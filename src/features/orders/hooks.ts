/**
 * Orders Hooks for Data Fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, GetOrdersParams } from '@/lib/api';
import { toast } from 'sonner';

export function useOrdersQuery(params: GetOrdersParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 30000,
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}

export function useReorderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.reorder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Reorder created successfully', {
        description: 'Your new order has been submitted.',
      });
    },
    onError: () => {
      toast.error('Failed to create reorder', {
        description: 'Please try again.',
      });
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled', {
        description: 'The order has been cancelled successfully.',
      });
    },
    onError: () => {
      toast.error('Failed to cancel order', {
        description: 'Please try again.',
      });
    },
  });
}
