/**
 * Application Configuration
 * 
 * Centralized configuration file for all environment variables, secrets, and keys.
 * This file serves as the single source of truth for all configuration values.
 * 
 * All environment variables should be imported from this file instead of using process.env directly.
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Server Configuration
// ============================================================================

export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;

export const isProduction = SERVER_CONFIG.NODE_ENV === 'production';
export const isDevelopment = SERVER_CONFIG.NODE_ENV === 'development';

// ============================================================================
// Database Configuration
// ============================================================================

export const DATABASE_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pantera-negra',
  DEBUG_DB_URI: process.env.DEBUG_DB_URI === 'true',
} as const;

// ============================================================================
// JWT Configuration
// ============================================================================

// Try to load JWT keys from environment or .pem files
let jwtPrivateKey = process.env.JWT_PRIVATE_KEY_PEM || '';
let jwtPublicKey = process.env.JWT_PUBLIC_KEY_PEM || '';

// If keys are not in env, try to load from .pem files (development only)
if (!jwtPrivateKey || !jwtPublicKey) {
  try {
    const possiblePaths = [
      join(process.cwd(), 'private.pem'),
      join(process.cwd(), 'packages', 'api', 'private.pem'),
      join(__dirname, '..', '..', 'private.pem'),
      join(__dirname, '..', 'private.pem'),
      join(__dirname, '..', '..', '..', 'packages', 'api', 'private.pem'),
    ];
    
    let privateKeyPath: string | null = null;
    
    for (const path of possiblePaths) {
      try {
        readFileSync(path, 'utf8');
        privateKeyPath = path;
        break;
      } catch {
        // Continue to next path
      }
    }
    
    if (privateKeyPath) {
      jwtPrivateKey = readFileSync(privateKeyPath, 'utf8');
      jwtPublicKey = readFileSync(privateKeyPath.replace('private.pem', 'public.pem'), 'utf8');
    }
  } catch {
    // Silently continue
  }
}

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || '',
  PRIVATE_KEY_PEM: jwtPrivateKey,
  PUBLIC_KEY_PEM: jwtPublicKey,
  ACCESS_TTL: process.env.JWT_ACCESS_TTL || '7d',
  REFRESH_TTL: process.env.JWT_REFRESH_TTL || '90d',
} as const;

// Determine which JWT method to use
export const JWT_USE_HS256 = !!JWT_CONFIG.SECRET;
export const JWT_USE_RS256 = !JWT_USE_HS256 && (!!JWT_CONFIG.PRIVATE_KEY_PEM && !!JWT_CONFIG.PUBLIC_KEY_PEM);

// ============================================================================
// reCAPTCHA Configuration
// ============================================================================

export const RECAPTCHA_CONFIG = {
  SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',
  VERIFY_URL: 'https://www.google.com/recaptcha/api/siteverify',
  DEFAULT_THRESHOLD: 0.5,
} as const;

// ============================================================================
// Google OAuth Configuration
// ============================================================================

export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.ID_CLIENT_AUTH || '',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET_AUTH || '',
  REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '',
} as const;

// ============================================================================
// Email Configuration
// ============================================================================

export const EMAIL_CONFIG = {
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  FROM_EMAIL: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  APP_NAME: process.env.APP_NAME || 'Pantera Negra',
  FRONTEND_URL: SERVER_CONFIG.FRONTEND_URL,
} as const;

// ============================================================================
// Cloudinary Configuration
// ============================================================================

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  API_KEY: process.env.CLOUDINARY_API_KEY || '',
  API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
} as const;

// ============================================================================
// Admin Whitelist Configuration
// ============================================================================

export const ADMIN_WHITELIST_CONFIG = {
  WHITELIST: process.env.ADMIN_WHITELIST || '',
  WHITELIST_JSON: process.env.ADMIN_WHITELIST_JSON || '',
} as const;

// ============================================================================
// Web Push / VAPID Configuration
// ============================================================================

export const VAPID_CONFIG = {
  PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  SUBJECT: process.env.VAPID_SUBJECT || SERVER_CONFIG.FRONTEND_URL,
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_SCHEDULERS: process.env.ENABLE_SCHEDULERS !== 'false',
} as const;

// ============================================================================
// Validation & Startup Checks
// ============================================================================

/**
 * Validates critical configuration on startup
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate JWT configuration
  if (!JWT_USE_HS256 && !JWT_USE_RS256) {
    errors.push(
      'JWT configuration is missing! Please set either:\n' +
      '  - JWT_SECRET (for HS256 algorithm), or\n' +
      '  - JWT_PRIVATE_KEY_PEM and JWT_PUBLIC_KEY_PEM (for RS256 algorithm), or\n' +
      '  - Ensure private.pem and public.pem files exist in the API directory.'
    );
  }

  // Validate database configuration
  if (!DATABASE_CONFIG.MONGODB_URI) {
    errors.push('MONGODB_URI is required');
  }

  // In production, validate required services
  if (isProduction) {
    if (!RECAPTCHA_CONFIG.SECRET_KEY) {
      errors.push('RECAPTCHA_SECRET_KEY is required in production');
    }
    
    if (!GOOGLE_OAUTH_CONFIG.CLIENT_ID || !GOOGLE_OAUTH_CONFIG.CLIENT_SECRET) {
      console.warn('⚠️  [CONFIG] Google OAuth credentials not configured');
    }
    
    if (!EMAIL_CONFIG.RESEND_API_KEY) {
      console.warn('⚠️  [CONFIG] RESEND_API_KEY not configured - email functionality will be disabled');
    }
    
    if (!CLOUDINARY_CONFIG.CLOUD_NAME || !CLOUDINARY_CONFIG.API_KEY || !CLOUDINARY_CONFIG.API_SECRET) {
      console.warn('⚠️  [CONFIG] Cloudinary credentials not configured - image upload will be disabled');
    }
  }

  if (errors.length > 0) {
    console.error('❌ [CONFIG] Configuration errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Invalid configuration. Please check your environment variables.');
  }
}

// Log configuration status on import (only in development or if DEBUG is enabled)
if (isDevelopment || process.env.DEBUG === 'true') {
  console.log('📋 [CONFIG] Configuration loaded:');
  console.log(`   - Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`   - Port: ${SERVER_CONFIG.PORT}`);
  console.log(`   - Frontend URL: ${SERVER_CONFIG.FRONTEND_URL}`);
  console.log(`   - JWT Method: ${JWT_USE_HS256 ? 'HS256 (Secret)' : JWT_USE_RS256 ? 'RS256 (RSA Keys)' : 'NOT CONFIGURED'}`);
  console.log(`   - Database: ${DATABASE_CONFIG.MONGODB_URI.includes('@') ? 'Remote (MongoDB Atlas)' : 'Local'}`);
  console.log(`   - reCAPTCHA: ${RECAPTCHA_CONFIG.SECRET_KEY ? 'Configured' : 'Not configured'}`);
}

