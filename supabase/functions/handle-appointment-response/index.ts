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

    // Parse webhook payload (Twilio sends form-urlencoded data for incoming messages)
    const contentType = req.headers.get('content-type')
    let twilioData: any = {}

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      // Twilio webhook sends: Body, From, To, MessageSid, etc.
      twilioData = {
        Body: formData.get('Body')?.toString(),
        From: formData.get('From')?.toString(),
        To: formData.get('To')?.toString(),
        MessageSid: formData.get('MessageSid')?.toString(),
      }
    } else {
      twilioData = await req.json()
    }

    console.log('Twilio webhook data:', twilioData)

    // Extract user response from message body
    const messageBody = twilioData.Body?.trim().toLowerCase()
    const fromPhone = twilioData.From

    if (!messageBody) {
      console.error('No message body received')
      return new Response(
        JSON.stringify({ error: 'Message body is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Received SMS from ${fromPhone}: ${messageBody}`)

    // Find the booking by customer phone number (most recent pending/confirmed booking)
    // Format the phone to match database format
    let phoneToMatch = fromPhone
    if (fromPhone.startsWith('+27')) {
      phoneToMatch = '0' + fromPhone.substring(3)
    }

    // Find customer profile by phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phoneToMatch)
      .single()

    if (!profile) {
      console.error('No profile found for phone:', phoneToMatch)
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get the most recent pending or confirmed booking for this customer
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', profile.id)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!booking) {
      console.error('No active booking found for customer')
      return new Response(
        JSON.stringify({ error: 'No active booking found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const bookingId = booking.id
    const userResponse = messageBody

    // Get Twilio credentials to send response SMS
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    // Check if user wants to cancel (reply with "2" or "cancel")
    if (userResponse.includes('2') || userResponse.includes('cancel')) {
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

      // Send cancellation confirmation SMS
      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        const cancelMessage = `❌ Your appointment has been CANCELLED.\n\nBooking ID: ${bookingId}\n\nIf you need to rebook, please visit our website.`
        
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: fromPhone,
            From: twilioPhoneNumber,
            Body: cancelMessage,
          }),
        })
      }

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

    // If user confirms (reply with "1" or "confirm")
    if (userResponse.includes('1') || userResponse.includes('confirm')) {
      console.log(`Processing confirmation for booking ${bookingId}`)

      // Update booking status to confirmed
      const { data: booking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating booking:', updateError)
        throw updateError
      }

      console.log(`Successfully confirmed booking ${bookingId}`)

      // Send confirmation SMS
      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        const confirmMessage = `✅ Your appointment has been CONFIRMED!\n\nBooking ID: ${bookingId}\n\nWe look forward to seeing you!`
        
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: fromPhone,
            From: twilioPhoneNumber,
            Body: confirmMessage,
          }),
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Appointment confirmed successfully',
          booking,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Invalid response
    console.log(`Invalid response for booking ${bookingId}: ${userResponse}`)

    // Send help message
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const helpMessage = `❓ Invalid response. Please reply:\n1 - to CONFIRM your appointment\n2 - to CANCEL your appointment`
      
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: fromPhone,
          From: twilioPhoneNumber,
          Body: helpMessage,
        }),
      })
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid response',
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
