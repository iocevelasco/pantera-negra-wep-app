import { apiClient } from '@/lib/api-client';
import type {
  PushSubscription,
  NotificationPayload,
  VapidPublicKeyResponse,
  SubscriptionResponse,
  UserSubscriptionsResponse,
} from '@pantera-negra/shared';

export const notificationsApi = {
  /**
   * Get VAPID public key from server
   */
  async getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<VapidPublicKeyResponse>(
      '/api/notifications/vapid-public-key'
    );
    return response.publicKey;
  },

  /**
   * Subscribe to push notifications
   */
  async subscribe(
    subscription: PushSubscription,
    userAgent?: string
  ): Promise<SubscriptionResponse> {
    return await apiClient.post<SubscriptionResponse>(
      '/api/notifications/subscribe',
      {
        subscription,
        userAgent,
      }
    );
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(endpoint: string): Promise<{ message: string }> {
    return await apiClient.post('/api/notifications/unsubscribe', {
      endpoint,
    });
  },

  /**
   * Get all subscriptions for the current user
   */
  async getSubscriptions(): Promise<UserSubscriptionsResponse> {
    return await apiClient.get<UserSubscriptionsResponse>(
      '/api/notifications/subscriptions'
    );
  },

  /**
   * Send a notification (admin only)
   */
  async sendNotification(
    payload: NotificationPayload,
    userIds?: string[]
  ): Promise<{ message: string; successCount: number }> {
    return await apiClient.post('/api/notifications/send', {
      payload,
      userIds,
    });
  },
};

