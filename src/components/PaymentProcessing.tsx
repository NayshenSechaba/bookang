import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Banknote, Shield, Clock, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PaymentProcessingProps {
  appointmentDetails: {
    service: string;
    stylist: string;
    date: string;
    time: string;
    cost: number;
    salon: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

const PaymentProcessing = ({ appointmentDetails, isOpen, onClose, onPaymentComplete }: PaymentProcessingProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [mobileWallet, setMobileWallet] = useState({
    provider: '',
    phoneNumber: ''
  });

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'mobile', name: 'Mobile Wallet', icon: Smartphone, description: 'M-Pesa, MTN Mobile Money' },
    { id: 'cash', name: 'Pay at Salon', icon: Banknote, description: 'Cash payment on arrival' }
  ];

  const mobileWalletProviders = [
    { id: 'mpesa', name: 'M-Pesa' },
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'airtel', name: 'Airtel Money' },
    { id: 'vodacom', name: 'Vodacom Pay' }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // NOTE: In production, implement server-side payment processing
      // via edge functions with proper PCI-compliant payment gateway integration

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        id: `PAY_${Date.now()}`,
        method: paymentMethod,
        amount: appointmentDetails.cost,
        currency: 'ZAR',
        status: paymentMethod === 'cash' ? 'pending' : 'completed',
        timestamp: new Date().toISOString(),
        transactionFee: appointmentDetails.cost * 0.029, // 2.9% processing fee
        netAmount: appointmentDetails.cost * 0.971,
        appointment: appointmentDetails
      };

      onPaymentComplete(paymentData);
      
      toast({
        title: "Payment Successful!",
        description: paymentMethod === 'cash' 
          ? "Your appointment is confirmed. Please pay at the salon."
          : "Your payment has been processed securely. Confirmation sent via SMS/Email.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = appointmentDetails.cost;
    const processingFee = paymentMethod === 'cash' ? 0 : subtotal * 0.029;
    return subtotal + processingFee;
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
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Subtotal:</span>
                <span>R{appointmentDetails.cost.toFixed(2)}</span>
              </div>
              {paymentMethod !== 'cash' && (
                <div className="flex justify-between text-gray-600">
                  <span>Processing Fee (2.9%):</span>
                  <span>R{(appointmentDetails.cost * 0.029).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R{calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Choose Payment Method</Label>
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details Forms */}
          {paymentMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'mobile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mobile Wallet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">Mobile Money Provider</Label>
                  <Select value={mobileWallet.provider} onValueChange={(value) => setMobileWallet({...mobileWallet, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileWalletProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={mobileWallet.phoneNumber}
                    onChange={(e) => setMobileWallet({...mobileWallet, phoneNumber: e.target.value})}
                    placeholder="+27 12 345 6789"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'cash' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Banknote className="h-5 w-5" />
                  <span className="font-medium">Pay at Salon</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Your appointment will be confirmed. Please bring exact change or card for payment at the salon.
                </p>
              </CardContent>
            </Card>
          )}


          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span>All payments are secured with 256-bit encryption and fraud protection</span>
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {paymentMethod === 'cash' ? 'Confirm Booking' : `Pay R${calculateTotal().toFixed(2)}`}
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