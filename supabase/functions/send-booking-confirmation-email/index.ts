import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting booking confirmation email process...')

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')

    // First verify the user is authenticated
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const { booking_id } = await req.json()

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate booking_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(booking_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching booking details for:', booking_id)

    // Use service role to fetch booking data
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        reference_number,
        appointment_date,
        appointment_time,
        total_price,
        profiles!bookings_customer_id_fkey(
          email,
          full_name
        ),
        hairdressers!bookings_hairdresser_id_fkey(
          profiles!hairdressers_profile_id_fkey(full_name)
        ),
        salons!bookings_saloon_fkey(
          name,
          address
        ),
        services(
          name
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      throw new Error('Booking not found')
    }

    const customerEmail = booking.profiles?.email
    
    if (!customerEmail) {
      console.log('No email found for customer in booking:', booking_id)
      return new Response(
        JSON.stringify({ success: false, message: 'Customer email not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const customerName = booking.profiles?.full_name || 'Valued Customer'
    const hairdresserName = booking.hairdressers?.profiles?.full_name || 'Your stylist'
    const salonName = booking.salons?.name || 'The salon'
    const salonAddress = booking.salons?.address || 'Location TBA'
    const serviceName = booking.services?.name || 'Service'
    const appointmentDate = new Date(booking.appointment_date).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    console.log('Sending confirmation email to:', customerEmail)

    // Create HTML email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your appointment has been confirmed! We're looking forward to seeing you.</p>
            
            <div class="booking-details">
              <h2 style="margin-top: 0; color: #4F46E5;">Booking Details</h2>
              
              <div class="detail-row">
                <span class="detail-label">Reference Number:</span>
                <span class="detail-value">${booking.reference_number}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${appointmentDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.appointment_time}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Stylist:</span>
                <span class="detail-value">${hairdresserName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${salonName}<br/>${salonAddress}</span>
              </div>
              
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Total Price:</span>
                <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #4F46E5;">R${booking.total_price}</span>
              </div>
            </div>
            
            <p style="margin-top: 20px;">If you need to reschedule or have any questions, please don't hesitate to contact us.</p>
            
            <p>See you soon!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated confirmation from Bookang</p>
            <p>&copy; ${new Date().getFullYear()} Bookang. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email via SendGrid
    const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send'

    const emailData = {
      personalizations: [
        {
          to: [{ email: customerEmail }],
          subject: `Booking Confirmed - ${booking.reference_number}`,
        },
      ],
      from: {
        email: Deno.env.get('MAIL_FROM_EMAIL') || 'noreply@bookang.com',
        name: Deno.env.get('MAIL_FROM_NAME') || 'Bookang',
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

    console.log('Email sent successfully to:', customerEmail)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking confirmation email sent',
        to: customerEmail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-booking-confirmation-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
