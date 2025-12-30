/**
 * Artwork Hooks for Data Fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artworkApi, GetArtworkParams } from '@/lib/api';
import { toast } from 'sonner';
import type { ArtworkUploadPayload } from '@/lib/types';

export function useArtworkQuery(params: GetArtworkParams = {}) {
  return useQuery({
    queryKey: ['artwork', params],
    queryFn: () => artworkApi.getArtwork(params),
    staleTime: 30000,
  });
}

export function useArtworkDetailQuery(id: string) {
  return useQuery({
    queryKey: ['artwork', id],
    queryFn: () => artworkApi.getArtworkById(id),
    enabled: !!id,
  });
}

export function useUploadArtworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ArtworkUploadPayload) => artworkApi.uploadArtwork(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      toast.success('Artwork uploaded successfully', {
        description: 'Your artwork has been submitted for review.',
      });
    },
    onError: () => {
      toast.error('Upload failed', {
        description: 'There was a problem uploading your artwork. Please try again.',
      });
    },
  });
}

export function useApproveArtworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      artworkApi.approveArtwork(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      toast.success('Artwork approved', {
        description: 'The artwork has been approved for production.',
      });
    },
    onError: () => {
      toast.error('Action failed', {
        description: 'Could not approve artwork. Please try again.',
      });
    },
  });
}

export function useRequestChangesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      artworkApi.requestChanges(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      toast.success('Changes requested', {
        description: 'The artwork creator has been notified of required changes.',
      });
    },
    onError: () => {
      toast.error('Action failed', {
        description: 'Could not request changes. Please try again.',
      });
    },
  });
}

export function useDeleteArtworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => artworkApi.deleteArtwork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      toast.success('Artwork deleted', {
        description: 'The artwork has been removed.',
      });
    },
    onError: () => {
      toast.error('Delete failed', {
        description: 'Could not delete artwork. Please try again.',
      });
    },
  });
}
