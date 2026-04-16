import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';
import { JWTService } from './jwt.service.js';
import { whitelistService } from './whitelist.service.js';
import type { UserRole, JWTPayload } from '@pantera-negra/shared';
import { determineUserRoles, getPrimaryRole } from '../utils/roles.js';
import mongoose from 'mongoose';
import { GOOGLE_OAUTH_CONFIG } from '../config/app.config.js';

const client = new OAuth2Client(
  GOOGLE_OAUTH_CONFIG.CLIENT_ID,
  GOOGLE_OAUTH_CONFIG.CLIENT_SECRET,
  GOOGLE_OAUTH_CONFIG.REDIRECT_URI
);

export class AuthService {
  /**
   * Get Google OAuth URL
   */
  static getGoogleAuthUrl(state?: string): string {
    const scopes = ['openid', 'email', 'profile'];
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state || this.generateState(),
    });
  }

  /**
   * Generate random state for CSRF protection
   */
  static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange code for tokens and verify id_token
   */
  static async handleGoogleCallback(code: string) {
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      throw new Error('No id_token received from Google');
    }

    // Verify id_token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid id_token payload');
    }

    // Validate email_verified
    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }

    const email = payload.email?.toLowerCase();
    if (!email) {
      throw new Error('No email in Google token');
    }

    return {
      email,
      name: payload.name,
      picture: payload.picture,
      google_sub: payload.sub,
    };
  }

  /**
   * Find or create user
   */
  static async findOrCreateUser(googleData: {
    email: string;
    name?: string;
    picture?: string;
    google_sub: string;
  }) {
    const { email, name, picture, google_sub } = googleData;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        email,
        email_verified: true,
        name,
        picture,
        google_sub,
        roles: ['student'], // Ensure default role is assigned
      });
    } else {
      // Update user if needed
      if (!user.google_sub) {
        user.google_sub = google_sub;
      }
      if (name && !user.name) {
        user.name = name;
      }
      if (picture && !user.picture) {
        user.picture = picture;
      }
      // Ensure user has roles
      if (!user.roles || user.roles.length === 0) {
        user.roles = ['student'];
      }
      await user.save();
    }

    return user;
  }

  /**
   * Resolve tenant from subdomain or header
   * Returns null if tenant cannot be resolved (does NOT create default tenant)
   */
  static async resolveTenant(tenantSlug?: string, tenantId?: string) {
    if (tenantId) {
      const tenant = await TenantModel.findById(tenantId);
      return tenant;
    }

    if (tenantSlug) {
      const tenant = await TenantModel.findOne({ slug: tenantSlug });
      return tenant;
    }

    // No tenant specified - return null instead of creating default
    // This prevents creation of unwanted default tenants
    return null;
  }

  /**
   * Get user roles (now directly from User model)
   */
  static async getUserRoles(userId: string): Promise<UserRole[] | null> {
    const user = await UserModel.findById(userId).select('roles').lean();
    return user?.roles || null;
  }

  /**
   * Get user's tenant (now directly from User model)
   */
  static async getUserTenant(userId: string) {
    const user = await UserModel.findById(userId).populate('tenant_id').lean();
    if (!user || !user.tenant_id) {
      return null;
    }
    return {
      tenant_id: (user.tenant_id as any)._id.toString(),
      roles: user.roles || [],
    };
  }

  /**
   * Update user roles and tenant
   */
  static async updateUserRoleAndTenant(
    userId: string,
    tenantId: string,
    roles: UserRole[]
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      tenant_id: tenantId,
      roles,
    });
  }

  /**
   * Check if email is in admin whitelist
   * @deprecated Use whitelistService.isAdminWhitelisted() directly
   */
  static isAdminWhitelisted(email: string): boolean {
    return whitelistService.isAdminWhitelisted(email);
  }

  /**
   * Get admin tenants for email from whitelist
   * @deprecated Use whitelistService.getAdminTenants() directly
   */
  static getAdminTenantsFromWhitelist(email: string): string[] {
    return whitelistService.getAdminTenants(email);
  }

  /**
   * Setup user roles and tenant after login
   */
  static async setupUserRoleAndTenant(
    userId: string,
    email: string,
    tenantId: string
  ): Promise<UserRole[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If user doesn't have roles or tenant, assign based on whitelist
    if (!user.roles || user.roles.length === 0 || !user.tenant_id) {
      // Verificar si el email está en la whitelist y es admin para este tenant
      const isAdmin = whitelistService.isAdminForTenant(email, tenantId);

      // If admin, assign both admin and instructor roles
      // Otherwise, assign student role
      const roles: UserRole[] = isAdmin ? determineUserRoles('admin') : determineUserRoles('student');

      user.tenant_id = new mongoose.Types.ObjectId(tenantId);
      user.roles = roles;
      await user.save();
      return roles;
    }

    // Update tenant if different
    if (user.tenant_id.toString() !== tenantId) {
      user.tenant_id = new mongoose.Types.ObjectId(tenantId);
      await user.save();
    }

    return user.roles;
  }

  /**
   * Generate JWT tokens for user
   */
  static async generateTokens(
    userId: string,
    email: string,
    tenantId: string
  ): Promise<{ accessToken: string; refreshToken: string; payload: JWTPayload }> {
    // Get user with tenant and membership
    const user = await UserModel.findById(userId)
      .populate('tenant_id')
      .populate('membership_id')
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    const userRoles = user.roles || [];
    // Determine primary role (admin > owner > instructor > student)
    const primaryRole = getPrimaryRole(userRoles) || 'student';

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      tenant_id: tenantId,
      roles: userRoles,
      primaryRole,
      membership_id: user.membership_id ? (user.membership_id as any)._id.toString() : undefined,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      payload: payload as JWTPayload,
    };
  }
}

