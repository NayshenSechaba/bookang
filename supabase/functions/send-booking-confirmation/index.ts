import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingConfirmationData {
  booking_id: string
  customer_phone: string
  hairdresser_name: string
  salon_name: string
  salon_location: string
  appointment_date: string
  appointment_time: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting booking confirmation SMS process...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured')
    }

    const { booking_id } = await req.json()

    if (!booking_id) {
      throw new Error('booking_id is required')
    }

    console.log('Fetching booking details for:', booking_id)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        phone,
        appointment_date,
        appointment_time,
        hairdressers!bookings_hairdresser_id_fkey(
          profiles!hairdressers_profile_id_fkey(full_name)
        ),
        salons!bookings_saloon_fkey(
          name,
          address
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      throw new Error('Booking not found')
    }

    if (!booking.phone) {
      console.log('No phone number provided for booking:', booking_id)
      return new Response(
        JSON.stringify({ success: false, message: 'No phone number provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const confirmationData: BookingConfirmationData = {
      booking_id: booking.id,
      customer_phone: booking.phone,
      hairdresser_name: booking.hairdressers?.profiles?.full_name || 'Your stylist',
      salon_name: booking.salons?.name || 'The salon',
      salon_location: booking.salons?.address || 'Location TBA',
      appointment_date: booking.appointment_date,
      appointment_time: booking.appointment_time,
    }

    console.log('Sending confirmation SMS to:', confirmationData.customer_phone)

    // Format phone number to international format if needed
    let formattedPhone = confirmationData.customer_phone
    if (confirmationData.customer_phone.startsWith('0')) {
      formattedPhone = '+27' + confirmationData.customer_phone.substring(1)
    } else if (!confirmationData.customer_phone.startsWith('+')) {
      formattedPhone = '+27' + confirmationData.customer_phone
    }

    // Create SMS message
    const message = `Hi! Your appointment at ${confirmationData.salon_name} with ${confirmationData.hairdresser_name} has been CONFIRMED! 🎉\n\nDate: ${confirmationData.appointment_date}\nTime: ${confirmationData.appointment_time}\nLocation: ${confirmationData.salon_location}\n\nSee you soon!`

    // Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: message,
      }),
    })

    const twilioResult = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('Failed to send SMS:', twilioResult)
      throw new Error(`Twilio API error: ${JSON.stringify(twilioResult)}`)
    }

    console.log('SMS sent successfully:', twilioResult.sid)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking confirmation SMS sent',
        execution_sid: twilioResult.sid,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-booking-confirmation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
