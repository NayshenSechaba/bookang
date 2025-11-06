import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, User, DollarSign, Plus, ChevronLeft, ChevronRight, Heart, ShoppingBag, CalendarX, Trash2 } from 'lucide-react';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerInfo {
  preferences: string[];
  lastService: string;
  lastVisit: string;
  totalVisits: number;
  notes?: string;
}

interface Booking {
  id: number;
  customerName: string;
  service: string;
  time: string;
  duration: number; // in minutes
  status: 'confirmed' | 'pending' | 'cancelled';
  cost: string;
  date: Date;
  customerInfo: CustomerInfo;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

const CalendarBooking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [showHourlyView, setShowHourlyView] = useState(false);
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [showBookingsSummary, setShowBookingsSummary] = useState(false);
  const [hourlyViewDate, setHourlyViewDate] = useState<Date>(new Date());
  
  // Blocked times state
  const [showBlockTimeDialog, setShowBlockTimeDialog] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [hairdresserId, setHairdresserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [blockReason, setBlockReason] = useState('');
  
  // Real bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch hairdresser ID
  useEffect(() => {
    const fetchHairdresserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: hairdresser } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (hairdresser) {
        setHairdresserId(hairdresser.id);
      }
    };

    fetchHairdresserId();
  }, []);

  // Fetch blocked times and bookings
  useEffect(() => {
    if (!hairdresserId) return;
    fetchBlockedTimes();
    fetchBookings();
  }, [hairdresserId]);

  const fetchBlockedTimes = async () => {
    if (!hairdresserId) return;

    const { data, error } = await supabase
      .from('blocked_times')
      .select('*')
      .eq('hairdresser_id', hairdresserId)
      .order('blocked_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching blocked times:', error);
      return;
    }

    setBlockedTimes(data || []);
  };

  const handleAddBlockedTime = async () => {
    if (!hairdresserId) {
      toast.error('Hairdresser profile not found');
      return;
    }

    if (!startTime || !endTime) {
      toast.error('Please select start and end times');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('blocked_times')
      .insert({
        hairdresser_id: hairdresserId,
        blocked_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        reason: blockReason || null,
      });

    setLoading(false);

    if (error) {
      console.error('Error adding blocked time:', error);
      toast.error('Failed to block time slot');
      return;
    }

    toast.success('Time slot blocked successfully');
    setShowBlockTimeDialog(false);
    setStartTime('09:00');
    setEndTime('17:00');
    setBlockReason('');
    fetchBlockedTimes();
  };

  const handleDeleteBlockedTime = async (id: string) => {
    const { error } = await supabase
      .from('blocked_times')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blocked time:', error);
      toast.error('Failed to remove blocked time');
      return;
    }

    toast.success('Blocked time removed');
    fetchBlockedTimes();
  };

  const fetchBookings = async () => {
    if (!hairdresserId) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        total_price,
        status,
        customer_id,
        services (
          name
        ),
        profiles!bookings_customer_id_fkey (
          full_name
        )
      `)
      .eq('hairdresser_id', hairdresserId)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    // Transform data to match the Booking interface
    const transformedBookings: Booking[] = (data || []).map((booking: any) => {
      const date = new Date(booking.appointment_date);
      const [hours, minutes] = booking.appointment_time.split(':');
      const hour = parseInt(hours);
      const isPM = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeString = `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;

      return {
        id: booking.id,
        customerName: booking.profiles?.full_name || 'Unknown Customer',
        service: booking.services?.name || 'Service',
        time: timeString,
        duration: booking.duration_minutes || 60,
        status: booking.status as 'confirmed' | 'pending' | 'cancelled',
        cost: `R${booking.total_price?.toFixed(2) || '0.00'}`,
        date: date,
        customerInfo: {
          preferences: [],
          lastService: '',
          lastVisit: '',
          totalVisits: 0,
        }
      };
    });

    setBookings(transformedBookings);
  };

  const getBlockedTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedTimes.filter(bt => bt.blocked_date === dateStr);
  };

  // Generate hours for horizontal timeline (9 AM to 6 PM)
  const generateHours = () => {
    const hours = [];
    for (let hour = 9; hour <= 18; hour++) {
      hours.push({
        hour,
        display: format(new Date(2024, 0, 1, hour, 0), 'h a'),
        timeSlot: `${hour.toString().padStart(2, '0')}:00`
      });
    }
    return hours;
  };

  // Get booking for specific date and hour
  const getBookingForHour = (date: Date, hour: number) => {
    const dayBookings = bookings.filter(booking => isSameDay(booking.date, date));
    return dayBookings.find(booking => {
      const bookingHour = parseInt(booking.time.split(':')[0]);
      const isPM = booking.time.includes('PM');
      const adjustedHour = isPM && bookingHour !== 12 ? bookingHour + 12 : bookingHour;
      return adjustedHour === hour;
    });
  };

  // Navigate days in hourly view
  const navigateDay = (direction: 'prev' | 'next') => {
    setHourlyViewDate(prev => 
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  // Generate time slots for a day (9 AM to 6 PM)
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayBookings = bookings.filter(booking => isSameDay(booking.date, date));
    const dayBlocks = getBlockedTimesForDate(date);
    
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(new Date(2024, 0, 1, hour, minute), 'h:mm a');
        
        // Check if this time is booked
        const booking = dayBookings.find(b => b.time === displayTime);
        
        // Check if this time is blocked
        const isBlocked = dayBlocks.some(block => {
          const blockStart = block.start_time;
          const blockEnd = block.end_time;
          return timeString >= blockStart && timeString < blockEnd;
        });
        
        slots.push({
          time: displayTime,
          available: !booking && !isBlocked,
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

  // Check if a date has bookings or blocked times
  const hasBookings = (date: Date) => {
    return bookings.some(booking => isSameDay(booking.date, date));
  };

  const hasBlockedTimes = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedTimes.some(bt => bt.blocked_date === dateStr);
  };

  // Generate available time slots summary for selected date
  const getAvailableSlotsForDate = (date: Date) => {
    const timeSlots = generateTimeSlots(date);
    const availableSlots = timeSlots.filter(slot => slot.available);
    
    // Group slots by hour for better display
    const groupedSlots = availableSlots.reduce((acc, slot) => {
      const hour = slot.time.split(':')[0];
      const period = slot.time.includes('AM') ? 'AM' : 'PM';
      const hourKey = `${hour} ${period}`;
      
      if (!acc[hourKey]) {
        acc[hourKey] = [];
      }
      acc[hourKey].push(slot.time);
      return acc;
    }, {} as Record<string, string[]>);

    return { availableSlots, groupedSlots };
  };

  const { availableSlots, groupedSlots } = getAvailableSlotsForDate(selectedDate);

  const selectedDateBlocks = getBlockedTimesForDate(selectedDate);

  // Custom day content to show booking indicators
  const modifiers = {
    hasBookings: (date: Date) => hasBookings(date),
    hasBlockedTimes: (date: Date) => hasBlockedTimes(date)
  };

  const modifiersStyles = {
    hasBookings: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: 'bold'
    },
    hasBlockedTimes: {
      backgroundColor: '#ef4444',
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
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setHourlyViewDate(date);
                    setShowHourlyView(true);
                  }
                }}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className={cn("rounded-md border pointer-events-auto")}
              />
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Has bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded"></div>
                  <span>Blocked times</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-border rounded"></div>
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
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBlockTimeDialog(true)}
                    disabled={!hairdresserId}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Block Time
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowDayDetails(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Booking
                  </Button>
                </div>
              </div>

              {/* Bookings */}
              {selectedDateBookings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Bookings</h4>
                  {selectedDateBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-3 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{booking.customerName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.service}</p>
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
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              )}

              {/* Blocked Times */}
              {selectedDateBlocks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Blocked Times</h4>
                  {selectedDateBlocks.map((block) => (
                    <div key={block.id} className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarX className="h-4 w-4 text-destructive" />
                            <span className="font-medium">
                              {block.start_time} - {block.end_time}
                            </span>
                          </div>
                          {block.reason && (
                            <p className="text-sm text-muted-foreground">{block.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlockedTime(block.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDateBookings.length === 0 && selectedDateBlocks.length === 0 && (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No bookings or blocks for this day</p>
                  <p className="text-sm text-muted-foreground">You're available all day!</p>
                </div>
              )}

              {/* Quick stats for the day */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center cursor-pointer" onClick={() => setShowBookingsSummary(true)}>
                  <div className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    {selectedDateBookings.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {selectedDateBlocks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setShowAvailableSlots(true)}>
                  <div className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">
                    {availableSlots.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Available slots</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Hourly Timeline View */}
      <Dialog open={showHourlyView} onOpenChange={setShowHourlyView}>
        <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Daily Schedule - {format(hourlyViewDate, 'EEEE, MMMM d, yyyy')}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Horizontal timeline view showing your appointments throughout the day
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-full">
              {/* Hour Headers */}
              <div className="flex border-b bg-gray-50">
                <div className="w-20 p-2 text-sm font-medium text-gray-600 border-r">
                  Time
                </div>
                {generateHours().map((hour) => (
                  <div 
                    key={hour.hour} 
                    className="flex-1 min-w-24 p-2 text-center text-sm font-medium text-gray-600 border-r"
                  >
                    {hour.display}
                  </div>
                ))}
              </div>

              {/* Timeline Row */}
              <div className="flex min-h-16">
                <div className="w-20 p-2 text-sm text-gray-500 border-r bg-gray-50 flex items-center">
                  Schedule
                </div>
                {generateHours().map((hour) => {
                  const booking = getBookingForHour(hourlyViewDate, hour.hour);
                  return (
                    <div 
                      key={hour.hour} 
                      className={`flex-1 min-w-24 p-1 border-r min-h-16 ${
                        booking 
                          ? booking.status === 'confirmed' 
                            ? 'bg-blue-100 border-blue-200' 
                            : 'bg-yellow-100 border-yellow-200'
                          : 'bg-green-50 hover:bg-green-100 cursor-pointer'
                      }`}
                    >
                      {booking ? (
                        <div className="h-full p-1">
                          <div className={`p-2 rounded text-xs h-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-blue-200 text-blue-800' 
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            <div className="font-medium truncate">{booking.customerName}</div>
                            <div className="text-xs truncate">{booking.service}</div>
                            <div className="text-xs">{booking.cost}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">
                          Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                  <span>Available</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowHourlyView(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookings Summary Modal */}
      <Dialog open={showBookingsSummary} onOpenChange={setShowBookingsSummary}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Appointments Summary - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDateBookings.length} appointments scheduled for this day
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedDateBookings.length > 0 ? (
              selectedDateBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{booking.customerName}</h4>
                      <p className="text-gray-600">{booking.service}</p>
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
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{booking.cost}</span>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {booking.duration} minutes
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Visits:</span>
                        <span>{booking.customerInfo.totalVisits}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Last:</span>
                        <span>{booking.customerInfo.lastService}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-medium text-sm">Preferences:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {booking.customerInfo.preferences.map((pref, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>

                    {booking.customerInfo.notes && (
                      <div className="text-sm">
                        <span className="font-medium text-amber-600">Note:</span>
                        <span className="ml-2 text-gray-600 italic">{booking.customerInfo.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No appointments scheduled</p>
                <p className="text-sm text-gray-500">You're free all day!</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Total: {selectedDateBookings.length} appointments
              {selectedDateBookings.length > 0 && (
                <span className="ml-2">
                  • Total earnings: {selectedDateBookings.reduce((sum, booking) => {
                    const cost = parseInt(booking.cost.replace('R', '').replace(',', ''));
                    return sum + cost;
                  }, 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                </span>
              )}
            </div>
            <Button onClick={() => setShowBookingsSummary(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Slots Summary Modal */}
      <Dialog open={showAvailableSlots} onOpenChange={setShowAvailableSlots}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Available Slots - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {availableSlots.length} time slots are available for booking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedSlots).length > 0 ? (
              Object.entries(groupedSlots).map(([hour, slots]) => (
                <div key={hour} className="space-y-2">
                  <h4 className="font-medium text-gray-900">{hour}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <div
                        key={slot}
                        className="p-2 text-center text-sm bg-green-50 border border-green-200 rounded-md text-green-800"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No available slots</p>
                <p className="text-sm text-gray-500">This day is fully booked</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Total: {availableSlots.length} available slots
            </div>
            <Button onClick={() => setShowAvailableSlots(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Original Day Details Modal */}
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

      {/* Block Time Dialog */}
      <Dialog open={showBlockTimeDialog} onOpenChange={setShowBlockTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Time Slot</DialogTitle>
            <DialogDescription>
              Block a time slot on {format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Lunch break, Personal appointment, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockTimeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBlockedTime} disabled={loading}>
              {loading ? 'Blocking...' : 'Block Time'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarBooking;
