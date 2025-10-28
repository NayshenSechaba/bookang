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

    const { token } = await req.json()

    // Validate token format
    if (!token || !tokenRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch token and verify it's valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('secure_booking_tokens')
      .select('*, bookings(*)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch additional booking details
    const booking = tokenData.bookings

    // Fetch customer details
    const { data: customer } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', booking.customer_id)
      .single()

    // Fetch hairdresser details
    let hairdresserName = 'Your stylist'
    if (booking.hairdresser_id) {
      const { data: hairdresser } = await supabase
        .from('hairdressers')
        .select('profile_id')
        .eq('id', booking.hairdresser_id)
        .single()

      if (hairdresser) {
        const { data: hairdresserProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', hairdresser.profile_id)
          .single()

        if (hairdresserProfile) {
          hairdresserName = hairdresserProfile.full_name
        }
      }
    }

    // Fetch salon details
    let salonName = 'The salon'
    let salonAddress = 'Location TBA'
    if (booking.saloon) {
      const { data: salon } = await supabase
        .from('salons')
        .select('name, address')
        .eq('id', booking.saloon)
        .single()

      if (salon) {
        salonName = salon.name
        salonAddress = salon.address || salonAddress
      }
    }

    // Fetch service details
    let serviceName = 'Service'
    if (booking.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('name')
        .eq('id', booking.service_id)
        .single()

      if (service) {
        serviceName = service.name
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          reference_number: booking.reference_number,
          status: booking.status,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          duration_minutes: booking.duration_minutes,
          total_price: booking.total_price,
          special_requests: booking.special_requests,
          customer: customer,
          hairdresser_name: hairdresserName,
          salon_name: salonName,
          salon_address: salonAddress,
          service_name: serviceName,
        },
        token_id: tokenData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error verifying token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
