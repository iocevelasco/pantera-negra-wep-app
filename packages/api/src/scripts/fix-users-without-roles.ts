import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import type { UserRole } from '@pantera-negra/shared';

dotenv.config();

/**
 * Script to fix users without roles by assigning default 'student' role
 */
async function fixUsersWithoutRoles() {
  try {
    console.log('🔄 Starting fix: Assigning roles to users without roles...');
    
    await connectDatabase();
    console.log('✅ Connected to database');

    // Find all users without roles or with empty roles array
    const usersWithoutRoles = await UserModel.find({
      $or: [
        { roles: { $exists: false } },
        { roles: { $eq: [] } },
        { roles: { $size: 0 } }
      ]
    });

    console.log(`📊 Found ${usersWithoutRoles.length} users without roles`);

    if (usersWithoutRoles.length === 0) {
      console.log('✅ No users found without roles. All users have roles assigned.');
      process.exit(0);
    }

    let fixed = 0;
    let errors = 0;

    // Process each user
    for (const user of usersWithoutRoles) {
      try {
        console.log(`\n👤 Processing user: ${user.email} (${user._id.toString()})`);
        
        // Assign default 'student' role
        user.roles = ['student'];
        await user.save();
        
        console.log(`✅ Assigned 'student' role to ${user.email}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing user ${user.email}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Fix completed!`);
    console.log(`   - Fixed: ${fixed} users`);
    console.log(`   - Errors: ${errors} users`);
    console.log(`   - Total processed: ${usersWithoutRoles.length} users`);

    // Verify fix
    console.log('\n🔍 Verifying fix...');
    const remainingUsersWithoutRoles = await UserModel.countDocuments({
      $or: [
        { roles: { $exists: false } },
        { roles: { $eq: [] } },
        { roles: { $size: 0 } }
      ]
    });

    if (remainingUsersWithoutRoles === 0) {
      console.log('✅ Verification passed: All users now have roles assigned');
    } else {
      console.warn(`⚠️  Verification warning: ${remainingUsersWithoutRoles} users still without roles`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run fix
fixUsersWithoutRoles();
