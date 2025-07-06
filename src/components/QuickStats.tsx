
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Scissors, Package, DollarSign } from 'lucide-react';
import { FinancialData } from '@/types/dashboard';

interface QuickStatsProps {
  data: FinancialData;
}

const QuickStats = ({ data }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Today's Appointments</p>
              <p className="text-2xl font-bold">{data.totalAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Average Rating</p>
              <p className="text-2xl font-bold">{data.averageRating}</p>
            </div>
            <Scissors className="h-8 w-8 text-amber-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Commission Rate</p>
              <p className="text-2xl font-bold">{data.commissionRate}</p>
            </div>
            <Package className="h-8 w-8 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Commission Payable</p>
              <p className="text-2xl font-bold">{data.monthlyCommission}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
