import { VAPID_CONFIG } from '../config/app.config.js';
import { PushSubscriptionModel } from '../models/PushSubscription.js';
import type { PushSubscriptionDocument } from '../models/PushSubscription.js';
import { sendPushNotification } from '../lib/web-push-native.js';
import mongoose from 'mongoose';

// Check VAPID configuration
if (VAPID_CONFIG.PUBLIC_KEY && VAPID_CONFIG.PRIVATE_KEY) {
  console.log('✅ [PUSH] VAPID keys configured (using native implementation)');
} else {
  console.warn('⚠️  [PUSH] VAPID keys not configured. Push notifications will not work.');
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  /**
   * Subscribe a user to push notifications
   */
  static async subscribe(
    userId: mongoose.Types.ObjectId,
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
    userAgent?: string
  ): Promise<PushSubscriptionDocument> {
    // Check if subscription already exists
    const existing = await PushSubscriptionModel.findOne({
      endpoint: subscription.endpoint,
    });

    if (existing) {
      // Update existing subscription
      existing.user_id = userId;
      existing.keys = subscription.keys;
      if (userAgent) {
        existing.userAgent = userAgent;
      }
      return await existing.save();
    }

    // Create new subscription
    const pushSubscription = new PushSubscriptionModel({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
    });

    return await pushSubscription.save();
  }

  /**
   * Unsubscribe a user from push notifications
   */
  static async unsubscribe(endpoint: string): Promise<void> {
    await PushSubscriptionModel.deleteOne({ endpoint });
  }

  /**
   * Unsubscribe all subscriptions for a user
   */
  static async unsubscribeUser(userId: mongoose.Types.ObjectId): Promise<void> {
    await PushSubscriptionModel.deleteMany({ user_id: userId });
  }

  /**
   * Send a push notification to a specific subscription
   */
  static async sendToSubscription(
    subscription: PushSubscriptionDocument,
    payload: NotificationPayload
  ): Promise<void> {
    if (!VAPID_CONFIG.PUBLIC_KEY || !VAPID_CONFIG.PRIVATE_KEY) {
      throw new Error('VAPID keys not configured');
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      image: payload.image,
      data: payload.data || {},
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
    });

    try {
      await sendPushNotification(
        pushSubscription,
        notificationPayload,
        VAPID_CONFIG.PUBLIC_KEY,
        VAPID_CONFIG.PRIVATE_KEY,
        VAPID_CONFIG.SUBJECT
      );
    } catch (error: any) {
      // If subscription is invalid, remove it from database
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`[PUSH] Removing invalid subscription: ${subscription.endpoint}`);
        await PushSubscriptionModel.deleteOne({ _id: subscription._id });
      }
      throw error;
    }
  }

  /**
   * Send a push notification to a user (all their subscriptions)
   */
  static async sendToUser(
    userId: mongoose.Types.ObjectId,
    payload: NotificationPayload
  ): Promise<number> {
    const subscriptions = await PushSubscriptionModel.find({ user_id: userId });

    if (subscriptions.length === 0) {
      return 0;
    }

    let successCount = 0;
    const errors: Error[] = [];

    // Send to all subscriptions in parallel
    const promises = subscriptions.map(async (subscription) => {
      try {
        await this.sendToSubscription(subscription, payload);
        successCount++;
      } catch (error) {
        errors.push(error as Error);
      }
    });

    await Promise.allSettled(promises);

    if (errors.length > 0) {
      console.warn(`[PUSH] ${errors.length} notifications failed for user ${userId}`);
    }

    return successCount;
  }

  /**
   * Send a push notification to multiple users
   */
  static async sendToUsers(
    userIds: mongoose.Types.ObjectId[],
    payload: NotificationPayload
  ): Promise<number> {
    let totalSuccess = 0;

    for (const userId of userIds) {
      const count = await this.sendToUser(userId, payload);
      totalSuccess += count;
    }

    return totalSuccess;
  }

  /**
   * Send a push notification to all subscribers
   */
  static async sendToAll(payload: NotificationPayload): Promise<number> {
    const subscriptions = await PushSubscriptionModel.find();

    if (subscriptions.length === 0) {
      return 0;
    }

    let successCount = 0;
    const errors: Error[] = [];

    const promises = subscriptions.map(async (subscription) => {
      try {
        await this.sendToSubscription(subscription, payload);
        successCount++;
      } catch (error) {
        errors.push(error as Error);
      }
    });

    await Promise.allSettled(promises);

    if (errors.length > 0) {
      console.warn(`[PUSH] ${errors.length} notifications failed`);
    }

    return successCount;
  }

  /**
   * Get all subscriptions for a user
   */
  static async getUserSubscriptions(
    userId: mongoose.Types.ObjectId
  ): Promise<PushSubscriptionDocument[]> {
    return await PushSubscriptionModel.find({ user_id: userId });
  }

  /**
   * Get subscription count for a user
   */
  static async getUserSubscriptionCount(
    userId: mongoose.Types.ObjectId
  ): Promise<number> {
    return await PushSubscriptionModel.countDocuments({ user_id: userId });
  }
}

