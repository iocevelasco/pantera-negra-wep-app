import { Router } from 'express';
import mongoose from 'mongoose';
import { MembershipModel } from '../models/Membership.js';
import { UserModel } from '../models/User.js';
import { PaymentModel } from '../models/Payment.js';
import { AttendanceModel } from '../models/Attendance.js';
import type { DashboardStats, AtRiskMember } from '@pantera-negra/shared';

export const dashboardRouter = Router();

// Helper function to get start and end of month
function getMonthRange(monthOffset: number = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - monthOffset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to calculate days since date
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// GET /api/dashboard/stats - Get dashboard statistics
dashboardRouter.get('/stats', async (req, res, next) => {
  try {
    const { tenant_id } = req.query;
    
    // If tenant_id is provided, get all membership_ids for users in that tenant
    let membershipIdsFilter: mongoose.Types.ObjectId[] | undefined;
    if (tenant_id) {
      const usersInTenant = await UserModel.find({ 
        tenant_id: new mongoose.Types.ObjectId(tenant_id as string) 
      }).select('membership_id').lean();
      membershipIdsFilter = usersInTenant
        .map(u => u.membership_id)
        .filter((id): id is mongoose.Types.ObjectId => id != null);
    }
    
    // Get current and previous month ranges
    const currentMonth = getMonthRange(0);
    const previousMonth = getMonthRange(1);

    // Calculate total revenue
    const currentPaymentsFilter: any = {
      date: {
        $gte: formatDate(currentMonth.start),
        $lte: formatDate(currentMonth.end),
      },
      status: 'completed',
    };
    
    const previousPaymentsFilter: any = {
      date: {
        $gte: formatDate(previousMonth.start),
        $lte: formatDate(previousMonth.end),
      },
      status: 'completed',
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      currentPaymentsFilter.membershipId = { $in: membershipIdsFilter };
      previousPaymentsFilter.membershipId = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      // No memberships in this tenant, return empty results
      currentPaymentsFilter.membershipId = { $in: [] };
      previousPaymentsFilter.membershipId = { $in: [] };
    }

    const currentPayments = await PaymentModel.find(currentPaymentsFilter).lean();
    const previousPayments = await PaymentModel.find(previousPaymentsFilter).lean();

    const currentRevenue = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousRevenue = previousPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenueChange = currentRevenue - previousRevenue;
    const revenueChangePercent =
      previousRevenue > 0 ? (revenueChange / previousRevenue) * 100 : 0;

    // Calculate active memberships
    const activeMembersFilter: any = { status: 'Active' };
    const newMembershipsFilter: any = {
      createdAt: {
        $gte: currentMonth.start,
        $lte: currentMonth.end,
      },
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      activeMembersFilter._id = { $in: membershipIdsFilter };
      newMembershipsFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      // No memberships in this tenant
      activeMembersFilter._id = { $in: [] };
      newMembershipsFilter._id = { $in: [] };
    }
    
    const activeMembers = await MembershipModel.countDocuments(activeMembersFilter);

    // Get previous month active memberships (approximate - memberships that were active at that time)
    // For simplicity, we'll use current active memberships minus new memberships this month
    const newMembershipsThisMonth = await MembershipModel.countDocuments(newMembershipsFilter);

    const previousActiveMembers = Math.max(0, activeMembers - newMembershipsThisMonth);
    const activeMembersChange = activeMembers - previousActiveMembers;

    // Calculate monthly attendance
    const currentAttendanceFilter: any = {
      date: {
        $gte: formatDate(currentMonth.start),
        $lte: formatDate(currentMonth.end),
      },
      checkedIn: true,
    };
    
    const previousAttendanceFilter: any = {
      date: {
        $gte: formatDate(previousMonth.start),
        $lte: formatDate(previousMonth.end),
      },
      checkedIn: true,
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      currentAttendanceFilter.membershipId = { $in: membershipIdsFilter };
      previousAttendanceFilter.membershipId = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      // No memberships in this tenant
      currentAttendanceFilter.membershipId = { $in: [] };
      previousAttendanceFilter.membershipId = { $in: [] };
    }

    const currentAttendance = await AttendanceModel.countDocuments(currentAttendanceFilter);
    const previousAttendance = await AttendanceModel.countDocuments(previousAttendanceFilter);

    const attendanceChange = currentAttendance - previousAttendance;
    const attendanceChangePercent =
      previousAttendance > 0 ? (attendanceChange / previousAttendance) * 100 : 0;

    // Calculate quarterly attendance (last 3 months)
    const quarterStart = getMonthRange(2);
    const quarterlyAttendanceFilter: any = {
      date: {
        $gte: formatDate(quarterStart.start),
        $lte: formatDate(currentMonth.end),
      },
      checkedIn: true,
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      quarterlyAttendanceFilter.membershipId = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      quarterlyAttendanceFilter.membershipId = { $in: [] };
    }

    const quarterlyAttendance = await AttendanceModel.countDocuments(quarterlyAttendanceFilter);

    // Calculate attendance by day of week (last 4 weeks for better representation)
    // Using 4 weeks provides a more representative average across multiple weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28); // 4 weeks = 28 days
    
    const weeklyAttendanceFilter: any = {
      date: {
        $gte: formatDate(fourWeeksAgo),
        $lte: formatDate(new Date()),
      },
      checkedIn: true,
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      weeklyAttendanceFilter.membershipId = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      weeklyAttendanceFilter.membershipId = { $in: [] };
    }

    // Fetch attendances and group by day of week
    // Using aggregation would be more efficient, but since date is stored as string,
    // we'll process in memory for reliability
    const weeklyAttendances = await AttendanceModel.find(weeklyAttendanceFilter)
      .select('date')
      .lean();
    
    // Initialize with zeros
    const attendanceByDayOfWeek: {
      Mon: number;
      Tue: number;
      Wed: number;
      Thu: number;
      Fri: number;
      Sat: number;
      Sun: number;
    } = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    // Group by day of week
    weeklyAttendances.forEach((attendance) => {
      try {
        const date = new Date(attendance.date);
        // getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] as keyof typeof attendanceByDayOfWeek;
        if (dayOfWeek && dayOfWeek in attendanceByDayOfWeek) {
          attendanceByDayOfWeek[dayOfWeek]++;
        }
      } catch (error) {
        // Skip invalid dates
        console.warn(`Invalid date format in attendance: ${attendance.date}`);
      }
    });

    // Get recent payments (last 10) with membership and user info
    const recentPaymentsFilter: any = {
      status: 'completed',
    };
    
    // Filter by membership_ids if tenant_id is provided
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      recentPaymentsFilter.membershipId = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      recentPaymentsFilter.membershipId = { $in: [] };
    }

    const recentPaymentsData = await PaymentModel.find(recentPaymentsFilter)
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .populate('membershipId')
      .lean();

    // Get user info for recent payments (through membership)
    const recentPayments = await Promise.all(
      recentPaymentsData.map(async (p) => {
        const membership = p.membershipId as any;
        // Find user with this membership_id
        const user = await UserModel.findOne({ membership_id: membership._id }).lean();
        return {
          id: p._id.toString(),
          membershipId: p.membershipId.toString(),
          amount: p.amount,
          date: p.date,
          status: p.status as 'completed' | 'pending' | 'failed',
          plan: p.plan,
          paymentType: p.paymentType,
          currency: p.currency || 'ARS',
          membershipName: membership?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
        };
      })
    );

    // Get at-risk memberships (last seen > 14 days ago)
    const allMembershipsFilter: any = {};
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      allMembershipsFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      allMembershipsFilter._id = { $in: [] };
    }
    const allMemberships = await MembershipModel.find(allMembershipsFilter).lean();
    const atRiskMembersData: AtRiskMember[] = [];

    for (const membership of allMemberships) {
      const daysSinceLastSeen = daysSince(membership.lastSeen);
      if (daysSinceLastSeen > 14 && membership.status === 'Active') {
        // Get user to get rank
        const user = await UserModel.findOne({ membership_id: membership._id }).select('rank').lean();
        atRiskMembersData.push({
          id: membership._id.toString(),
          name: membership.name,
          daysSinceLastSeen,
          rank: (user?.rank || 'White') as AtRiskMember['rank'],
          status: membership.status as AtRiskMember['status'],
          lastSeen: membership.lastSeen,
        });
      }
    }

    // Sort by days since last seen (descending)
    atRiskMembersData.sort((a, b) => b.daysSinceLastSeen - a.daysSinceLastSeen);

    // Calculate retention (quarterly)
    // Memberships who were active 3 months ago (joined before 3 months ago)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = formatDate(threeMonthsAgo);

    // Memberships who were active 6 months ago (for previous quarter comparison)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = formatDate(sixMonthsAgo);

    // Current quarter: Memberships who joined before 3 months ago
    const membershipsActive3MonthsAgoFilter: any = {
      joined: { $lte: threeMonthsAgoStr },
    };
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      membershipsActive3MonthsAgoFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      membershipsActive3MonthsAgoFilter._id = { $in: [] };
    }
    const membershipsActive3MonthsAgo = await MembershipModel.countDocuments(membershipsActive3MonthsAgoFilter);

    // Of those, how many are still active today
    const stillActiveCurrentQuarterFilter: any = {
      joined: { $lte: threeMonthsAgoStr },
      status: 'Active',
    };
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      stillActiveCurrentQuarterFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      stillActiveCurrentQuarterFilter._id = { $in: [] };
    }
    const stillActiveCurrentQuarter = await MembershipModel.countDocuments(stillActiveCurrentQuarterFilter);

    // Previous quarter: Memberships who joined before 6 months ago (and were active 3 months ago)
    const membershipsActive6MonthsAgoFilter: any = {
      joined: { $lte: sixMonthsAgoStr },
    };
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      membershipsActive6MonthsAgoFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      membershipsActive6MonthsAgoFilter._id = { $in: [] };
    }
    const membershipsActive6MonthsAgo = await MembershipModel.countDocuments(membershipsActive6MonthsAgoFilter);

    // Of those, how many were still active 3 months ago (for previous quarter retention)
    // We approximate this by checking how many from 6 months ago are still active today
    // (This is an approximation - ideally we'd track historical status)
    const stillActivePreviousQuarterFilter: any = {
      joined: { $lte: sixMonthsAgoStr },
      status: 'Active',
    };
    if (membershipIdsFilter && membershipIdsFilter.length > 0) {
      stillActivePreviousQuarterFilter._id = { $in: membershipIdsFilter };
    } else if (membershipIdsFilter && membershipIdsFilter.length === 0) {
      stillActivePreviousQuarterFilter._id = { $in: [] };
    }
    const stillActivePreviousQuarter = await MembershipModel.countDocuments(stillActivePreviousQuarterFilter);

    // Calculate retention percentages
    const currentRetention = membershipsActive3MonthsAgo > 0 
      ? (stillActiveCurrentQuarter / membershipsActive3MonthsAgo) * 100 
      : 0;
    
    const previousRetention = membershipsActive6MonthsAgo > 0 
      ? (stillActivePreviousQuarter / membershipsActive6MonthsAgo) * 100 
      : 0;
    
    const retentionChange = currentRetention - previousRetention;

    const stats: DashboardStats = {
      totalRevenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange,
        changePercent: revenueChangePercent,
      },
      activeMembers: {
        current: activeMembers,
        previous: previousActiveMembers,
        change: activeMembersChange,
      },
      monthlyAttendance: {
        current: currentAttendance,
        previous: previousAttendance,
        change: attendanceChange,
        changePercent: attendanceChangePercent,
        quarterly: quarterlyAttendance,
      },
      attendanceByDayOfWeek: attendanceByDayOfWeek,
      retention: {
        current: currentRetention,
        previous: previousRetention,
        change: retentionChange,
      },
      recentPayments: recentPayments,
      atRiskMembers: atRiskMembersData.slice(0, 10), // Top 10 at-risk members
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});
