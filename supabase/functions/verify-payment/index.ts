import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying payment:', reference);

    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack verification error:', paystackData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment verification failed',
          details: paystackData.message || 'Unknown error'
        }),
        { 
          status: paystackResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const transaction = paystackData.data;
    
    console.log('Payment verified:', {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount
    });

    return new Response(
      JSON.stringify({
        success: true,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        reference: transaction.reference,
        paid_at: transaction.paid_at,
        customer: transaction.customer,
        metadata: transaction.metadata,
        split: transaction.split
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-payment function:', error);
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
