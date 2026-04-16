import mongoose, { Schema, Document } from 'mongoose';
import type { Attendance } from '@pantera-negra/shared';

export interface AttendanceDocument extends Omit<Attendance, 'id' | 'membershipId'>, Document {
  _id: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId; // Stored as ObjectId, converted to string in API
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true, index: true },
    classId: { type: String, required: true },
    date: { type: String, required: true }, // Removed index: true - using explicit index below
    checkedIn: { type: Boolean, default: true },
    checkedInAt: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
attendanceSchema.index({ membershipId: 1, date: 1 });
attendanceSchema.index({ date: 1 }); // Explicit index replaces the inline index: true
// Unique index to prevent duplicate check-ins for same membership, class, and date
attendanceSchema.index({ membershipId: 1, classId: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);

