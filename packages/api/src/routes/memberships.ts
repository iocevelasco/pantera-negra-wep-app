import { Router } from 'express';
import { MembershipModel } from '../models/Membership.js';
import { UserModel } from '../models/User.js';
import { MembershipPlanModel } from '../models/MembershipPlan.js';
import { membershipSchema } from '@pantera-negra/shared';
import type { Membership } from '@pantera-negra/shared';

export const membershipsRouter = Router();

/**
 * Calculate subscription expiration date based on last payment date
 * If lastPaymentDate exists, expiration is one month later
 * If not, calculate from joined date
 */
function calculateSubscriptionExpiresAt(lastPaymentDate?: string, joined?: string): string {
  const baseDate = lastPaymentDate 
    ? new Date(lastPaymentDate) 
    : (joined ? new Date(joined) : new Date());
  
  const expirationDate = new Date(baseDate);
  expirationDate.setMonth(expirationDate.getMonth() + 1);
  
  return expirationDate.toISOString();
}

/**
 * Calculate membership status based on expiration date
 * - Active: Not expired yet
 * - Past Due: Expired or explicitly set to Past Due
 * 
 * If currentStatus is explicitly "Past Due", it takes precedence over expiration calculation
 */
function calculateMembershipStatus(expiresAt?: string, currentStatus?: string): Membership['status'] {
  // If status is explicitly set to "Past Due" in database, respect it
  if (currentStatus === 'Past Due') {
    return 'Past Due';
  }

  if (!expiresAt) {
    return (currentStatus as Membership['status']) || 'Active';
  }

  const expirationDate = new Date(expiresAt);
  const now = new Date();
  
  if (now > expirationDate) {
    return 'Past Due';
  }
  
  return (currentStatus as Membership['status']) || 'Active';
}

