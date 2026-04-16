import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import {
  login,
  register,
  getGoogleAuthUrl,
  handleGoogleCallback,
  completeGoogleRegistration,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from '../controllers/index.js';

export const authRouter = Router();

// Rate limiting for auth endpoints
// Note: trust proxy is configured in index.ts to trust only the first proxy (Fly.io)
// This prevents IP spoofing while still allowing correct IP detection behind Fly.io's proxy
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

authRouter.use(cookieParser());

/**
 * POST /auth/login
 * Login with email and password
 */
authRouter.post('/login', authLimiter, login);

/**
 * POST /auth/register
 * Register a new user with email and password
 */
authRouter.post('/register', authLimiter, register);

/**
 * GET /auth/google
 * Initiates Google OAuth flow
 * Returns the Google OAuth URL for the frontend to redirect to
 */
authRouter.get('/google', authLimiter, getGoogleAuthUrl);

/**
 * GET /auth/google/callback
 * Handles Google OAuth callback
 */
authRouter.get('/google/callback', authLimiter, handleGoogleCallback);

/**
 * POST /auth/google/complete
 * Complete Google OAuth registration by selecting tenant
 */
authRouter.post('/google/complete', authLimiter, completeGoogleRegistration);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
authRouter.post('/refresh', authLimiter, refreshToken);

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
authRouter.post('/logout', isAuthenticated, logout);

/**
 * GET /auth/me
 * Get current user info with full details
 */
authRouter.get('/me', isAuthenticated, getCurrentUser);

/**
 * POST /auth/forgot-password
 * Request password reset - generates reset token and sends email (if email service configured)
 */
authRouter.post('/forgot-password', authLimiter, forgotPassword);

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
authRouter.post('/reset-password', authLimiter, resetPassword);
