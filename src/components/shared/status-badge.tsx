/**
 * Status Badge Component
 */

import React from 'react';
import { Badge } from '@/components/ui';
import { cn, formatStatus } from '@/lib/utils';
import type { OrderStatus, ArtworkStatus, HealthStatus } from '@/lib/types';

type StatusType = OrderStatus | ArtworkStatus | HealthStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'> = {
  // Order statuses
  pending: 'secondary',
  confirmed: 'info',
  in_production: 'info',
  quality_check: 'warning',
  ready_to_ship: 'success',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'destructive',
  
  // Artwork statuses
  draft: 'secondary',
  submitted: 'info',
  in_review: 'warning',
  changes_requested: 'warning',
  approved: 'success',
  rejected: 'destructive',
  
  // Health statuses
  operational: 'success',
  degraded: 'warning',
  partial_outage: 'warning',
  major_outage: 'destructive',
  
  // Compliance statuses
  active: 'success',
  expired: 'destructive',
  suspended: 'destructive',
  
  // Sync statuses
  idle: 'secondary',
  syncing: 'info',
  success: 'success',
  error: 'destructive',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status] || 'secondary';
  
  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {formatStatus(status)}
    </Badge>
  );
}
