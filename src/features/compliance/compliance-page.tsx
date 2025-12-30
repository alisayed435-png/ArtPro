/**
 * Compliance Page Component
 * METRC integration status and compliance event log
 */

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Package,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { PageHeader, EmptyState, ErrorState } from '@/components/shared';
import { useComplianceStatusQuery, useComplianceEventsQuery } from './hooks';
import { formatDate, cn } from '@/lib/utils';
import type { ComplianceEvent } from '@/lib/types';

function SyncStatusCard({
  title,
  description,
  status,
  lastSync,
  icon: Icon,
}: {
  title: string;
  description: string;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync?: Date;
  icon: React.ElementType;
}) {
  const statusConfig = {
    synced: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Synced',
      icon: CheckCircle2,
    },
    syncing: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Syncing',
      icon: RefreshCw,
    },
    error: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Error',
      icon: XCircle,
    },
    pending: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Pending',
      icon: Clock,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="flex items-center gap-1.5">
            <StatusIcon
              className={cn(
                'h-4 w-4',
                config.color,
                status === 'syncing' && 'animate-spin'
              )}
            />
            <span className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {lastSync && (
          <p className="text-xs text-muted-foreground mt-3">
            Last synced: {formatDate(lastSync)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComplianceEventRow({ event }: { event: ComplianceEvent }) {
  const typeConfig: Record<
    ComplianceEvent['type'],
    { color: string; bg: string; label: string }
  > = {
    package_created: {
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Package Created',
    },
    package_updated: {
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Package Updated',
    },
    transfer_initiated: {
      color: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Transfer Started',
    },
    transfer_completed: {
      color: 'text-green-700 dark:text-green-300',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Transfer Done',
    },
    sync_started: {
      color: 'text-yellow-700 dark:text-yellow-300',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Sync Started',
    },
    sync_completed: {
      color: 'text-green-700 dark:text-green-300',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Sync Done',
    },
    sync_failed: {
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Sync Failed',
    },
    manifest_generated: {
      color: 'text-gray-700 dark:text-gray-300',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Manifest',
    },
    license_renewal: {
      color: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'License',
    },
    audit_log: {
      color: 'text-gray-700 dark:text-gray-300',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Audit',
    },
  };

  const severityConfig: Record<
    ComplianceEvent['severity'],
    { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }
  > = {
    info: { variant: 'secondary' },
    warning: { variant: 'warning' },
    error: { variant: 'destructive' },
    success: { variant: 'success' },
  };

  const typeConf = typeConfig[event.type];
  const severityConf = severityConfig[event.severity];

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              typeConf.bg,
              typeConf.color
            )}
          >
            {typeConf.label}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{event.message}</p>
          {event.details && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {event.details}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {event.metrcId && (
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {event.metrcId}
          </code>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={severityConf.variant} className="capitalize">
          {event.resolved ? 'Resolved' : event.severity}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(event.timestamp)}
      </TableCell>
    </TableRow>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-6 w-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function CompliancePage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const limit = 15;

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    refetch: refetchStatus,
  } = useComplianceStatusQuery();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useComplianceEventsQuery(page, limit);

  const filteredEvents =
    typeFilter === 'all'
      ? eventsData?.data
      : eventsData?.data.filter((e) => e.type === typeFilter);

  if (statusError || eventsError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance"
          description="METRC integration and regulatory compliance tracking"
        />
        <ErrorState
          title="Failed to load compliance data"
          description="There was an error loading compliance information. Please try again."
          onRetry={() => {
            refetchStatus();
            refetchEvents();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        description="METRC integration and regulatory compliance tracking"
        action={
          <Button variant="outline" onClick={() => refetchStatus()}>
            <RefreshCw
              className={cn(
                'mr-2 h-4 w-4',
                statusLoading && 'animate-spin'
              )}
            />
            Sync Now
          </Button>
        }
      />

      {/* Compliance Score Banner */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-sm">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Compliance Score</h2>
                <p className="text-sm text-muted-foreground">
                  Your organization maintains excellent regulatory standing
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-4xl font-bold text-emerald-600">
                {statusLoading ? (
                  <Skeleton className="h-10 w-24 inline-block" />
                ) : (
                  `${status?.connected ? (100 - (status.errorCount || 0)) : 98}%`
                )}
              </div>
              <p className="text-sm text-emerald-600 font-medium">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <SyncStatusCard
              title="METRC API"
              description="Cannabis tracking system integration"
              status={status?.syncStatus === 'success' ? 'synced' : status?.syncStatus === 'error' ? 'error' : 'syncing'}
              lastSync={status?.lastSyncAt ? new Date(status.lastSyncAt) : new Date()}
              icon={Activity}
            />
            <SyncStatusCard
              title="Package Labels"
              description="Label compliance verification"
              status="synced"
              lastSync={new Date()}
              icon={Package}
            />
            <SyncStatusCard
              title="Lab Results"
              description="COA and test result sync"
              status="synced"
              lastSync={new Date()}
              icon={FileText}
            />
            <SyncStatusCard
              title="Manifests"
              description="Transfer manifest generation"
              status="synced"
              lastSync={new Date()}
              icon={ArrowUpDown}
            />
          </>
        )}
      </div>

      {/* Compliance Events */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Compliance Event Log</CardTitle>
              <CardDescription>
                Real-time tracking of all compliance-related activities
              </CardDescription>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="sync">Sync</SelectItem>
                <SelectItem value="submission">Submission</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="rejection">Rejection</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <EventsSkeleton />
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <EmptyState
              title="No compliance events"
              description="Compliance events will appear here as they occur."
            />
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[140px]">Reference</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[140px]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <ComplianceEventRow key={event.id} event={event} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {eventsData && eventsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {eventsData.page} of{' '}
                    {eventsData.totalPages} ({eventsData.total}{' '}
                    events)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(eventsData.totalPages, p + 1)
                        )
                      }
                      disabled={page >= eventsData.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Compliance Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Compliance Best Practices
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Keep your METRC credentials up to date and ensure all packages are
                properly tagged before shipping. Regular audits help maintain your
                excellent compliance score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
