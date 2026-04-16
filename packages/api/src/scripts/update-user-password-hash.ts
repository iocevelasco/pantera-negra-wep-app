import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';

dotenv.config();

async function updateUserPasswordHash() {
  try {
    // Get email and password hash from command line arguments
    const email = process.argv[2];
    const passwordHash = process.argv[3];
    
    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('\nUsage: pnpm update:user-password-hash <email> <password-hash> [tenantId]');
      console.log('Example: pnpm update:user-password-hash user@example.com "$2a$10$..." "692d9f2978f0f8971dd5e65b"');
      process.exit(1);
    }

    if (!passwordHash) {
      console.error('❌ Error: Password hash is required');
      console.log('\nUsage: pnpm update:user-password-hash <email> <password-hash> [tenantId]');
      console.log('Example: pnpm update:user-password-hash user@example.com "$2a$10$..." "692d9f2978f0f8971dd5e65b"');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Validate hash format (should start with $2a$ or $2b$)
    if (!passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$')) {
      console.warn('⚠️  Warning: Password hash does not appear to be a bcrypt hash');
      console.warn('   Bcrypt hashes typically start with $2a$ or $2b$');
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

    // Check if user exists
    const normalizedEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: normalizedEmail });
    
    if (user) {
      // Update existing user with new password hash
      user.password = passwordHash;
      // Ensure user has admin and instructor roles and tenant
      user.roles = ['admin', 'instructor'];
      if (!user.tenant_id || user.tenant_id.toString() !== tenant._id.toString()) {
        user.tenant_id = tenant._id;
      }
      await user.save();
      console.log('✅ Updated existing user password hash');
      console.log('✅ Ensured admin and instructor roles and tenant for user');
    } else {
      // Create new user with the provided hash
      user = await UserModel.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        email_verified: true,
        password: passwordHash,
        tenant_id: tenant._id,
        roles: ['admin', 'instructor'],
        rank: 'White',
        stripes: 0,
      });
      console.log('✅ Created new user with provided password hash');
      console.log('✅ Assigned admin and instructor roles to user');
    }

    console.log('\n✅ User updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Password hash: ${passwordHash.substring(0, 20)}...`);
    console.log('👤 Role: admin\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

updateUserPasswordHash();




