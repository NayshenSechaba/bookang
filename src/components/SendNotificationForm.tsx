import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SendNotificationForm() {
  const [bookingReference, setBookingReference] = useState("");
  const [notificationType, setNotificationType] = useState<"booking_confirmation" | "cancellation_alert">("booking_confirmation");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!bookingReference) {
      toast({
        title: "Error",
        description: "Please enter a booking reference",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          reference_number,
          appointment_date,
          appointment_time,
          customer_id,
          service_id,
          services (name)
        `)
        .eq("reference_number", bookingReference)
        .single();

      if (bookingError || !booking) {
        throw new Error("Booking not found");
      }

      // Get customer profile
      const { data: customer } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("id", booking.customer_id)
        .single();

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get current user profile (sender)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Get message template
      const { data: template } = await supabase
        .from("message_templates")
        .select("subject, body_template")
        .eq("notification_type", notificationType)
        .single();

      if (!template) throw new Error("Template not found");

      // Replace template variables
      const subject = template.subject
        .replace("{booking_reference}", booking.reference_number);
      
      const messageBody = template.body_template
        .replace("{booking_reference}", booking.reference_number)
        .replace("{appointment_date}", booking.appointment_date)
        .replace("{appointment_time}", booking.appointment_time)
        .replace("{service_name}", booking.services?.name || "N/A");

      // Create notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_type: "Customer",
          recipient_id: customer.id,
          sender_id: senderProfile?.id,
          notification_type: notificationType,
          subject,
          message_body: messageBody,
          booking_reference: booking.reference_number,
          booking_id: booking.id,
        });

      if (notificationError) throw notificationError;

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: {
            booking_id: booking.id,
            notification_type: notificationType,
          },
        });

        if (emailError) {
          console.error('Email send error:', emailError);
          toast({
            title: "Warning",
            description: "Notification created but email failed to send",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `${notificationType === "booking_confirmation" ? "Confirmation" : "Cancellation"} notification and email sent successfully`,
          });
        }
      } catch (emailErr) {
        console.error('Email invocation error:', emailErr);
        toast({
          title: "Warning",
          description: "Notification created but email failed to send",
          variant: "destructive",
        });
      }

      setBookingReference("");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Manual Notification
        </CardTitle>
        <CardDescription>
          Send booking confirmation or cancellation alerts manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking-ref">Booking Reference</Label>
          <Input
            id="booking-ref"
            placeholder="e.g., BK12345678"
            value={bookingReference}
            onChange={(e) => setBookingReference(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select
            value={notificationType}
            onValueChange={(v) => setNotificationType(v as any)}
          >
            <SelectTrigger id="notification-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking_confirmation">
                Booking Confirmation
              </SelectItem>
              <SelectItem value="cancellation_alert">
                Cancellation Alert
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSendNotification}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Sending..." : "Send Notification"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Data processed in compliance with the South African POPIA Act
        </p>
      </CardContent>
    </Card>
  );
}
