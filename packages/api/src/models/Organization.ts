import mongoose, { Schema, Document } from 'mongoose';
import type { Organization as IOrganization } from '@pantera-negra/shared';

export interface OrganizationDocument extends Omit<IOrganization, 'id' | 'dojo_count' | 'owner_id'>, Document {
  _id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
}

const organizationSchema = new Schema<OrganizationDocument>(
  {
    name:          { type: String, required: true },
    description:   { type: String },
    logo_url:      { type: String },
    owner_id:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    website:       { type: String },
    contact_email: { type: String },
  },
  { timestamps: true }
);

organizationSchema.index({ owner_id: 1 });

export const OrganizationModel = mongoose.model<OrganizationDocument>('Organization', organizationSchema);
