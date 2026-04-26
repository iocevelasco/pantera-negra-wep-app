import { z } from 'zod';

// Validation schemas shared between frontend and backend

// ============================================================================
// Martial Arts & Organization Schemas
// ============================================================================

const martialArtEnum = z.enum([
  'BJJ', 'Karate', 'Judo', 'Taekwondo', 'MuayThai', 'MMA', 'Boxing', 'Kickboxing', 'Wrestling', 'Other',
]);

const dojoAddressSchema = z.object({
  street:      z.string().optional(),
  city:        z.string().optional(),
  state:       z.string().optional(),
  country:     z.string().optional(),
  postal_code: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const dojoScheduleSlotSchema = z.object({
  day:   z.number().int().min(0).max(6),
  open:  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time (HH:mm)'),
  close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time (HH:mm)'),
});

export const organizationSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters'),
  description:   z.string().optional(),
  logo_url:      z.string().url('Invalid URL').optional().or(z.literal('')),
  website:       z.string().url('Invalid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const createOrganizationSchema = organizationSchema;
export const updateOrganizationSchema = organizationSchema.partial();

export const createDojoSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  slug:            z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens').optional(),
  martial_art:     martialArtEnum,
  organization_id: z.string().min(1, 'Organization is required'),
  description:     z.string().optional(),
  logo_url:        z.string().url('Invalid URL').optional().or(z.literal('')),
  address:         dojoAddressSchema.optional(),
  phone:           z.string().optional(),
  email:           z.string().email('Invalid email').optional().or(z.literal('')),
  website:         z.string().url('Invalid URL').optional().or(z.literal('')),
  schedule:        z.array(dojoScheduleSlotSchema).optional(),
});

export const updateDojoSchema = createDojoSchema.omit({ organization_id: true, slug: true }).partial();

export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').optional(),
  roles: z.array(z.enum(['admin', 'instructor', 'student', 'owner', 'network_owner'])).min(1, 'At least one role is required'),
  tenant_id: z.string().min(1, 'Tenant is required'),
  membership_id: z.string().optional(),
  rank: z.enum(['White', 'Blue', 'Purple', 'Brown', 'Black']),
  stripes: z.number().min(0).max(4),
});

export type UserSchema = z.infer<typeof userSchema>;

export const membershipSchema = z.object({
  user_id: z.string().min(1, 'User is required'),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['Active', 'Inactive', 'Past Due']),
  memberType: z.enum(['Adult', 'Kid']),
  plan: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  lastPaymentDate: z.string().optional(),
  subscriptionExpiresAt: z.string().optional(),
});

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  type: z.enum(['Gi', 'No-Gi', 'Kids']).optional(),
  instructor: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  date: z.string(),
  location: z.string().optional(), // Optional - will be set from tenant
  capacity: z.number().int().positive().optional(),
});

export const attendanceSchema = z.object({
  membershipId: z.string().min(1),
  classId: z.string().min(1),
  date: z.string(),
});

export const paymentSchema = z.object({
  membershipId: z.string().min(1),
  amount: z.number().positive().optional(),
  plan: z.string().min(1),
  paymentType: z.enum(['transfer', 'cash', 'card']),
  currency: z.string().optional(),
});

export const membershipPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  duration: z.number().int().positive('Duration must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  active: z.boolean().default(true),
});

export type MembershipPlanSchema = z.infer<typeof membershipPlanSchema>;

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().optional(),
});

export const registerCredentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
  tenant_id: z.string().min(1, 'Tenant is required'),
  rank: z.enum(['White', 'Blue', 'Purple', 'Brown', 'Black']).optional(),
  stripes: z.number().min(0).max(4).optional(),
  recaptchaToken: z.string().optional(),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  recaptchaToken: z.string().optional(),
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// Private Classes Schemas
// ============================================================================

export const privatePlanScheduleSchema = z.object({
  days: z.array(z.number().min(0).max(6)).min(1, 'At least one day is required'),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  duration_minutes: z.number().int().positive('Duration must be positive'),
});

export const createPrivatePlanRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sessionsTotal: z.number().int().positive('Sessions total must be positive'),
  priceCents: z.number().int().min(0, 'Price must be non-negative').optional(),
  schedule: privatePlanScheduleSchema.optional(),
});

export const createPrivateSessionRequestSchema = z.object({
  startAt: z.string().datetime('Invalid date format'),
  participantIds: z.array(z.string().min(1)).min(1, 'At least one participant is required'),
  priceCents: z.number().int().min(0, 'Price must be non-negative').optional(),
});

export const enablePrivateClassesRequestSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
});

// ============================================================================
// Registration Schemas
// ============================================================================

export const confirmRegistrationRequestSchema = z.object({
  createMembership: z.boolean().optional(),
  membershipData: z.object({
    name: z.string().optional(),
    memberType: z.enum(['Adult', 'Kid']).optional(),
    plan: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    lastPaymentDate: z.string().optional(),
    subscriptionExpiresAt: z.string().optional(),
  }).optional(),
});

export const rejectRegistrationRequestSchema = z.object({
  reason: z.string().optional(),
});

export const assignMembershipRequestSchema = z.object({
  membershipId: z.string().optional(),
  membershipData: z.object({
    name: z.string().optional(),
    memberType: z.enum(['Adult', 'Kid']).optional(),
    plan: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    lastPaymentDate: z.string().optional(),
    subscriptionExpiresAt: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Notification Schemas
// ============================================================================

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
  }),
});

export const notificationPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  icon: z.string().url('Invalid icon URL').optional(),
  badge: z.string().url('Invalid badge URL').optional(),
  image: z.string().url('Invalid image URL').optional(),
  data: z.record(z.any()).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
});
