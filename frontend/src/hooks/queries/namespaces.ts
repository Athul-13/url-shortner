import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { namespaceService, type CreateNamespaceData, type UpdateNamespaceData } from '../../api/services/namespaces';

// Query keys
export const namespaceKeys = {
  all: ['namespaces'] as const,
  lists: () => [...namespaceKeys.all, 'list'] as const,
  list: (organizationId?: number) => [...namespaceKeys.lists(), { organizationId }] as const,
  details: () => [...namespaceKeys.all, 'detail'] as const,
  detail: (id: number) => [...namespaceKeys.details(), id] as const,
};

// Get all namespaces
export const useNamespaces = (organizationId?: number) => {
  return useQuery({
    queryKey: namespaceKeys.list(organizationId),
    queryFn: () => namespaceService.getAll(organizationId),
  });
};

// Get namespace by ID
export const useNamespace = (id: number) => {
  return useQuery({
    queryKey: namespaceKeys.detail(id),
    queryFn: () => namespaceService.getById(id),
    enabled: !!id,
  });
};

// Create namespace mutation
export const useCreateNamespace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNamespaceData) => namespaceService.create(data),
    onSuccess: () => {
      // Invalidate and refetch namespaces list
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
    },
  });
};

// Update namespace mutation
export const useUpdateNamespace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNamespaceData }) =>
      namespaceService.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch namespaces list and detail
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: namespaceKeys.detail(data.id) });
    },
  });
};

// Delete namespace mutation
export const useDeleteNamespace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => namespaceService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch namespaces list
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
    },
  });
};

