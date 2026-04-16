import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { SubscriptionService } from '../services/subscription.service.js';

dotenv.config();

/**
 * Script to expire all existing subscriptions for users with 'student' or 'instructor' roles
 */
async function expireAllSubscriptions() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database');

    console.log('🔄 Expiring all subscriptions...');
    const result = await SubscriptionService.expireSubscriptions();

    if (result.success) {
      console.log(`\n✅ Successfully expired ${result.expiredCount} subscriptions`);
      console.log(`📅 Timestamp: ${result.timestamp.toISOString()}`);
      
      if (result.errors.length > 0) {
        console.log(`\n⚠️  Errors encountered:`);
        result.errors.forEach((error) => console.log(`  - ${error}`));
      }
    } else {
      console.error('❌ Failed to expire subscriptions');
      if (result.errors.length > 0) {
        result.errors.forEach((error) => console.error(`  - ${error}`));
      }
      process.exit(1);
    }

    // Get stats after expiration
    console.log('\n📊 Current subscription statistics:');
    const stats = await SubscriptionService.getSubscriptionStats();
    console.log(`  Total memberships: ${stats.totalMemberships}`);
    console.log(`  Active memberships: ${stats.activeMemberships}`);
    console.log(`  Past Due memberships: ${stats.expiredMemberships}`);
    console.log(`  Inactive memberships: ${stats.inactiveMemberships}`);
    console.log(`  Expiring soon (next 7 days): ${stats.expiringSoon}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error expiring subscriptions:', error);
    process.exit(1);
  }
}

expireAllSubscriptions();

