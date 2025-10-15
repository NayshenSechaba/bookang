import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  from_name?: string
  from_email?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting email send process...')

    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const defaultFromEmail = Deno.env.get('MAIL_FROM_EMAIL') || 'noreply@bookang.com'
    const defaultFromName = Deno.env.get('MAIL_FROM_NAME') || 'Bookang'

    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const { to, subject, html, from_name, from_email }: EmailRequest = await req.json()

    if (!to || !subject || !html) {
      throw new Error('to, subject, and html are required')
    }

    console.log('Sending email to:', to)

    // Send email via SendGrid API
    const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send'

    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: from_email || defaultFromEmail,
        name: from_name || defaultFromName,
      },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
    }

    const sendGridResponse = await fetch(sendGridUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text()
      console.error('SendGrid API error:', errorText)
      throw new Error(`SendGrid API error: ${errorText}`)
    }

    console.log('Email sent successfully to:', to)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        to: to,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
