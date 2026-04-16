// Shared types and utilities
export * from './types/index.js';
export * from './schemas/index.js';
export * from './utils/environment.js';

// Re-export commonly used types
export type {
  Membership,
  MembershipPlan,
  Classes,
  Attendance,
  Payment,
  ApiResponse,
  DashboardStats,
  AtRiskMember,
  MonthlyRevenue,
  User,
  Tenant,
  UserRole,
  JWTPayload,
  // Auth types
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  GoogleLoginResponse,
  // Private Classes types
  PrivatePlan,
  PrivatePlanSchedule,
  PrivatePlanEnrollment,
  PrivateSession,
  StudentPrivatePlan,
  StudentPrivateSession,
  PrivateStudent,
  CreatePrivatePlanRequest,
  CreatePrivateSessionRequest,
  EnablePrivateClassesRequest,
  EnablePrivateClassesResponse,
  DisablePrivateClassesResponse,
  Instructor,
  // Registration types
  RegistrationRequest,
  RegistrationListResponse,
  ConfirmRegistrationRequest,
  RejectRegistrationRequest,
  AssignMembershipRequest,
  // Notification types
  PushSubscription,
  NotificationPayload,
  VapidPublicKeyResponse,
  SubscriptionResponse,
  UserSubscriptionsResponse,
} from './types/index.js';
export {
  userSchema,
  membershipSchema,
  classSchema,
  attendanceSchema,
  paymentSchema,
  membershipPlanSchema,
  // Auth schemas
  loginCredentialsSchema,
  registerCredentialsSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  // Private Classes schemas
  privatePlanScheduleSchema,
  createPrivatePlanRequestSchema,
  createPrivateSessionRequestSchema,
  enablePrivateClassesRequestSchema,
  // Registration schemas
  confirmRegistrationRequestSchema,
  rejectRegistrationRequestSchema,
  assignMembershipRequestSchema,
  // Notification schemas
  pushSubscriptionSchema,
  notificationPayloadSchema,
} from './schemas/index.js';

