import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { TenantModel } from '../models/Tenant.js';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';
import { AttendanceModel } from '../models/Attendance.js';
import { PaymentModel } from '../models/Payment.js';

dotenv.config();

const TENANT_ID = '693f1c8423881fa934b005ed';

async function deleteTenant() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Verify tenant exists
    const tenant = await TenantModel.findById(TENANT_ID);
    if (!tenant) {
      console.log(`❌ Tenant with ID ${TENANT_ID} not found`);
      process.exit(1);
    }

    console.log(`🗑️  Deleting tenant: ${tenant.name} (${tenant.slug})\n`);

    // Step 1: Find all users with this tenant_id
    const users = await UserModel.find({ tenant_id: new mongoose.Types.ObjectId(TENANT_ID) });
    console.log(`📊 Found ${users.length} users associated with this tenant`);

    // Step 2: Collect all membership IDs from users
    const membershipIds = users
      .map((user) => user.membership_id)
      .filter((id) => id !== null && id !== undefined) as mongoose.Types.ObjectId[];

    console.log(`📊 Found ${membershipIds.length} memberships to delete`);

    // Step 3: Delete all Attendance records for these memberships
    if (membershipIds.length > 0) {
      const attendanceResult = await AttendanceModel.deleteMany({
        membershipId: { $in: membershipIds },
      });
      console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance records`);
    } else {
      console.log(`ℹ️  No attendance records to delete`);
    }

    // Step 4: Delete all Payment records for these memberships
    if (membershipIds.length > 0) {
      const paymentResult = await PaymentModel.deleteMany({
        membershipId: { $in: membershipIds },
      });
      console.log(`✅ Deleted ${paymentResult.deletedCount} payment records`);
    } else {
      console.log(`ℹ️  No payment records to delete`);
    }

    // Step 5: Delete all Membership records
    if (membershipIds.length > 0) {
      const membershipResult = await MembershipModel.deleteMany({
        _id: { $in: membershipIds },
      });
      console.log(`✅ Deleted ${membershipResult.deletedCount} membership records`);
    } else {
      console.log(`ℹ️  No membership records to delete`);
    }

    // Step 6: Delete all User records with this tenant_id
    const userResult = await UserModel.deleteMany({
      tenant_id: new mongoose.Types.ObjectId(TENANT_ID),
    });
    console.log(`✅ Deleted ${userResult.deletedCount} user records`);

    // Step 7: Finally, delete the Tenant itself
    const tenantResult = await TenantModel.findByIdAndDelete(TENANT_ID);
    if (tenantResult) {
      console.log(`✅ Deleted tenant: ${tenant.name} (${tenant.slug})`);
    } else {
      console.log(`❌ Failed to delete tenant`);
    }

    console.log('\n✅ Tenant deletion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting tenant:', error);
    process.exit(1);
  }
}

deleteTenant();

