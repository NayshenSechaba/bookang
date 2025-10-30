import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { hairdresser_id, month, year } = await req.json()

    if (!hairdresser_id || !month || !year) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: hairdresser_id, month, year' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is an employee or super_user
    const { data: roleData, error: roleError } = await supabase
      .from('employee_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['employee', 'super_user'])
      .single()

    if (roleError || !roleData) {
      console.error('Permission denied:', roleError)
      return new Response(
        JSON.stringify({ error: 'Permission denied. Employee role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch commission data for the specified period
    const { data: commissions, error: commissionError } = await supabase
      .from('vw_commission_data')
      .select('*')
      .eq('hairdresser_id', hairdresser_id)
      .eq('year', year)
      .eq('month', month)

    if (commissionError) {
      console.error('Error fetching commission data:', commissionError)
      throw new Error('Failed to fetch commission data')
    }

    if (!commissions || commissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No commission data found for the specified period',
          invoice: null
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate totals
    const totalBookings = commissions.length
    const totalRevenue = commissions.reduce((sum, c) => sum + parseFloat(c.service_cost), 0)
    const totalCommission = commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0)

    // Get hairdresser details
    const hairdresserName = commissions[0].hairdresser_name
    const hairdresserEmail = commissions[0].hairdresser_email
    const salonName = commissions[0].salon_name || 'Independent'

    // Generate invoice number
    const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${hairdresser_id.substring(0, 8).toUpperCase()}`

    // Create invoice object
    const invoice = {
      invoice_number: invoiceNumber,
      generated_date: new Date().toISOString(),
      period: {
        month: month,
        year: year,
        month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
      },
      hairdresser: {
        id: hairdresser_id,
        name: hairdresserName,
        email: hairdresserEmail,
        salon: salonName
      },
      summary: {
        total_bookings: totalBookings,
        total_revenue: totalRevenue.toFixed(2),
        commission_rate: commissions[0].commission_rate_percent,
        total_commission: totalCommission.toFixed(2)
      },
      line_items: commissions.map(c => ({
        booking_id: c.booking_id,
        date: c.appointment_date,
        service_cost: parseFloat(c.service_cost).toFixed(2),
        commission_rate: c.commission_rate_percent,
        commission_amount: parseFloat(c.commission_amount).toFixed(2)
      }))
    }

    console.log(`Generated invoice ${invoiceNumber} for ${hairdresserName}`)

    return new Response(
      JSON.stringify({
        success: true,
        invoice: invoice
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating invoice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})