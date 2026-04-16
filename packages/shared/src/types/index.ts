// Common types shared between frontend and backend

// ============================================================================
// Base Types - Common patterns reused across interfaces
// ============================================================================

/**
 * Base interface for entities with timestamps
 */
export interface Timestamped {
  created_at: string;
  updated_at: string;
}

/**
 * Base interface for entities with ID
 */
export interface WithId {
  id: string;
}

/**
 * Base interface for entities with ID and timestamps
 */
export interface BaseEntity extends WithId, Timestamped {}

/**
 * Base user information (minimal user data)
 */
export interface BaseUserInfo {
  id: string;
  name?: string;
  email: string;
}

/**
 * Extended user information with picture
 */
export interface UserInfo extends BaseUserInfo {
  picture?: string;
}

/**
 * BJJ rank information
 */
export interface BJJRank {
  rank: 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black';
  stripes: number;
}

/**
 * Base enrollment information
 */
export interface BaseEnrollment {
  id: string;
  sessions_remaining: number;
  status: 'active' | 'consumed' | 'cancelled';
  started_at: string;
  expires_at?: string;
  agreed_price_cents?: number;
}

/**
 * Base plan information
 */
export interface BasePlan {
  id: string;
  name: string;
  sessions_total: number;
  price_cents?: number;
}

/**
 * Base session information
 */
export interface BaseSession {
  id: string;
  startAt: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  price_cents?: number;
}

/**
 * Base membership data for requests
 */
export interface BaseMembershipData {
  name?: string;
  memberType?: 'Adult' | 'Kid';
  plan?: string;
  price?: number;
  lastPaymentDate?: string;
  subscriptionExpiresAt?: string;
}

// ============================================================================
// Core Domain Types
// ============================================================================

export interface Membership {
  id: string;
  user_id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Past Due';
  memberType: 'Adult' | 'Kid';
  joined: string;
  lastSeen: string;
  plan?: string;
  price?: number; // Monthly membership price
  lastPaymentDate?: string; // ISO date string of last payment
  subscriptionExpiresAt?: string; // ISO date string when subscription expires
}

export interface Classes {
  id: string;
  name: string;
  type?: 'Gi' | 'No-Gi' | 'Kids'; // Optional - not required for check-in
  instructor?: string; // Optional - can be undefined
  startTime: string;
  endTime: string;
  date: string;
  location?: string; // Optional - can be undefined
  capacity?: number; // Optional - can be undefined
  enrolled: number;
}

