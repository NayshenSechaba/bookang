import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, DollarSign, Flag, Star, User, Clock, Calendar } from 'lucide-react';
import { Appointment } from '@/types/dashboard';
import StarRating from './StarRating';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentManagementProps {
  appointments: Appointment[];
  onUpdateAppointment: (appointment: Appointment) => void;
}

const AppointmentManagement = ({ appointments, onUpdateAppointment }: AppointmentManagementProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [cancellationFee, setCancellationFee] = useState('');
  const [customerRating, setCustomerRating] = useState(5);
  const [customerNotes, setCustomerNotes] = useState('');

  const handleAcceptAppointment = async (appointment: Appointment) => {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'confirmed'
    };
    onUpdateAppointment(updatedAppointment);
    
    // Send SMS confirmation
    try {
      const { error } = await supabase.functions.invoke('send-booking-confirmation', {
        body: { booking_id: appointment.id }
      });
      
      if (error) {
        console.error('Failed to send SMS:', error);
        toast({
          title: "Appointment Accepted",
          description: `Appointment confirmed for ${appointment.customerName}, but SMS failed to send.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Appointment Accepted",
          description: `${appointment.customerName}'s appointment confirmed and SMS sent! 🎉`,
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Appointment Accepted",
        description: `Appointment confirmed for ${appointment.customerName}.`,
      });
    }
  };

  const handleMarkNoShow = (appointment: Appointment) => {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'no-show',
      noShowCount: (appointment.noShowCount || 0) + 1
    };
    onUpdateAppointment(updatedAppointment);
    toast({
      title: "Marked as No-Show",
      description: `${appointment.customerName} has been flagged for not showing up.`,
    });
  };

  const handleChargeCancellationFee = () => {
    if (!selectedAppointment) return;
    
    const fee = parseFloat(cancellationFee);
    if (isNaN(fee) || fee <= 0) {
      toast({
        title: "Invalid Fee",
        description: "Please enter a valid cancellation fee amount.",
        variant: "destructive"
      });
      return;
    }

    const updatedAppointment: Appointment = {
      ...selectedAppointment,
      status: 'cancelled',
      cancellationFeeCharged: fee
    };
    
    onUpdateAppointment(updatedAppointment);
    setShowChargeModal(false);
    setCancellationFee('');
    setSelectedAppointment(null);
    
    toast({
      title: "Cancellation Fee Charged",
      description: `R${fee} cancellation fee has been applied to ${selectedAppointment.customerName}.`,
    });
  };

  const handleRateCustomer = () => {
    if (!selectedAppointment) return;

    const updatedAppointment: Appointment = {
      ...selectedAppointment,
      status: 'completed',
      customerRating,
      customerNotes
    };
    
    onUpdateAppointment(updatedAppointment);
    setShowRatingModal(false);
    setCustomerRating(5);
    setCustomerNotes('');
    setSelectedAppointment(null);
    
    toast({
      title: "Customer Rated",
      description: `You've rated ${selectedAppointment.customerName} ${customerRating} stars.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">{appointment.customerName}</span>
                      {(appointment.noShowCount || 0) > 2 && (
                        <Flag className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {appointment.cost}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    
                    {appointment.cancellationFeeCharged && (
                      <Badge variant="outline" className="text-red-600">
                        Fee: R{appointment.cancellationFeeCharged}
                      </Badge>
                    )}
                    
                    {appointment.customerRating && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={appointment.customerRating} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  {appointment.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptAppointment(appointment)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Appointment
                    </Button>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkNoShow(appointment)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No Show
                      </Button>
                      
                      <Dialog open={showChargeModal} onOpenChange={setShowChargeModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Charge Fee
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Charge Cancellation Fee</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="fee">Cancellation Fee (R)</Label>
                              <Input
                                id="fee"
                                type="number"
                                value={cancellationFee}
                                onChange={(e) => setCancellationFee(e.target.value)}
                                placeholder="50.00"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleChargeCancellationFee}>
                                Charge Fee
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowChargeModal(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Rate Customer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate Customer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Customer Rating</Label>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setCustomerRating(star)}
                                    className={`p-1 ${
                                      star <= customerRating 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    <Star className="h-6 w-6 fill-current" />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes about customer</Label>
                              <Textarea
                                id="notes"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                placeholder="Professional, on time, good communication..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleRateCustomer}>
                                Submit Rating
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowRatingModal(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>

                {/* Additional info for problematic customers */}
                {(appointment.noShowCount || 0) > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                    <div className="flex items-center gap-1 text-yellow-800">
                      <AlertTriangle className="h-3 w-3" />
                      No-show history: {appointment.noShowCount} times
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManagement;