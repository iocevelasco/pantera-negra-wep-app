import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';

dotenv.config();

/**
 * Calculate the last day of the current month
 * Returns ISO string of the last day at 23:59:59
 */
function getEndOfCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Get the last day of the current month
  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return lastDay.toISOString();
}

/**
 * Get the current date as ISO string (YYYY-MM-DD)
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function createMonthlyMemberships() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database');

    // Get all users without a membership
    const usersWithoutMembership = await UserModel.find({
      $or: [
        { membership_id: { $exists: false } },
        { membership_id: null },
      ],
    }).lean();

    console.log(`📊 Found ${usersWithoutMembership.length} users without membership`);

    if (usersWithoutMembership.length === 0) {
      console.log('✅ All users already have a membership');
      process.exit(0);
    }

    const currentDate = getCurrentDate();
    const endOfMonth = getEndOfCurrentMonth();

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of usersWithoutMembership) {
      try {
        // Create membership for this user
        const membershipName = user.name || user.email.split('@')[0] || 'Member';
        
        const membership = await MembershipModel.create({
          name: membershipName,
          status: 'Active',
          memberType: 'Adult', // Default to Adult, can be updated later
          joined: currentDate,
          lastSeen: 'Today',
          plan: 'monthly',
          lastPaymentDate: currentDate,
          subscriptionExpiresAt: endOfMonth,
        });

        // Update user to associate with this membership
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { membership_id: membership._id } }
        );

        createdCount++;
        console.log(`✅ Created monthly membership for user: ${user.email || user.name || user._id}`);
      } catch (error) {
        console.error(`❌ Error creating membership for user ${user.email || user._id}:`, error);
      }
    }

    console.log('\n✅ Monthly memberships creation completed!');
    console.log(`📊 Created: ${createdCount} memberships`);
    console.log(`📊 Updated: ${updatedCount} users`);
    console.log(`📅 Expiration date: ${endOfMonth}`);
    console.log(`📋 Plan: monthly\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating monthly memberships:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createMonthlyMemberships();

