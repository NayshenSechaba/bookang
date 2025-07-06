
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Scissors, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { FinancialData } from '@/types/dashboard';

interface QuickStatsProps {
  data: FinancialData;
}

const QuickStats = ({ data }: QuickStatsProps) => {
  // Mock performance data - in a real app this would come from props
  const performanceChange = 15.2; // percentage change from previous month
  const isImprovement = performanceChange > 0;
  
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
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold">{data.averageRating}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(data.averageRating) 
                          ? 'text-yellow-300 fill-yellow-300' 
                          : 'text-amber-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
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
              <p className="text-purple-100">Monthly Performance</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{Math.abs(performanceChange)}%</p>
                {isImprovement ? (
                  <TrendingUp className="h-5 w-5 text-green-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
              </div>
              <p className="text-xs text-purple-200 mt-1">
                {isImprovement ? 'Better' : 'Lower'} than last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
