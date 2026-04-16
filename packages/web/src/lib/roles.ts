import type { UserRole } from '@pantera-negra/shared';

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
 * Get primary role (admin > owner > instructor > student)
 */
export function getPrimaryRole(userRoles: UserRole[] | undefined): UserRole | undefined {
  if (!userRoles || userRoles.length === 0) {
    return undefined;
  }
  if (userRoles.includes('admin')) return 'admin';
  if (userRoles.includes('owner')) return 'owner';
  if (userRoles.includes('instructor')) return 'instructor';
  if (userRoles.includes('student')) return 'student';
  return userRoles[0];
}
