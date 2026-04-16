import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { MembershipModel } from '../models/Membership.js';
import { TenantModel } from '../models/Tenant.js';
import { EmailService } from '../services/email.service.js';
import { SERVER_CONFIG } from '../config/app.config.js';
import mongoose from 'mongoose';
import type { RegistrationRequest, BaseUserInfo, MembershipSummary } from '@pantera-negra/shared';

/**
 * GET /api/admin/registrations
 * List registration requests with optional status filter
 */
export const listRegistrations = async (req: Request, res: Response) => {
  try {
    const { status = 'pending', limit = 20, page = 1 } = req.query;
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    // Normalize status to ensure it's a valid value
    const statusValue = typeof status === 'string' ? status : 'pending';
    const validStatuses = ['pending', 'confirmed', 'rejected', 'all'];
    const normalizedStatus = validStatuses.includes(statusValue) ? statusValue : 'pending';

    console.log(`[REGISTRATIONS] Filtering by status: ${normalizedStatus}, tenant: ${tenantId}`);

    const baseFilter: any = {
      tenant_id: new mongoose.Types.ObjectId(tenantId),
      roles: 'student',
    };

    // Filter by registration status
    let statusFilter: any = {};
    if (normalizedStatus && normalizedStatus !== 'all') {
      if (normalizedStatus === 'pending') {
        // For pending: include users with status 'pending' OR users without registration field
        statusFilter = {
          $or: [
            { 'registration.status': 'pending' },
            { 'registration.status': { $exists: false } },
            { 'registration': { $exists: false } },
          ],
        };
      } else {
        // For confirmed/rejected: only users with that specific status
        statusFilter = { 'registration.status': normalizedStatus };
      }
    }
    // If status is 'all' or undefined, don't filter by status (show all)

    // Combine base filter with status filter
    const filter = statusFilter.$or
      ? { $and: [baseFilter, statusFilter] }
      : { ...baseFilter, ...statusFilter };

    console.log(`[REGISTRATIONS] Final filter:`, JSON.stringify(filter, null, 2));

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select('-password -resetToken -resetTokenExpires')
        .populate('registration.confirmedBy', 'name email')
        .populate('registration.rejectedBy', 'name email')
        .sort({ 'registration.requestedAt': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users.map((user: any): RegistrationRequest => {
        // Helper to safely extract populated user info
        const getPopulatedUser = (
          field: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string; email: string } | undefined
        ): BaseUserInfo | undefined => {
          if (!field) return undefined;
          if (field instanceof mongoose.Types.ObjectId) return undefined; // Not populated
          if (typeof field === 'object' && '_id' in field) {
            return {
              id: field._id.toString(),
              name: field.name,
              email: field.email,
            };
          }
          return undefined;
        };

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          rank: user.rank,
          stripes: user.stripes,
          registration: {
            status: user.registration?.status || 'pending',
            requestedAt: user.registration?.requestedAt?.toISOString(),
            requestedIp: user.registration?.requestedIp,
            confirmedAt: user.registration?.confirmedAt?.toISOString(),
            confirmedBy: getPopulatedUser(user.registration?.confirmedBy),
            rejectedAt: user.registration?.rejectedAt?.toISOString(),
            rejectedBy: getPopulatedUser(user.registration?.rejectedBy),
            rejectionReason: user.registration?.rejectionReason,
          },
          student_enabled: user.student_enabled ?? false,
          created_at: user.createdAt?.toISOString() || new Date().toISOString(),
          updated_at: user.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error listing registrations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list registrations',
    });
  }
};

/**
 * GET /api/admin/registrations/:userId
 * Get registration details for a specific user
 */
export const getRegistration = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
      tenant_id: tenantId,
      roles: 'student',
    })
      .select('-password -resetToken -resetTokenExpires')
      .populate('registration.confirmedBy', 'name email')
      .populate('registration.rejectedBy', 'name email')
      .populate('membership_id')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Registration request not found',
      });
    }

    // Helper to safely extract populated user info
    const getPopulatedUser = (
      field: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string; email: string } | undefined
    ): BaseUserInfo | undefined => {
      if (!field) return undefined;
      if (field instanceof mongoose.Types.ObjectId) return undefined; // Not populated
      if (typeof field === 'object' && '_id' in field) {
        return {
          id: field._id.toString(),
          name: field.name,
          email: field.email,
        };
      }
      return undefined;
    };

    // Helper to safely extract membership info
    const getMembership = (
      field: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; status: string } | undefined
    ): MembershipSummary | undefined => {
      if (!field) return undefined;
      if (field instanceof mongoose.Types.ObjectId) return undefined; // Not populated
      if (typeof field === 'object' && '_id' in field) {
        return {
          id: field._id.toString(),
          name: field.name,
          status: field.status,
        };
      }
      return undefined;
    };

    const userData: RegistrationRequest = {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      rank: user.rank,
      stripes: user.stripes,
      registration: {
        status: user.registration?.status || 'pending',
        requestedAt: user.registration?.requestedAt?.toISOString(),
        requestedIp: user.registration?.requestedIp,
        confirmedAt: user.registration?.confirmedAt?.toISOString(),
        confirmedBy: getPopulatedUser(user.registration?.confirmedBy),
        rejectedAt: user.registration?.rejectedAt?.toISOString(),
        rejectedBy: getPopulatedUser(user.registration?.rejectedBy),
        rejectionReason: user.registration?.rejectionReason,
      },
      student_enabled: user.student_enabled ?? false,
      membership_id: user.membership_id instanceof mongoose.Types.ObjectId
        ? user.membership_id.toString()
        : (user.membership_id as any)?._id?.toString(),
      membership: getMembership(user.membership_id as any),
      created_at: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      updated_at: (user as any).updatedAt?.toISOString() || new Date().toISOString(),
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error getting registration:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get registration',
    });
  }
};

