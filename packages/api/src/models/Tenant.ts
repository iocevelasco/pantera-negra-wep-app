import mongoose, { Schema, Document } from 'mongoose';
import type { Tenant as ITenant, MartialArt, RankLevel, DojoScheduleSlot, DojoAddress } from '@pantera-negra/shared';

export interface TenantDocument extends Omit<ITenant, 'id' | 'organization_id'>, Document {
  _id: mongoose.Types.ObjectId;
  organization_id?: mongoose.Types.ObjectId;
}

const dojoAddressSchema = new Schema<DojoAddress>(
  {
    street:      { type: String },
    city:        { type: String },
    state:       { type: String },
    country:     { type: String },
    postal_code: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const rankLevelSchema = new Schema<RankLevel>(
  {
    key:        { type: String, required: true },
    label:      { type: String, required: true },
    order:      { type: Number, required: true },
    color:      { type: String },
    maxStripes: { type: Number },
  },
  { _id: false }
);

const scheduleSlotSchema = new Schema<DojoScheduleSlot>(
  {
    day:   { type: Number, min: 0, max: 6, required: true },
    open:  { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);

const tenantSchema = new Schema<TenantDocument>(
  {
    slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:            { type: String, required: true },
    // Network layer
    organization_id: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    // Dojo details
    martial_art:  {
      type: String,
      enum: ['BJJ', 'Karate', 'Judo', 'Taekwondo', 'MuayThai', 'MMA', 'Boxing', 'Kickboxing', 'Wrestling', 'Other'],
      default: 'BJJ',
      required: true,
    },
    description:  { type: String },
    logo_url:     { type: String },
    address:      { type: dojoAddressSchema },
    phone:        { type: String },
    email:        { type: String },
    website:      { type: String },
    schedule:     { type: [scheduleSlotSchema], default: [] },
    custom_ranks: { type: [rankLevelSchema], default: [] },
  },
  { timestamps: true }
);

export const TenantModel = mongoose.model<TenantDocument>('Tenant', tenantSchema);
