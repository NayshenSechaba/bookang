import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarX, Clock, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BlockedTime {
  id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

const BlockedTimesManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [hairdresserId, setHairdresserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');

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

  // Fetch blocked times
  useEffect(() => {
    if (!hairdresserId) return;
    fetchBlockedTimes();
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
        reason: reason || null,
      });

    setLoading(false);

    if (error) {
      console.error('Error adding blocked time:', error);
      toast.error('Failed to block time slot');
      return;
    }

    toast.success('Time slot blocked successfully');
    setShowAddDialog(false);
    setStartTime('09:00');
    setEndTime('17:00');
    setReason('');
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

  const getBlockedTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedTimes.filter(bt => bt.blocked_date === dateStr);
  };

  const selectedDateBlocks = getBlockedTimesForDate(selectedDate);

  const hasBlockedTimes = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedTimes.some(bt => bt.blocked_date === dateStr);
  };

  const modifiers = {
    blocked: (date: Date) => hasBlockedTimes(date)
  };

  const modifiersStyles = {
    blocked: {
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
            <CalendarX className="mr-2 h-5 w-5 text-destructive" />
            Block Calendar Times
          </CardTitle>
          <CardDescription>
            Block time slots when you're unavailable for bookings
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
                className={cn("rounded-md border pointer-events-auto")}
              />
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded"></div>
                  <span>Has blocked times</span>
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
                <Button 
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  disabled={!hairdresserId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Block Time
                </Button>
              </div>

              {selectedDateBlocks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateBlocks.map((block) => (
                    <div key={block.id} className="border rounded-lg p-3 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
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
              ) : (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <CalendarX className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No blocked times for this day</p>
                  <p className="text-sm text-muted-foreground">You're available all day!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Blocked Time Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
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

export default BlockedTimesManagement;
