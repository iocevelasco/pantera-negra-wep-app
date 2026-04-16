import { MembershipModel } from '../models/Membership.js';

/**
 * Service to sync membership status
 */
export class MemberSyncService {
  /**
   * Sync all memberships' status based on subscription expiration
   */
  static async syncAllMembersStatus(): Promise<{ updated: number; errors: string[] }> {
    const result = { updated: 0, errors: [] as string[] };

    try {
      const memberships = await MembershipModel.find().lean();

      // Update memberships based on subscription expiration
      for (const membership of memberships) {
        try {
          let newStatus = membership.status;

          // Check subscription expiration if available
          if (membership.subscriptionExpiresAt) {
            const expirationDate = new Date(membership.subscriptionExpiresAt);
            if (new Date() > expirationDate && membership.status === 'Active') {
              newStatus = 'Past Due';
            }
          }

          // Only update if status changed
          if (newStatus !== membership.status) {
            await MembershipModel.findByIdAndUpdate(membership._id, {
              $set: { status: newStatus },
            });
            result.updated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Membership ${membership._id}: ${errorMessage}`);
        }
      }

      console.log(`✅ Synced ${result.updated} memberships' status`);
      if (result.errors.length > 0) {
        console.warn(`⚠️  ${result.errors.length} errors during sync`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('❌ Error syncing memberships status:', error);
    }

    return result;
  }

  /**
   * Sync a specific membership's status based on subscription expiration
   */
  static async syncMembershipStatus(membershipId: string): Promise<boolean> {
    try {
      const membership = await MembershipModel.findById(membershipId);
      if (!membership) {
        return false;
      }

      let newStatus = membership.status;

      // Check membership's subscription expiration if available
      if (membership.subscriptionExpiresAt) {
        const expirationDate = new Date(membership.subscriptionExpiresAt);
        if (new Date() > expirationDate && membership.status === 'Active') {
          newStatus = 'Past Due';
        }
      }

      // Only update if status changed
      if (newStatus !== membership.status) {
        membership.status = newStatus as any;
        await membership.save();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing membership status:', error);
      return false;
    }
  }
}
