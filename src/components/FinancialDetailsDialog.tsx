
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Appointment } from '@/types/dashboard';

interface FinancialDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Appointment[];
  totalEarnings: string;
  monthlyCommission: string;
}

const FinancialDetailsDialog = ({ 
  isOpen, 
  onClose, 
  bookings, 
  totalEarnings, 
  monthlyCommission 
}: FinancialDetailsDialogProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayCommission = () => {
    // For demo purposes, using a placeholder payment link
    // In a real implementation, this would integrate with a payment processor
    const paymentLink = `https://checkout.stripe.com/pay/demo-commission-${monthlyCommission.replace('R', '')}`;
    window.open(paymentLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Financial Details - Booking Breakdown</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-xl font-semibold">{totalEarnings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Commission</p>
              <p className="text-xl font-semibold text-green-600">{monthlyCommission}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">All Bookings</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{booking.cost}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {booking.commission}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">Pay Commission</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Amount Due: <span className="font-semibold">{monthlyCommission}</span></p>
                  <p className="text-xs text-blue-600 mt-1">Pay your monthly commission securely online</p>
                </div>
                <Button 
                  onClick={handlePayCommission}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialDetailsDialog;
