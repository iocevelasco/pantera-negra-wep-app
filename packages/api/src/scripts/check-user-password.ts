import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
// Import models to ensure they are registered with mongoose
import '../models/User.js';
import { UserModel } from '../models/User.js';

dotenv.config();

async function checkUserPassword() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('\nUsage: pnpm check:user-password <email>');
      console.log('Example: pnpm check:user-password user@example.com');
      process.exit(1);
    }

    await connectDatabase();
    console.log('✅ Connected to database\n');

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Looking up user with email: "${normalizedEmail}"\n`);

    // Find user with password field
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+password').lean();

    if (!user) {
      console.log(`❌ User not found for email: "${normalizedEmail}"`);
      
      // Try case-insensitive search
      const anyUser = await UserModel.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).lean();
      
      if (anyUser) {
        console.log(`⚠️  Found user with different email casing:`);
        console.log(`   Email in DB: "${anyUser.email}"`);
        console.log(`   Searched for: "${normalizedEmail}"`);
      }
      process.exit(1);
    }

    console.log(`✅ User found!\n`);
    console.log('═'.repeat(80));
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name || 'N/A'}`);
    console.log(`✅ Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
    console.log(`🔑 Has Password: ${user.password ? 'Yes ✅' : 'No ❌'}`);
    
    if (user.password) {
      console.log(`🔐 Password Length: ${user.password.length} characters`);
      console.log(`💡 Password Hash: ${user.password.substring(0, 20)}...`);
    } else {
      console.log(`\n⚠️  This user has no password set!`);
      console.log(`💡 This user may have been created via Google OAuth.`);
      console.log(`💡 To set a password, use: pnpm create:admin-user ${user.email} "${user.name || 'User'}" "password"`);
    }
    
    if (user.google_sub) {
      console.log(`🔗 Google ID: ${user.google_sub}`);
    }
    
    console.log(`📅 Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
    console.log('═'.repeat(80));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user password:', error);
    process.exit(1);
  }
}

checkUserPassword();

