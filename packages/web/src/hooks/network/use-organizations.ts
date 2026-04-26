import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { organizationsApi } from '@/api/organizations';
import type { Organization, Tenant } from '@pantera-negra/shared';

const KEYS = {
  all:           ['organizations'] as const,
  list:          () => [...KEYS.all, 'list'] as const,
  detail:        (id: string) => [...KEYS.all, id] as const,
  dojos:         (orgId: string) => [...KEYS.all, orgId, 'dojos'] as const,
};

// ── Organizations ─────────────────────────────────────────────────────────────

export function useOrganizations() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: async () => {
      const res = await organizationsApi.list();
      return res.data as Organization[];
    },
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const res = await organizationsApi.get(id);
      return res.data as Organization;
    },
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      toast.success('Organization created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateOrganization(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof organizationsApi.update>[1]) =>
      organizationsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.list() });
      toast.success('Organization updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: organizationsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      toast.success('Organization deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Dojos ─────────────────────────────────────────────────────────────────────

export function useDojos(orgId: string) {
  return useQuery({
    queryKey: KEYS.dojos(orgId),
    queryFn: async () => {
      const res = await organizationsApi.listDojos(orgId);
      return res.data as Tenant[];
    },
    enabled: !!orgId,
  });
}

export function useCreateDojo(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => organizationsApi.createDojo(orgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.dojos(orgId) });
      qc.invalidateQueries({ queryKey: KEYS.detail(orgId) });
      toast.success('Dojo created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDojo(orgId: string, dojoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => organizationsApi.updateDojo(orgId, dojoId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.dojos(orgId) });
      toast.success('Dojo updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDojo(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dojoId: string) => organizationsApi.deleteDojo(orgId, dojoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.dojos(orgId) });
      qc.invalidateQueries({ queryKey: KEYS.detail(orgId) });
      toast.success('Dojo deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
