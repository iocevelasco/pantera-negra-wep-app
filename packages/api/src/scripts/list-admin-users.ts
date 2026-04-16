import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';

dotenv.config();

async function listAdminUsers() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Find all users with admin or owner role
    const adminUsers = await UserModel.find({
      roles: { $in: ['admin', 'owner'] },
    })
      .populate('tenant_id', 'name slug')
      .populate('membership_id', 'name status')
      .lean();

    if (adminUsers.length === 0) {
      console.log('📋 No admin users found in the database.\n');
      process.exit(0);
    }

    console.log(`📋 Found ${adminUsers.length} admin user(s):\n`);
    console.log('═'.repeat(80));

    adminUsers.forEach((user, index) => {
      const tenant = user.tenant_id as any;
      const membership = user.membership_id as any;

      console.log(`\n${index + 1}. User Information:`);
      console.log(`   📧 Email: ${user.email || 'N/A'}`);
      console.log(`   👤 Name: ${user.name || 'N/A'}`);
      console.log(`   ✅ Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
      if (user.google_sub) {
        console.log(`   🔗 Google ID: ${user.google_sub}`);
      }
      if (user.picture) {
        console.log(`   🖼️  Picture: ${user.picture}`);
      }
      console.log(`   🥋 Rank: ${user.rank || 'White'}`);
      console.log(`   📊 Stripes: ${user.stripes || 0}`);
      console.log(`   📅 Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
      console.log(`\n   🏢 Tenant:`);
      console.log(`      Name: ${tenant?.name || 'N/A'}`);
      console.log(`      Slug: ${tenant?.slug || 'N/A'}`);
      if (membership) {
        console.log(`\n   💳 Membership:`);
        console.log(`      Name: ${membership.name || 'N/A'}`);
        console.log(`      Status: ${membership.status || 'N/A'}`);
      }
      console.log(`\n   👑 Roles: ${user.roles?.join(', ') || 'N/A'}`);
      
      if (index < adminUsers.length - 1) {
        console.log('\n' + '─'.repeat(80));
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Total admin users: ${adminUsers.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing admin users:', error);
    process.exit(1);
  }
}

listAdminUsers();
