import mongoose, { Schema, Document } from 'mongoose';

export interface PushSubscriptionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<PushSubscriptionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
pushSubscriptionSchema.index({ user_id: 1, endpoint: 1 });

export const PushSubscriptionModel = mongoose.model<PushSubscriptionDocument>(
  'PushSubscription',
  pushSubscriptionSchema
);

