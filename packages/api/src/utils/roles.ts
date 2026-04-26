import type { UserRole, JWTPayload } from '@pantera-negra/shared';

/**
 * Extract user roles from JWT payload or user object
 * Handles both new format (roles array) and legacy format (primaryRole)
 */
export function getUserRoles(payload: JWTPayload | { roles?: UserRole[]; primaryRole?: UserRole } | null | undefined): UserRole[] {
  if (!payload) {
    return [];
  }
  
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles;
  }
  
  if (payload.primaryRole) {
    return [payload.primaryRole];
  }
  
  return [];
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: UserRole[] | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user is admin (admin or owner)
 */
export function isAdmin(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, ['admin', 'owner']);
}

/**
 * Check if user is instructor
 */
export function isInstructor(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, 'instructor');
}

/**
 * Check if user is student
 */
export function isStudent(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, 'student');
}

/**
 * Check if user is a network owner
 */
export function isNetworkOwner(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, 'network_owner');
}

/**
 * Get primary role (network_owner > admin > owner > instructor > student)
 */
export function getPrimaryRole(userRoles: UserRole[] | undefined): UserRole | undefined {
  if (!userRoles || userRoles.length === 0) {
    return undefined;
  }
  if (userRoles.includes('network_owner')) return 'network_owner';
  if (userRoles.includes('admin')) return 'admin';
  if (userRoles.includes('owner')) return 'owner';
  if (userRoles.includes('instructor')) return 'instructor';
  if (userRoles.includes('student')) return 'student';
  return userRoles[0];
}

/**
 * Check if user can perform admin actions
 * (admin or owner roles)
 */
export function canPerformAdminActions(userRoles: UserRole[] | undefined): boolean {
  return isAdmin(userRoles);
}

/**
 * Check if user can perform instructor actions
 * (instructor, admin, or owner roles)
 */
export function canPerformInstructorActions(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, ['instructor', 'admin', 'owner']);
}

/**
 * Check if user can access student features
 * (student role)
 */
export function canAccessStudentFeatures(userRoles: UserRole[] | undefined): boolean {
  return isStudent(userRoles);
}

/**
 * Determine roles to assign when creating/updating a user
 * - Admins and owners automatically get instructor role
 * - Other roles stay as is
 */
export function determineUserRoles(role: UserRole): UserRole[] {
  if (role === 'admin' || role === 'owner') {
    return [role, 'instructor'];
  }
  return [role];
}
