import { Request, Response } from 'express';
import { PrivatePlanModel } from '../models/PrivatePlan.js';
import { PrivatePlanEnrollmentModel } from '../models/PrivatePlanEnrollment.js';
import { UserModel } from '../models/User.js';
import mongoose from 'mongoose';
import { isInstructor } from '../utils/roles.js';
import { getUserRoles } from '../utils/roles.js';

/**
 * POST /me/private/plans
 * Create a new private plan
 */
export const createPrivatePlan = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Verify user is instructor
    const userRoles = getUserRoles(req.user);
    if (!isInstructor(userRoles)) {
      return res.status(403).json({
        success: false,
        error: 'Instructor role required',
      });
    }

    const { name, sessionsTotal, priceCents, schedule } = req.body;

    if (!name || !sessionsTotal) {
      return res.status(400).json({
        success: false,
        error: 'name and sessionsTotal are required',
      });
    }

    if (sessionsTotal < 1) {
      return res.status(400).json({
        success: false,
        error: 'sessionsTotal must be at least 1',
      });
    }

    if (priceCents !== undefined && priceCents < 0) {
      return res.status(400).json({
        success: false,
        error: 'priceCents must be non-negative',
      });
    }

    // Validate schedule if provided
    if (schedule) {
      if (schedule.days && (!Array.isArray(schedule.days) || schedule.days.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'schedule.days must be a non-empty array',
        });
      }
      if (schedule.days && schedule.days.some((day: number) => day < 0 || day > 6)) {
        return res.status(400).json({
          success: false,
          error: 'schedule.days must contain values between 0 (Sunday) and 6 (Saturday)',
        });
      }
      if (schedule.start_time && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(schedule.start_time)) {
        return res.status(400).json({
          success: false,
          error: 'schedule.start_time must be in HH:mm format',
        });
      }
      if (schedule.duration_minutes && schedule.duration_minutes < 1) {
        return res.status(400).json({
          success: false,
          error: 'schedule.duration_minutes must be at least 1',
        });
      }
    }

    const plan = new PrivatePlanModel({
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
      name,
      sessions_total: sessionsTotal,
      price_cents: priceCents !== undefined ? Math.floor(priceCents) : undefined,
      schedule: schedule
        ? {
            days: schedule.days,
            start_time: schedule.start_time,
            duration_minutes: schedule.duration_minutes,
          }
        : undefined,
      active: true,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      data: {
        id: plan._id.toString(),
        name: plan.name,
        sessions_total: plan.sessions_total,
        active: plan.active,
        price_cents: plan.price_cents,
        schedule: plan.schedule,
      },
    });
  } catch (error) {
    console.error('Error creating private plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /me/private/plans
 * List private plans for the instructor
 */
export const listPrivatePlans = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { active } = req.query;
    const filter: any = {
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
    };

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    const plans = await PrivatePlanModel.find(filter).lean();

    res.json({
      success: true,
      data: plans.map((plan) => ({
        id: plan._id.toString(),
        name: plan.name,
        sessions_total: plan.sessions_total,
        active: plan.active,
        price_cents: plan.price_cents,
        schedule: plan.schedule,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing private plans:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /me/private/plans/:planId/enroll
 * Enroll a student in a private plan
 */
export const enrollStudentInPlan = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { planId } = req.params;
    const { studentId, agreedPriceCents } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'studentId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId as string) || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid planId or studentId',
      });
    }

    // Verify plan exists and belongs to instructor
    const plan = await PrivatePlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    if (plan.owner_instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Plan does not belong to instructor',
      });
    }

    // Verify student exists and is a student
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (!student.roles.includes('student')) {
      return res.status(400).json({
        success: false,
        error: 'User is not a student',
      });
    }

    // Verify/assign private_owner_instructor_id
    if (!student.private_owner_instructor_id) {
      student.private_owner_instructor_id = new mongoose.Types.ObjectId(instructorId);
      await student.save();
    } else if (student.private_owner_instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Student belongs to another instructor',
      });
    }

    // Check for existing active enrollment
    const existingEnrollment = await PrivatePlanEnrollmentModel.findOne({
      plan_id: plan._id,
      student_id: student._id,
      status: 'active',
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Student already has an active enrollment for this plan',
      });
    }

    // Determine agreed_price_cents
    const agreed_price_cents =
      agreedPriceCents !== undefined
        ? Math.floor(agreedPriceCents)
        : plan.price_cents !== undefined
          ? plan.price_cents
          : undefined;

    if (agreed_price_cents !== undefined && agreed_price_cents < 0) {
      return res.status(400).json({
        success: false,
        error: 'agreedPriceCents must be non-negative',
      });
    }

    // Calculate expiration date if plan has schedule (optional: 3 months from start)
    let expires_at: Date | undefined;
    if (req.body.expiresAt) {
      expires_at = new Date(req.body.expiresAt);
    } else if (plan.schedule) {
      // Default: 3 months from start if no expiration provided
      expires_at = new Date();
      expires_at.setMonth(expires_at.getMonth() + 3);
    }

    // Create enrollment
    const enrollment = new PrivatePlanEnrollmentModel({
      plan_id: plan._id,
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
      student_id: student._id,
      sessions_remaining: plan.sessions_total,
      status: 'active',
      started_at: new Date(),
      expires_at,
      agreed_price_cents,
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      data: {
        id: enrollment._id.toString(),
        plan_id: plan._id.toString(),
        student_id: student._id.toString(),
        sessions_remaining: enrollment.sessions_remaining,
        status: enrollment.status,
        started_at: enrollment.started_at,
        expires_at: enrollment.expires_at,
        agreed_price_cents: enrollment.agreed_price_cents,
      },
    });
  } catch (error) {
    console.error('Error enrolling student in plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /me/private/students/:studentId/enrollments
 * List enrollments for a specific student
 */
export const listStudentEnrollments = async (req: Request, res: Response) => {
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

    // Verify student exists and belongs to instructor
    const student = await UserModel.findById(studentId);
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

    const enrollments = await PrivatePlanEnrollmentModel.find({
      student_id: student._id,
      owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
    })
      .populate('plan_id', 'name sessions_total price_cents')
      .lean();

    res.json({
      success: true,
      data: enrollments.map((enrollment) => ({
        id: enrollment._id.toString(),
        plan: enrollment.plan_id
          ? {
              id: (enrollment.plan_id as any)._id.toString(),
              name: (enrollment.plan_id as any).name,
              sessions_total: (enrollment.plan_id as any).sessions_total,
              price_cents: (enrollment.plan_id as any).price_cents,
            }
          : null,
        sessions_remaining: enrollment.sessions_remaining,
        status: enrollment.status,
        started_at: enrollment.started_at,
        agreed_price_cents: enrollment.agreed_price_cents,
        created_at: enrollment.createdAt,
        updated_at: enrollment.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing student enrollments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /me/private/students/:studentId/convert
 * Convert a regular student to private student
 */
export const convertStudentToPrivate = async (req: Request, res: Response) => {
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

    // Find student
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (!student.roles.includes('student')) {
      return res.status(400).json({
        success: false,
        error: 'User is not a student',
      });
    }

    // Check if already assigned to another instructor
    if (student.private_owner_instructor_id && student.private_owner_instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Student already belongs to another instructor',
      });
    }

    // Assign to this instructor
    student.private_owner_instructor_id = new mongoose.Types.ObjectId(instructorId);
    await student.save();

    res.json({
      success: true,
      data: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        private_owner_instructor_id: student.private_owner_instructor_id.toString(),
      },
      message: 'Student successfully converted to private student',
    });
  } catch (error) {
    console.error('Error converting student to private:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /me/private/enrollments/:enrollmentId/cancel
 * Cancel an enrollment
 */
export const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { enrollmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid enrollmentId',
      });
    }

    const enrollment = await PrivatePlanEnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    if (enrollment.owner_instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Enrollment does not belong to instructor',
      });
    }

    if (enrollment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Enrollment is already cancelled',
      });
    }

    enrollment.status = 'cancelled';
    await enrollment.save();

    res.json({
      success: true,
      data: {
        id: enrollment._id.toString(),
        status: enrollment.status,
      },
    });
  } catch (error) {
    console.error('Error cancelling enrollment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
