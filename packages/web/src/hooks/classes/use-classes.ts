import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/api/classes';
import type { Classes } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const classKeys = {
  all: [QueryKeys.classes] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (filters?: { date?: string; type?: string }) => 
    [...classKeys.lists(), { filters }] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
};

// Get all classes query
export function useClasses(params?: { date?: string; type?: string }) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classesApi.getAll(params),
  });
}

// Get class by ID query
export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
}

// Create class mutation
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classData: Omit<Classes, 'id' | 'enrolled'>) => 
      classesApi.create(classData),
    onSuccess: () => {
      // Invalidate and refetch classes list
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

// Update class mutation
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...classData }: { id: string } & Partial<Omit<Classes, 'id' | 'enrolled'>>) =>
      classesApi.update(id, classData),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(data.id) });
    },
  });
}

// Delete class mutation
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch classes list
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

// Create multiple classes mutation
export function useCreateBulkClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      month: number;
      year: number;
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
      name?: string;
    }) => classesApi.createBulk(params),
    onSuccess: () => {
      // Invalidate and refetch classes list
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

