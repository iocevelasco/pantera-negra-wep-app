import mongoose, { Schema, Document } from 'mongoose';
import type { User as IUser, UserRole } from '@pantera-negra/shared';

export interface UserDocument extends Omit<IUser, 'id' | 'membership_id' | 'tenant_id' | 'roles' | 'rank' | 'stripes'>, Document {
  _id: mongoose.Types.ObjectId;
  password?: string; // Password is only stored in database, not in shared type
  membership_id?: mongoose.Types.ObjectId; // Reference to Membership
  tenant_id: mongoose.Types.ObjectId; // Reference to Tenant
  roles: UserRole[]; // Roles array - user can have multiple roles
  rank: 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black'; // BJJ belt rank
  stripes: number; // Number of stripes on the belt (0-4, typically 0-3 for colored belts)
  phone?: string; // User phone number
  resetToken?: string; // Token for password reset
  resetTokenExpires?: Date; // Expiration date for reset token
  // Registration approval fields
  registration?: {
    status: 'pending' | 'confirmed' | 'rejected';
    requestedAt?: Date;
    requestedIp?: string;
    confirmedAt?: Date;
    confirmedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
  };
  student_enabled?: boolean; // Whether student can access student features
  private_owner_instructor_id?: mongoose.Types.ObjectId; // Reference to User (instructor) for private plans
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email_verified: { type: Boolean, default: false },
    name: { type: String },
    phone: { type: String },
    picture: { type: String },
    google_sub: { type: String, unique: true, sparse: true },
    password: { type: String, select: false }, // Don't include password in queries by default
    membership_id: { type: Schema.Types.ObjectId, ref: 'Membership', required: false },
    tenant_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: false },
    roles: {
      type: [String],
      enum: ['admin', 'instructor', 'student', 'owner'],
      required: true,
      default: () => ['student'],
    },
    rank: {
      type: String,
      enum: ['White', 'Blue', 'Purple', 'Brown', 'Black'],
      required: true,
      default: 'White',
    },
    stripes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 4, // Typically 0-3 for colored belts, can extend to 4+ for black belts
    },
    resetToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
    resetTokenExpires: {
      type: Date,
      select: false, // Don't include in queries by default
    },
    // Registration approval fields
    registration: {
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending',
        required: true,
      },
      requestedAt: { 
        type: Date, 
        default: Date.now,
      },
      requestedIp: { type: String },
      confirmedAt: { type: Date },
      confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectedAt: { type: Date },
      rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectionReason: { type: String },
    },
    student_enabled: {
      type: Boolean,
      default: false, // Students need approval before accessing features
    },
    private_owner_instructor_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Conditional validation: if role includes 'student' and tenant_id is null, private_owner_instructor_id is required
userSchema.pre('validate', function(next) {
  // Ensure user always has at least one role
  if (!this.roles || this.roles.length === 0) {
    console.warn(`⚠️  [USER] User ${this.email || 'unknown'} has no roles, assigning default 'student' role`);
    this.roles = ['student'];
  }
  
  if (this.roles && this.roles.includes('student') && !this.tenant_id && !this.private_owner_instructor_id) {
    return next(new Error('private_owner_instructor_id is required when role is student and tenant_id is null'));
  }
  
  // Validate registration fields when status is pending
  if (this.registration?.status === 'pending') {
    if (!this.registration.requestedAt) {
      this.registration.requestedAt = new Date();
    }
  }
  
  // Validate that confirmed/rejected have appropriate fields
  if (this.registration?.status === 'confirmed' && !this.registration.confirmedAt) {
    this.registration.confirmedAt = new Date();
  }
  
  if (this.registration?.status === 'rejected' && !this.registration.rejectedAt) {
    this.registration.rejectedAt = new Date();
  }
  
  next();
});

// Indexes for efficient queries
userSchema.index({ tenant_id: 1, 'registration.status': 1 });
userSchema.index({ 'registration.status': 1 });
userSchema.index({ student_enabled: 1 });
userSchema.index({ private_owner_instructor_id: 1, roles: 1 });
userSchema.index({ tenant_id: 1, roles: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

