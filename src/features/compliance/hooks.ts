/**
 * Compliance Data Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';

/**
 * Hook to fetch compliance status
 */
export function useComplianceStatusQuery() {
  return useQuery({
    queryKey: ['compliance', 'status'],
    queryFn: complianceApi.getStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch compliance events with pagination
 */
export function useComplianceEventsQuery(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['compliance', 'events', page, limit],
    queryFn: () => complianceApi.getEvents({ page, limit }),
  });
}
