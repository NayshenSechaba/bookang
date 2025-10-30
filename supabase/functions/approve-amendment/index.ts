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

    const { amendment_id, action, reason } = await req.json()

    if (!amendment_id || !action || !['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Provide amendment_id and action (approve/reject)' }),
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

    // Check if user is a super_user
    const { data: roleData, error: roleError } = await supabase
      .from('employee_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_user')
      .single()

    if (roleError || !roleData) {
      console.error('Permission denied:', roleError)
      return new Response(
        JSON.stringify({ error: 'Permission denied. Super user role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the amendment request
    const { data: amendment, error: amendmentError } = await supabase
      .from('amendment_requests')
      .select('*')
      .eq('id', amendment_id)
      .eq('status', 'pending')
      .single()

    if (amendmentError || !amendment) {
      console.error('Amendment not found or already processed:', amendmentError)
      return new Response(
        JSON.stringify({ error: 'Amendment request not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'approve') {
      // Update the client profile with new value
      const updateData: any = {}
      updateData[amendment.field_name] = amendment.new_value
      updateData.updated_at = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('client_profiles')
        .update(updateData)
        .eq('id', amendment.client_profile_id)

      if (updateError) {
        console.error('Error updating client profile:', updateError)
        throw new Error('Failed to update client profile')
      }

      console.log(`Updated client profile ${amendment.client_profile_id}, field: ${amendment.field_name}`)
    }

    // Update amendment request status
    const { error: statusError } = await supabase
      .from('amendment_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reason: reason || null,
      })
      .eq('id', amendment_id)

    if (statusError) {
      console.error('Error updating amendment status:', statusError)
      throw new Error('Failed to update amendment status')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Amendment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing amendment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})