import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationEmailRequest {
  booking_id: string
  notification_type: 'booking_confirmation' | 'cancellation_alert' | 'review_request' | 'booking_modification'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting notification email send process...')

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const defaultFromEmail = Deno.env.get('MAIL_FROM_EMAIL') || 'noreply@bookang.com'
    const defaultFromName = Deno.env.get('MAIL_FROM_NAME') || 'Bookang'

    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const { booking_id, notification_type }: NotificationEmailRequest = await req.json()

    if (!booking_id || !notification_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: booking_id and notification_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching booking and template data for:', booking_id, notification_type)

    // Use service role for fetching data
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await serviceSupabase
      .from('bookings')
      .select(`
        id,
        reference_number,
        appointment_date,
        appointment_time,
        status,
        customer_id,
        service_id,
        hairdresser_id,
        services (name),
        hairdressers (
          profile_id,
          profiles (business_name, full_name)
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError)
      throw new Error('Booking not found')
    }

    // Fetch customer profile with email
    const { data: customer, error: customerError } = await serviceSupabase
      .from('profiles')
      .select('id, email, full_name, user_id')
      .eq('id', booking.customer_id)
      .single()

    if (customerError || !customer) {
      console.error('Customer fetch error:', customerError)
      throw new Error('Customer not found')
    }

    // Fetch message template
    const { data: template, error: templateError } = await serviceSupabase
      .from('message_templates')
      .select('subject, body_template')
      .eq('notification_type', notification_type)
      .single()

    if (templateError || !template) {
      console.error('Template fetch error:', templateError)
      throw new Error('Message template not found')
    }

    // Replace template variables
    const businessName = booking.hairdressers?.profiles?.business_name || 
                        booking.hairdressers?.profiles?.full_name || 
                        'Bookang'
    const serviceName = booking.services?.name || 'Service'
    
    const subject = template.subject
      .replace('{booking_reference}', booking.reference_number)
      .replace('{business_name}', businessName)

    const messageBody = template.body_template
      .replace('{customer_name}', customer.full_name || 'Customer')
      .replace('{booking_reference}', booking.reference_number)
      .replace('{appointment_date}', booking.appointment_date)
      .replace('{appointment_time}', booking.appointment_time)
      .replace('{service_name}', serviceName)
      .replace('{business_name}', businessName)
      .replace('{status}', booking.status || 'pending')

    // Build HTML email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #ffffff;
              padding: 30px 20px;
              border: 1px solid #e0e0e0;
              border-top: none;
            }
            .booking-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .booking-details h2 {
              margin-top: 0;
              color: #667eea;
              font-size: 18px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              color: #333;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 0 0 8px 8px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border: 1px solid #e0e0e0;
              border-top: none;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
            .message {
              margin: 20px 0;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bookang</h1>
          </div>
          <div class="content">
            <div class="message">
              ${messageBody.replace(/\n/g, '<br>')}
            </div>
            <div class="booking-details">
              <h2>Booking Details</h2>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${booking.reference_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.appointment_date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.appointment_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Provider:</span>
                <span class="detail-value">${businessName}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Data processed in compliance with the South African POPIA Act.</p>
            <p>© ${new Date().getFullYear()} Bookang. All rights reserved.</p>
            <p><a href="https://bookang.com">Visit our website</a></p>
          </div>
        </body>
      </html>
    `

    console.log('Sending email to:', customer.email)

    // Send email via SendGrid
    const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send'
    const emailData = {
      personalizations: [
        {
          to: [{ email: customer.email }],
          subject: subject,
        },
      ],
      from: {
        email: defaultFromEmail,
        name: defaultFromName,
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

    console.log('Email sent successfully to:', customer.email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        to: customer.email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-notification-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
