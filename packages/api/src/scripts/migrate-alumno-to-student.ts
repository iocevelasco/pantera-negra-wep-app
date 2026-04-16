import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import type { UserRole } from '@pantera-negra/shared';

dotenv.config();

/**
 * Migration script to update all users with role 'alumno' to 'student'
 * This script updates both:
 * - The old 'role' field (if it exists)
 * - The 'roles' array field
 */
async function migrateAlumnoToStudent() {
  try {
    console.log('🔄 Starting migration: alumno -> student...');
    
    await connectDatabase();
    console.log('✅ Connected to database');

    // Find all users with 'alumno' in their roles array
    const usersWithAlumnoInRoles = await UserModel.find({
      roles: 'alumno'
    });
    console.log(`📊 Found ${usersWithAlumnoInRoles.length} users with 'alumno' in roles array`);

    // Find all users with old 'role' field set to 'alumno'
    const usersWithAlumnoRole = await UserModel.find({
      role: 'alumno'
    } as any);
    console.log(`📊 Found ${usersWithAlumnoRole.length} users with old 'role' field = 'alumno'`);

    // Combine and deduplicate users
    const allUserIds = new Set<string>();
    usersWithAlumnoInRoles.forEach(u => allUserIds.add(u._id.toString()));
    usersWithAlumnoRole.forEach(u => allUserIds.add(u._id.toString()));

    const totalUsers = allUserIds.size;
    console.log(`📊 Total unique users to migrate: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log('✅ No users found with role "alumno". Migration not needed.');
      process.exit(0);
    }

    let migrated = 0;
    let errors = 0;

    // Process each user
    for (const userId of allUserIds) {
      try {
        const user = await UserModel.findById(userId);
        if (!user) {
          console.warn(`⚠️  User ${userId} not found, skipping...`);
          continue;
        }

        let updated = false;

        // Update roles array if it contains 'alumno'
        if (Array.isArray(user.roles) && user.roles.includes('alumno' as any)) {
          user.roles = user.roles.map((role: any) => 
            role === 'alumno' ? 'student' : role
          ) as UserRole[];
          updated = true;
          console.log(`✅ Updated roles array for ${user.email}: ${user.roles.join(', ')}`);
        }

        // Update old 'role' field if it exists and is 'alumno'
        if ((user as any).role === 'alumno') {
          (user as any).role = 'student';
          updated = true;
          console.log(`✅ Updated old role field for ${user.email}: student`);
        }

        if (updated) {
          await user.save();
          migrated++;
        }
      } catch (error) {
        console.error(`❌ Error updating user ${userId}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   - Migrated: ${migrated} users`);
    console.log(`   - Errors: ${errors} users`);
    console.log(`   - Total processed: ${totalUsers} users`);

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const remainingAlumnoInRoles = await UserModel.countDocuments({
      roles: 'alumno'
    });
    const remainingAlumnoRole = await UserModel.countDocuments({
      role: 'alumno'
    } as any);

    if (remainingAlumnoInRoles === 0 && remainingAlumnoRole === 0) {
      console.log('✅ Verification passed: No users with "alumno" role found');
    } else {
      console.warn(`⚠️  Verification warning:`);
      console.warn(`   - Users with 'alumno' in roles array: ${remainingAlumnoInRoles}`);
      console.warn(`   - Users with old 'role' = 'alumno': ${remainingAlumnoRole}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAlumnoToStudent();
