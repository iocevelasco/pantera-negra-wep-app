import mongoose, { Schema, Document } from 'mongoose';

export interface MembershipPlanDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  duration: number; // months
  description: string;
  price?: number; // Optional price
  active: boolean; // Whether the plan is active and available
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<MembershipPlanDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    duration: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    price: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const MembershipPlanModel = mongoose.model<MembershipPlanDocument>('MembershipPlan', membershipPlanSchema);
