// Common types shared between frontend and backend

// ============================================================================
// Martial Arts & Rank Systems
// ============================================================================

export type MartialArt =
  | 'BJJ'
  | 'Karate'
  | 'Judo'
  | 'Taekwondo'
  | 'MuayThai'
  | 'MMA'
  | 'Boxing'
  | 'Kickboxing'
  | 'Wrestling'
  | 'Other';

export interface RankLevel {
  key: string;       // internal key e.g. "white", "1dan"
  label: string;     // display label e.g. "White Belt", "1st Dan"
  order: number;     // sort order
  color?: string;    // hex or named color for badge
  maxStripes?: number; // if the rank uses stripes/degrees
}

export const MARTIAL_ART_RANKS: Record<MartialArt, RankLevel[]> = {
  BJJ: [
    { key: 'white',  label: 'White Belt',  order: 0, color: '#FFFFFF', maxStripes: 4 },
    { key: 'blue',   label: 'Blue Belt',   order: 1, color: '#3B82F6', maxStripes: 4 },
    { key: 'purple', label: 'Purple Belt', order: 2, color: '#9333EA', maxStripes: 4 },
    { key: 'brown',  label: 'Brown Belt',  order: 3, color: '#92400E', maxStripes: 4 },
    { key: 'black',  label: 'Black Belt',  order: 4, color: '#111827', maxStripes: 6 },
  ],
  Karate: [
    { key: '10kyu', label: '10th Kyu (White)',  order: 0,  color: '#FFFFFF' },
    { key: '9kyu',  label: '9th Kyu (Yellow)',  order: 1,  color: '#FDE047' },
    { key: '8kyu',  label: '8th Kyu (Orange)',  order: 2,  color: '#FB923C' },
    { key: '7kyu',  label: '7th Kyu (Green)',   order: 3,  color: '#22C55E' },
    { key: '6kyu',  label: '6th Kyu (Blue)',    order: 4,  color: '#3B82F6' },
    { key: '5kyu',  label: '5th Kyu (Purple)',  order: 5,  color: '#9333EA' },
    { key: '4kyu',  label: '4th Kyu (Purple)',  order: 6,  color: '#7E22CE' },
    { key: '3kyu',  label: '3rd Kyu (Brown)',   order: 7,  color: '#92400E' },
    { key: '2kyu',  label: '2nd Kyu (Brown)',   order: 8,  color: '#78350F' },
    { key: '1kyu',  label: '1st Kyu (Brown)',   order: 9,  color: '#451A03' },
    { key: '1dan',  label: '1st Dan (Black)',   order: 10, color: '#111827', maxStripes: 1 },
    { key: '2dan',  label: '2nd Dan (Black)',   order: 11, color: '#111827', maxStripes: 1 },
    { key: '3dan',  label: '3rd Dan (Black)',   order: 12, color: '#111827', maxStripes: 1 },
    { key: '4dan',  label: '4th Dan (Black)',   order: 13, color: '#111827', maxStripes: 1 },
    { key: '5dan',  label: '5th Dan (Black)',   order: 14, color: '#111827', maxStripes: 1 },
  ],
  Judo: [
    { key: '6kyu',  label: '6th Kyu (White)',   order: 0,  color: '#FFFFFF' },
    { key: '5kyu',  label: '5th Kyu (Yellow)',  order: 1,  color: '#FDE047' },
    { key: '4kyu',  label: '4th Kyu (Orange)',  order: 2,  color: '#FB923C' },
    { key: '3kyu',  label: '3rd Kyu (Green)',   order: 3,  color: '#22C55E' },
    { key: '2kyu',  label: '2nd Kyu (Blue)',    order: 4,  color: '#3B82F6' },
    { key: '1kyu',  label: '1st Kyu (Brown)',   order: 5,  color: '#92400E' },
    { key: '1dan',  label: '1st Dan (Black)',   order: 6,  color: '#111827' },
    { key: '2dan',  label: '2nd Dan (Black)',   order: 7,  color: '#111827' },
    { key: '3dan',  label: '3rd Dan (Black)',   order: 8,  color: '#111827' },
    { key: '4dan',  label: '4th Dan (Black)',   order: 9,  color: '#111827' },
    { key: '5dan',  label: '5th Dan (Black)',   order: 10, color: '#111827' },
    { key: '6dan',  label: '6th Dan (Red-White)', order: 11, color: '#EF4444' },
    { key: '7dan',  label: '7th Dan (Red-White)', order: 12, color: '#EF4444' },
    { key: '8dan',  label: '8th Dan (Red-White)', order: 13, color: '#EF4444' },
    { key: '9dan',  label: '9th Dan (Red)',     order: 14, color: '#DC2626' },
    { key: '10dan', label: '10th Dan (Red)',    order: 15, color: '#DC2626' },
  ],
  Taekwondo: [
    { key: '9geup',  label: '9th Geup (White)',      order: 0,  color: '#FFFFFF' },
    { key: '8geup',  label: '8th Geup (Yellow)',     order: 1,  color: '#FDE047' },
    { key: '7geup',  label: '7th Geup (Yellow-Green)', order: 2, color: '#A3E635' },
    { key: '6geup',  label: '6th Geup (Green)',      order: 3,  color: '#22C55E' },
    { key: '5geup',  label: '5th Geup (Green-Blue)', order: 4,  color: '#34D399' },
    { key: '4geup',  label: '4th Geup (Blue)',       order: 5,  color: '#3B82F6' },
    { key: '3geup',  label: '3rd Geup (Blue-Red)',   order: 6,  color: '#818CF8' },
    { key: '2geup',  label: '2nd Geup (Red)',        order: 7,  color: '#EF4444' },
    { key: '1geup',  label: '1st Geup (Red-Black)',  order: 8,  color: '#B91C1C' },
    { key: '1dan',   label: '1st Dan (Black)',       order: 9,  color: '#111827' },
    { key: '2dan',   label: '2nd Dan (Black)',       order: 10, color: '#111827' },
    { key: '3dan',   label: '3rd Dan (Black)',       order: 11, color: '#111827' },
    { key: '4dan',   label: '4th Dan (Black)',       order: 12, color: '#111827' },
    { key: '5dan',   label: '5th Dan (Black)',       order: 13, color: '#111827' },
    { key: '6dan',   label: '6th Dan (Black)',       order: 14, color: '#111827' },
    { key: '7dan',   label: '7th Dan (Black)',       order: 15, color: '#111827' },
    { key: '8dan',   label: '8th Dan (Black)',       order: 16, color: '#111827' },
    { key: '9dan',   label: '9th Dan (Black)',       order: 17, color: '#111827' },
  ],
  MuayThai: [
    { key: 'white',       label: 'White Prajied',       order: 0, color: '#FFFFFF' },
    { key: 'yellow',      label: 'Yellow Prajied',      order: 1, color: '#FDE047' },
    { key: 'green',       label: 'Green Prajied',       order: 2, color: '#22C55E' },
    { key: 'blue',        label: 'Blue Prajied',        order: 3, color: '#3B82F6' },
    { key: 'red',         label: 'Red Prajied',         order: 4, color: '#EF4444' },
    { key: 'black',       label: 'Black Prajied',       order: 5, color: '#111827' },
    { key: 'black_gold',  label: 'Black/Gold Prajied',  order: 6, color: '#78350F' },
  ],
  MMA: [
    { key: 'beginner',     label: 'Beginner',     order: 0, color: '#D1D5DB' },
    { key: 'intermediate', label: 'Intermediate', order: 1, color: '#6B7280' },
    { key: 'advanced',     label: 'Advanced',     order: 2, color: '#374151' },
    { key: 'competitor',   label: 'Competitor',   order: 3, color: '#111827' },
  ],
  Boxing: [
    { key: 'novice',       label: 'Novice',       order: 0, color: '#D1D5DB' },
    { key: 'intermediate', label: 'Intermediate', order: 1, color: '#6B7280' },
    { key: 'elite',        label: 'Elite',        order: 2, color: '#374151' },
    { key: 'professional', label: 'Professional', order: 3, color: '#111827' },
  ],
  Kickboxing: [
    { key: 'white',  label: 'White Belt',  order: 0, color: '#FFFFFF' },
    { key: 'yellow', label: 'Yellow Belt', order: 1, color: '#FDE047' },
    { key: 'orange', label: 'Orange Belt', order: 2, color: '#FB923C' },
    { key: 'green',  label: 'Green Belt',  order: 3, color: '#22C55E' },
    { key: 'blue',   label: 'Blue Belt',   order: 4, color: '#3B82F6' },
    { key: 'red',    label: 'Red Belt',    order: 5, color: '#EF4444' },
    { key: 'black',  label: 'Black Belt',  order: 6, color: '#111827', maxStripes: 5 },
  ],
  Wrestling: [
    { key: 'beginner',     label: 'Beginner',     order: 0, color: '#D1D5DB' },
    { key: 'intermediate', label: 'Intermediate', order: 1, color: '#6B7280' },
    { key: 'advanced',     label: 'Advanced',     order: 2, color: '#374151' },
  ],
  Other: [
    { key: 'beginner',     label: 'Beginner',     order: 0, color: '#D1D5DB' },
    { key: 'intermediate', label: 'Intermediate', order: 1, color: '#6B7280' },
    { key: 'advanced',     label: 'Advanced',     order: 2, color: '#374151' },
    { key: 'expert',       label: 'Expert',       order: 3, color: '#111827' },
  ],
};

export interface DojoScheduleSlot {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday
  open: string;  // "HH:mm"
  close: string; // "HH:mm"
}

// ============================================================================
// Organization (Network of Dojos)
// ============================================================================

export interface Organization extends BaseEntity {
  name: string;
  description?: string;
  logo_url?: string;
  owner_id: string; // network_owner user
  website?: string;
  contact_email?: string;
  dojo_count?: number; // virtual, populated on read
}

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
export type UserRole = 'admin' | 'instructor' | 'student' | 'owner' | 'network_owner';

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

export interface DojoAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Tenant extends BaseEntity {
  slug: string;
  name: string;
  // Network layer
  organization_id?: string;
  // Dojo details
  martial_art: MartialArt;
  description?: string;
  logo_url?: string;
  address?: DojoAddress;
  phone?: string;
  email?: string;
  website?: string;
  schedule?: DojoScheduleSlot[];
  // Rank system override (if null, uses MARTIAL_ART_RANKS[martial_art])
  custom_ranks?: RankLevel[];
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
