import { connectDatabase } from '../config/database.js';
// Import models to ensure they are registered with mongoose
import '../models/User.js';
import '../models/Tenant.js';
import '../models/Membership.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';
import { MembershipModel } from '../models/Membership.js';
import mongoose from 'mongoose';
import { DATABASE_CONFIG, SERVER_CONFIG } from '../config/app.config.js';

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...\n');
    
    const MONGODB_URI = DATABASE_CONFIG.MONGODB_URI;
    const uriDisplay = MONGODB_URI.includes('@') 
      ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
      : MONGODB_URI;
    
    console.log('📝 Connection URI:', uriDisplay);
    console.log('📊 Environment:', SERVER_CONFIG.NODE_ENV);
    console.log('');

    await connectDatabase();
    
    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database connection object not available');
      process.exit(1);
    }

    const dbName = db.databaseName;
    console.log('✅ Connected to database:', dbName);
    console.log('');

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Count documents in each collection
    console.log('📊 Document counts:');
    console.log('─'.repeat(50));
    
    const userCount = await UserModel.countDocuments();
    const tenantCount = await TenantModel.countDocuments();
    const membershipCount = await MembershipModel.countDocuments();
    
    console.log(`👤 Users: ${userCount}`);
    console.log(`🏢 Tenants: ${tenantCount}`);
    console.log(`💳 Memberships: ${membershipCount}`);
    console.log('');
    
    // Check for admin users
    const adminUsers = await UserModel.find({ role: { $in: ['admin', 'owner'] } }).countDocuments();
    console.log(`👑 Admin users: ${adminUsers}`);
    console.log('');

    // Show database stats
    const stats = await db.stats();
    console.log('💾 Database Statistics:');
    console.log('─'.repeat(50));
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    console.log(`   Index Size: ${(stats.indexSize / 1024).toFixed(2)} KB`);
    console.log(`   Total Documents: ${stats.objects}`);
    console.log('');

    if (userCount === 0) {
      console.warn('⚠️  WARNING: No users found in this database!');
      console.warn('💡 This might be a different database than your local one.');
      console.warn('💡 Check your MONGODB_URI environment variable.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabaseConnection();

