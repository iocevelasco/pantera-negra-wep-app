import mongoose, { Schema, Document } from 'mongoose';
import type { Membership } from '@pantera-negra/shared';

export interface MembershipDocument extends Omit<Membership, 'id' | 'user_id'>, Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  lastPaymentDate?: string;
  subscriptionExpiresAt?: string;
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Past Due'],
      default: 'Active',
    },
    memberType: {
      type: String,
      enum: ['Adult', 'Kid'],
      default: 'Adult',
    },
    joined: { type: String, required: true },
    lastSeen: { type: String, required: true },
    plan: { type: String },
    price: { type: Number }, // Monthly membership price
    lastPaymentDate: { type: String }, // ISO date string
    subscriptionExpiresAt: { type: String }, // ISO date string
  },
  {
    timestamps: true,
  }
);

export const MembershipModel = mongoose.model<MembershipDocument>('Membership', membershipSchema);

