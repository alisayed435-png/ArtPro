/**
 * System Status Data Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/lib/api';

/**
 * Hook to fetch system status with polling
 */
export function useSystemStatusQuery() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: systemApi.getStatus,
    refetchInterval: 10000, // Poll every 10 seconds for real-time feel
  });
}

/**
 * Hook to fetch system events/incidents
 */
export function useSystemEventsQuery() {
  return useQuery({
    queryKey: ['system', 'events'],
    queryFn: systemApi.getEvents,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}
