import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWebNotifications } from '@/hooks/useWebNotifications';

export function WebNotificationManager() {
  const navigate = useNavigate();
  const { permission, profileId, showNotification } = useWebNotifications();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!profileId || permission !== 'granted' || subscribedRef.current) {
      return;
    }

    subscribedRef.current = true;
    console.log('Setting up web notification listeners for profile:', profileId);

    // Listen for new bookings
    const bookingsChannel = supabase
      .channel('web-notifications-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          console.log('New booking detected:', payload);
          const booking = payload.new;
          
          // Get customer name
          const { data: customer } = await supabase
            .from('profiles')
            .select('full_name, name')
            .eq('id', booking.customer_id)
            .single();

          const customerName = customer?.full_name || customer?.name || 'A customer';
          
          showNotification({
            title: '🎉 New Booking!',
            body: `${customerName} has made a new booking for ${booking.appointment_date}`,
            tag: `booking-${booking.id}`,
            onClick: () => navigate('/'),
          });
        }
      )
      .subscribe();

    // Listen for booking cancellations
    const cancellationsChannel = supabase
      .channel('web-notifications-cancellations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          const oldStatus = (payload.old as any)?.status;
          const newStatus = payload.new.status;

          // Only notify on cancellation
          if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
            console.log('Booking cancelled:', payload);
            const booking = payload.new;

            // Get customer name
            const { data: customer } = await supabase
              .from('profiles')
              .select('full_name, name')
              .eq('id', booking.customer_id)
              .single();

            const customerName = customer?.full_name || customer?.name || 'A customer';

            showNotification({
              title: '❌ Booking Cancelled',
              body: `${customerName} has cancelled their booking for ${booking.appointment_date}`,
              tag: `cancellation-${booking.id}`,
              onClick: () => navigate('/'),
            });
          }
        }
      )
      .subscribe();

    // Listen for new notifications (messages, inbox items)
    const notificationsChannel = supabase
      .channel('web-notifications-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profileId}`,
        },
        (payload) => {
          console.log('New notification/message:', payload);
          const notification = payload.new;

          showNotification({
            title: getNotificationTitle(notification.notification_type),
            body: notification.subject || notification.message_body?.substring(0, 100),
            tag: `notification-${notification.id}`,
            onClick: () => navigate('/'),
          });
        }
      )
      .subscribe();

    // Listen for inbox messages
    const inboxChannel = supabase
      .channel('web-notifications-inbox')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbox_messages',
          filter: `user_id=eq.${profileId}`,
        },
        (payload) => {
          console.log('New inbox message:', payload);
          const message = payload.new;

          showNotification({
            title: '📬 New Message',
            body: message.subject || 'You have a new message',
            tag: `inbox-${message.id}`,
            onClick: () => navigate('/'),
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up web notification listeners');
      subscribedRef.current = false;
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(cancellationsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(inboxChannel);
    };
  }, [profileId, permission, showNotification, navigate]);

  return null; // This is a manager component, no UI
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'booking_confirmation':
      return '✅ Booking Confirmed';
    case 'cancellation_alert':
      return '❌ Booking Cancelled';
    case 'review_request':
      return '⭐ Review Request';
    case 'new_review':
      return '⭐ New Review';
    case 'booking_modification':
      return '🔄 Booking Updated';
    case 'verification_status':
      return '🔔 Verification Update';
    default:
      return '🔔 New Notification';
  }
}
