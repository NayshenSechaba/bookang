import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface SMSRequest {
  phone_number: string
  message: string
  recipient_name?: string
}

// E.164 phone format regex (international format)
const phoneRegex = /^\+[1-9]\d{1,14}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting SMS send process...')

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+1234567890'

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const { phone_number, message, recipient_name }: SMSRequest = await req.json()

    // Input validation
    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: 'phone_number and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate message length
    if (message.length > 1600) {
      return new Response(
        JSON.stringify({ error: 'Message exceeds maximum length of 1600 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending SMS to:', phone_number)

    // Format phone number to international format if needed
    let formattedPhone = phone_number
    if (phone_number.startsWith('0')) {
      formattedPhone = '+27' + phone_number.substring(1)
    } else if (!phone_number.startsWith('+')) {
      formattedPhone = '+27' + phone_number
    }

    // Validate E.164 format after formatting
    if (!phoneRegex.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Must be in E.164 format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
