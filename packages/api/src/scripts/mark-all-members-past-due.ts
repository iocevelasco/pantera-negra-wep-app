import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { MembershipModel } from '../models/Membership.js';

dotenv.config();

/**
 * Script to mark ALL memberships as "Past Due"
 * Use with caution!
 */
async function markAllMembersPastDue() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database');

    // Get count of all memberships
    const totalMemberships = await MembershipModel.countDocuments();
    console.log(`📊 Found ${totalMemberships} total memberships`);

    if (totalMemberships === 0) {
      console.log('✅ No memberships to update');
      process.exit(0);
    }

    // Get count of memberships that are not already Past Due
    const membershipsNotPastDue = await MembershipModel.countDocuments({
      status: { $ne: 'Past Due' },
    });

    console.log(`📊 Found ${membershipsNotPastDue} memberships that are not Past Due`);

    if (membershipsNotPastDue === 0) {
      console.log('✅ All memberships are already marked as Past Due');
      process.exit(0);
    }

    console.log('🔄 Marking all memberships as Past Due...');
    const updateResult = await MembershipModel.updateMany(
      {},
      {
        $set: {
          status: 'Past Due',
        },
      }
    );

    console.log(`\n✅ Successfully updated ${updateResult.modifiedCount} memberships to Past Due`);

    // Get stats after update
    console.log('\n📊 Updated membership statistics:');
    const totalMembershipsAfter = await MembershipModel.countDocuments();
    const activeMemberships = await MembershipModel.countDocuments({
      status: 'Active',
    });
    const inactiveMemberships = await MembershipModel.countDocuments({
      status: 'Inactive',
    });
    const pastDueMemberships = await MembershipModel.countDocuments({
      status: 'Past Due',
    });

    console.log(`  Total memberships: ${totalMembershipsAfter}`);
    console.log(`  Active memberships: ${activeMemberships}`);
    console.log(`  Inactive memberships: ${inactiveMemberships}`);
    console.log(`  Past Due memberships: ${pastDueMemberships}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error marking members as Past Due:', error);
    process.exit(1);
  }
}

markAllMembersPastDue();