/**
 * PUT /api/admin/registrations/:userId/confirm
 * Confirm a registration request and optionally assign membership
 */
export const confirmRegistration = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const adminId = req.user?.sub; // JWTPayload uses 'sub' for user_id, not '_id'
    const { userId } = req.params;
    const { createMembership, membershipData } = req.body;
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
      tenant_id: tenantId,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.registration?.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Registration is not pending',
      });
    }

    // Update registration status
    user.registration = {
      ...user.registration,
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: new mongoose.Types.ObjectId(adminId as string),
    };
    user.student_enabled = true;

    // Optionally create and assign membership
    if (createMembership && membershipData) {
      const membership = new MembershipModel({
        user_id: user._id,
        name: membershipData.name || user.name || user.email.split('@')[0] || 'Member',
        status: 'Active',
        memberType: membershipData.memberType || 'Adult',
        joined: new Date().toISOString().split('T')[0],
        lastSeen: 'Today',
        plan: membershipData.plan,
        price: membershipData.price,
        lastPaymentDate: membershipData.lastPaymentDate || new Date().toISOString().split('T')[0],
        subscriptionExpiresAt: membershipData.subscriptionExpiresAt,
      });

      await membership.save({ session });
      user.membership_id = membership._id;
    }

    await user.save({ session });
    await session.commitTransaction();

    // Send email notification to user about approval
    const loginUrl = `${SERVER_CONFIG.FRONTEND_URL}/login`;
    EmailService.sendRegistrationConfirmedEmail(user.email, user.name, loginUrl).catch((error) => {
      console.error('Failed to send registration confirmed email:', error);
    });

    res.json({
      success: true,
      message: 'Registration confirmed successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          registration_status: 'confirmed',
          student_enabled: user.student_enabled,
          membership_id: user.membership_id?.toString(),
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error confirming registration:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm registration',
    });
  } finally {
    session.endSession();
  }
};

/**
 * PUT /api/admin/registrations/:userId/reject
 * Reject a registration request with optional reason
 */
export const rejectRegistration = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.sub; // JWTPayload uses 'sub' for user_id, not '_id'
    const { userId } = req.params;
    const { reason } = req.body;
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
      tenant_id: tenantId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.registration?.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Registration is not pending',
      });
    }

    // Update registration status
    user.registration = {
      ...user.registration,
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: new mongoose.Types.ObjectId(adminId as string),
      rejectionReason: reason || 'No reason provided',
    };
    user.student_enabled = false;

    await user.save();

    // Send email notification to user about rejection
    EmailService.sendRegistrationRejectedEmail(
      user.email,
      user.name,
      reason || undefined
    ).catch((error) => {
      console.error('Failed to send registration rejected email:', error);
    });

    res.json({
      success: true,
      message: 'Registration rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject registration',
    });
  }
};

/**
 * POST /api/admin/registrations/:userId/assign-membership
 * Assign membership to a confirmed user
 */
export const assignMembership = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;
    const { membershipId, membershipData } = req.body;
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
      tenant_id: tenantId,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.registration?.status !== 'confirmed') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'User registration must be confirmed before assigning membership',
      });
    }

    let finalMembershipId = membershipId;

    // Create new membership if membershipData is provided
    if (membershipData && !membershipId) {
      const membership = new MembershipModel({
        user_id: user._id,
        name: membershipData.name || user.name || user.email.split('@')[0] || 'Member',
        status: 'Active',
        memberType: membershipData.memberType || 'Adult',
        joined: new Date().toISOString().split('T')[0],
        lastSeen: 'Today',
        plan: membershipData.plan,
        price: membershipData.price,
        lastPaymentDate: membershipData.lastPaymentDate || new Date().toISOString().split('T')[0],
        subscriptionExpiresAt: membershipData.subscriptionExpiresAt,
      });

      await membership.save({ session });
      finalMembershipId = membership._id;
    } else if (membershipId) {
      // Verify membership exists and belongs to same tenant
      const membership = await MembershipModel.findById(membershipId).session(session);
      if (!membership) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          error: 'Membership not found',
        });
      }
      membership.user_id = user._id;
      await membership.save({ session });
    }

    if (!finalMembershipId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Membership ID or membership data is required',
      });
    }

    user.membership_id = new mongoose.Types.ObjectId(finalMembershipId);
    await user.save({ session });
    await session.commitTransaction();

    const populatedUser = await UserModel.findById(user._id)
      .populate('membership_id')
      .lean();

    // Helper to safely extract membership info
    const getMembership = (
      field: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; status: string } | undefined
    ): MembershipSummary | undefined => {
      if (!field) return undefined;
      if (field instanceof mongoose.Types.ObjectId) return undefined; // Not populated
      if (typeof field === 'object' && '_id' in field) {
        return {
          id: field._id.toString(),
          name: field.name,
          status: field.status,
        };
      }
      return undefined;
    };

    res.json({
      success: true,
      message: 'Membership assigned successfully',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          membership_id: user.membership_id?.toString() || '',
          membership: populatedUser ? getMembership(populatedUser.membership_id) : undefined,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error assigning membership:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign membership',
    });
  } finally {
    session.endSession();
  }
};
