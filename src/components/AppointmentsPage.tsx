import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Star, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentsPageProps {
  userName: string;
}

const AppointmentsPage = ({ userName }: AppointmentsPageProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Currency formatting for South African Rands
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // Mock data for appointments
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Haircut & Styling',
      hairdresser: 'Sarah Johnson',
      date: '2024-07-20',
      time: '2:00 PM',
      status: 'Confirmed',
      salon: 'Glamour Studio',
      cost: 75,
      address: '123 Beauty Street, Downtown',
      phone: '+27 11 234 5678',
      email: 'sarah@glamourstudio.co.za',
      notes: 'Please bring inspiration photos',
      canCancel: true,
      canReschedule: true
    },
    {
      id: 2,
      service: 'Hair Color & Highlights',
      hairdresser: 'Maria Garcia',
      date: '2024-07-25',
      time: '10:00 AM',
      status: 'Pending Confirmation',
      salon: 'Elite Hair Lounge',
      cost: 150,
      address: '456 Style Avenue, Uptown',
      phone: '+27 11 876 5432',
      email: 'maria@elitehair.co.za',
      notes: 'Consultation included',
      canCancel: true,
      canReschedule: false
    },
    {
      id: 3,
      service: 'Deep Tissue Massage',
      hairdresser: 'Jennifer Lee',
      date: '2024-07-22',
      time: '3:30 PM',
      status: 'Confirmed',
      salon: 'Spa & Wellness Center',
      cost: 120,
      address: '789 Wellness Blvd, Midtown',
      phone: '+27 11 345 6789',
      email: 'jennifer@spawellness.co.za',
      notes: '60-minute session',
      canCancel: true,
      canReschedule: true
    }
  ];

  const pastAppointments = [
    {
      id: 4,
      service: 'Haircut',
      hairdresser: 'Emma Wilson',
      date: '2024-06-28',
      time: '3:30 PM',
      status: 'Completed',
      salon: 'Trendy Cuts',
      cost: 60,
      address: '321 Style Street, Central',
      phone: '+27 11 555 1234',
      email: 'emma@trendycuts.co.za',
      rating: 5,
      review: 'Amazing service! Emma really understood what I wanted.',
      hasReview: true
    },
    {
      id: 5,
      service: 'Hair Treatment',
      hairdresser: 'Lisa Chen',
      date: '2024-06-15',
      time: '1:00 PM',
      status: 'Completed',
      salon: 'Luxury Hair Spa',
      cost: 120,
      address: '654 Luxury Lane, Upmarket',
      phone: '+27 11 777 8888',
      email: 'lisa@luxuryhairspa.co.za',
      rating: 4,
      review: 'Great treatment, hair feels so soft now!',
      hasReview: true
    },
    {
      id: 6,
      service: 'Manicure & Pedicure',
      hairdresser: 'Sophie Brown',
      date: '2024-06-10',
      time: '11:00 AM',
      status: 'Completed',
      salon: 'Nail Artistry',
      cost: 85,
      address: '987 Beauty Boulevard, Fashion District',
      phone: '+27 11 999 0000',
      email: 'sophie@nailartistry.co.za',
      rating: 0,
      review: '',
      hasReview: false
    }
  ];

  const cancelledAppointments = [
    {
      id: 7,
      service: 'Facial Treatment',
      hairdresser: 'Rachel Green',
      date: '2024-06-20',
      time: '2:00 PM',
      status: 'Cancelled',
      salon: 'Beauty Haven',
      cost: 95,
      address: '147 Glow Street, Beauty District',
      phone: '+27 11 222 3333',
      email: 'rachel@beautyhaven.co.za',
      cancelReason: 'Cancelled by customer - Schedule conflict',
      cancelDate: '2024-06-18'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'Pending Confirmation':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'Completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const openAppointmentDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    // Here you would implement the cancellation logic
    console.log('Cancelling appointment:', appointmentId);
    // For now, just close the modal
    setShowDetailsModal(false);
  };

  const handleRescheduleAppointment = (appointmentId: number) => {
    // Here you would implement the rescheduling logic
    console.log('Rescheduling appointment:', appointmentId);
    // For now, just close the modal
    setShowDetailsModal(false);
  };

  const renderAppointmentCard = (appointment: any) => (
    <Card 
      key={appointment.id} 
      className="border-blue-100 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => openAppointmentDetails(appointment)}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex-1">
          <CardTitle className="text-lg">{appointment.service}</CardTitle>
          <CardDescription>{appointment.salon} - {appointment.hairdresser}</CardDescription>
        </div>
        {getStatusBadge(appointment.status)}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(appointment.date).toLocaleDateString('en-ZA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at {appointment.time}
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          {appointment.address}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">{formatCurrency(appointment.cost)}</span>
          {appointment.hasReview !== undefined && appointment.hasReview && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{appointment.rating}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Appointments</h1>
          <p className="text-gray-600">Manage your salon appointments and bookings</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-6">
                {upcomingAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
                  <p className="text-gray-600 mb-4">You don't have any upcoming appointments scheduled.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Book New Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastAppointments.length > 0 ? (
              <div className="grid gap-6">
                {pastAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Appointments</h3>
                  <p className="text-gray-600">Your appointment history will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {cancelledAppointments.length > 0 ? (
              <div className="grid gap-6">
                {cancelledAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cancelled Appointments</h3>
                  <p className="text-gray-600">Cancelled appointments will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Appointment Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Appointment Details</span>
                {selectedAppointment && getStatusBadge(selectedAppointment.status)}
              </DialogTitle>
              <DialogDescription>
                View and manage your appointment information
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-6">
                {/* Service Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold">{selectedAppointment.service}</p>
                        <p className="text-sm text-gray-600">{selectedAppointment.salon}</p>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        {new Date(selectedAppointment.date).toLocaleDateString('en-ZA', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        {selectedAppointment.time}
                      </div>
                      <div className="pt-2 border-t">
                        <p className="font-semibold text-lg">{formatCurrency(selectedAppointment.cost)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Professional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold">{selectedAppointment.hairdresser}</p>
                        <p className="text-sm text-gray-600">{selectedAppointment.salon}</p>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        {selectedAppointment.address}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        {selectedAppointment.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        {selectedAppointment.email}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedAppointment.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Cancellation Reason (for cancelled appointments) */}
                {selectedAppointment.status === 'Cancelled' && selectedAppointment.cancelReason && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cancellation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-2">{selectedAppointment.cancelReason}</p>
                      <p className="text-sm text-gray-500">
                        Cancelled on: {new Date(selectedAppointment.cancelDate).toLocaleDateString('en-ZA')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Review (for completed appointments) */}
                {selectedAppointment.hasReview && selectedAppointment.review && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        Your Review
                        <div className="flex items-center ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= selectedAppointment.rating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedAppointment.review}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  {selectedAppointment.canReschedule && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleRescheduleAppointment(selectedAppointment.id)}
                    >
                      Reschedule
                    </Button>
                  )}
                  {selectedAppointment.canCancel && (
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                  {selectedAppointment.status === 'Completed' && !selectedAppointment.hasReview && (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => console.log('Open review modal')}
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppointmentsPage;