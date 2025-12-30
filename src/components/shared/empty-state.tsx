/**
 * Empty State Component
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { LucideIcon, Package, Image, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode | {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'orders' | 'artwork' | 'error';
  className?: string;
}

const variantIcons: Record<string, LucideIcon> = {
  default: Package,
  orders: Package,
  artwork: Image,
  error: AlertTriangle,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  // Check if action is a ReactNode or action config
  const isActionConfig = action && typeof action === 'object' && 'label' in action && 'onClick' in action;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className={cn(
        "h-16 w-16 rounded-full flex items-center justify-center mb-4",
        variant === 'error' ? "bg-destructive/10" : "bg-muted"
      )}>
        <Icon className={cn(
          "h-8 w-8",
          variant === 'error' ? "text-destructive" : "text-muted-foreground"
        )} />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        isActionConfig ? (
          <Button onClick={(action as { label: string; onClick: () => void }).onClick}>
            {(action as { label: string; onClick: () => void }).label}
          </Button>
        ) : action
      )}
    </div>
  );
}
