import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        toast({
          title: "Invalid Payment",
          description: "No payment reference found.",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log('Verifying payment:', reference);

        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference }
        });

        if (error) {
          console.error('Verification error:', error);
          throw error;
        }

        console.log('Payment verification result:', data);

        if (data.status === 'success') {
          setStatus('success');
          setPaymentData(data);
          
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed. Booking confirmed.",
          });

          // Update booking status in database
          if (data.metadata?.booking_id) {
            await supabase
              .from('bookings')
              .update({ status: 'confirmed' })
              .eq('id', data.metadata.booking_id);
          }
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast({
          title: "Verification Error",
          description: "Could not verify payment. Please contact support.",
          variant: "destructive"
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Verifying Payment</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Your booking has been confirmed.</p>
                {paymentData && (
                  <div className="bg-muted p-4 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span>R{(paymentData.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Reference:</span>
                      <span className="text-xs">{paymentData.reference}</span>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground">
                Your payment could not be processed. Please try again or contact support.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
