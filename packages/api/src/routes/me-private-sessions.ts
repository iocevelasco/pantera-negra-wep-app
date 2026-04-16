import { Router, Request, Response } from 'express';
import { isAuthenticated, requireRole } from '../middleware/auth.middleware.js';
import { PrivateSessionModel } from '../models/PrivateSession.js';
import { PrivatePlanEnrollmentModel } from '../models/PrivatePlanEnrollment.js';
import { UserModel } from '../models/User.js';
import mongoose from 'mongoose';
import { isInstructor } from '../utils/roles.js';
import { getUserRoles } from '../utils/roles.js';

export const mePrivateSessionsRouter = Router();

// All routes require authentication and instructor/admin/owner role
mePrivateSessionsRouter.use(isAuthenticated);
mePrivateSessionsRouter.use((req: Request, _res: Response, next) => {
  const userRoles = getUserRoles(req.user);
  if (userRoles.includes('instructor') || userRoles.includes('admin') || userRoles.includes('owner')) {
    return next();
  }
  return next('router');
});

/**
 * GET /me/private/sessions
 * List all private sessions for the instructor
 */
mePrivateSessionsRouter.get('/sessions', async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { status, startDate, endDate, limit = 50 } = req.query;

    const filter: any = {
      instructor_id: new mongoose.Types.ObjectId(instructorId),
    };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) {
        filter.startAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.startAt.$lte = new Date(endDate as string);
      }
    }

    const sessions = await PrivateSessionModel.find(filter)
      .populate('participant_ids', 'name email')
      .sort({ startAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: sessions.map((session) => ({
        id: session._id.toString(),
        instructor_id: session.instructor_id.toString(),
        participants: (session.participant_ids as any[]).map((p: any) => ({
          id: p._id.toString(),
          name: p.name,
          email: p.email,
        })),
        startAt: session.startAt,
        status: session.status,
        price_cents: session.price_cents,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing private sessions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /me/private/sessions/:id
 * Get details of a specific private session
 */
mePrivateSessionsRouter.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID',
      });
    }

    const session = await PrivateSessionModel.findById(id)
      .populate('participant_ids', 'name email rank stripes')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Verify session belongs to instructor
    if (session.instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Session does not belong to instructor',
      });
    }

    res.json({
      success: true,
      data: {
        id: session._id.toString(),
        instructor_id: session.instructor_id.toString(),
        participants: (session.participant_ids as any[]).map((p: any) => ({
          id: p._id.toString(),
          name: p.name,
          email: p.email,
          rank: p.rank,
          stripes: p.stripes,
        })),
        startAt: session.startAt,
        status: session.status,
        price_cents: session.price_cents,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error getting private session:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /me/private/sessions
 * Create a new private session
 */
mePrivateSessionsRouter.post('/sessions', async (req: Request, res: Response) => {
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

    const { startAt, participantIds, priceCents } = req.body;

    if (!startAt || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'startAt and participantIds (non-empty array) are required',
      });
    }

    if (priceCents !== undefined && priceCents < 0) {
      return res.status(400).json({
        success: false,
        error: 'priceCents must be non-negative',
      });
    }

    // Validate all participant IDs
    const participantObjectIds = participantIds.map((id: string) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid participant ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    // Verify all participants are students and belong to this instructor
    const participants = await UserModel.find({
      _id: { $in: participantObjectIds },
    });

    if (participants.length !== participantObjectIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more participants not found',
      });
    }

    for (const participant of participants) {
      if (!participant.roles.includes('student')) {
        return res.status(400).json({
          success: false,
          error: `User ${participant.email} is not a student`,
        });
      }

      if (participant.private_owner_instructor_id?.toString() !== instructorId) {
        return res.status(403).json({
          success: false,
          error: `Student ${participant.email} does not belong to this instructor`,
        });
      }
    }

    // Create session
    const session = new PrivateSessionModel({
      instructor_id: new mongoose.Types.ObjectId(instructorId),
      participant_ids: participantObjectIds,
      startAt: new Date(startAt),
      status: 'scheduled',
      price_cents: priceCents !== undefined ? Math.floor(priceCents) : undefined,
    });

    await session.save();

    res.status(201).json({
      success: true,
      data: {
        id: session._id.toString(),
        instructor_id: session.instructor_id.toString(),
        participant_ids: session.participant_ids.map((id) => id.toString()),
        startAt: session.startAt,
        status: session.status,
        price_cents: session.price_cents,
      },
    });
  } catch (error) {
    console.error('Error creating private session:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /me/private/sessions/:id/checkin
 * Check in a private session (mark as completed and consume plan credits if applicable)
 */
mePrivateSessionsRouter.post('/sessions/:id/checkin', async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.sub;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID',
      });
    }

    // Find session
    const session = await PrivateSessionModel.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Verify session belongs to instructor
    if (session.instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Session does not belong to instructor',
      });
    }

    // Update session status
    session.status = 'completed';
    await session.save();

    // For each participant, check for active enrollment and consume credit
    const enrollmentUpdates: any[] = [];
    for (const participantId of session.participant_ids) {
      // Find active enrollment for this student
      const enrollment = await PrivatePlanEnrollmentModel.findOne({
        student_id: participantId,
        owner_instructor_id: new mongoose.Types.ObjectId(instructorId),
        status: 'active',
        sessions_remaining: { $gt: 0 },
      });

      if (enrollment) {
        enrollment.sessions_remaining -= 1;
        if (enrollment.sessions_remaining === 0) {
          enrollment.status = 'consumed';
        }
        await enrollment.save();
        enrollmentUpdates.push({
          student_id: participantId.toString(),
          enrollment_id: enrollment._id.toString(),
          sessions_remaining: enrollment.sessions_remaining,
          status: enrollment.status,
        });
      }
    }

    res.json({
      success: true,
      data: {
        id: session._id.toString(),
        status: session.status,
        enrollment_updates: enrollmentUpdates,
      },
    });
  } catch (error) {
    console.error('Error checking in session:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
