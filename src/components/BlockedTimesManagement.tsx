import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BlockedTime {
  id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

const BlockedTimesManagement = () => {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [hairdresserId, setHairdresserId] = useState<string | null>(null);

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
        .single();

      if (hairdresser) {
        setHairdresserId(hairdresser.id);
      }
    };

    fetchHairdresserId();
  }, []);

  // Fetch blocked times
  useEffect(() => {
    if (!hairdresserId) return;

    const fetchBlockedTimes = async () => {
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

    fetchBlockedTimes();

    // Subscribe to changes
    const channel = supabase
      .channel('blocked_times_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocked_times',
          filter: `hairdresser_id=eq.${hairdresserId}`
        },
        () => {
          fetchBlockedTimes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hairdresserId]);

  const handleAddBlockedTime = async () => {
    if (!selectedDate || !hairdresserId) {
      toast.error('Please select a date');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
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
        reason: reason || null
      });

    setLoading(false);

    if (error) {
      toast.error('Failed to block time');
      console.error('Error blocking time:', error);
      return;
    }

    toast.success('Time blocked successfully');
    setShowAddDialog(false);
    setSelectedDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setReason('');
  };

  const handleDeleteBlockedTime = async (id: string) => {
    const { error } = await supabase
      .from('blocked_times')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to unblock time');
      console.error('Error unblocking time:', error);
      return;
    }

    toast.success('Time unblocked successfully');
  };

  // Group blocked times by date
  const groupedBlockedTimes = blockedTimes.reduce((acc, time) => {
    const date = time.blocked_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(time);
    return acc;
  }, {} as Record<string, BlockedTime[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              Blocked Times
            </CardTitle>
            <CardDescription>
              Manage unavailable time slots in your calendar
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Block Time
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Block Time Slot</DialogTitle>
                <DialogDescription>
                  Select a date and time range to mark as unavailable
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
                    placeholder="e.g., Lunch break, Personal appointment..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleAddBlockedTime}
                  disabled={loading || !selectedDate}
                  className="w-full"
                >
                  {loading ? 'Blocking...' : 'Block Time'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedBlockedTimes).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No blocked times</p>
            <p className="text-sm">Block time slots when you're unavailable</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedBlockedTimes).map(([date, times]) => (
              <div key={date} className="space-y-2">
                <h4 className="font-semibold text-sm">
                  {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                </h4>
                <div className="space-y-2">
                  {times.map((time) => (
                    <div
                      key={time.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {time.start_time.slice(0, 5)} - {time.end_time.slice(0, 5)}
                          </span>
                        </div>
                        {time.reason && (
                          <p className="text-sm text-muted-foreground mt-1 ml-6">
                            {time.reason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlockedTime(time.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockedTimesManagement;
