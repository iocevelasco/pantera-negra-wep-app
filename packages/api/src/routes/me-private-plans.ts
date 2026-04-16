import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getUserRoles } from '../utils/roles.js';
import {
  createPrivatePlan,
  listPrivatePlans,
  enrollStudentInPlan,
  listStudentEnrollments,
  convertStudentToPrivate,
  cancelEnrollment,
} from '../controllers/index.js';

export const mePrivatePlansRouter = Router();

// All routes require authentication and instructor/admin/owner role
mePrivatePlansRouter.use(isAuthenticated);
mePrivatePlansRouter.use((req: Request, _res: Response, next) => {
  const userRoles = getUserRoles(req.user);
  if (userRoles.includes('instructor') || userRoles.includes('admin') || userRoles.includes('owner')) {
    return next();
  }
  return next('router');
});

/**
 * POST /me/private/plans
 * Create a new private plan
 */
mePrivatePlansRouter.post('/plans', createPrivatePlan);

/**
 * GET /me/private/plans
 * List private plans for the instructor
 */
mePrivatePlansRouter.get('/plans', listPrivatePlans);

/**
 * POST /me/private/plans/:planId/enroll
 * Enroll a student in a private plan
 */
mePrivatePlansRouter.post('/plans/:planId/enroll', enrollStudentInPlan);
/**
 * GET /me/private/students/:studentId/enrollments
 * List enrollments for a specific student
 */
mePrivatePlansRouter.get('/students/:studentId/enrollments', listStudentEnrollments);
/**
 * POST /me/private/students/:studentId/convert
 * Convert a regular student to private student
 */
mePrivatePlansRouter.post('/students/:studentId/convert', convertStudentToPrivate);
/**
 * POST /me/private/enrollments/:enrollmentId/cancel
 * Cancel an enrollment
 */
mePrivatePlansRouter.post('/enrollments/:enrollmentId/cancel', cancelEnrollment);
