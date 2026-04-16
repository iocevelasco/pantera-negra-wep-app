import mongoose, { Schema, Document } from 'mongoose';
import type { Classes } from '@pantera-negra/shared';

export interface ClassDocument extends Omit<Classes, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const classSchema = new Schema<ClassDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Gi', 'No-Gi', 'Kids'],
      required: false,
    },
    instructor: { type: String, required: false },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: false },
    capacity: { type: Number, required: false, min: 1 },
    enrolled: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const ClassModel = mongoose.model<ClassDocument>('Class', classSchema);

