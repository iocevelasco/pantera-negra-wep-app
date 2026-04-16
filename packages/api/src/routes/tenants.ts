import { Router } from 'express';
import { TenantModel } from '../models/Tenant.js';
import type { Tenant } from '@pantera-negra/shared';

export const tenantsRouter = Router();

// Helper function to safely convert date to ISO string
function toISOString(date: any): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
}

// GET /api/tenants - Get all tenants
tenantsRouter.get('/', async (req, res, next) => {
  try {
    const tenants = await TenantModel.find().lean();
    const formattedTenants: Tenant[] = tenants.map((tenant) => ({
      id: tenant._id.toString(),
      slug: tenant.slug,
      name: tenant.name,
      created_at: toISOString(tenant.created_at),
      updated_at: toISOString(tenant.updated_at),
    }));

    res.json({
      success: true,
      data: formattedTenants,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tenants/:id - Get tenant by ID
tenantsRouter.get('/:id', async (req, res, next) => {
  try {
    const tenant = await TenantModel.findById(req.params.id).lean();
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: tenant._id.toString(),
        slug: tenant.slug,
        name: tenant.name,
        created_at: toISOString(tenant.created_at),
        updated_at: toISOString(tenant.updated_at),
      },
    });
  } catch (error) {
    next(error);
  }
});

