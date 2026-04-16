import mongoose, { Schema, Document } from 'mongoose';
import type { Tenant as ITenant } from '@pantera-negra/shared';

export interface TenantDocument extends Omit<ITenant, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const tenantSchema = new Schema<TenantDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Note: No need for explicit index on slug - unique: true already creates an index

export const TenantModel = mongoose.model<TenantDocument>('Tenant', tenantSchema);

