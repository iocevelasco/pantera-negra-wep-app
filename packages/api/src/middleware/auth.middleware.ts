import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service.js';
import type { JWTPayload, UserRole } from '@pantera-negra/shared';
import { getUserRoles, isAdmin as checkIsAdmin, hasRole } from '../utils/roles.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Parse Bearer token from Authorization header
 */
function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * Middleware to authenticate requests
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = parseBearerToken(authHeader);

    if (!token) {
      console.warn('⚠️  [AUTH] Authentication failed: No token provided');
      console.log(`📋 [AUTH] Request path: ${req.path}`);
      console.log(`📋 [AUTH] Authorization header present: ${!!authHeader}`);
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    console.log(`🔍 [AUTH] Verifying token for request to: ${req.path}`);
    const payload = JWTService.verifyAccessToken(token);
    req.user = payload;

    // Set tenant context (for RLS or filtering)
    // This could be used by database queries
    (req as any).tenant_id = payload.tenant_id;

    console.log(`✅ [AUTH] Authentication successful for user: ${payload.email || payload.sub}`);
    const roles = getUserRoles(payload);
    console.log(`📋 [AUTH] Tenant: ${payload.tenant_id}, Roles: ${roles.join(', ')}`);
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid token';
    console.error('❌ [AUTH] Authentication failed:', errorMessage);
    console.log(`📋 [AUTH] Request path: ${req.path}`);
    console.log(`📋 [AUTH] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    
    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Middleware to require admin role in active tenant
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    console.warn('⚠️  [AUTH] Admin access denied: No user in request');
    console.log(`📋 [AUTH] Request path: ${req.path}`);
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const userRoles = getUserRoles(req.user);
  const hasAdminRole = checkIsAdmin(userRoles);

  if (!hasAdminRole) {
    console.warn(`⚠️  [AUTH] Admin access denied for user: ${req.user.email || req.user.sub}`);
    console.log(`📋 [AUTH] User roles: ${userRoles.join(', ') || 'none'}`);
    console.log(`📋 [AUTH] Tenant: ${req.user.tenant_id}`);
    console.log(`📋 [AUTH] Request path: ${req.path}`);
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  console.log(`✅ [AUTH] Admin access granted for user: ${req.user.email || req.user.sub}`);
  next();
}

/**
 * Middleware to require network_owner role
 * Network owners manage multiple dojos across an organization
 */
export function requireNetworkOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const userRoles = getUserRoles(req.user);
  if (!hasRole(userRoles, ['network_owner'])) {
    return res.status(403).json({ success: false, error: 'Network owner access required' });
  }
  next();
}

/**
 * Middleware to require specific role
 */
export function requireRole(role: string | string[]) {
  const requiredRoles = Array.isArray(role) ? role : [role];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userRoles = getUserRoles(req.user);
    const userHasRole = hasRole(userRoles, requiredRoles as UserRole[]);

    if (!userHasRole) {
      return res.status(403).json({
        success: false,
        error: `Required role: ${requiredRoles.join(' or ')}`,
      });
    }

    next();
  };
}

