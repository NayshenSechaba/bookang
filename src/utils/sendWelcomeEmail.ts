import { supabase } from "@/integrations/supabase/client";

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class='container'>
          <div class='header'>
            <h1>✨ Welcome to Bookang!</h1>
            <p style='font-size: 18px; margin: 10px 0;'>Your all-in-one beauty business management platform</p>
          </div>
          <div class='content'>
            <p>Hi ${name},</p>
            <p>We're thrilled to have you join the Bookang community! 🎉</p>
            <p>Bookang is designed to help beauty professionals like you manage your business effortlessly. Here's what you can do:</p>
            
            <div class='feature'>
              <strong>📅 Smart Booking Management</strong>
              <p>Accept and manage appointments seamlessly with automated confirmations and reminders</p>
            </div>
            
            <div class='feature'>
              <strong>💰 Financial Tracking</strong>
              <p>Keep track of your earnings, invoices, and get paid faster</p>
            </div>
            
            <div class='feature'>
              <strong>👥 Customer Management</strong>
              <p>Build lasting relationships with your clients through our customer management tools</p>
            </div>
            
            <div class='feature'>
              <strong>📊 Business Insights</strong>
              <p>Get valuable insights into your business performance and grow strategically</p>
            </div>
            
            <p style='margin-top: 30px;'>Ready to get started? Log in to your dashboard and complete your business profile to start accepting bookings!</p>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            
            <p>Here's to your success! 🚀</p>
            
            <p style='margin-top: 30px;'><strong>The Bookang Team</strong></p>
          </div>
          
          <div class='footer'>
            <p>This email was sent from Bookang</p>
            <p>&copy; ${new Date().getFullYear()} Bookang. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Sending welcome email to:', email);

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: 'Welcome to Bookang - Your Beauty Business Platform',
        html: html,
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};
