import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';
import type { User } from '@pantera-negra/shared';
import { determineUserRoles } from '../utils/roles.js';
import mongoose from 'mongoose';

export const usersRouter = Router();

// Helper function to safely extract ID from populated or non-populated field
function extractId(field: any): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'object' && field !== null && '_id' in field) {
    // It's a populated document
    const id = (field as any)._id;
    return id ? id.toString() : undefined;
  }
  if (mongoose.Types.ObjectId.isValid(field)) {
    // It's an ObjectId
    return field.toString();
  }
  return undefined;
}

// Helper function to safely convert date to ISO string
function toISOString(date: any): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
}

/**
 * Calculate subscription expiration date based on plan type
 * @param plan - 'monthly' or 'quarterly'
 * @param baseDate - Optional base date (defaults to now)
 * @returns ISO string of expiration date
 */
function calculateSubscriptionExpiresAtByPlan(plan: string, baseDate?: Date): string {
  const date = baseDate || new Date();
  const expirationDate = new Date(date);
  
  if (plan === 'quarterly') {
    // For quarterly: add 3 months and set to end of that month
    expirationDate.setMonth(expirationDate.getMonth() + 3);
    const year = expirationDate.getFullYear();
    const month = expirationDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.toISOString();
  } else {
    // For monthly: set to end of current month
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.toISOString();
  }
}

// Helper function to format user with populated relations
function formatUserWithRelations(user: any): User & { membership?: any; tenant?: any } {
  const membership = user.membership_id as any;
  const tenant = user.tenant_id as any;

  return {
    id: user._id.toString(),
    email: user.email,
    email_verified: user.email_verified,
    name: user.name,
    phone: user.phone,
    picture: user.picture,
    google_sub: user.google_sub,
    membership_id: extractId(user.membership_id),
    tenant_id: extractId(user.tenant_id) || '',
    roles: user.roles || [],
    rank: user.rank,
    stripes: user.stripes,
    created_at: toISOString(user.created_at),
    updated_at: toISOString(user.updated_at),
    // Include populated data for frontend
    membership: membership ? {
      id: membership._id.toString(),
      user_id: membership.user_id?.toString() || '',
      name: membership.name,
      status: membership.status,
      memberType: membership.memberType,
      joined: membership.joined,
      lastSeen: membership.lastSeen,
      plan: membership.plan,
      lastPaymentDate: membership.lastPaymentDate,
      subscriptionExpiresAt: membership.subscriptionExpiresAt,
    } : undefined,
    tenant: tenant ? {
      id: tenant._id.toString(),
      slug: tenant.slug,
      name: tenant.name,
    } : undefined,
  } as any;
}

