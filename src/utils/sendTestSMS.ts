import { supabase } from "@/integrations/supabase/client";

export async function sendTestSMS(phoneNumber: string, recipientName: string) {
  try {
    const message = `Hi ${recipientName}! This is a test message from Bookang. Your booking system is ready to send SMS confirmations. 🎉`;

    const { data, error } = await supabase.functions.invoke('send-test-sms', {
      body: {
        phone_number: phoneNumber,
        message: message,
        recipient_name: recipientName
      }
    });

    if (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }

    console.log('SMS sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send test SMS:', error);
    throw error;
  }
}
