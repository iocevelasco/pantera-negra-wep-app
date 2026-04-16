import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';

dotenv.config();

async function createAdminUser() {
  try {
    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Error: Email is required');
    console.log('\nUsage: pnpm create:admin-user <email> [name] [password] [tenantId]');
    console.log('Example: pnpm create:admin-user user@example.com "John Doe" "mypassword" "692d9f2978f0f8971dd5e65b"');
      process.exit(1);
    }

    // Get optional name and password from arguments
    const name = process.argv[3] || email.split('@')[0]; // Default to email username
    const password = process.argv[4] || '123456789'; // Default password

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    await connectDatabase();
    console.log('✅ Connected to database');

    // Get tenant ID from command line arguments (5th argument) or use first valid tenant
    const tenantIdArg = process.argv[5];
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

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      // Update password and name
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      existingUser.name = name;
      // Ensure user has admin and instructor roles and tenant
      existingUser.roles = ['admin', 'instructor'];
      if (!existingUser.tenant_id || existingUser.tenant_id.toString() !== tenant._id.toString()) {
        existingUser.tenant_id = tenant._id;
      }
      await existingUser.save();
      console.log('✅ Updated existing user password and name');
      console.log('✅ Ensured admin and instructor roles and tenant for user');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        email: normalizedEmail,
        name,
        email_verified: true,
        password: hashedPassword,
        tenant_id: tenant._id,
        roles: ['admin', 'instructor'],
        rank: 'White',
        stripes: 0,
      });
      console.log('✅ Created admin user');
      console.log('✅ Assigned admin and instructor roles to user');
    }

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 Password: ${password}`);
    console.log('👤 Role: admin\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
