import { corsHeaders } from '../_shared/cors.ts'

interface SMSRequest {
  phone_number: string
  message: string
  recipient_name?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting SMS send process...')

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+1234567890'

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const { phone_number, message, recipient_name }: SMSRequest = await req.json()

    if (!phone_number || !message) {
      throw new Error('phone_number and message are required')
    }

    console.log('Sending SMS to:', phone_number)

    // Format phone number to international format if needed
    let formattedPhone = phone_number
    if (phone_number.startsWith('0')) {
      formattedPhone = '+27' + phone_number.substring(1)
    } else if (!phone_number.startsWith('+')) {
      formattedPhone = '+27' + phone_number
    }

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
        message: 'SMS sent successfully',
        message_sid: twilioResult.sid,
        to: formattedPhone,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-test-sms function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
