import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Archive, Trash2, MailOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Notification {
  id: string;
  notification_type: string;
  subject: string;
  message_body: string;
  is_read: boolean;
  created_at: string;
  booking_reference: string | null;
  user_type: string;
}

type FilterType = "all" | "unread" | "bookings" | "reviews" | "alerts";

export function InboxView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("inbox-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.is_read);
      case "bookings":
        return notifications.filter((n) =>
          ["booking_confirmation", "cancellation_alert", "booking_modification"].includes(
            n.notification_type
          )
        );
      case "reviews":
        return notifications.filter((n) =>
          ["review_request", "new_review"].includes(n.notification_type)
        );
      case "alerts":
        return notifications.filter((n) => n.notification_type === "system_alert");
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "booking_confirmation":
        return "Booking Confirmed";
      case "cancellation_alert":
        return "Cancellation";
      case "review_request":
        return "Review Request";
      case "new_review":
        return "New Review";
      case "booking_modification":
        return "Booking Modified";
      case "system_alert":
        return "System Alert";
      default:
        return "Notification";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} unread</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading messages...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                          !notification.is_read
                            ? "bg-accent/50 border-primary/50"
                            : "border-border"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {!notification.is_read && (
                                <div className="h-2 w-2 bg-primary rounded-full" />
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {getNotificationTypeLabel(notification.notification_type)}
                              </Badge>
                              {notification.booking_reference && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.booking_reference}
                                </Badge>
                              )}
                            </div>
                            <h4
                              className={`text-sm mb-1 ${
                                !notification.is_read ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {notification.subject}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message_body}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")} SAST
                            </p>
                          </div>
                          {!notification.is_read ? (
                            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <MailOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedNotification && getNotificationTypeLabel(selectedNotification.notification_type)}
              </Badge>
              {selectedNotification?.booking_reference && (
                <Badge variant="outline">
                  {selectedNotification.booking_reference}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedNotification && format(new Date(selectedNotification.created_at), "MMMM d, yyyy 'at' h:mm a")} SAST
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedNotification?.message_body}</p>
            </div>
            <div className="text-xs text-muted-foreground border-t pt-4">
              Data processed in compliance with the South African POPIA Act
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
