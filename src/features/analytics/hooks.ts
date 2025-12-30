/**
 * Analytics Data Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

interface DateRange {
  start: string;
  end: string;
}

/**
 * Hook to fetch analytics data
 */
export function useAnalyticsQuery(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => analyticsApi.getDashboard({ dateRange }),
  });
}

/**
 * Hook to fetch revenue breakdown
 */
export function useRevenueBreakdownQuery(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'revenue', dateRange],
    queryFn: () => analyticsApi.getRevenueAnalytics({ dateRange }),
  });
}
