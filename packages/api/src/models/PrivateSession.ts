import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PrivateSessionDocument extends Document {
  _id: Types.ObjectId;
  instructor_id: Types.ObjectId;
  participant_ids: Types.ObjectId[];
  startAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  price_cents?: number; // Optional: price for per-session payment (without plan)
  createdAt: Date;
  updatedAt: Date;
}

const privateSessionSchema = new Schema<PrivateSessionDocument>(
  {
    instructor_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participant_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    price_cents: {
      type: Number,
      min: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PrivateSessionModel = mongoose.model<PrivateSessionDocument>('PrivateSession', privateSessionSchema);
