/**
 * Reusable Page Header Component
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // Alias for subtitle
  actions?: React.ReactNode;
  action?: React.ReactNode; // Alias for actions
  className?: string;
}

export function PageHeader({ title, subtitle, description, actions, action, className }: PageHeaderProps) {
  const displaySubtitle = subtitle || description;
  const displayActions = actions || action;
  
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {displaySubtitle && (
          <p className="text-muted-foreground mt-1">{displaySubtitle}</p>
        )}
      </div>
      {displayActions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {displayActions}
        </div>
      )}
    </div>
  );
}
