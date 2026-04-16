import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';
import {
  listRegistrations,
  getRegistration,
  confirmRegistration,
  rejectRegistration,
  assignMembership,
} from '../../controllers/index.js';

export const adminRegistrationsRouter = Router();

// All routes require authentication and admin role
adminRegistrationsRouter.use(isAuthenticated);
adminRegistrationsRouter.use(requireAdmin);

// GET /api/admin/registrations - List registration requests
adminRegistrationsRouter.get('/', listRegistrations);

// GET /api/admin/registrations/:userId - Get registration details
adminRegistrationsRouter.get('/:userId', getRegistration);

// PUT /api/admin/registrations/:userId/confirm - Confirm registration
adminRegistrationsRouter.put('/:userId/confirm', confirmRegistration);

// PUT /api/admin/registrations/:userId/reject - Reject registration
adminRegistrationsRouter.put('/:userId/reject', rejectRegistration);

// POST /api/admin/registrations/:userId/assign-membership - Assign membership
adminRegistrationsRouter.post('/:userId/assign-membership', assignMembership);

