import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioWebhookPayload {
  BookingId?: string
  UserResponse?: string
  MessageSid?: string
  From?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received appointment response webhook from Twilio')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse webhook payload (Twilio sends form-urlencoded data)
    const contentType = req.headers.get('content-type')
    let payload: TwilioWebhookPayload = {}

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      payload = {
        BookingId: formData.get('BookingId')?.toString(),
        UserResponse: formData.get('UserResponse')?.toString(),
        MessageSid: formData.get('MessageSid')?.toString(),
        From: formData.get('From')?.toString(),
      }
    } else {
      payload = await req.json()
    }

    console.log('Webhook payload:', payload)

    const bookingId = payload.BookingId
    const userResponse = payload.UserResponse?.toLowerCase()

    if (!bookingId) {
      console.error('No booking ID provided')
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user wants to cancel
    if (userResponse && (userResponse.includes('cancel') || userResponse.includes('2'))) {
      console.log(`Processing cancellation for booking ${bookingId}`)

      // Update booking status to cancelled
      const { data: booking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: 'Customer cancelled via SMS reminder',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating booking:', updateError)
        throw updateError
      }

      console.log(`Successfully cancelled booking ${bookingId}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Appointment cancelled successfully',
          booking,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // If user confirms or other response
    console.log(`Received response for booking ${bookingId}: ${userResponse}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Response received',
        response: userResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in handle-appointment-response function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
