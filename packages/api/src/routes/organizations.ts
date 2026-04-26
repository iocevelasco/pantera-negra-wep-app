import { Router } from 'express';
import mongoose from 'mongoose';
import { OrganizationModel } from '../models/Organization.js';
import { TenantModel } from '../models/Tenant.js';
import { isAuthenticated, requireNetworkOwner } from '../middleware/auth.middleware.js';
import { createOrganizationSchema, updateOrganizationSchema, createDojoSchema, updateDojoSchema } from '@pantera-negra/shared';
import type { Organization, Tenant } from '@pantera-negra/shared';

export const organizationsRouter = Router();

function toISOString(date: any): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
}

function formatOrg(org: any, dojoCount = 0): Organization {
  return {
    id:            org._id.toString(),
    name:          org.name,
    description:   org.description,
    logo_url:      org.logo_url,
    owner_id:      org.owner_id.toString(),
    website:       org.website,
    contact_email: org.contact_email,
    dojo_count:    dojoCount,
    created_at:    toISOString(org.created_at),
    updated_at:    toISOString(org.updated_at),
  };
}

function formatTenant(t: any): Tenant {
  return {
    id:              t._id.toString(),
    slug:            t.slug,
    name:            t.name,
    organization_id: t.organization_id?.toString(),
    martial_art:     t.martial_art ?? 'BJJ',
    description:     t.description,
    logo_url:        t.logo_url,
    address:         t.address,
    phone:           t.phone,
    email:           t.email,
    website:         t.website,
    schedule:        t.schedule ?? [],
    custom_ranks:    t.custom_ranks ?? [],
    created_at:      toISOString(t.created_at),
    updated_at:      toISOString(t.updated_at),
  };
}

// ─── Organization CRUD ───────────────────────────────────────────────────────

// GET /api/organizations — my organizations
organizationsRouter.get('/', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const ownerId = req.user!.sub;
    const orgs = await OrganizationModel.find({ owner_id: ownerId }).lean();

    const orgIds = orgs.map(o => o._id);
    const counts = await TenantModel.aggregate([
      { $match: { organization_id: { $in: orgIds } } },
      { $group: { _id: '$organization_id', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

    res.json({ success: true, data: orgs.map(o => formatOrg(o, countMap[o._id.toString()] ?? 0)) });
  } catch (err) { next(err); }
});

// POST /api/organizations — create organization
organizationsRouter.post('/', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const parsed = createOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const org = await OrganizationModel.create({
      ...parsed.data,
      owner_id: new mongoose.Types.ObjectId(req.user!.sub),
    });
    res.status(201).json({ success: true, data: formatOrg(org) });
  } catch (err) { next(err); }
});

// GET /api/organizations/:id
organizationsRouter.get('/:id', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findOne({
      _id: req.params.id,
      owner_id: req.user!.sub,
    }).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const count = await TenantModel.countDocuments({ organization_id: org._id });
    res.json({ success: true, data: formatOrg(org, count) });
  } catch (err) { next(err); }
});

// PUT /api/organizations/:id
organizationsRouter.put('/:id', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const parsed = updateOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const org = await OrganizationModel.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user!.sub },
      { $set: parsed.data },
      { new: true }
    ).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const count = await TenantModel.countDocuments({ organization_id: org._id });
    res.json({ success: true, data: formatOrg(org, count) });
  } catch (err) { next(err); }
});

// DELETE /api/organizations/:id
organizationsRouter.delete('/:id', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const dojoCount = await TenantModel.countDocuments({ organization_id: req.params.id });
    if (dojoCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete organization with ${dojoCount} active dojo(s). Remove dojos first.`,
      });
    }
    const org = await OrganizationModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(String(req.params.id)),
      owner_id: new mongoose.Types.ObjectId(String(req.user!.sub)),
    });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    res.json({ success: true, message: 'Organization deleted' });
  } catch (err) { next(err); }
});

// ─── Dojo (Tenant) management under an Organization ──────────────────────────

// GET /api/organizations/:id/dojos
organizationsRouter.get('/:id/dojos', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findOne({ _id: req.params.id, owner_id: req.user!.sub }).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const dojos = await TenantModel.find({ organization_id: org._id }).lean();
    res.json({ success: true, data: dojos.map(formatTenant) });
  } catch (err) { next(err); }
});

// POST /api/organizations/:id/dojos — create dojo in org
organizationsRouter.post('/:id/dojos', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findOne({ _id: req.params.id, owner_id: req.user!.sub }).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const parsed = createDojoSchema.safeParse({ ...req.body, organization_id: req.params.id });
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    // Auto-generate slug if not provided
    const slug = parsed.data.slug ||
      parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await TenantModel.findOne({ slug });
    if (existing) {
      return res.status(409).json({ success: false, error: `Slug "${slug}" is already taken` });
    }

    const dojo = await TenantModel.create({
      ...parsed.data,
      slug,
      organization_id: new mongoose.Types.ObjectId(String(req.params.id)),
    });

    res.status(201).json({ success: true, data: formatTenant(dojo) });
  } catch (err) { next(err); }
});

// PUT /api/organizations/:orgId/dojos/:dojoId
organizationsRouter.put('/:orgId/dojos/:dojoId', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findOne({ _id: req.params.orgId, owner_id: req.user!.sub }).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const parsed = updateDojoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const dojo = await TenantModel.findOneAndUpdate(
      { _id: req.params.dojoId, organization_id: org._id },
      { $set: parsed.data },
      { new: true }
    ).lean();
    if (!dojo) return res.status(404).json({ success: false, error: 'Dojo not found' });

    res.json({ success: true, data: formatTenant(dojo) });
  } catch (err) { next(err); }
});

// DELETE /api/organizations/:orgId/dojos/:dojoId
organizationsRouter.delete('/:orgId/dojos/:dojoId', isAuthenticated, requireNetworkOwner, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findOne({ _id: req.params.orgId, owner_id: req.user!.sub }).lean();
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const dojo = await TenantModel.findOneAndDelete({
      _id: req.params.dojoId,
      organization_id: org._id,
    });
    if (!dojo) return res.status(404).json({ success: false, error: 'Dojo not found' });
    res.json({ success: true, message: 'Dojo deleted' });
  } catch (err) { next(err); }
});