// GET /api/instructors - Get all instructors (public endpoint for students to select)
usersRouter.get('/instructors', async (req, res, next) => {
  try {
    const instructors = await UserModel.find({
      roles: 'instructor', // Only return users with instructor role
    })
      .select('_id name email picture')
      .lean();

    res.json({
      success: true,
      data: instructors.map((instructor) => ({
        id: instructor._id.toString(),
        name: instructor.name,
        email: instructor.email,
        picture: instructor.picture,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - Get all users with their memberships and tenants
usersRouter.get('/', async (req, res, next) => {
  try {
    const { role, tenant_id, membership_id, includePending } = req.query;
    const filter: any = {};

    // Exclude admin users unless specifically filtering by role
    if (!role) {
      filter.roles = { $nin: ['admin', 'owner'] };
    } else {
      filter.roles = role;
    }
    if (tenant_id) {
      filter.tenant_id = tenant_id;
    }
    if (membership_id) {
      filter.membership_id = membership_id;
    }

    // For students, only show confirmed registrations unless includePending is true
    if (role === 'student' && includePending !== 'true') {
      filter['registration.status'] = 'confirmed';
      filter.student_enabled = true;
    }

    const users = await UserModel.find(filter)
      .populate('membership_id')
      .populate('tenant_id')
      .lean();

    const formattedUsers = users.map(formatUserWithRelations);

    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id)
      .populate('membership_id')
      .populate('tenant_id')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: formatUserWithRelations(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
usersRouter.post('/', async (req, res, next) => {
  try {
    const { email, name, phone, role, tenant_id, membership_id, rank, stripes, plan, memberType, price, temporaryPassword, password } = req.body;

    if (!email || !tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Email and tenant_id are required',
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    let finalMembershipId = membership_id;

    // Validate tenant_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(tenant_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tenant_id format',
      });
    }

    // Hash password if provided (temporaryPassword or password)
    let hashedPassword: string | undefined;
    const passwordToHash = temporaryPassword || password;
    if (passwordToHash) {
      if (passwordToHash.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long',
        });
      }
      hashedPassword = await bcrypt.hash(passwordToHash, 10);
    }

    // Determine roles: if admin or owner, also add instructor role
    const roles = determineUserRoles(role || 'student');

    const user = new UserModel({
      email: email.toLowerCase().trim(),
      name,
      phone,
      email_verified: req.body.email_verified || false,
      tenant_id,
      membership_id: finalMembershipId,
      roles,
      rank: rank || 'White',
      stripes: stripes || 0,
      ...(hashedPassword && { password: hashedPassword }),
    });

    await user.save();

    // If plan is provided but no membership_id, create a new membership tied to this user
    if (plan && !membership_id) {
      try {
        const currentDate = new Date();
        const joinedDate = currentDate.toISOString().split('T')[0];
        const subscriptionExpiresAt = calculateSubscriptionExpiresAtByPlan(plan, currentDate);

        const membership = new MembershipModel({
          user_id: user._id,
          name: name || email.split('@')[0] || 'Member',
          status: 'Active',
          memberType: memberType || 'Adult',
          joined: joinedDate,
          lastSeen: 'Today',
          plan: plan,
          price: price,
          lastPaymentDate: joinedDate,
          subscriptionExpiresAt: subscriptionExpiresAt,
        });

        await membership.save();
        finalMembershipId = membership._id;
        user.membership_id = finalMembershipId;
        await user.save();
      } catch (membershipError) {
        console.error('Error creating membership:', membershipError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create membership: ' + (membershipError instanceof Error ? membershipError.message : 'Unknown error'),
        });
      }
    } else if (membership_id) {
      await MembershipModel.findByIdAndUpdate(
        membership_id,
        { user_id: user._id },
        { new: true, runValidators: true }
      );
    }

    const populatedUser = await UserModel.findById(user._id)
      .populate('membership_id')
      .populate('tenant_id')
      .lean();

    res.status(201).json({
      success: true,
      data: formatUserWithRelations(populatedUser),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Provide more detailed error information
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

// PUT /api/users/:id - Update user
usersRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, role, tenant_id, membership_id, rank, stripes, plan, memberType, price, picture } = req.body;

    const existingUser = await UserModel.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    let finalMembershipId = membership_id !== undefined ? membership_id : existingUser.membership_id;

    // If plan is provided but no membership_id, create or update membership
    if (plan && !membership_id) {
      const currentDate = new Date();
      const joinedDate = currentDate.toISOString().split('T')[0];
      const subscriptionExpiresAt = calculateSubscriptionExpiresAtByPlan(plan, currentDate);

      if (existingUser.membership_id) {
        // Update existing membership
        await MembershipModel.findByIdAndUpdate(
          existingUser.membership_id,
          {
            user_id: existingUser._id,
            ...(name !== undefined && { name: name || existingUser.name }),
            ...(memberType !== undefined && { memberType }),
            ...(price !== undefined && { price }),
            plan: plan,
            lastPaymentDate: joinedDate,
            subscriptionExpiresAt: subscriptionExpiresAt,
            status: 'Active',
          },
          { new: true, runValidators: true }
        );
        finalMembershipId = existingUser.membership_id;
      } else {
        // Create new membership
        const membership = new MembershipModel({
          user_id: existingUser._id,
          name: name || existingUser.name || existingUser.email.split('@')[0] || 'Member',
          status: 'Active',
          memberType: memberType || 'Adult',
          joined: joinedDate,
          lastSeen: 'Today',
          plan: plan,
          price: price,
          lastPaymentDate: joinedDate,
          subscriptionExpiresAt: subscriptionExpiresAt,
        });
        await membership.save();
        finalMembershipId = membership._id;
      }
    }

    // Handle role update: if role is provided, convert to roles array
    const rolesUpdate = role !== undefined ? determineUserRoles(role) : undefined;

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(rolesUpdate !== undefined && { roles: rolesUpdate }),
        ...(tenant_id !== undefined && { tenant_id }),
        ...(finalMembershipId !== undefined && { membership_id: finalMembershipId }),
        ...(rank !== undefined && { rank }),
        ...(stripes !== undefined && { stripes }),
        ...(picture !== undefined && { picture }),
      },
      { new: true, runValidators: true }
    )
      .populate('membership_id')
      .populate('tenant_id')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (membership_id) {
      await MembershipModel.findByIdAndUpdate(
        membership_id,
        { user_id: existingUser._id },
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      data: formatUserWithRelations(user),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await MembershipModel.deleteMany({
      $or: [{ user_id: user._id }, { _id: user.membership_id }],
    });

    await UserModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

