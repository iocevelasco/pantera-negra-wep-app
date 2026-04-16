import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import type { UserRole } from '@pantera-negra/shared';

/**
 * Migration script to convert single role to multiple roles
 * - Admins will get both 'admin' and 'instructor' roles
 * - Other users keep their existing role
 */
async function migrateUserRoles() {
  try {
    console.log('🔄 Starting user roles migration...');
    
    await connectDatabase();
    console.log('✅ Connected to database');

    // Get all users
    const users = await UserModel.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if user already has roles array (already migrated)
      if (Array.isArray((user as any).roles) && (user as any).roles.length > 0) {
        console.log(`⏭️  User ${user.email} already has roles array, skipping...`);
        skipped++;
        continue;
      }

      // Get old role from the document
      const oldRole = (user as any).role as UserRole | undefined;
      
      if (!oldRole) {
        console.log(`⚠️  User ${user.email} has no role, setting to 'student'...`);
        (user as any).roles = ['student'];
      } else {
        // Convert single role to roles array
        const newRoles: UserRole[] = [];
        
        if (oldRole === 'admin' || oldRole === 'owner') {
          // Admins and owners also get instructor role
          newRoles.push(oldRole);
          if (!newRoles.includes('instructor')) {
            newRoles.push('instructor');
          }
        } else {
          // Other roles stay as is
          newRoles.push(oldRole);
        }

        (user as any).roles = newRoles;
        console.log(`✅ Migrated ${user.email}: ${oldRole} -> [${newRoles.join(', ')}]`);
      }

      // Remove old role field (optional, for cleanup)
      // (user as any).role = undefined;
      
      await user.save();
      migrated++;
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   - Migrated: ${migrated} users`);
    console.log(`   - Skipped: ${skipped} users`);
    console.log(`   - Total: ${users.length} users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateUserRoles();
