import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, amount, currency, reference, callback_url, metadata, business_id } = await req.json();

    console.log('Initializing payment:', { email, amount, currency, reference, business_id });

    // Fetch subaccount code from database if business_id provided
    let subaccounts = [];
    if (business_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: paymentSettings, error: fetchError } = await supabase
        .from('business_payment_settings')
        .select('paystack_subaccount_code')
        .eq('profile_id', business_id)
        .single();

      if (fetchError) {
        console.error('Error fetching payment settings:', fetchError);
      } else if (paymentSettings?.paystack_subaccount_code) {
        console.log('Using subaccount code from database');
        subaccounts = [{
          subaccount: paymentSettings.paystack_subaccount_code,
          share: 85 // Business gets 85%, platform gets 15%
        }];
      }
    }

    // Initialize transaction with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount, // Amount in kobo (cents)
        currency: currency || 'ZAR',
        reference,
        callback_url: callback_url || `${req.headers.get('origin')}/payment/callback`,
        metadata: metadata || {},
        split: subaccounts.length > 0 ? {
          type: 'percentage',
          bearer_type: 'account',
          subaccounts: subaccounts
        } : undefined
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack error:', paystackData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment initialization failed',
          details: paystackData.message || 'Unknown error'
        }),
        { 
          status: paystackResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Payment initialized successfully:', paystackData.data.reference);

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in initialize-payment function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
