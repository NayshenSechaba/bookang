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

    // Fetch booking with customer profile
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      throw new Error('Booking not found')
    }

    // Fetch customer profile for phone number
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', booking.customer_id)
      .single()
    
    if (profileError || !customerProfile) {
      console.error('Error fetching customer profile:', profileError)
      throw new Error('Customer profile not found')
    }

    // Fetch hairdresser details if hairdresser_id exists
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

    // Fetch salon details if saloon exists
    let salonName = 'The salon'
    let salonLocation = 'Location TBA'
    if (booking.saloon) {
      const { data: salon } = await supabase
        .from('salons')
        .select('name, address')
        .eq('id', booking.saloon)
        .single()
      
      if (salon) {
        salonName = salon.name
        salonLocation = salon.address || salonLocation
      }
    }

    const customerPhone = customerProfile.phone
    
    if (!customerPhone) {
      console.log('No phone number found for customer in booking:', booking_id)
      return new Response(
        JSON.stringify({ success: false, message: 'Customer phone number not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const confirmationData: BookingConfirmationData = {
      booking_id: booking.id,
      customer_phone: customerPhone,
      hairdresser_name: hairdresserName,
      salon_name: salonName,
      salon_location: salonLocation,
      appointment_date: booking.appointment_date,
      appointment_time: booking.appointment_time,
    }

    console.log('Confirmation data:', confirmationData)

    // Generate secure booking token
    const secureToken = crypto.randomUUID().replace(/-/g, '')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Token valid for 7 days

    const { error: tokenError } = await supabase
      .from('secure_booking_tokens')
      .insert({
        booking_id: booking.id,
        token: secureToken,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Error creating secure token:', tokenError)
      throw new Error('Failed to create secure booking link')
    }

    const secureBookingLink = `${supabaseUrl.replace('.supabase.co', '')}.lovable.app/booking/manage/${secureToken}`
    console.log('Generated secure booking link:', secureBookingLink)

    // Format phone number to international format if needed
    let formattedPhone = confirmationData.customer_phone
    if (confirmationData.customer_phone.startsWith('0')) {
      formattedPhone = '+27' + confirmationData.customer_phone.substring(1)
    } else if (!confirmationData.customer_phone.startsWith('+')) {
      formattedPhone = '+27' + confirmationData.customer_phone
    }

    console.log('Original phone:', confirmationData.customer_phone)
    console.log('Formatted phone (E.164):', formattedPhone)

    // Create interactive SMS message with secure booking link
    const message = `📅 BOOKING CONFIRMATION

Salon: ${confirmationData.salon_name}
Stylist: ${confirmationData.hairdresser_name}
Date: ${confirmationData.appointment_date}
Time: ${confirmationData.appointment_time}
Location: ${confirmationData.salon_location}

Manage your booking:
${secureBookingLink}

Booking ID: ${confirmationData.booking_id}`

    console.log('Sending SMS to:', formattedPhone, 'from:', twilioPhoneNumber)

    // Send SMS via Twilio REST API with StatusCallback for replies
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    
    // Construct the webhook URL for handling responses
    const webhookUrl = `${supabaseUrl}/functions/v1/handle-appointment-response`

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
        StatusCallback: webhookUrl,
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
