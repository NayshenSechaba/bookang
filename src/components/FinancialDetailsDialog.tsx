
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialDetailsDialog;
