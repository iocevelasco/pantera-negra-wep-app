import { Router } from 'express';
import { MembershipPlanModel } from '../models/MembershipPlan.js';
import { membershipPlanSchema } from '@pantera-negra/shared';
import type { MembershipPlan } from '@pantera-negra/shared';
import { isAuthenticated, requireAdmin } from '../middleware/auth.middleware.js';

export const membershipPlansRouter = Router();

// All routes require authentication and admin role
membershipPlansRouter.use(isAuthenticated);
membershipPlansRouter.use(requireAdmin);

// GET /api/admin/membership-plans - Get all membership plans
membershipPlansRouter.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter: any = {};

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    const plans = await MembershipPlanModel.find(filter).sort({ createdAt: -1 }).lean();
    const formattedPlans: MembershipPlan[] = plans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
      type: plan.type as MembershipPlan['type'],
      duration: plan.duration,
      description: plan.description,
      price: plan.price,
      active: plan.active,
      created_at: plan.createdAt.toISOString(),
      updated_at: plan.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: formattedPlans,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/membership-plans/:id - Get membership plan by ID
membershipPlansRouter.get('/:id', async (req, res, next) => {
  try {
    const plan = await MembershipPlanModel.findById(req.params.id).lean();
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Membership plan not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: plan._id.toString(),
        name: plan.name,
        type: plan.type as MembershipPlan['type'],
        duration: plan.duration,
        description: plan.description,
        price: plan.price,
        active: plan.active,
        created_at: plan.createdAt.toISOString(),
        updated_at: plan.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/membership-plans - Create new membership plan
membershipPlansRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = membershipPlanSchema.parse(req.body);
    
    const plan = new MembershipPlanModel({
      ...validatedData,
      active: validatedData.active ?? true,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      data: {
        id: plan._id.toString(),
        name: plan.name,
        type: plan.type as MembershipPlan['type'],
        duration: plan.duration,
        description: plan.description,
        price: plan.price,
        active: plan.active,
        created_at: plan.createdAt.toISOString(),
        updated_at: plan.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/membership-plans/:id - Update membership plan
membershipPlansRouter.put('/:id', async (req, res, next) => {
  try {
    const validatedData = membershipPlanSchema.partial().parse(req.body);
    
    const plan = await MembershipPlanModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    ).lean();

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Membership plan not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: plan._id.toString(),
        name: plan.name,
        type: plan.type as MembershipPlan['type'],
        duration: plan.duration,
        description: plan.description,
        price: plan.price,
        active: plan.active,
        created_at: plan.createdAt.toISOString(),
        updated_at: plan.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/membership-plans/:id - Delete membership plan
membershipPlansRouter.delete('/:id', async (req, res, next) => {
  try {
    const plan = await MembershipPlanModel.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Membership plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Membership plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
