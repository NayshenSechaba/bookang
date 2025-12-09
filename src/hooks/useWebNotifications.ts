import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface WebNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export function useWebNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Get user profile ID for real-time subscriptions
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setProfileId(profile.id);
        }
      }
    };

    getUserProfile();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Web notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Save to local storage that user enabled notifications
        localStorage.setItem('webNotificationsEnabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((options: WebNotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Cannot show notification: permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: false,
      });

      if (options.onClick) {
        notification.onclick = () => {
          window.focus();
          options.onClick?.();
          notification.close();
        };
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const shouldShowBanner = useCallback(() => {
    if (!isSupported) return false;
    if (permission === 'granted') return false;
    if (permission === 'denied') return false;
    
    // Check if user dismissed the banner
    const dismissed = localStorage.getItem('webNotificationsBannerDismissed');
    if (dismissed) return false;
    
    return true;
  }, [isSupported, permission]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem('webNotificationsBannerDismissed', 'true');
  }, []);

  return {
    permission,
    isSupported,
    profileId,
    requestPermission,
    showNotification,
    shouldShowBanner,
    dismissBanner,
  };
}
