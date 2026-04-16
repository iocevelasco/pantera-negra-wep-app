import mongoose, { Schema, Document } from 'mongoose';
import type { Payment } from '@pantera-negra/shared';

export interface PaymentDocument extends Omit<Payment, 'id' | 'membershipId'>, Document {
  _id: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId; // Stored as ObjectId, converted to string in API
}

// Payment constants
export const PAYMENT_AMOUNTS = {
  TRANSFER: 54000,
  CASH: 47000,
} as const;

export const PAYMENT_CURRENCY = 'ARS' as const; // Argentine Pesos

const paymentSchema = new Schema(
  {
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    plan: { type: String, required: true },
    paymentType: {
      type: String,
      enum: ['transfer', 'cash', 'card'],
      required: true,
    },
    currency: {
      type: String,
      default: PAYMENT_CURRENCY,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', paymentSchema);

