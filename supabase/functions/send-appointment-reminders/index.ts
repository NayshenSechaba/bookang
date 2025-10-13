import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingReminder {
  id: string
  reference_number: string
  appointment_date: string
  appointment_time: string
  phone: string
  customer_name: string
  service_name: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting appointment reminder process...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate the date 7 days from now
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    console.log('Checking for appointments on:', targetDateStr)

    // Query bookings that are 7 days away and confirmed/pending
    const { data: bookings, error: queryError } = await supabase
      .from('bookings')
      .select(`
        id,
        reference_number,
        appointment_date,
        appointment_time,
        phone,
        status,
        customer_id,
        service_id,
        profiles!bookings_customer_id_fkey(full_name),
        services(name)
      `)
      .eq('appointment_date', targetDateStr)
      .in('status', ['confirmed', 'pending'])
      .not('phone', 'is', null)

    if (queryError) {
      console.error('Error querying bookings:', queryError)
      throw queryError
    }

    console.log(`Found ${bookings?.length || 0} appointments to remind`)

    const results = []

    // Send reminder for each booking
    for (const booking of bookings || []) {
      try {
        const reminderData: BookingReminder = {
          id: booking.id,
          reference_number: booking.reference_number,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          phone: booking.phone,
          customer_name: booking.profiles?.full_name || 'Customer',
          service_name: booking.services?.name || 'Service',
        }

        console.log(`Sending reminder for booking ${reminderData.reference_number} to ${reminderData.phone}`)

        // Call Twilio Studio Flow
        const flowSid = 'FW16e0a59f9204256f682a5f53f51206d4'
        const twilioUrl = `https://studio.twilio.com/v2/Flows/${flowSid}/Executions`

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: reminderData.phone,
            From: '+1234567890', // Replace with your Twilio phone number
            Parameters: JSON.stringify({
              customer_name: reminderData.customer_name,
              service_name: reminderData.service_name,
              appointment_date: reminderData.appointment_date,
              appointment_time: reminderData.appointment_time,
              reference_number: reminderData.reference_number,
              booking_id: reminderData.id,
            }),
          }),
        })

        const twilioResult = await twilioResponse.json()

        if (!twilioResponse.ok) {
          console.error(`Failed to send reminder for ${reminderData.reference_number}:`, twilioResult)
          results.push({
            booking_id: reminderData.id,
            reference_number: reminderData.reference_number,
            success: false,
            error: twilioResult,
          })
        } else {
          console.log(`Successfully sent reminder for ${reminderData.reference_number}`)
          results.push({
            booking_id: reminderData.id,
            reference_number: reminderData.reference_number,
            success: true,
            execution_sid: twilioResult.sid,
          })
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.reference_number}:`, error)
        results.push({
          booking_id: booking.id,
          reference_number: booking.reference_number,
          success: false,
          error: error.message,
        })
      }
    }

    console.log('Reminder process completed')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} reminders`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-appointment-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
