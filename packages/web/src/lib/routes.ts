/**
 * Route constants for the application
 * Centralized route definitions to avoid typos and improve maintainability
 */
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_DOJO: '/register-dojo',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OAUTH_CALLBACK: '/oauth/callback',

  // Student routes
  STUDENT_MEMBERSHIP: '/mi-membresia',

  // Admin routes
  ADMIN_ROOT: '/',
  ADMIN_DASHBOARD: '/panel',
  ADMIN_MEMBERS: '/',
  ADMIN_SCHEDULE_MANAGEMENT: '/schedule-management',
  ADMIN_REGISTRATIONS: '/admin/registrations',
  ADMIN_MEMBERSHIP_PLANS: '/admin/membership-plans',
  ADMIN_PRIVATE_CLASSES: '/admin/private-classes',

  // Protected routes (any authenticated user)
  SCHEDULE: '/schedule',
  PORTAL: '/portal',

  // Network owner routes
  NETWORK_ROOT: '/network',
  NETWORK_ORGANIZATIONS: '/network/organizations',
  NETWORK_ORGANIZATION_NEW: '/network/organizations/new',
  NETWORK_ORGANIZATION_DETAIL: (id: string) => `/network/organizations/${id}`,
  NETWORK_DOJO_NEW: (orgId: string) => `/network/organizations/${orgId}/dojos/new`,
  NETWORK_DOJO_EDIT: (orgId: string, dojoId: string) => `/network/organizations/${orgId}/dojos/${dojoId}/edit`,
} as const;

/**
 * Type-safe route paths
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
