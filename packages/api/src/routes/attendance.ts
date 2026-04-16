import { Router } from 'express';
import { AttendanceModel } from '../models/Attendance.js';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';
import { ClassModel } from '../models/Class.js';
import { attendanceSchema } from '@pantera-negra/shared';
import type { Attendance } from '@pantera-negra/shared';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getUserRoles, isAdmin } from '../utils/roles.js';
import mongoose from 'mongoose';

export const attendanceRouter = Router();

// GET /api/attendance - Get attendance records
attendanceRouter.get('/', async (req, res, next) => {
  try {
    const { membershipId, classId, date } = req.query;
    const filter: any = {};

    if (membershipId) {
      filter.membershipId = membershipId as string;
    }
    if (classId) {
      filter.classId = classId as string;
    }
    if (date) {
      filter.date = date as string;
    }

    const attendances = await AttendanceModel.find(filter)
      .populate('membershipId')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formattedAttendances: Attendance[] = attendances.map((attendance) => ({
      id: attendance._id.toString(),
      membershipId: attendance.membershipId.toString(),
      classId: attendance.classId,
      date: attendance.date,
      checkedIn: attendance.checkedIn,
      checkedInAt: attendance.checkedInAt,
    }));

    res.json({
      success: true,
      data: formattedAttendances,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to check if check-in is within allowed time window
 * Allows check-in 12 hours before class start and up to 12 hours after class start
 */
function isWithinCheckInWindow(classStartTime: string, classDate: string): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if class is today
  if (classDate !== today) {
    return false;
  }

  // Parse class start time (format: "HH:MM")
  const [hours, minutes] = classStartTime.split(':').map(Number);
  const classStart = new Date(now);
  classStart.setHours(hours, minutes, 0, 0);

  // Calculate time differences in minutes
  const minutesBeforeStart = (now.getTime() - classStart.getTime()) / (1000 * 60);
  
  // Allow 12 hours before to 12 hours after start (12 hours = 720 minutes)
  return minutesBeforeStart >= -720 && minutesBeforeStart <= 720;
}

/**
 * POST /api/attendance/self-check-in
 * Self check-in for authenticated students
 * Only requires classId - automatically uses student's membership and today's date
 */
attendanceRouter.post('/self-check-in', isAuthenticated, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        error: 'classId is required',
      });
    }

    // Get user with membership
    const user = await UserModel.findById(req.user.sub).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.membership_id) {
      return res.status(400).json({
        success: false,
        error: 'No membership found. Please contact administration.',
      });
    }

    // Verify membership exists and is active
    const membership = await MembershipModel.findById(user.membership_id).lean();
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found',
      });
    }

    if (membership.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: 'Your membership is not active. Please renew your subscription.',
      });
    }

    // Check if membership is expired
    if (membership.subscriptionExpiresAt) {
      const expirationDate = new Date(membership.subscriptionExpiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        return res.status(400).json({
          success: false,
          error: 'Your membership has expired. Please renew your subscription.',
        });
      }
    }

    // Verify class exists
    const classDoc = await ClassModel.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Verify class is today
    if (classDoc.date !== today) {
      return res.status(400).json({
        success: false,
        error: 'This class is not scheduled for today',
      });
    }

    // Check if check-in is within allowed time window
    if (!isWithinCheckInWindow(classDoc.startTime, classDoc.date)) {
      return res.status(400).json({
        success: false,
        error: 'Check-in window has expired. You can check in 12 hours before class starts and up to 12 hours after.',
      });
    }

    // Check for duplicate attendance
    const existingAttendance = await AttendanceModel.findOne({
      membershipId: user.membership_id,
      classId: classId,
      date: today,
    }).lean();

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in for this class',
        data: {
          id: existingAttendance._id.toString(),
          membershipId: existingAttendance.membershipId.toString(),
          classId: existingAttendance.classId,
          date: existingAttendance.date,
          checkedIn: existingAttendance.checkedIn,
          checkedInAt: existingAttendance.checkedInAt,
        },
      });
    }

    // Create attendance record
    const attendance = new AttendanceModel({
      membershipId: user.membership_id,
      classId: classId,
      date: today,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    });

    await attendance.save();

    const formattedAttendance: Attendance = {
      id: attendance._id.toString(),
      membershipId: attendance.membershipId.toString(),
      classId: attendance.classId,
      date: attendance.date,
      checkedIn: attendance.checkedIn,
      checkedInAt: attendance.checkedInAt,
    };

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: formattedAttendance,
    });
  } catch (error) {
    // Handle duplicate key error (from unique index)
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in for this class',
      });
    }
    next(error);
  }
});

/**
 * POST /api/attendance/check-in
 * Check in membership (for admins or manual check-in)
 * Requires authentication and allows specifying any membershipId
 */
attendanceRouter.post('/check-in', isAuthenticated, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Only allow admins to use this endpoint
    const userRoles = getUserRoles(req.user);
    if (!isAdmin(userRoles)) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can use this endpoint. Students should use /self-check-in',
      });
    }

    const validatedData = attendanceSchema.parse(req.body);
    
    // Check for duplicate
    const existingAttendance = await AttendanceModel.findOne({
      membershipId: validatedData.membershipId,
      classId: validatedData.classId,
      date: validatedData.date || new Date().toISOString().split('T')[0],
    }).lean();

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already recorded for this membership, class, and date',
        data: {
          id: existingAttendance._id.toString(),
          membershipId: existingAttendance.membershipId.toString(),
          classId: existingAttendance.classId,
          date: existingAttendance.date,
          checkedIn: existingAttendance.checkedIn,
          checkedInAt: existingAttendance.checkedInAt,
        },
      });
    }

    const attendance = new AttendanceModel({
      membershipId: validatedData.membershipId,
      classId: validatedData.classId,
      date: validatedData.date || new Date().toISOString().split('T')[0],
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    });

    await attendance.save();

    const formattedAttendance: Attendance = {
      id: attendance._id.toString(),
      membershipId: attendance.membershipId.toString(),
      classId: attendance.classId,
      date: attendance.date,
      checkedIn: attendance.checkedIn,
      checkedInAt: attendance.checkedInAt,
    };

    res.status(201).json({
      success: true,
      message: 'Check-in recorded',
      data: formattedAttendance,
    });
  } catch (error) {
    // Handle duplicate key error (from unique index)
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already recorded for this membership, class, and date',
      });
    }
    next(error);
  }
});

