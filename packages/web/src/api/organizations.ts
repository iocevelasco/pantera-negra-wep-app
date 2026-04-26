import { apiClient } from '@/lib/api-client';
import type { Organization, Tenant } from '@pantera-negra/shared';

export const organizationsApi = {
  // ── Organizations ──────────────────────────────────────────────────────────

  list: (): Promise<{ success: boolean; data: Organization[] }> =>
    apiClient.get('/api/organizations'),

  get: (id: string): Promise<{ success: boolean; data: Organization }> =>
    apiClient.get(`/api/organizations/${id}`),

  create: (data: {
    name: string;
    description?: string;
    logo_url?: string;
    website?: string;
    contact_email?: string;
  }): Promise<{ success: boolean; data: Organization }> =>
    apiClient.post('/api/organizations', data),

  update: (
    id: string,
    data: Partial<{ name: string; description: string; logo_url: string; website: string; contact_email: string }>
  ): Promise<{ success: boolean; data: Organization }> =>
    apiClient.put(`/api/organizations/${id}`, data),

  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/api/organizations/${id}`),

  // ── Dojos ─────────────────────────────────────────────────────────────────

  listDojos: (orgId: string): Promise<{ success: boolean; data: Tenant[] }> =>
    apiClient.get(`/api/organizations/${orgId}/dojos`),

  createDojo: (orgId: string, data: Record<string, unknown>): Promise<{ success: boolean; data: Tenant }> =>
    apiClient.post(`/api/organizations/${orgId}/dojos`, data),

  updateDojo: (
    orgId: string,
    dojoId: string,
    data: Record<string, unknown>
  ): Promise<{ success: boolean; data: Tenant }> =>
    apiClient.put(`/api/organizations/${orgId}/dojos/${dojoId}`, data),

  deleteDojo: (orgId: string, dojoId: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/api/organizations/${orgId}/dojos/${dojoId}`),
};
