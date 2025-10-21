import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, Users, FileText, Ban, CheckCircle } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';

interface BookingPoliciesProps {
  userName: string;
}

const BookingPolicies = ({ userName }: BookingPoliciesProps) => {
  // Cancellation policy state
  const [cancellationPolicy, setCancellationPolicy] = useState({
    enabled: true,
    timeFrame: '24', // hours
    cancellationFee: 50, // percentage or fixed amount
    feeType: 'percentage', // 'percentage' or 'fixed'
    description: 'Cancellations must be made at least 24 hours in advance to avoid fees.',
    exceptions: 'Medical emergencies and severe weather conditions may be exempt from cancellation fees.',
    refundPolicy: 'partial' // 'full', 'partial', 'none'
  });

  // No-show policy state
  const [noShowPolicy, setNoShowPolicy] = useState({
    enabled: true,
    gracePeriod: 15, // minutes
    fee: 100, // percentage of service cost
    feeType: 'percentage',
    blacklistAfter: 3, // number of no-shows
    description: 'Customers who arrive more than 15 minutes late may be marked as no-show.',
    autoBlacklist: true
  });

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  // Mock data for customer tracking
  const customerFlags = [
    {
      id: 1,
      customerName: 'John Smith',
      email: 'john.smith@email.com',
      noShows: 2,
      lateArrivals: 1,
      totalAppointments: 8,
      reliabilityScore: 75,
      lastIncident: '2024-06-15',
      status: 'Warning',
      notes: 'Customer called 10 minutes after appointment time citing traffic issues.'
    },
    {
      id: 2,
      customerName: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      noShows: 3,
      lateArrivals: 2,
      totalAppointments: 5,
      reliabilityScore: 40,
      lastIncident: '2024-06-20',
      status: 'Blacklisted',
      notes: 'Multiple no-shows without prior notice. Automatic blacklist applied.'
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      email: 'mike.j@email.com',
      noShows: 0,
      lateArrivals: 0,
      totalAppointments: 12,
      reliabilityScore: 100,
      lastIncident: null,
      status: 'Excellent',
      notes: 'Exemplary customer - always on time and professional.'
    }
  ];

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Handle policy updates
  const handleSavePolicies = () => {
    showAlert('success', 'Policies Updated!', 
      'Your booking and cancellation policies have been saved successfully.'
    );
  };

  // Handle customer status change
  const handleCustomerStatusChange = (customerId: number, newStatus: string) => {
    showAlert('info', 'Customer Status Updated', 
      `Customer status has been changed to ${newStatus}.`
    );
  };

  const getStatusBadge = (status: string, score: number) => {
    switch (status) {
      case 'Excellent':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Excellent
          </Badge>
        );
      case 'Warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case 'Blacklisted':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Ban className="h-3 w-3 mr-1" />
            Blacklisted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Policies & Customer Management</h2>
        <p className="text-gray-600">
          Set your cancellation policies and manage customer reliability tracking.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Cancellation Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Cancellation Policy
            </CardTitle>
            <CardDescription>
              Set rules for appointment cancellations and associated fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="cancellation-enabled">Enable Cancellation Policy</Label>
              <Switch
                id="cancellation-enabled"
                checked={cancellationPolicy.enabled}
                onCheckedChange={(checked) => 
                  setCancellationPolicy(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {cancellationPolicy.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Minimum Notice (hours)</Label>
                    <Input
                      id="timeframe"
                      type="number"
                      value={cancellationPolicy.timeFrame}
                      onChange={(e) => 
                        setCancellationPolicy(prev => ({ ...prev, timeFrame: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee-type">Fee Type</Label>
                    <Select
                      value={cancellationPolicy.feeType}
                      onValueChange={(value) => 
                        setCancellationPolicy(prev => ({ ...prev, feeType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cancellation-fee">
                    Cancellation Fee ({cancellationPolicy.feeType === 'percentage' ? '%' : 'R'})
                  </Label>
                  <Input
                    id="cancellation-fee"
                    type="number"
                    value={cancellationPolicy.cancellationFee}
                    onChange={(e) => 
                      setCancellationPolicy(prev => ({ ...prev, cancellationFee: Number(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="policy-description">Policy Description</Label>
                  <Textarea
                    id="policy-description"
                    value={cancellationPolicy.description}
                    onChange={(e) => 
                      setCancellationPolicy(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="refund-policy">Refund Policy</Label>
                  <Select
                    value={cancellationPolicy.refundPolicy}
                    onValueChange={(value) => 
                      setCancellationPolicy(prev => ({ ...prev, refundPolicy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Refund (minus fees)</SelectItem>
                      <SelectItem value="partial">Partial Refund</SelectItem>
                      <SelectItem value="none">No Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* No-Show Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              No-Show Policy
            </CardTitle>
            <CardDescription>
              Manage no-show tracking and automatic customer flagging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="noshow-enabled">Enable No-Show Tracking</Label>
              <Switch
                id="noshow-enabled"
                checked={noShowPolicy.enabled}
                onCheckedChange={(checked) => 
                  setNoShowPolicy(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {noShowPolicy.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grace-period">Grace Period (minutes)</Label>
                    <Input
                      id="grace-period"
                      type="number"
                      value={noShowPolicy.gracePeriod}
                      onChange={(e) => 
                        setNoShowPolicy(prev => ({ ...prev, gracePeriod: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="noshow-fee">No-Show Fee (%)</Label>
                    <Input
                      id="noshow-fee"
                      type="number"
                      value={noShowPolicy.fee}
                      onChange={(e) => 
                        setNoShowPolicy(prev => ({ ...prev, fee: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="blacklist-threshold">Blacklist After (# of no-shows)</Label>
                  <Input
                    id="blacklist-threshold"
                    type="number"
                    value={noShowPolicy.blacklistAfter}
                    onChange={(e) => 
                      setNoShowPolicy(prev => ({ ...prev, blacklistAfter: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-blacklist">Auto-Blacklist Repeat Offenders</Label>
                  <Switch
                    id="auto-blacklist"
                    checked={noShowPolicy.autoBlacklist}
                    onCheckedChange={(checked) => 
                      setNoShowPolicy(prev => ({ ...prev, autoBlacklist: checked }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="noshow-description">No-Show Policy Description</Label>
                  <Textarea
                    id="noshow-description"
                    value={noShowPolicy.description}
                    onChange={(e) => 
                      setNoShowPolicy(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Reliability Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Customer Reliability Tracking
          </CardTitle>
          <CardDescription>
            Monitor customer punctuality and reliability scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Reliability</th>
                  <th className="text-center py-3 px-2">No-Shows</th>
                  <th className="text-center py-3 px-2">Late Arrivals</th>
                  <th className="text-center py-3 px-2">Total Visits</th>
                  <th className="text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerFlags.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{customer.customerName}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(customer.status, customer.reliabilityScore)}
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          customer.reliabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                          customer.reliabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {customer.reliabilityScore}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={customer.noShows > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {customer.noShows}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={customer.lateArrivals > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                        {customer.lateArrivals}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">{customer.totalAppointments}</td>
                    <td className="text-center py-3 px-2">
                      <Select
                        value={customer.status.toLowerCase()}
                        onValueChange={(value) => handleCustomerStatusChange(customer.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="blacklisted">Blacklisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Policy Preview
          </CardTitle>
          <CardDescription>
            How your policies will appear to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Booking Policies</h3>
            
            {cancellationPolicy.enabled && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-600 mb-2">{cancellationPolicy.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Fee:</strong> {cancellationPolicy.cancellationFee}
                  {cancellationPolicy.feeType === 'percentage' ? '% of service cost' : ' ZAR'} 
                  for cancellations within {cancellationPolicy.timeFrame} hours
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Refund:</strong> {
                    cancellationPolicy.refundPolicy === 'full' ? 'Full refund minus fees' :
                    cancellationPolicy.refundPolicy === 'partial' ? 'Partial refund' :
                    'No refund'
                  }
                </p>
              </div>
            )}

            {noShowPolicy.enabled && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">No-Show Policy</h4>
                <p className="text-sm text-gray-600 mb-2">{noShowPolicy.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Fee:</strong> {noShowPolicy.fee}% of service cost for no-shows
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Grace period:</strong> {noShowPolicy.gracePeriod} minutes after appointment time
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSavePolicies}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Policies
        </Button>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertInfo.show}
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
        onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default BookingPolicies;