// GET /api/memberships - Get all memberships
membershipsRouter.get('/', async (req, res, next) => {
  try {
    const { status, memberType } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }
    if (memberType) {
      filter.memberType = memberType;
    }

    const memberships = await MembershipModel.find(filter).lean();
    const formattedMemberships: Membership[] = memberships.map((membership) => {
      // Calculate subscription expiration if not set
      const membershipDoc = membership as typeof membership & { lastPaymentDate?: string; subscriptionExpiresAt?: string; price?: number };
      const subscriptionExpiresAt = membershipDoc.subscriptionExpiresAt 
        || calculateSubscriptionExpiresAt(membershipDoc.lastPaymentDate, membership.joined);
      
      // Use the status from database if it's explicitly set to "Past Due"
      // Otherwise, calculate based on expiration date
      const calculatedStatus = membership.status === 'Past Due' 
        ? 'Past Due' 
        : calculateMembershipStatus(subscriptionExpiresAt, membership.status);
      
      return {
        id: membership._id.toString(),
        user_id: membership.user_id?.toString() || '',
        name: membership.name,
        status: calculatedStatus,
        memberType: (membership.memberType || 'Adult') as Membership['memberType'],
        joined: membership.joined,
        lastSeen: membership.lastSeen,
        plan: membership.plan,
        price: membershipDoc.price,
        lastPaymentDate: membershipDoc.lastPaymentDate || undefined,
        subscriptionExpiresAt: subscriptionExpiresAt,
      } as Membership;
    });

    res.json({
      success: true,
      data: formattedMemberships,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memberships/plans - Get available membership plans
membershipsRouter.get('/plans', async (req, res, next) => {
  try {
    // Get active plans from database
    const plans = await MembershipPlanModel.find({ active: true }).sort({ duration: 1 }).lean();
    
    // Format plans to match the expected interface
    const formattedPlans = plans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
      type: plan.type as 'monthly' | 'quarterly' | 'yearly' | 'custom',
      duration: plan.duration,
      description: plan.description,
    }));

    // If no plans exist in database, return default plans for backward compatibility
    if (formattedPlans.length === 0) {
      const defaultPlans = [
        {
          id: 'monthly',
          name: 'Mensual',
          type: 'monthly' as const,
          duration: 1,
          description: 'Plan de membresía mensual',
        },
        {
          id: 'quarterly',
          name: 'Trimestral',
          type: 'quarterly' as const,
          duration: 3,
          description: 'Plan de membresía trimestral',
        },
      ];
      return res.json({
        success: true,
        data: defaultPlans,
      });
    }

    res.json({
      success: true,
      data: formattedPlans,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memberships/:id - Get membership by ID
membershipsRouter.get('/:id', async (req, res, next) => {
  try {
    const membership = await MembershipModel.findById(req.params.id).lean();
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found',
      });
    }

    const subscriptionExpiresAt = membership.subscriptionExpiresAt 
      || calculateSubscriptionExpiresAt(membership.lastPaymentDate, membership.joined);
    // Use the status from database if it's explicitly set to "Past Due"
    const calculatedStatus = membership.status === 'Past Due' 
      ? 'Past Due' 
      : calculateMembershipStatus(subscriptionExpiresAt, membership.status);

    res.json({
      success: true,
      data: {
        id: membership._id.toString(),
        user_id: membership.user_id?.toString() || '',
        name: membership.name,
        status: calculatedStatus,
        memberType: (membership.memberType || 'Adult') as Membership['memberType'],
        joined: membership.joined,
        lastSeen: membership.lastSeen,
        plan: membership.plan,
        price: membership.price,
        lastPaymentDate: membership.lastPaymentDate || undefined,
        subscriptionExpiresAt: subscriptionExpiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/memberships - Create new membership
membershipsRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = membershipSchema.parse(req.body);
    const joined = (req.body.joined as string) || new Date().toISOString().split('T')[0];
    const lastPaymentDate = req.body.lastPaymentDate || joined;
    const subscriptionExpiresAt = req.body.subscriptionExpiresAt 
      || calculateSubscriptionExpiresAt(lastPaymentDate, joined);
    
    const user = await UserModel.findById(validatedData.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const membership = new MembershipModel({
      ...validatedData,
      joined,
      lastSeen: (req.body.lastSeen as string) || 'Today',
      lastPaymentDate,
      subscriptionExpiresAt,
    });

    await membership.save();
    user.membership_id = membership._id;
    await user.save();

    const calculatedStatus = calculateMembershipStatus(subscriptionExpiresAt, membership.status);

    res.status(201).json({
      success: true,
      data: {
        id: membership._id.toString(),
        ...membership.toObject(),
        status: calculatedStatus,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/memberships/:id - Update membership
membershipsRouter.put('/:id', async (req, res, next) => {
  try {
    const validatedData = membershipSchema.partial().parse(req.body);
    
    // If lastPaymentDate is updated, recalculate subscriptionExpiresAt
    if (req.body.lastPaymentDate) {
      const existingMembership = await MembershipModel.findById(req.params.id).lean();
      if (existingMembership) {
        validatedData.subscriptionExpiresAt = calculateSubscriptionExpiresAt(
          req.body.lastPaymentDate,
          existingMembership.joined
        );
      }
    }
    
    const membership = await MembershipModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    ).lean();

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found',
      });
    }

    const membershipDoc = membership as typeof membership & { lastPaymentDate?: string; subscriptionExpiresAt?: string };
    const subscriptionExpiresAt = membershipDoc.subscriptionExpiresAt 
      || calculateSubscriptionExpiresAt(membershipDoc.lastPaymentDate, membership.joined);
    // Use the status from database if it's explicitly set to "Past Due"
    const calculatedStatus = membership.status === 'Past Due' 
      ? 'Past Due' 
      : calculateMembershipStatus(subscriptionExpiresAt, membership.status);

    if (validatedData.user_id) {
      await UserModel.findByIdAndUpdate(validatedData.user_id, {
        membership_id: membership._id,
      });
    }

    res.json({
      success: true,
      data: {
        id: membership._id.toString(),
        ...membership,
        status: calculatedStatus,
        subscriptionExpiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/memberships/:id - Delete membership
membershipsRouter.delete('/:id', async (req, res, next) => {
  try {
    const membership = await MembershipModel.findByIdAndDelete(req.params.id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found',
      });
    }

    res.json({
      success: true,
      message: 'Membership deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

