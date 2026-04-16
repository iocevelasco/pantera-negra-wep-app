import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { PushNotificationService } from '../services/push-notification.service.js';
import { VAPID_CONFIG } from '../config/app.config.js';
import { UserModel } from '../models/User.js';
import { isAdmin } from '../utils/roles.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /api/notifications/vapid-public-key
 * Get the VAPID public key for client-side subscription
 */
router.get('/vapid-public-key', (req, res) => {
  if (!VAPID_CONFIG.PUBLIC_KEY) {
    return res.status(503).json({
      error: 'Push notifications are not configured',
      message: 'VAPID public key is not set',
    });
  }

  res.json({
    publicKey: VAPID_CONFIG.PUBLIC_KEY,
  });
});

/**
 * POST /api/notifications/subscribe
 * Subscribe a user to push notifications
 * Requires authentication
 */
router.post('/subscribe', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { subscription, userAgent } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        error: 'Invalid subscription',
        message: 'Subscription must include endpoint and keys',
      });
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({
        error: 'Invalid subscription keys',
        message: 'Subscription keys must include p256dh and auth',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify user exists
    const user = await UserModel.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pushSubscription = await PushNotificationService.subscribe(
      userObjectId,
      subscription,
      userAgent || req.headers['user-agent']
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: pushSubscription._id,
        endpoint: pushSubscription.endpoint,
      },
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Subscribe error:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
      message: error.message,
    });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe a user from push notifications
 * Requires authentication
 */
router.post('/unsubscribe', isAuthenticated, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Endpoint is required',
      });
    }

    await PushNotificationService.unsubscribe(endpoint);

    res.json({
      message: 'Unsubscribed successfully',
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Unsubscribe error:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe',
      message: error.message,
    });
  }
});

/**
 * GET /api/notifications/subscriptions
 * Get all subscriptions for the authenticated user
 * Requires authentication
 */
router.get('/subscriptions', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const subscriptions = await PushNotificationService.getUserSubscriptions(
      userObjectId
    );

    res.json({
      subscriptions: subscriptions.map((sub) => ({
        id: sub._id,
        endpoint: sub.endpoint,
        userAgent: sub.userAgent,
        createdAt: sub.createdAt,
      })),
      count: subscriptions.length,
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Get subscriptions error:', error);
    res.status(500).json({
      error: 'Failed to get subscriptions',
      message: error.message,
    });
  }
});

/**
 * POST /api/notifications/send
 * Send a push notification (admin only)
 * Requires authentication and admin role
 */
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await UserModel.findById(userId).select('roles').lean();
    if (!user || !isAdmin(user.roles)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userIds, payload } = req.body;

    if (!payload || !payload.title || !payload.body) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'Payload must include title and body',
      });
    }

    let successCount = 0;

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // Send to specific users
      const userObjectIds = userIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      successCount = await PushNotificationService.sendToUsers(
        userObjectIds,
        payload
      );
    } else {
      // Send to all subscribers
      successCount = await PushNotificationService.sendToAll(payload);
    }

    res.json({
      message: 'Notifications sent successfully',
      successCount,
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Send error:', error);
    res.status(500).json({
      error: 'Failed to send notifications',
      message: error.message,
    });
  }
});

export const notificationsRouter = router;

