import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/utils/sendWelcomeEmail';
import { Mail } from 'lucide-react';

export const TestEmailButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    setIsLoading(true);
    try {
      await sendWelcomeEmail('sechabamagatikele@gmail.com', 'sechabamagatikele');
      
      toast({
        title: 'Email sent successfully!',
        description: 'Welcome email has been sent to sechabamagatikele@gmail.com',
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error sending email',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSendTestEmail} 
      disabled={isLoading}
      className="gap-2"
    >
      <Mail className="h-4 w-4" />
      {isLoading ? 'Sending...' : 'Send Test Welcome Email'}
    </Button>
  );
};
