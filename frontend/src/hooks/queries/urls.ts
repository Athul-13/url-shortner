import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { urlService, type CreateShortURLData, type UpdateShortURLData } from '../../api/services/urls';

// Query keys
export const urlKeys = {
  all: ['urls'] as const,
  lists: () => [...urlKeys.all, 'list'] as const,
  list: (namespaceId?: number) => [...urlKeys.lists(), { namespaceId }] as const,
  details: () => [...urlKeys.all, 'detail'] as const,
  detail: (id: number) => [...urlKeys.details(), id] as const,
};

// Get all URLs
export const useURLs = (namespaceId?: number) => {
  return useQuery({
    queryKey: urlKeys.list(namespaceId),
    queryFn: () => urlService.getAll(namespaceId),
    refetchInterval: 3000, // Poll every 3 seconds to keep click counts updated
    refetchIntervalInBackground: false, // Pause polling when tab is not visible (saves resources)
  });
};

// Get URL by ID
export const useURL = (id: number) => {
  return useQuery({
    queryKey: urlKeys.detail(id),
    queryFn: () => urlService.getById(id),
    enabled: !!id,
  });
};

// Create URL mutation
export const useCreateShortURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShortURLData) => urlService.create(data),
    onSuccess: () => {
      // Invalidate and refetch URLs list
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
};

// Update URL mutation
export const useUpdateShortURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShortURLData }) =>
      urlService.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch URLs list and detail
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(data.id) });
    },
  });
};

// Delete URL mutation
export const useDeleteShortURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => urlService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch URLs list
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
};

