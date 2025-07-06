
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, User, DollarSign, Plus } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface Booking {
  id: number;
  customerName: string;
  service: string;
  time: string;
  duration: number; // in minutes
  status: 'confirmed' | 'pending' | 'cancelled';
  cost: string;
  date: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

const CalendarBooking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDayDetails, setShowDayDetails] = useState(false);

  // Mock booking data
  const bookings: Booking[] = [
    {
      id: 1,
      customerName: 'Emily Johnson',
      service: 'Haircut & Styling',
      time: '10:00 AM',
      duration: 90,
      status: 'confirmed',
      cost: 'R1,125',
      date: new Date(2024, 6, 15) // July 15, 2024
    },
    {
      id: 2,
      customerName: 'Sarah Williams',
      service: 'Hair Color & Highlights',
      time: '2:00 PM',
      duration: 120,
      status: 'pending',
      cost: 'R2,250',
      date: new Date(2024, 6, 15) // July 15, 2024
    },
    {
      id: 3,
      customerName: 'Jessica Brown',
      service: 'Hair Treatment',
      time: '4:30 PM',
      duration: 60,
      status: 'confirmed',
      cost: 'R1,800',
      date: new Date(2024, 6, 16) // July 16, 2024
    }
  ];

  // Generate time slots for a day (9 AM to 6 PM)
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayBookings = bookings.filter(booking => isSameDay(booking.date, date));
    
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(new Date(2024, 0, 1, hour, minute), 'h:mm a');
        
        const booking = dayBookings.find(b => b.time === displayTime);
        
        slots.push({
          time: displayTime,
          available: !booking,
          booking
        });
      }
    }
    
    return slots;
  };

  // Get bookings for selected date
  const selectedDateBookings = bookings.filter(booking => 
    isSameDay(booking.date, selectedDate)
  );

  // Check if a date has bookings
  const hasBookings = (date: Date) => {
    return bookings.some(booking => isSameDay(booking.date, date));
  };

  // Custom day content to show booking indicators
  const modifiers = {
    hasBookings: (date: Date) => hasBookings(date)
  };

  const modifiersStyles = {
    hasBookings: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: 'bold'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
            Booking Calendar
          </CardTitle>
          <CardDescription>
            View your appointments and availability in calendar format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
              />
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Has bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
              </div>
            </div>

            {/* Day Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <Button 
                  size="sm"
                  onClick={() => setShowDayDetails(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Booking
                </Button>
              </div>

              {selectedDateBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{booking.customerName}</h4>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                        </div>
                        <Badge 
                          variant={
                            booking.status === 'confirmed' ? 'default' : 
                            booking.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {booking.cost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">No bookings for this day</p>
                  <p className="text-sm text-gray-500">You're available all day!</p>
                </div>
              )}

              {/* Quick stats for the day */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDateBookings.length}
                  </div>
                  <p className="text-xs text-gray-600">Appointments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {18 - selectedDateBookings.length * 2}
                  </div>
                  <p className="text-xs text-gray-600">Available slots</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              View all time slots and bookings for this day
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {generateTimeSlots(selectedDate).map((slot, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  slot.available 
                    ? 'bg-green-50 border-green-200' 
                    : slot.booking?.status === 'confirmed'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{slot.time}</span>
                  {slot.available ? (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      Available
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        slot.booking?.status === 'confirmed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {slot.booking?.status}
                    </Badge>
                  )}
                </div>
                
                {slot.booking && (
                  <div>
                    <p className="text-xs font-medium">{slot.booking.customerName}</p>
                    <p className="text-xs text-gray-600">{slot.booking.service}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowDayDetails(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarBooking;
