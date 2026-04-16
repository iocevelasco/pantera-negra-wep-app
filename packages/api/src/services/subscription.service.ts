import mongoose from 'mongoose';
import { MembershipModel } from '../models/Membership.js';
import { connectDatabase } from '../config/database.js';

export interface SubscriptionExpirationResult {
  success: boolean;
  expiredCount: number;
  errors: string[];
  timestamp: Date;
}

/**
 * Service for managing subscription expirations
 */
export class SubscriptionService {
  /**
   * Expire subscriptions for memberships that have passed their expiration date
   * This should be called at the end of each month
   */
  static async expireSubscriptions(): Promise<SubscriptionExpirationResult> {
    const result: SubscriptionExpirationResult = {
      success: false,
      expiredCount: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      // Ensure database connection
      if (mongoose.connection.readyState !== 1) {
        await connectDatabase();
      }

      const now = new Date();

      // Find all active memberships that have expired
      const expiredMemberships = await MembershipModel.find({
        status: 'Active',
        subscriptionExpiresAt: { $lte: now.toISOString() },
      }).lean();

      if (expiredMemberships.length === 0) {
        result.success = true;
        return result;
      }

      // Update memberships to Past Due status
      const membershipIds = expiredMemberships.map((m) => m._id);

      const updateResult = await MembershipModel.updateMany(
        {
          _id: { $in: membershipIds },
        },
        {
          $set: {
            status: 'Past Due',
          },
        }
      );

      result.expiredCount = updateResult.modifiedCount;
      result.success = true;

      console.log(
        `✅ Subscription expiration completed: ${result.expiredCount} memberships expired at ${result.timestamp.toISOString()}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('❌ Error expiring subscriptions:', error);
    }

    return result;
  }

  /**
   * Get statistics about subscriptions
   */
  static async getSubscriptionStats() {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDatabase();
      }

      const totalMemberships = await MembershipModel.countDocuments();
      const activeMemberships = await MembershipModel.countDocuments({
        status: 'Active',
      });
      const expiredMemberships = await MembershipModel.countDocuments({
        status: 'Past Due',
      });
      const inactiveMemberships = await MembershipModel.countDocuments({
        status: 'Inactive',
      });

      // Get memberships with expiring subscriptions in the next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringSoon = await MembershipModel.countDocuments({
        subscriptionExpiresAt: {
          $lte: sevenDaysFromNow.toISOString(),
          $gte: new Date().toISOString(),
        },
        status: 'Active',
      });

      return {
        totalMemberships,
        activeMemberships,
        expiredMemberships,
        inactiveMemberships,
        expiringSoon,
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  }

  /**
   * Manually expire a specific membership's subscription
   */
  static async expireMembershipSubscription(membershipId: string): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDatabase();
      }

      await MembershipModel.findByIdAndUpdate(membershipId, {
        $set: {
          status: 'Past Due',
        },
      });

      return true;
    } catch (error) {
      console.error('Error expiring membership subscription:', error);
      return false;
    }
  }

  /**
   * Reactivate a membership's subscription
   */
  static async reactivateSubscription(membershipId: string, expiresAt?: string): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDatabase();
      }

      // If no expiration date provided, set to one month from now
      let expirationDate = expiresAt;
      if (!expirationDate) {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        expirationDate = nextMonth.toISOString();
      }

      await MembershipModel.findByIdAndUpdate(membershipId, {
        $set: {
          status: 'Active',
          subscriptionExpiresAt: expirationDate,
        },
      });

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return false;
    }
  }
}
