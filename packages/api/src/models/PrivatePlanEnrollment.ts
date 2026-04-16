import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PrivatePlanEnrollmentDocument extends Document {
  _id: Types.ObjectId;
  plan_id: Types.ObjectId;
  owner_instructor_id: Types.ObjectId;
  student_id: Types.ObjectId;
  sessions_remaining: number;
  status: 'active' | 'consumed' | 'cancelled';
  started_at: Date;
  expires_at?: Date; // Optional: expiration date for the plan
  agreed_price_cents?: number; // Optional: actual price charged for the pack
  createdAt: Date;
  updatedAt: Date;
}

const privatePlanEnrollmentSchema = new Schema<PrivatePlanEnrollmentDocument>(
  {
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: 'PrivatePlan',
      required: true,
      index: true,
    },
    owner_instructor_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessions_remaining: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'consumed', 'cancelled'],
      default: 'active',
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: false,
    },
    agreed_price_cents: {
      type: Number,
      min: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
privatePlanEnrollmentSchema.index({ owner_instructor_id: 1, student_id: 1, status: 1 });

// Partial unique index: one active enrollment per plan per student
privatePlanEnrollmentSchema.index(
  { plan_id: 1, student_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

export const PrivatePlanEnrollmentModel = mongoose.model<PrivatePlanEnrollmentDocument>(
  'PrivatePlanEnrollment',
  privatePlanEnrollmentSchema
);
