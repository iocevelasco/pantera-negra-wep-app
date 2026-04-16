import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PrivatePlanDocument extends Document {
  _id: Types.ObjectId;
  owner_instructor_id: Types.ObjectId;
  name: string;
  sessions_total: number;
  active: boolean;
  price_cents?: number; // Optional recommended price for the pack
  schedule?: {
    days: number[]; // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time: string; // Format: "HH:mm" (e.g., "18:00")
    duration_minutes: number; // Duration of each session
  };
  createdAt: Date;
  updatedAt: Date;
}

const privatePlanSchema = new Schema<PrivatePlanDocument>(
  {
    owner_instructor_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sessions_total: {
      type: Number,
      required: true,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    price_cents: {
      type: Number,
      min: 0,
      required: false,
    },
    schedule: {
      days: {
        type: [Number],
        validate: {
          validator: (days: number[]) => {
            return days.every(day => day >= 0 && day <= 6);
          },
          message: 'Days must be between 0 (Sunday) and 6 (Saturday)',
        },
      },
      start_time: {
        type: String,
        match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm format
      },
      duration_minutes: {
        type: Number,
        min: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for unique plan names per instructor (optional)
privatePlanSchema.index({ owner_instructor_id: 1, name: 1 }, { unique: false });

export const PrivatePlanModel = mongoose.model<PrivatePlanDocument>('PrivatePlan', privatePlanSchema);
