
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Star, DollarSign, Users, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';

interface HairdresserDashboardProps {
  userName: string;
}

const HairdresserDashboard = ({ userName }: HairdresserDashboardProps) => {
  // State management
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      customerName: 'Emily Johnson',
      service: 'Haircut & Styling',
      date: '2024-07-15',
      time: '2:00 PM',
      status: 'Pending',
      cost: '$75',
      commission: '$22.50'
    },
    {
      id: 2,
      customerName: 'Sarah Williams',
      service: 'Hair Color & Highlights',
      date: '2024-07-15',
      time: '10:00 AM',
      status: 'Confirmed',
      cost: '$150',
      commission: '$45.00'
    },
    {
      id: 3,
      customerName: 'Jessica Brown',
      service: 'Hair Treatment',
      date: '2024-07-15',
      time: '4:00 PM',
      status: 'Pending',
      cost: '$120',
      commission: '$36.00'
    }
  ]);

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });

  // Mock data for reviews
  const customerReviews = [
    {
      id: 1,
      customerName: 'Emily Johnson',
      service: 'Haircut',
      rating: 5,
      comment: 'Absolutely amazing! Sarah gave me the perfect haircut. She really listened to what I wanted and delivered exactly that. The salon atmosphere was great too!',
      date: '2024-06-28'
    },
    {
      id: 2,
      customerName: 'Maria Garcia',
      service: 'Hair Color',
      rating: 5,
      comment: 'Best hair color experience ever! The results exceeded my expectations. Professional, friendly, and skilled. Will definitely be back!',
      date: '2024-06-25'
    },
    {
      id: 3,
      customerName: 'Lisa Chen',
      service: 'Hair Styling',
      rating: 4,
      comment: 'Great service and lovely results. Sarah is very talented and made me feel comfortable throughout the appointment.',
      date: '2024-06-20'
    },
    {
      id: 4,
      customerName: 'Anna Wilson',
      service: 'Hair Treatment',
      rating: 5,
      comment: 'My hair has never felt better! The treatment was relaxing and the results speak for themselves. Highly recommend!',
      date: '2024-06-18'
    }
  ];

  // Financial data
  const financialData = {
    totalEarnings: '$2,450.00',
    monthlyCommission: '$735.00',
    pendingPayments: '$103.50',
    commissionRate: '30%',
    totalAppointments: 42,
    averageRating: 4.8
  };

  // Show custom alert
  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertInfo({ show: true, type, title, message });
  };

  // Handle appointment actions
  const handleAppointmentAction = (appointmentId: number, action: 'confirm' | 'cancel') => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: action === 'confirm' ? 'Confirmed' : 'Cancelled' }
          : apt
      )
    );

    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (action === 'confirm') {
      showAlert('success', 'Appointment Confirmed', 
        `Appointment with ${appointment?.customerName} has been confirmed. They will be notified via email.`);
    } else {
      showAlert('info', 'Appointment Cancelled', 
        `Appointment with ${appointment?.customerName} has been cancelled. They will be notified and can reschedule if needed.`);
    }
  };

  // Render star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-600">
            Manage your appointments, track your earnings, and view customer feedback.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Today's Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Pending Approvals</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt => apt.status === 'Pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Average Rating</p>
                  <p className="text-2xl font-bold">{financialData.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Monthly Earnings</p>
                  <p className="text-2xl font-bold">{financialData.monthlyCommission}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appointments Management */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>
                  Manage your upcoming appointments and client bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.customerName}</h3>
                          <p className="text-gray-600">{appointment.service}</p>
                        </div>
                        <Badge 
                          variant={
                            appointment.status === 'Confirmed' ? 'default' : 
                            appointment.status === 'Pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          {appointment.cost}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-purple-600">
                            Commission: {appointment.commission}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what your customers are saying about your services
                  <Badge variant="outline" className="ml-2">Standard Tier Feature</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{review.customerName}</h4>
                          <p className="text-sm text-gray-600">{review.service} • {review.date}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Free Tier:</strong> Individual reviews are available with Standard Tier. 
                    Currently showing total review count and average rating only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Finance Overview */}
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
                    onClick={() => setShowFinanceModal(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {financialData.totalAppointments}
                    </div>
                    <p className="text-gray-600">Total Appointments</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      {financialData.averageRating}
                    </div>
                    <p className="text-gray-600">Average Rating</p>
                    <StarRating rating={Math.floor(financialData.averageRating)} />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {customerReviews.length}
                    </div>
                    <p className="text-gray-600">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Confirm appointments promptly to build trust</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Respond to reviews to show you care</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep your schedule updated regularly</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Upload portfolio photos to attract customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Finance Modal */}
      <Dialog open={showFinanceModal} onOpenChange={setShowFinanceModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Finance Management</DialogTitle>
            <DialogDescription>
              Detailed view of your earnings and commission structure
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="commission">Commission</TabsTrigger>
            </TabsList>
            
            <TabsContent value="earnings" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-800 font-medium">Total Earnings (This Month)</span>
                    <span className="text-2xl font-bold text-green-600">{financialData.totalEarnings}</span>
                  </div>
                  <p className="text-sm text-green-700">Based on {financialData.totalAppointments} completed appointments</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-800 font-medium">Your Commission</span>
                    <span className="text-xl font-bold text-blue-600">{financialData.monthlyCommission}</span>
                  </div>
                  <p className="text-sm text-blue-700">At {financialData.commissionRate} commission rate</p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-800 font-medium">Pending Payments</span>
                    <span className="text-xl font-bold text-amber-600">{financialData.pendingPayments}</span>
                  </div>
                  <p className="text-sm text-amber-700">From recent appointments</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="commission" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Commission Structure</h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    <div className="flex justify-between">
                      <span>Standard Services:</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium Services:</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Online Booking Fee:</span>
                      <span className="font-medium">2.5%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Schedule</h4>
                  <p className="text-sm text-gray-700">
                    Payments are processed weekly on Fridays. Commission from online bookings 
                    is calculated after the service is completed and customer payment is confirmed.
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Performance Bonuses</h4>
                  <p className="text-sm text-indigo-700">
                    Maintain a 4.8+ rating to qualify for monthly performance bonuses. 
                    Top performers receive additional commission increases.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowFinanceModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertInfo.show}
        onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
      />
    </div>
  );
};

export default HairdresserDashboard;
