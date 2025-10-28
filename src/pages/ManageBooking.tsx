import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, User, Scissors, CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface BookingDetails {
  id: string;
  reference_number: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  total_price: number;
  special_requests: string | null;
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  hairdresser_name: string;
  salon_name: string;
  salon_address: string;
  service_name: string;
}

const ManageBooking = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [tokenId, setTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('verify-booking-token', {
        body: { token }
      });

      if (error) throw error;

      if (data.success) {
        setBooking(data.booking);
        setTokenId(data.token_id);
      } else {
        setError(data.error || 'Invalid or expired booking link');
      }
    } catch (err: any) {
      console.error('Error verifying token:', err);
      setError('This booking link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'confirmed' | 'cancelled') => {
    if (!token) return;

    if (status === 'cancelled' && !cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setActionLoading(true);
      const { data, error } = await supabase.functions.invoke('update-booking-status', {
        body: {
          token,
          status,
          cancellation_reason: status === 'cancelled' ? cancellationReason : null
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setBooking(prev => prev ? { ...prev, status } : null);
      } else {
        toast.error(data.error || 'Failed to update booking');
      }
    } catch (err: any) {
      console.error('Error updating booking:', err);
      toast.error('Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              {error || 'This booking link is no longer valid'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActionable = booking.status === 'pending';

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Booking Details</CardTitle>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>
            <CardDescription>Reference: {booking.reference_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{booking.customer.full_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{booking.salon_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.salon_address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Scissors className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.hairdresser_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{booking.appointment_date}</p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{booking.appointment_time} ({booking.duration_minutes} min)</p>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">R {booking.total_price}</p>
              </div>

              {booking.special_requests && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Special Requests:</p>
                  <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isActionable && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Booking</CardTitle>
              <CardDescription>Confirm or cancel your appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdateStatus('confirmed')}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirm Booking
                </Button>
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder="Reason for cancellation (required)"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={actionLoading || !cancellationReason.trim()}
                  variant="destructive"
                  className="w-full"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancel Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isActionable && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                This booking has already been {booking.status}. No further action is needed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
