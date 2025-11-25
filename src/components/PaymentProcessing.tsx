import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubAccount {
  subaccount: string;
  share: number;
}

interface PaymentProcessingProps {
  appointmentDetails: {
    service: string;
    stylist: string;
    date: string;
    time: string;
    cost: number;
    salon: string;
    bookingId?: string;
  };
  customerEmail: string;
  subaccounts?: SubAccount[];
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

const PaymentProcessing = ({ 
  appointmentDetails, 
  customerEmail, 
  subaccounts = [],
  isOpen, 
  onClose, 
  onPaymentComplete 
}: PaymentProcessingProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Generate unique reference
      const reference = `BOOKANG-${appointmentDetails.bookingId || Date.now()}`;
      
      // Amount in kobo (cents) - multiply by 100
      const amountInKobo = Math.round(appointmentDetails.cost * 100);

      console.log('Initializing payment:', { 
        email: customerEmail, 
        amount: amountInKobo, 
        reference,
        subaccounts: subaccounts.length 
      });

      // Initialize payment with Paystack
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          email: customerEmail,
          amount: amountInKobo,
          currency: 'ZAR',
          reference,
          split: subaccounts.length > 0 ? {
            type: 'percentage',
            bearer_type: 'account',
            bearer_subaccount: null,
            subaccounts
          } : undefined,
          metadata: {
            booking_id: appointmentDetails.bookingId,
            service: appointmentDetails.service,
            stylist: appointmentDetails.stylist,
            date: appointmentDetails.date,
            time: appointmentDetails.time
          }
        }
      });

      if (error) {
        console.error('Payment initialization error:', error);
        throw error;
      }

      if (!data.authorization_url) {
        throw new Error('No authorization URL received');
      }

      console.log('Payment initialized, redirecting to:', data.authorization_url);

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Payment Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-medium">{appointmentDetails.service}</span>
              </div>
              <div className="flex justify-between">
                <span>Stylist:</span>
                <span className="font-medium">{appointmentDetails.stylist}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-medium">{appointmentDetails.date} at {appointmentDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium">{appointmentDetails.salon}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R{appointmentDetails.cost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium">Secure Card Payment</div>
                  <div className="text-sm text-muted-foreground">Powered by Paystack</div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <Shield className="h-4 w-4 text-primary" />
            <span>All payments are secured with 256-bit encryption and PCI-DSS compliance</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting to Payment...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Pay R{appointmentDetails.cost.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProcessing;