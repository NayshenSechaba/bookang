
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye } from 'lucide-react';
import { FinancialData } from '@/types/dashboard';

interface FinanceOverviewProps {
  financialData: FinancialData;
  onViewDetails: () => void;
}

const FinanceOverview = ({ financialData, onViewDetails }: FinanceOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-green-500" />
          Finance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Earnings</span>
            <span className="font-semibold text-lg">{financialData.totalEarnings}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Commission</span>
            <span className="font-semibold text-green-600">{financialData.monthlyCommission}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pending Payments</span>
            <span className="font-semibold text-amber-600">{financialData.pendingPayments}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Commission Rate</span>
            <span className="font-semibold">{financialData.commissionRate}</span>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={onViewDetails}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceOverview;
