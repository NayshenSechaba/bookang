import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  profile_id: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')!;
    const mailFromEmail = Deno.env.get('MAIL_FROM_EMAIL') || 'noreply@bookang.com';
    const mailFromName = Deno.env.get('MAIL_FROM_NAME') || 'Bookang';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { profile_id, status, notes }: VerificationEmailRequest = await req.json();

    console.log('Sending verification status email:', { profile_id, status });

    // Fetch business profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_name, business_email, email, full_name')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    const recipientEmail = profile.business_email || profile.email;
    const businessName = profile.business_name || profile.full_name || 'Your Business';

    // Prepare email content based on status
    let subject = '';
    let htmlContent = '';

    switch (status) {
      case 'pending':
        subject = 'Verification Application Received';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verification Application Received</h2>
            <p>Hello ${businessName},</p>
            <p>We've received your verification application and it's currently pending review.</p>
            <p>Our team will review your submission and get back to you soon.</p>
            <p>Thank you for your patience.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The Bookang Team</p>
          </div>
        `;
        break;

      case 'in_review':
        subject = 'Verification Under Review';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verification Under Review</h2>
            <p>Hello ${businessName},</p>
            <p>Good news! Your verification application is now under review by our team.</p>
            <p>We're carefully reviewing your documents and information. We'll notify you once the review is complete.</p>
            ${notes ? `<p style="background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb;"><strong>Review Notes:</strong><br>${notes}</p>` : ''}
            <p>Thank you for your patience.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The Bookang Team</p>
          </div>
        `;
        break;

      case 'approved':
        subject = '🎉 Verification Approved!';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Congratulations! Your Business is Verified</h2>
            <p>Hello ${businessName},</p>
            <p>Excellent news! Your business verification has been approved.</p>
            <p>You now have full access to all platform features and your business will be marked as verified to customers.</p>
            ${notes ? `<p style="background: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a;"><strong>Approval Notes:</strong><br>${notes}</p>` : ''}
            <p>Welcome to Bookang's verified business community!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The Bookang Team</p>
          </div>
        `;
        break;

      case 'rejected':
        subject = 'Verification Application Update';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Verification Application Requires Attention</h2>
            <p>Hello ${businessName},</p>
            <p>We've reviewed your verification application and unfortunately we need you to address some issues before we can proceed.</p>
            ${notes ? `<p style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626;"><strong>Issues to Address:</strong><br>${notes}</p>` : ''}
            <p>Please review the feedback above and resubmit your application with the necessary corrections.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The Bookang Team</p>
          </div>
        `;
        break;
    }

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }],
        }],
        from: {
          email: mailFromEmail,
          name: mailFromName,
        },
        subject: subject,
        content: [{
          type: 'text/html',
          value: htmlContent,
        }],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid error: ${sendGridResponse.status} - ${errorText}`);
    }

    console.log('Verification status email sent successfully to:', recipientEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending verification status email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
