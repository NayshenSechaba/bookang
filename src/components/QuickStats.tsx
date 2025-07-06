
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Scissors, Package, DollarSign } from 'lucide-react';
import { Service, Product } from '@/types/dashboard';

interface QuickStatsProps {
  appointmentsCount: number;
  services: Service[];
  products: Product[];
  monthlyCommission: string;
}

const QuickStats = ({ appointmentsCount, services, products, monthlyCommission }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Today's Appointments</p>
              <p className="text-2xl font-bold">{appointmentsCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Active Services</p>
              <p className="text-2xl font-bold">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
            <Scissors className="h-8 w-8 text-amber-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Products in Stock</p>
              <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>
            </div>
            <Package className="h-8 w-8 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Monthly Earnings</p>
              <p className="text-2xl font-bold">{monthlyCommission}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
