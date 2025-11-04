
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Scissors, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { FinancialData } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface QuickStatsProps {
  data: FinancialData;
}

const QuickStats = ({ data }: QuickStatsProps) => {
  const navigate = useNavigate();
  // Mock performance data - in a real app this would come from props
  const performanceChange = 15.2; // percentage change from previous month
  const isImprovement = performanceChange > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
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

      <Card 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all"
        onClick={() => navigate('/employee/ratings')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Average Rating</p>
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
            <Scissors className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Monthly Performance</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{Math.abs(performanceChange)}%</p>
                {isImprovement ? (
                  <TrendingUp className="h-5 w-5 text-green-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
              </div>
              <p className="text-xs text-blue-200 mt-1">
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
