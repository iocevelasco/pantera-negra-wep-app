import { Router, Request, Response } from 'express';
import { isAuthenticated, requireRole } from '../middleware/auth.middleware.js';
import { PrivatePlanEnrollmentModel } from '../models/PrivatePlanEnrollment.js';
import { PrivatePlanModel } from '../models/PrivatePlan.js';
import { PrivateSessionModel } from '../models/PrivateSession.js';
import { UserModel } from '../models/User.js';
import mongoose from 'mongoose';
import { isStudent } from '../utils/roles.js';
import { getUserRoles } from '../utils/roles.js';

export const studentPrivateRouter = Router();

// All routes require authentication and student role
studentPrivateRouter.use(isAuthenticated);
studentPrivateRouter.use(requireRole('student'));

/**
 * GET /me/private/plan
 * Get the student's active private plan details
 */
studentPrivateRouter.get('/plan', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get active enrollment
    const enrollment = await PrivatePlanEnrollmentModel.findOne({
      student_id: new mongoose.Types.ObjectId(studentId),
      status: 'active',
    })
      .populate('plan_id')
      .populate('owner_instructor_id', 'name email')
      .lean();

    if (!enrollment) {
      return res.json({
        success: true,
        data: null, // No active plan
      });
    }

    const plan = enrollment.plan_id as any;
    const instructor = enrollment.owner_instructor_id as any;

    res.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment._id.toString(),
          sessions_remaining: enrollment.sessions_remaining,
          status: enrollment.status,
          started_at: enrollment.started_at,
          expires_at: enrollment.expires_at,
          agreed_price_cents: enrollment.agreed_price_cents,
        },
        plan: {
          id: plan._id.toString(),
          name: plan.name,
          sessions_total: plan.sessions_total,
          price_cents: plan.price_cents,
          schedule: plan.schedule,
        },
        instructor: instructor
          ? {
              id: instructor._id.toString(),
              name: instructor.name,
              email: instructor.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error getting student private plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /me/private/sessions
 * Get the student's private sessions (scheduled, completed, cancelled)
 */
studentPrivateRouter.get('/sessions', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { status, limit = 50 } = req.query;

    const filter: any = {
      participant_ids: new mongoose.Types.ObjectId(studentId),
    };

    if (status) {
      filter.status = status;
    }

    const sessions = await PrivateSessionModel.find(filter)
      .populate('instructor_id', 'name email')
      .sort({ startAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: sessions.map((session) => ({
        id: session._id.toString(),
        startAt: session.startAt,
        status: session.status,
        price_cents: session.price_cents,
        instructor: (session.instructor_id as any)
          ? {
              id: (session.instructor_id as any)._id.toString(),
              name: (session.instructor_id as any).name,
              email: (session.instructor_id as any).email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Error getting student sessions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /me/private/enable
 * Enable private classes for the student and assign an instructor
 */
studentPrivateRouter.put('/enable', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        error: 'instructorId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid instructorId',
      });
    }

    // Verify instructor exists and has instructor role
    const instructor = await UserModel.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found',
      });
    }

    const instructorRoles = getUserRoles({ roles: instructor.roles });
    if (!instructorRoles.includes('instructor') && !instructorRoles.includes('admin') && !instructorRoles.includes('owner')) {
      return res.status(400).json({
        success: false,
        error: 'User is not an instructor',
      });
    }

    // Get student
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    // Check if student already has a different instructor
    if (student.private_owner_instructor_id && student.private_owner_instructor_id.toString() !== instructorId) {
      return res.status(400).json({
        success: false,
        error: 'Student already has a different instructor assigned. Please disable private classes first.',
      });
    }

    // Assign instructor
    student.private_owner_instructor_id = new mongoose.Types.ObjectId(instructorId);
    await student.save();

    res.json({
      success: true,
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          private_owner_instructor_id: student.private_owner_instructor_id.toString(),
        },
        instructor: {
          id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email,
        },
      },
      message: 'Private classes enabled successfully',
    });
  } catch (error) {
    console.error('Error enabling private classes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /me/private/disable
 * Disable private classes for the student
 */
studentPrivateRouter.put('/disable', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get student
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    // Check if student has active enrollments
    const activeEnrollments = await PrivatePlanEnrollmentModel.find({
      student_id: student._id,
      status: 'active',
    });

    if (activeEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot disable private classes while having active enrollments. Please cancel or complete all active plans first.',
      });
    }

    // Remove instructor assignment
    student.private_owner_instructor_id = undefined;
    await student.save();

    res.json({
      success: true,
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          private_owner_instructor_id: null,
        },
      },
      message: 'Private classes disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling private classes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
