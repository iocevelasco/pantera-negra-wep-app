/**
 * Centralized enum for all React Query keys used in the application
 * This ensures type safety and consistency across all queries and mutations
 */
export enum QueryKeys {
  // Auth & User
  currentUser = 'currentUser',
  user = 'user',
  users = 'users',
  
  // Classes
  classes = 'classes',
  class = 'class',
  
  // Attendance
  attendance = 'attendance',
  attendanceCount = 'attendance-count',
  
  // Memberships
  memberships = 'memberships',
  membership = 'membership',
  membershipPlans = 'membership-plans',
  
  // Tenants
  tenants = 'tenants',
  tenant = 'tenant',
  
  // Registrations
  registrations = 'registrations',
  
  // Private Classes
  privateSessions = 'private-sessions',
  privatePlans = 'private-plans',
  privateStudents = 'private-students',
  
  // Dashboard
  dashboard = 'dashboard',
  
  // Payments
  payments = 'payments',
}
