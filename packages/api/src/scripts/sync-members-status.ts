import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { MemberSyncService } from '../services/member-sync.service.js';

dotenv.config();

/**
 * Script to sync all members' status based on their associated user subscription status
 */
async function syncMembersStatus() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database');

    console.log('🔄 Syncing members status with user subscriptions...');
    const result = await MemberSyncService.syncAllMembersStatus();

    console.log(`\n✅ Successfully synced ${result.updated} members`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      result.errors.forEach((error) => console.log(`  - ${error}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing members status:', error);
    process.exit(1);
  }
}

syncMembersStatus();

