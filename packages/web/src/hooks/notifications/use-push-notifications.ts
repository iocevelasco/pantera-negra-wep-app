import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from '@/api/notifications';
import { useToast } from '@/hooks/use-toast';

interface UsePushNotificationsOptions {
  autoSubscribe?: boolean;
  autoSubscribeCondition?: () => boolean;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: Error | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  permission: NotificationPermission;
  isActivating: boolean;
  hasActivated: boolean;
}

export function usePushNotifications(
  options: UsePushNotificationsOptions = {}
): UsePushNotificationsReturn {
  const { autoSubscribe = false, autoSubscribeCondition } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isActivating, setIsActivating] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const hasAttemptedAutoSubscribe = useRef(false);
  const { toast } = useToast();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(supported);

      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Check subscription status on mount
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('[PUSH] Error checking subscription:', err);
      }
    };

    checkSubscription();
  }, [isSupported]);

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      throw new Error('Notification permission was previously denied');
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted');
    }

    return permission;
  }, []);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Request permission
      await requestPermission();

      // Step 2: Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[PUSH] Service Worker registered:', registration);
      }

      // Step 3: Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Step 4: Get VAPID public key from server
      const vapidPublicKey = await notificationsApi.getVapidPublicKey();

      // Step 5: Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Convert VAPID key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      // Step 6: Send subscription to server
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      await notificationsApi.subscribe(
        subscriptionData,
        navigator.userAgent
      );

      setIsSubscribed(true);
      toast({
        title: 'Notificaciones activadas',
        description: 'Ahora recibirás notificaciones push',
      });
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe');
      setError(error);
      toast({
        title: 'Error al activar notificaciones',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission, toast]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await notificationsApi.unsubscribe(subscription.endpoint);

        setIsSubscribed(false);
        toast({
          title: 'Notificaciones desactivadas',
          description: 'Ya no recibirás notificaciones push',
        });
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe');
      setError(error);
      toast({
        title: 'Error al desactivar notificaciones',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission, toast]);

  // Auto-subscribe to push notifications
  useEffect(() => {
    if (!autoSubscribe) return;

    // Check if we should attempt auto-subscribe
    const shouldAttempt = autoSubscribeCondition
      ? autoSubscribeCondition()
      : true;

    // Only attempt once, when conditions are met and not already subscribed
    if (
      !hasAttemptedAutoSubscribe.current &&
      shouldAttempt &&
      isSupported &&
      !isSubscribed &&
      permission !== 'denied' &&
      !isLoading
    ) {
      hasAttemptedAutoSubscribe.current = true;
      setIsActivating(true);

      subscribe()
        .then(() => {
          setHasActivated(true);
          setIsActivating(false);
          // Hide the alert after 5 seconds
          setTimeout(() => {
            setHasActivated(false);
          }, 5000);
        })
        .catch((error) => {
          console.error('[PUSH] Failed to auto-subscribe:', error);
          setIsActivating(false);
          // Don't show error if permission was denied (user rejected)
          if (error.message?.includes('permission')) {
            hasAttemptedAutoSubscribe.current = false; // Allow retry if permission changes
          }
        });
    }
  }, [
    autoSubscribe,
    autoSubscribeCondition,
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
  ]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
    permission,
    isActivating,
    hasActivated,
  };
}

/**
 * Convert VAPID public key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

