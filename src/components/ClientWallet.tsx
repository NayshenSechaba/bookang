import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Plus, History, Star, Gift, Shield } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ClientWalletProps {
  userName: string;
}

const ClientWallet = ({ userName }: ClientWalletProps) => {
  const [walletBalance, setWalletBalance] = useState(250.00);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Mock data
  const savedPaymentMethods = [
    {
      id: 'card1',
      type: 'card',
      name: 'Visa ****1234',
      isDefault: true,
      expiry: '12/26'
    },
    {
      id: 'mobile1',
      type: 'mobile',
      name: 'MTN Mobile Money',
      isDefault: false,
      number: '+27 82 *** 5678'
    }
  ];

  const walletTransactions = [
    {
      id: 1,
      type: 'payment',
      description: 'Hair Color & Highlights - Sarah Johnson',
      amount: -150.00,
      date: '2024-01-20',
      status: 'completed',
      salon: 'Glamour Studio'
    },
    {
      id: 2,
      type: 'topup',
      description: 'Wallet Top-up',
      amount: +200.00,
      date: '2024-01-18',
      status: 'completed'
    },
    {
      id: 3,
      type: 'cashback',
      description: 'Loyalty Cashback',
      amount: +15.00,
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 4,
      type: 'payment',
      description: 'Haircut & Style - Emma Wilson',
      amount: -85.00,
      date: '2024-01-12',
      status: 'completed',
      salon: 'Trendy Cuts'
    },
    {
      id: 5,
      type: 'refund',
      description: 'Cancelled Appointment Refund',
      amount: +120.00,
      date: '2024-01-10',
      status: 'completed'
    }
  ];

  const loyaltyData = {
    points: 1250,
    tier: 'Gold',
    nextTier: 'Platinum',
    pointsToNext: 750,
    cashbackRate: 0.05
  };

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add to your wallet.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to add funds.",
        variant: "destructive"
      });
      return;
    }

    setWalletBalance(prev => prev + amount);
    setShowAddFunds(false);
    setAddAmount('');
    setSelectedPaymentMethod('');
    
    toast({
      title: "Funds Added Successfully",
      description: `R${amount.toFixed(2)} has been added to your wallet.`,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💸';
      case 'topup': return '💰';
      case 'cashback': return '🎁';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-red-100 text-red-800';
      case 'topup': return 'bg-green-100 text-green-800';
      case 'cashback': return 'bg-purple-100 text-purple-800';
      case 'refund': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8" />
              <div>
                <p className="text-purple-100 text-sm">Digital Wallet</p>
                <p className="text-2xl font-bold">R{walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (R)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="100.00"
                      min="10"
                      step="10"
                    />
                  </div>
                  
                  <div>
                    <Label>Payment Method</Label>
                    <div className="space-y-2 mt-2">
                      {savedPaymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedPaymentMethod === method.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5" />
                            <div className="flex-1">
                              <div className="font-medium">{method.name}</div>
                              {method.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddFunds(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddFunds} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Add R{addAmount || '0.00'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-200">Available Balance</p>
              <p className="font-semibold">R{walletBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-purple-200">Pending Transactions</p>
              <p className="font-semibold">R0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty & Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Loyalty & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{loyaltyData.points}</div>
              <div className="text-sm text-yellow-700">Loyalty Points</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{loyaltyData.tier}</div>
              <div className="text-sm text-purple-700">Current Tier</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(loyaltyData.cashbackRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-green-700">Cashback Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{loyaltyData.pointsToNext} points to {loyaltyData.nextTier}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${((loyaltyData.points % 2000) / 2000) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Transaction History */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-600">
                          {transaction.date} • {transaction.salon || 'Wallet System'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <Badge variant="secondary" className={getBadgeColor(transaction.type)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Saved Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedPaymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">
                            {method.type === 'card' ? `Expires ${method.expiry}` : method.number}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Your wallet is protected</span>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            All transactions are encrypted and monitored for fraud. Your funds are secure with bank-level protection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientWallet;