import { Router, Request, Response } from 'express';
import { isAuthenticated, requireRole } from '../middleware/auth.middleware.js';
import { PrivatePlanEnrollmentModel } from '../models/PrivatePlanEnrollment.js';
import { PrivatePlanModel } from '../models/PrivatePlan.js';
import { PrivateSessionModel } from '../models/PrivateSession.js';
import { UserModel } from '../models/User.js';
import mongoose from 'mongoose';
import { isInstructor, isAdmin } from '../utils/roles.js';
import { getUserRoles } from '../utils/roles.js';

export const mePrivateStudentsRouter = Router();

// All routes require authentication and instructor/admin/owner role
mePrivateStudentsRouter.use(isAuthenticated);
mePrivateStudentsRouter.use((req: Request, _res: Response, next) => {
  const userRoles = getUserRoles(req.user);
  if (!isInstructor(userRoles) && !isAdmin(userRoles)) {
    return next('router');
  }
  next();
});

/**
 * GET /me/private/students
 * List all students with private plans for the instructor
 */
mePrivateStudentsRouter.get('/students', async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userRoles = getUserRoles(req.user);
    const isAdminUser = isAdmin(userRoles);

    // Get all enrollments for this instructor
    const enrollments = await PrivatePlanEnrollmentModel.find({
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
      status: { $in: ['active', 'consumed'] },
    })
      .populate('plan_id')
      .populate('student_id', 'name email phone rank stripes')
      .lean();

    // Group by student
    const studentsMap = new Map<string, any>();

    for (const enrollment of enrollments) {
      const studentId = (enrollment.student_id as any)._id.toString();
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          name: (enrollment.student_id as any).name,
          email: (enrollment.student_id as any).email,
          phone: (enrollment.student_id as any).phone,
          rank: (enrollment.student_id as any).rank,
          stripes: (enrollment.student_id as any).stripes,
          enrollments: [],
        });
      }

      const student = studentsMap.get(studentId);
      const plan = enrollment.plan_id as any;
      
      student.enrollments.push({
        id: enrollment._id.toString(),
        plan: {
          id: plan._id.toString(),
          name: plan.name,
          sessions_total: plan.sessions_total,
          price_cents: plan.price_cents,
          schedule: plan.schedule,
        },
        sessions_remaining: enrollment.sessions_remaining,
        status: enrollment.status,
        started_at: enrollment.started_at,
        expires_at: enrollment.expires_at,
        agreed_price_cents: enrollment.agreed_price_cents,
      });
    }

    // Get upcoming sessions for each student
    const students = Array.from(studentsMap.values());
    for (const student of students) {
      const upcomingSessions = await PrivateSessionModel.find({
        instructor_id: new mongoose.Types.ObjectId(instructorId),
        participant_ids: new mongoose.Types.ObjectId(student.id),
        status: 'scheduled',
        startAt: { $gte: new Date() },
      })
        .sort({ startAt: 1 })
        .limit(5)
        .lean();

      student.upcoming_sessions = upcomingSessions.map((session) => ({
        id: session._id.toString(),
        startAt: session.startAt,
        status: session.status,
        price_cents: session.price_cents,
      }));
    }

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error listing private students:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /me/private/students/:studentId
 * Get detailed information about a specific student
 */
mePrivateStudentsRouter.get('/students/:studentId', async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid studentId',
      });
    }

    // Verify student belongs to instructor
    const student = await UserModel.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (student.private_owner_instructor_id?.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Student does not belong to instructor',
      });
    }

    // Get all enrollments
    const enrollments = await PrivatePlanEnrollmentModel.find({
      student_id: student._id,
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
    })
      .populate('plan_id')
      .sort({ started_at: -1 })
      .lean();

    // Get all sessions
    const sessions = await PrivateSessionModel.find({
      instructor_id: new mongoose.Types.ObjectId(instructorId),
      participant_ids: student._id,
    })
      .sort({ startAt: -1 })
      .lean();

    // Get instructor info
    const instructor = await UserModel.findById(instructorId).select('name email').lean();

    res.json({
      success: true,
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          phone: student.phone,
          rank: student.rank,
          stripes: student.stripes,
        },
        instructor: instructor
          ? {
              id: instructor._id.toString(),
              name: instructor.name,
              email: instructor.email,
            }
          : null,
        enrollments: enrollments.map((enrollment) => {
          const plan = enrollment.plan_id as any;
          return {
            id: enrollment._id.toString(),
            plan: {
              id: plan._id.toString(),
              name: plan.name,
              sessions_total: plan.sessions_total,
              price_cents: plan.price_cents,
              schedule: plan.schedule,
            },
            sessions_remaining: enrollment.sessions_remaining,
            status: enrollment.status,
            started_at: enrollment.started_at,
            expires_at: enrollment.expires_at,
            agreed_price_cents: enrollment.agreed_price_cents,
          };
        }),
        sessions: sessions.map((session) => ({
          id: session._id.toString(),
          startAt: session.startAt,
          status: session.status,
          price_cents: session.price_cents,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting student details:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
