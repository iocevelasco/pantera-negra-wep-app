import { Request, Response } from 'express';
import { SERVER_CONFIG, isProduction } from '../config/app.config.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthService } from '../services/auth.service.js';
import { JWTService } from '../services/jwt.service.js';
import { EmailService } from '../services/email.service.js';
import { UserModel } from '../models/User.js';
import { TenantModel } from '../models/Tenant.js';
import { verifyRecaptchaFromRequest } from '../services/recaptcha.service.js';

/**
 * POST /auth/login
 * Login with email and password
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 [AUTH] Login attempt for email: ${email || 'not provided'}`);

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptchaFromRequest(req, 'login');
    if (!recaptchaResult.success) {
      console.warn(`⚠️  [AUTH] Login failed: reCAPTCHA verification failed - ${recaptchaResult.error}`);
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    if (!email || !password) {
      console.warn('⚠️  [AUTH] Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user with password field
    console.log(`🔍 [AUTH] Looking up user in database...`);
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 [AUTH] Normalized email: "${normalizedEmail}"`);
    
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.warn(`⚠️  [AUTH] Login failed: User not found for email "${normalizedEmail}"`);
      // Check if user exists with different casing (though schema should normalize)
      const anyUser = await UserModel.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (anyUser) {
        console.warn(`⚠️  [AUTH] User exists but email case mismatch. DB email: "${anyUser.email}"`);
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log(`✅ [AUTH] User found: ${user._id.toString()}, email: "${user.email}"`);

    if (!user.password) {
      console.warn(`⚠️  [AUTH] Login failed: User "${normalizedEmail}" exists but has no password set`);
      console.warn(`💡 [AUTH] User may have been created via Google OAuth. Password login not available.`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log(`✅ [AUTH] User found: ${user._id.toString()}`);

    // Verify password
    console.log(`🔐 [AUTH] Verifying password...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`⚠️  [AUTH] Login failed: Invalid password for ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log(`✅ [AUTH] Password verified successfully`);

    // Resolve tenant - use user's tenant if available, otherwise try from headers/query, then fallback to first tenant
    console.log(`🏢 [AUTH] Resolving tenant...`);
    let tenant;
    
    // First, try to use user's existing tenant
    if (user.tenant_id) {
      tenant = await TenantModel.findById(user.tenant_id);
      if (tenant) {
        console.log(`✅ [AUTH] Using user's existing tenant: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);
      }
    }
    
    // If user doesn't have a tenant, try to resolve from headers/query params
    if (!tenant) {
      const tenantSlug = req.headers['x-tenant-slug'] as string;
      const tenantIdFromHeader = req.headers['x-tenant-id'] as string;
      tenant = await AuthService.resolveTenant(tenantSlug, tenantIdFromHeader);
      if (tenant) {
        console.log(`✅ [AUTH] Using tenant from headers: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);
      }
    }
    
    // Fallback: if no tenant found, try to get the first tenant from database
    if (!tenant) {
      console.log(`⚠️  [AUTH] No tenant specified, attempting to use first available tenant...`);
      tenant = await TenantModel.findOne().sort({ _id: 1 });
      if (tenant) {
        console.log(`✅ [AUTH] Using first available tenant as fallback: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);
      }
    }

    // If still no tenant, we need one for token generation - use first available or user's role without tenant
    if (!tenant) {
      console.warn(`⚠️  [AUTH] No tenant found in database, cannot proceed with login`);
      return res.status(500).json({
        success: false,
        error: 'No tenant available in system',
      });
    }

    console.log(`✅ [AUTH] Tenant resolved: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);

    // Setup user roles and tenant
    console.log(`👤 [AUTH] Setting up user roles and tenant...`);
    const roles = await AuthService.setupUserRoleAndTenant(user._id.toString(), user.email, tenant._id.toString());
    console.log(`✅ [AUTH] User roles: ${roles.join(', ')}`);

    // Generate tokens
    console.log(`🎫 [AUTH] Generating JWT tokens...`);
    const tokens = await AuthService.generateTokens(user._id.toString(), user.email, tenant._id.toString());
    console.log(`✅ [AUTH] Tokens generated successfully`);

    // Set refresh token in cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    console.log(`✅ [AUTH] Login successful for user: ${user.email}`);
    
    // Get final user roles
    const finalUser = await UserModel.findById(user._id).lean();
    const finalRoles = finalUser?.roles || roles;
    
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          roles: finalRoles,
        },
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`📋 [AUTH] Error details:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
    });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * POST /auth/register
 * Register a new user with email and password
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, tenant_id, rank, stripes } = req.body;

    console.log(`📝 [AUTH] Registration attempt for email: ${email || 'not provided'}`);

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptchaFromRequest(req, 'register');
    if (!recaptchaResult.success) {
      console.warn(`⚠️  [AUTH] Registration failed: reCAPTCHA verification failed - ${recaptchaResult.error}`);
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    // Validate required fields
    if (!email || !password) {
      console.warn('⚠️  [AUTH] Registration failed: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      console.warn(`⚠️  [AUTH] Registration failed: Invalid email format "${normalizedEmail}"`);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      console.warn(`⚠️  [AUTH] Registration failed: Password too short`);
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    console.log(`🔍 [AUTH] Checking if user already exists...`);
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.warn(`⚠️  [AUTH] Registration failed: User already exists with email "${normalizedEmail}"`);
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Resolve tenant
    console.log(`🏢 [AUTH] Resolving tenant...`);
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const tenantIdFromHeader = req.headers['x-tenant-id'] as string;
    const tenantIdFromBody = tenant_id;
    
    // Priority: body > header > default
    const tenant = await AuthService.resolveTenant(
      tenantSlug,
      tenantIdFromBody || tenantIdFromHeader
    );

    if (!tenant) {
      console.error('❌ [AUTH] Registration failed: No tenant available');
      return res.status(500).json({
        success: false,
        error: 'No tenant available',
      });
    }

    console.log(`✅ [AUTH] Tenant resolved: ${tenant._id.toString()} (${tenant.slug})`);

    // Hash password
    console.log(`🔐 [AUTH] Hashing password...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`✅ [AUTH] Password hashed successfully`);

    // Get client IP for audit
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Create user with pending registration status
    console.log(`👤 [AUTH] Creating user with pending registration...`);
    const user = new UserModel({
      email: normalizedEmail,
      password: hashedPassword,
      name: name || normalizedEmail.split('@')[0],
      email_verified: false, // Email verification can be implemented later
      tenant_id: tenant._id,
      roles: ['student'], // Default role for new registrations
      rank: rank || 'White',
      stripes: stripes !== undefined ? stripes : 0,
      registration: {
        status: 'pending',
        requestedAt: new Date(),
        requestedIp: typeof clientIp === 'string' ? clientIp : 'unknown',
      },
      student_enabled: false, // Disabled until admin confirms
    });

    await user.save();
    console.log(`✅ [AUTH] User created with pending status: ${user._id.toString()}`);

    // Setup user roles and tenant (this ensures proper tenant assignment)
    console.log(`👤 [AUTH] Setting up user roles and tenant...`);
    const roles = await AuthService.setupUserRoleAndTenant(
      user._id.toString(),
      user.email,
      tenant._id.toString()
    );
    console.log(`✅ [AUTH] User roles: ${roles.join(', ')}`);

    // Send email notification to user that their registration is pending review
    EmailService.sendRegistrationPendingEmail(user.email, user.name).catch((error) => {
      console.error('Failed to send registration pending email:', error);
    });

    // Send notification to admins about new registration request
    const adminEmails = await EmailService.getAdminEmailsForTenant(tenant._id.toString());
    if (adminEmails.length > 0) {
      EmailService.sendNewRegistrationNotificationToAdmins(
        adminEmails,
        user.email,
        user.name,
        tenant.name
      ).catch((error) => {
        console.error('Failed to send new registration notification to admins:', error);
      });
    }

    console.log(`✅ [AUTH] Registration request submitted for user: ${user.email}`);
    
    // Get the final user roles after setup and enforce pending registration status
    const finalUser = await UserModel.findById(user._id);
    if (finalUser && finalUser.registration?.status !== 'pending') {
      finalUser.registration = {
        ...finalUser.registration,
        status: 'pending',
        requestedAt: finalUser.registration?.requestedAt || new Date(),
        requestedIp:
          finalUser.registration?.requestedIp ||
          (typeof clientIp === 'string' ? clientIp : 'unknown'),
      };
      finalUser.student_enabled = false;
      await finalUser.save();
    }
    const finalRoles = finalUser?.roles || roles;
    
    // Generate tokens so user can be logged in (even with pending status)
    console.log(`🎫 [AUTH] Generating JWT tokens for registered user...`);
    const tokens = await AuthService.generateTokens(user._id.toString(), user.email, tenant._id.toString());
    console.log(`✅ [AUTH] Tokens generated successfully`);
    
    // Set refresh token in cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Your account is pending admin approval.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          roles: finalRoles,
          tenant_id: tenant._id.toString(),
          email_verified: user.email_verified,
          registration_status: 'pending',
        },
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`📋 [AUTH] Error details:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
    });

    // Handle duplicate key error (MongoDB unique constraint)
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * GET /auth/google
 * Initiates Google OAuth flow
 */
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    const state = AuthService.generateState();
    // Store state in session or cookie for CSRF protection
    // For simplicity, we'll include it in the redirect
    const authUrl = AuthService.getGoogleAuthUrl(state);
    
    // Return JSON response with URL instead of redirecting
    // This allows the frontend to handle the redirect
    res.json({
      success: true,
      data: {
        url: authUrl,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * GET /auth/google/callback
 * Handles Google OAuth callback
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${SERVER_CONFIG.FRONTEND_URL}/login?error=${error}`);
    }

    if (!code) {
      return res.redirect(`${SERVER_CONFIG.FRONTEND_URL}/login?error=no_code`);
    }

    // Verify id_token and get user info
    const googleData = await AuthService.handleGoogleCallback(code as string);

    // Find or create user
    const user = await AuthService.findOrCreateUser(googleData);
    const isNewUser = !user.tenant_id;

    // Resolve tenant (from subdomain, header, or user's existing tenant)
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const tenantId = req.headers['x-tenant-id'] as string;
    let tenant = await AuthService.resolveTenant(tenantSlug, tenantId);

    // If existing user has a tenant but no tenant from headers, use user's existing tenant
    if (!tenant && user.tenant_id) {
      tenant = await TenantModel.findById(user.tenant_id);
      if (tenant) {
        console.log(`✅ [AUTH] Using user's existing tenant: ${tenant._id.toString()} (${tenant.slug || tenant.name})`);
      }
    }

    // If new user and no tenant provided, allow them to continue without tenant
    // They will select tenant later in the student view
    if (isNewUser && !tenant) {
      // Generate token without tenant_id - user will select tenant later
      const tempToken = JWTService.generateAccessToken({
        sub: user._id.toString(),
        email: user.email,
        tenant_id: '', // Empty tenant_id indicates pending tenant selection
        roles: ['student'],
      });

      // Redirect to OAuth callback page with token (user will select tenant in student view)
      const redirectUrl = `${SERVER_CONFIG.FRONTEND_URL}/oauth/callback?token=${tempToken}`;
      return res.redirect(redirectUrl);
    }

    // If still no tenant (existing user case), error
    if (!tenant) {
      return res.redirect(`${SERVER_CONFIG.FRONTEND_URL}/login?error=no_tenant`);
    }

    // Setup user role and tenant
    const role = await AuthService.setupUserRoleAndTenant(user._id.toString(), user.email, tenant._id.toString());

    // Generate tokens
    const tokens = await AuthService.generateTokens(user._id.toString(), user.email, tenant._id.toString());

    // Set refresh token in cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    // Redirect to OAuth callback page with token
    const redirectUrl = `${SERVER_CONFIG.FRONTEND_URL}/oauth/callback?token=${tokens.accessToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${SERVER_CONFIG.FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * POST /auth/google/complete
 * Complete Google OAuth registration by selecting tenant
 */
export const completeGoogleRegistration = async (req: Request, res: Response) => {
  try {
    const { tenant_id } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
    }

    // Verify temporary token
    let payload;
    try {
      payload = JWTService.verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Verify tenant exists
    const tenant = await TenantModel.findById(tenant_id);
    if (!tenant) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tenant ID',
      });
    }

    // Get user
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Setup user roles and tenant
    const roles = await AuthService.setupUserRoleAndTenant(
      user._id.toString(),
      user.email,
      tenant._id.toString()
    );

    // Generate final tokens
    const tokens = await AuthService.generateTokens(
      user._id.toString(),
      user.email,
      tenant._id.toString()
    );

    // Set refresh token in cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    // Get final user roles
    const finalUser = await UserModel.findById(user._id).lean();
    const finalRoles = finalUser?.roles || roles;

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          roles: finalRoles,
        },
      },
    });
  } catch (error) {
    console.error('Complete OAuth registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    console.log(`🔄 [AUTH] Refresh token request received`);
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      console.warn('⚠️  [AUTH] Refresh failed: No refresh token in cookies');
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided',
      });
    }

    // Verify refresh token
    console.log(`🔍 [AUTH] Verifying refresh token...`);
    const payload = JWTService.verifyRefreshToken(refreshToken);
    console.log(`✅ [AUTH] Refresh token verified for user: ${payload.email || payload.sub}`);

    // Generate new tokens (refresh token rotation)
    console.log(`🎫 [AUTH] Generating new tokens...`);
    const newAccessToken = JWTService.generateAccessToken({
      sub: payload.sub,
      email: payload.email,
      tenant_id: payload.tenant_id,
      roles: payload.roles,
      membership_id: payload.membership_id,
    });

    const newRefreshToken = JWTService.generateRefreshToken({
      sub: payload.sub,
      email: payload.email,
      tenant_id: payload.tenant_id,
      roles: payload.roles,
      membership_id: payload.membership_id,
    });

    console.log(`✅ [AUTH] New tokens generated successfully`);

    // Set new refresh token
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    console.log(`✅ [AUTH] Token refresh successful`);
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Refresh token error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Invalid refresh token';
    console.error(`📋 [AUTH] Error details:`, {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
export const logout = (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * GET /auth/me
 * Get current user info with full details
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Validate that req.user exists (should be guaranteed by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Get user from database to include all fields
    const user = await UserModel.findById(req.user.sub);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Ensure user has at least one role - assign 'student' as default if empty
    if (!user.roles || user.roles.length === 0) {
      console.warn(`⚠️  [AUTH] User ${user.email} has no roles, assigning default 'student' role`);
      user.roles = ['student'];
      await user.save();
    }

    // Get tenant_id from user or from token
    const tenantId = user.tenant_id?.toString() || req.user.tenant_id;

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || user.email.split('@')[0],
        phone: user.phone,
        picture: user.picture,
        email_verified: user.email_verified,
        roles: user.roles || ['student'], // Fallback to student if somehow still empty
        tenant_id: tenantId || '',
        membership_id: user.membership_id?.toString(),
        rank: user.rank,
        stripes: user.stripes,
        registration: user.registration
          ? {
              status: user.registration.status,
              requestedAt: user.registration.requestedAt,
              requestedIp: user.registration.requestedIp,
              confirmedAt: user.registration.confirmedAt,
              rejectedAt: user.registration.rejectedAt,
              rejectionReason: user.registration.rejectionReason,
            }
          : undefined,
        student_enabled: user.student_enabled,
      },
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
    });
  }
};

/**
 * POST /auth/forgot-password
 * Request password reset - generates reset token and sends email (if email service configured)
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log(`🔐 [AUTH] Forgot password request for email: ${email || 'not provided'}`);

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptchaFromRequest(req, 'forgot_password');
    if (!recaptchaResult.success) {
      console.warn(`⚠️  [AUTH] Forgot password failed: reCAPTCHA verification failed - ${recaptchaResult.error}`);
      // Still return success to prevent email enumeration, but log the failure
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    if (!email) {
      console.warn('⚠️  [AUTH] Forgot password failed: Missing email');
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      console.warn(`⚠️  [AUTH] Forgot password failed: Invalid email format "${normalizedEmail}"`);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Find user
    console.log(`🔍 [AUTH] Looking up user...`);
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Always return success to prevent email enumeration
    // In production, you would send an email with the reset token
    if (!user) {
      console.warn(`⚠️  [AUTH] User not found for email "${normalizedEmail}" (returning success for security)`);
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    console.log(`✅ [AUTH] Reset token generated for user: ${user._id.toString()}`);

    // In production, send email with reset link
    // For now, we'll return the token in development mode only
    const frontendUrl = SERVER_CONFIG.FRONTEND_URL;
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (!isProduction) {
      console.log(`🔗 [AUTH] Reset URL (dev only): ${resetUrl}`);
    }

    // Send email with reset link
    EmailService.sendPasswordResetEmail(user.email, resetToken).catch((error) => {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request if email fails
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Only include token in development
      ...(!isProduction && { resetToken, resetUrl }),
    });
  } catch (error) {
    console.error('❌ [AUTH] Forgot password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }
};

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    console.log(`🔐 [AUTH] Reset password request received`);

    if (!token || !password) {
      console.warn('⚠️  [AUTH] Reset password failed: Missing token or password');
      return res.status(400).json({
        success: false,
        error: 'Token and password are required',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      console.warn(`⚠️  [AUTH] Reset password failed: Password too short`);
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Find user with reset token
    console.log(`🔍 [AUTH] Looking up user with reset token...`);
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }, // Token must not be expired
    }).select('+resetToken +resetTokenExpires');

    if (!user) {
      console.warn(`⚠️  [AUTH] Reset password failed: Invalid or expired token`);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    console.log(`✅ [AUTH] User found: ${user._id.toString()}`);

    // Hash new password
    console.log(`🔐 [AUTH] Hashing new password...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`✅ [AUTH] Password hashed successfully`);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log(`✅ [AUTH] Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('❌ [AUTH] Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`📋 [AUTH] Error details:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
    });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};
