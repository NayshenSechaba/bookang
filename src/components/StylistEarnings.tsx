import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Clock, Users } from 'lucide-react';

interface StylistEarningsProps {
  stylistName: string;
}

const StylistEarnings = ({ stylistName }: StylistEarningsProps) => {
  // Mock earnings data
  const earningsData = {
    today: {
      gross: 650,
      net: 591.50,
      tips: 85,
      appointments: 8,
      commission: 0.15
    },
    week: {
      gross: 3240,
      net: 2947.20,
      tips: 420,
      appointments: 32,
      target: 4000
    },
    month: {
      gross: 12860,
      net: 11703.40,
      tips: 1580,
      appointments: 128,
      target: 15000
    },
    pending: {
      amount: 2947.20,
      nextPayout: '2024-01-22',
      processingFee: 292.80
    }
  };

  const recentTransactions = [
    { id: 1, type: 'service', client: 'Sarah Johnson', amount: 85, tips: 15, time: '14:30', status: 'completed' },
    { id: 2, type: 'service', client: 'Maria Garcia', amount: 150, tips: 20, time: '12:00', status: 'completed' },
    { id: 3, type: 'service', client: 'Emma Wilson', amount: 95, tips: 10, time: '10:30', status: 'completed' },
    { id: 4, type: 'payout', client: 'Weekly Payout', amount: 2847.20, tips: 0, time: '09:00', status: 'processed' },
    { id: 5, type: 'service', client: 'Lisa Chen', amount: 120, tips: 25, time: 'Yesterday', status: 'completed' }
  ];

  const weeklyProgress = (earningsData.week.gross / earningsData.week.target) * 100;
  const monthlyProgress = (earningsData.month.gross / earningsData.month.target) * 100;

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Today's Earnings</p>
                <p className="text-2xl font-bold">R{earningsData.today.net.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pending Payout</p>
                <p className="text-2xl font-bold">R{earningsData.pending.amount.toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tips This Week</p>
                <p className="text-2xl font-bold">R{earningsData.week.tips.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Appointments Today</p>
                <p className="text-2xl font-bold">{earningsData.today.appointments}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>R{earningsData.week.gross.toFixed(2)} of R{earningsData.week.target.toFixed(2)}</span>
              <span>{weeklyProgress.toFixed(1)}%</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              R{(earningsData.week.target - earningsData.week.gross).toFixed(2)} remaining to reach your weekly target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>R{earningsData.month.gross.toFixed(2)} of R{earningsData.month.target.toFixed(2)}</span>
              <span>{monthlyProgress.toFixed(1)}%</span>
            </div>
            <Progress value={monthlyProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              R{(earningsData.month.target - earningsData.month.gross).toFixed(2)} remaining to reach your monthly target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.client}</span>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{transaction.time}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {transaction.type === 'payout' ? '+' : ''}R{transaction.amount.toFixed(2)}
                  </div>
                  {transaction.tips > 0 && (
                    <div className="text-sm text-green-600">+R{transaction.tips} tips</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistEarnings;