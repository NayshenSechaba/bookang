import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import { FinancialData, Appointment } from '@/types/dashboard';
import FinancialDetailsDialog from './FinancialDetailsDialog';

interface FinanceOverviewProps {
  data: FinancialData;
  bookings?: Appointment[];
}

const FinanceOverview = ({ data, bookings = [] }: FinanceOverviewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = () => {
    console.log('View financial details');
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Finance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-semibold text-lg">{data.totalEarnings}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Commission</span>
              <span className="font-semibold text-green-600">{data.monthlyCommission}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payments</span>
              <span className="font-semibold text-amber-600">{data.pendingPayments}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commission Rate</span>
              <span className="font-semibold">{data.commissionRate}</span>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleViewDetails}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <FinancialDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        bookings={bookings}
        totalEarnings={data.totalEarnings}
        monthlyCommission={data.monthlyCommission}
      />
    </>
  );
};

export default FinanceOverview;