export interface Attendance {
  id: string;
  membershipId: string;
  classId: string;
  date: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface Payment {
  id: string;
  membershipId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  plan: string;
  paymentType: 'transfer' | 'cash' | 'card';
  currency?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export type UserRole = 'admin' | 'instructor' | 'student' | 'owner';

export interface JWTPayload {
  sub: string; // user_id
  email: string;
  tenant_id: string; // Current tenant_id
  roles: UserRole[]; // User roles array
  primaryRole?: UserRole; // Primary/current role for backward compatibility
  membership_id?: string; // Optional membership reference
  iat?: number;
  exp?: number;
}

export interface User extends BaseEntity {
  email: string;
  email_verified: boolean;
  name?: string;
  phone?: string;
  picture?: string;
  google_sub?: string;
  membership_id?: string; // Reference to Membership
  tenant_id: string; // Reference to Tenant
  roles: UserRole[]; // Array of roles - user can have multiple roles
  rank: BJJRank['rank']; // BJJ belt rank
  stripes: BJJRank['stripes']; // Number of stripes on the belt (0-4, typically 0-3 for colored belts, can extend for black belts)
}

export interface Tenant extends BaseEntity {
  slug: string;
  name: string;
}


// Dashboard Statistics Types
export interface DashboardStats {
  totalRevenue: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  activeMembers: {
    current: number;
    previous: number;
    change: number;
  };
  monthlyAttendance: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    quarterly: number;
  };
  attendanceByDayOfWeek: {
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
    Sun: number;
  };
  retention: {
    current: number; // Current quarter retention percentage
    previous: number; // Previous quarter retention percentage
    change: number; // Change in percentage points
  };
  recentPayments: (Payment & {
    membershipName?: string;
    userEmail?: string;
  })[];
  atRiskMembers: AtRiskMember[];
}

export interface AtRiskMember extends WithId {
  name: string;
  daysSinceLastSeen: number;
  rank: User['rank'];
  status: Membership['status'];
  lastSeen: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface MembershipPlan extends BaseEntity {
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  duration: number; // months
  description: string;
  price?: number; // Optional price
  active: boolean; // Whether the plan is active and available
}

// ============================================================================
// Auth Types
// ============================================================================

/**
 * Base credentials with email and password
 */
export interface BaseCredentials {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface LoginCredentials extends BaseCredentials {}

export interface RegisterCredentials extends BaseCredentials {
  name?: string;
  tenant_id: string;
  rank?: BJJRank['rank'];
  stripes?: BJJRank['stripes'];
}

export interface ForgotPasswordRequest {
  email: string;
  recaptchaToken?: string;
}

/**
 * Base user response data
 */
export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUserResponse;
}

export interface GoogleLoginResponse {
  url: string;
}

// ============================================================================
// Private Classes Types
// ============================================================================

export interface PrivatePlanSchedule {
  days: number[]; // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // Format: "HH:mm" (e.g., "18:00")
  duration_minutes: number; // Duration of each session
}

export interface PrivatePlan extends BasePlan, BaseEntity {
  active: boolean;
  schedule?: PrivatePlanSchedule;
}

export interface PrivatePlanEnrollment extends BaseEnrollment, BaseEntity {
  plan_id: string;
  owner_instructor_id: string;
  student_id: string;
}

/**
 * Participant information in a private session
 */
export interface SessionParticipant extends BaseUserInfo {
  rank?: string;
  stripes?: number;
}

export interface PrivateSession extends BaseSession, BaseEntity {
  instructor_id: string;
  participant_ids: string[];
  participants?: SessionParticipant[];
}

/**
 * Enrollment summary (subset of full enrollment)
 */
export interface EnrollmentSummary extends BaseEnrollment {}

/**
 * Plan summary (subset of full plan)
 */
export interface PlanSummary extends BasePlan {
  schedule?: PrivatePlanSchedule;
}

export interface StudentPrivatePlan {
  enrollment: EnrollmentSummary;
  plan: PlanSummary;
  instructor: UserInfo | null;
}

export interface StudentPrivateSession extends BaseSession {
  instructor: UserInfo | null;
}

/**
 * Enrollment with plan details
 */
export interface EnrollmentWithPlan extends BaseEnrollment {
  plan: PrivatePlan;
}

/**
 * Upcoming session summary
 */
export interface UpcomingSessionSummary {
  id: string;
  startAt: string;
  status: string;
  price_cents?: number;
}

export interface PrivateStudent extends BaseUserInfo {
  phone?: string;
  rank: string;
  stripes: number;
  enrollments: EnrollmentWithPlan[];
  upcoming_sessions?: UpcomingSessionSummary[];
}

export interface CreatePrivatePlanRequest {
  name: string;
  sessionsTotal: number;
  priceCents?: number;
  schedule?: PrivatePlanSchedule;
}

export interface CreatePrivateSessionRequest {
  startAt: string;
  participantIds: string[];
  priceCents?: number;
}

export interface EnablePrivateClassesRequest {
  instructorId: string;
}

/**
 * Student with private instructor assignment
 */
export interface StudentWithPrivateInstructor extends BaseUserInfo {
  private_owner_instructor_id: string | null;
}

export interface EnablePrivateClassesResponse {
  student: StudentWithPrivateInstructor;
  instructor: BaseUserInfo;
}

export interface DisablePrivateClassesResponse {
  student: StudentWithPrivateInstructor;
}

export interface Instructor extends UserInfo {}

// ============================================================================
// Registration Types
// ============================================================================

/**
 * Registration status information
 */
export interface RegistrationStatus {
  status: 'pending' | 'confirmed' | 'rejected';
  requestedAt?: string;
  requestedIp?: string;
  confirmedAt?: string;
  confirmedBy?: BaseUserInfo;
  rejectedAt?: string;
  rejectedBy?: BaseUserInfo;
  rejectionReason?: string;
}

/**
 * Membership summary
 */
export interface MembershipSummary {
  id: string;
  name: string;
  status: string;
}

export interface RegistrationRequest extends BaseUserInfo, BaseEntity, BJJRank {
  registration: RegistrationStatus;
  student_enabled: boolean;
  membership_id?: string;
  membership?: MembershipSummary;
}

export interface RegistrationListResponse {
  data: RegistrationRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ConfirmRegistrationRequest {
  createMembership?: boolean;
  membershipData?: BaseMembershipData;
}

export interface RejectRegistrationRequest {
  reason?: string;
}

export interface AssignMembershipRequest {
  membershipId?: string;
  membershipData?: BaseMembershipData;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface VapidPublicKeyResponse {
  publicKey: string;
}

export interface SubscriptionResponse {
  message: string;
  subscription: {
    id: string;
    endpoint: string;
  };
}

export interface UserSubscriptionsResponse {
  subscriptions: Array<{
    id: string;
    endpoint: string;
    userAgent?: string;
    createdAt: string;
  }>;
  count: number;
}
