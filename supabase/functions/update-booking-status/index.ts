import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const tokenRegex = /^[0-9a-f]{32}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { token, status, cancellation_reason } = await req.json()

    // Validate inputs
    if (!token || !tokenRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Status must be either "confirmed" or "cancelled"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token is valid and not used
    const { data: tokenData, error: tokenError } = await supabase
      .from('secure_booking_tokens')
      .select('id, booking_id, used_at, expires_at')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ error: 'Token has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update booking status
    const updateData: any = { status }
    if (status === 'cancelled' && cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason.substring(0, 500) // Limit length
    }

    const { error: bookingError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', tokenData.booking_id)

    if (bookingError) {
      console.error('Error updating booking:', bookingError)
      throw new Error('Failed to update booking status')
    }

    // Mark token as used
    await supabase
      .from('secure_booking_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Booking ${status} successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating booking:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
