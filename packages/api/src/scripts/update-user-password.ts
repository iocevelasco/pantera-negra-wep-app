import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';

dotenv.config();

async function updateUserPassword() {
  try {
    // Get email and password from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('\nUsage: pnpm update:user-password <email> <password> [tenantId]');
      console.log('Example: pnpm update:user-password user@example.com "TempPassword123!" "692d9f2978f0f8971dd5e65b"');
      process.exit(1);
    }

    if (!password) {
      console.error('❌ Error: Password is required');
      console.log('\nUsage: pnpm update:user-password <email> <password> [tenantId]');
      console.log('Example: pnpm update:user-password user@example.com "TempPassword123!" "692d9f2978f0f8971dd5e65b"');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 8) {
      console.warn('⚠️  Warning: Password is less than 8 characters. Consider using a stronger password.');
    }

    await connectDatabase();
    console.log('✅ Connected to database');

    // Get tenant ID from command line arguments or use first valid tenant
    const tenantIdArg = process.argv[4];
    let tenant;
    
    if (tenantIdArg) {
      tenant = await TenantModel.findById(tenantIdArg);
      if (!tenant) {
        console.error(`❌ Error: Tenant with ID ${tenantIdArg} not found`);
        process.exit(1);
      }
    } else {
      // Use first available tenant if no tenant ID provided
      tenant = await TenantModel.findOne().sort({ _id: 1 });
      if (!tenant) {
        console.error('❌ Error: No tenants found in database. Please create tenants first.');
        process.exit(1);
      }
      console.log(`⚠️  Warning: No tenant ID provided. Using first tenant: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: normalizedEmail }).select('+password');
    
    // Hash new password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (!user) {
      // Create new user if it doesn't exist
      console.log(`⚠️  User not found. Creating new user...`);
      user = await UserModel.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        email_verified: true,
        password: hashedPassword,
        tenant_id: tenant._id,
        roles: ['student'],
        rank: 'White',
        stripes: 0,
      });
      console.log('✅ Created new user');
    } else {
      // Update existing user password
      user.password = hashedPassword;
      await user.save();
      console.log('✅ Updated existing user password');
    }

    console.log('\n✅ Password updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${user.name || 'N/A'}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Roles: ${user.roles?.join(', ') || 'N/A'}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user password:', error);
    process.exit(1);
  }
}

updateUserPassword();

