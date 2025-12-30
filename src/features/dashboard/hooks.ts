/**
 * Dashboard Hooks for Data Fetching
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, ordersApi, activityApi, systemApi } from '@/lib/api';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 60000, // 1 minute
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => ordersApi.getOrders({ page: 1, pageSize: 5 }),
    staleTime: 30000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity', 'recent'],
    queryFn: () => activityApi.getRecentActivity(10),
    staleTime: 30000,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => systemApi.getStatus(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });
}
