/**
 * System Status Page Component
 * Real-time service status, uptime, and incident tracking
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { PageHeader, ErrorState } from '@/components/shared';
import { useSystemStatusQuery } from './hooks';
import { formatDate, cn } from '@/lib/utils';

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: number;
  latency?: number;
  icon: React.ElementType;
}

function getStatusConfig(status: ServiceStatus) {
  const configs: Record<
    ServiceStatus,
    { color: string; bg: string; label: string; icon: React.ElementType }
  > = {
    operational: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Operational',
      icon: CheckCircle2,
    },
    degraded: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Degraded',
      icon: AlertTriangle,
    },
    outage: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Outage',
      icon: XCircle,
    },
    maintenance: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Maintenance',
      icon: Clock,
    },
  };
  return configs[status];
}

function ServiceCard({ service }: { service: Service }) {
  const config = getStatusConfig(service.status);
  const StatusIcon = config.icon;
  const ServiceIcon = service.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <ServiceIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5', config.color)}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{service.uptime.toFixed(2)}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>30-day uptime</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {service.latency && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{service.latency}ms</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Average latency</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Uptime bars for last 30 days */}
            {Array.from({ length: 30 }).map((_, i) => {
              const isGood = Math.random() > 0.05;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-1 h-4 rounded-sm',
                    isGood ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  affectedServices: string[];
}

function IncidentCard({ incident }: { incident: Incident }) {
  const severityConfig = {
    minor: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800' },
    major: { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800' },
    critical: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' },
  };

  const statusLabels = {
    investigating: 'Investigating',
    identified: 'Identified',
    monitoring: 'Monitoring',
    resolved: 'Resolved',
  };

  const config = severityConfig[incident.severity];

  return (
    <div className={cn('p-4 rounded-lg border', config.border, config.bg)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={incident.status === 'resolved' ? 'secondary' : 'default'}>
              {statusLabels[incident.status]}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {incident.severity}
            </Badge>
          </div>
          <h3 className="font-medium mt-2">{incident.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Affected: {incident.affectedServices.join(', ')}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{formatDate(incident.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StatusPage() {
  const {
    data: systemStatus,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useSystemStatusQuery();

  // Sample services data
  const services: Service[] = [
    {
      name: 'Web Application',
      description: 'Customer portal and admin dashboard',
      status: 'operational',
      uptime: 99.98,
      latency: 45,
      icon: Globe,
    },
    {
      name: 'API Services',
      description: 'REST API and webhooks',
      status: 'operational',
      uptime: 99.95,
      latency: 120,
      icon: Server,
    },
    {
      name: 'Database',
      description: 'Primary data storage',
      status: 'operational',
      uptime: 99.99,
      latency: 8,
      icon: Database,
    },
    {
      name: 'METRC Integration',
      description: 'Cannabis tracking system sync',
      status: systemStatus?.services?.find(s => s.name.toLowerCase().includes('metrc'))?.status === 'operational' ? 'operational' : 'degraded',
      uptime: 99.87,
      latency: 350,
      icon: Shield,
    },
    {
      name: 'File Storage',
      description: 'Artwork and document storage',
      status: 'operational',
      uptime: 99.99,
      icon: Database,
    },
    {
      name: 'Email Services',
      description: 'Notifications and alerts',
      status: 'operational',
      uptime: 99.92,
      icon: Activity,
    },
  ];

  // Sample incidents
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Elevated API response times',
      status: 'resolved',
      severity: 'minor',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
      affectedServices: ['API Services'],
    },
  ];

  const allOperational = services.every((s) => s.status === 'operational');
  const overallUptime = services.reduce((sum, s) => sum + s.uptime, 0) / services.length;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Status"
          description="Real-time service health and incident tracking"
        />
        <ErrorState
          title="Failed to load system status"
          description="There was an error loading system status. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Status"
        description="Real-time service health and incident tracking"
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* Overall Status Banner */}
      <Card
        className={cn(
          'border-2',
          allOperational
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {allOperational ? (
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {allOperational ? 'All Systems Operational' : 'Partial Service Degradation'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {dataUpdatedAt ? formatDate(new Date(dataUpdatedAt)) : 'Just now'}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-bold text-green-600">{overallUptime.toFixed(2)}%</div>
              <p className="text-sm text-muted-foreground">30-day uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      {isLoading ? (
        <StatusSkeleton />
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4">Service Status</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          </div>

          {/* Active Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Incidents</CardTitle>
              <CardDescription>Recent and ongoing incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-medium">No Active Incidents</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All systems are running smoothly
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
              <CardDescription>Upcoming planned maintenance windows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Database Maintenance Window
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Scheduled for Saturday, 2:00 AM - 4:00 AM PST. Brief service interruptions
                    may occur during this window.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4 inline mr-1" />
                      In 3 days
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Duration: 2 hours
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">99.95%</div>
                <p className="text-sm text-muted-foreground mt-1">Overall Uptime</p>
                <Progress value={99.95} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">124ms</div>
                <p className="text-sm text-muted-foreground mt-1">Avg Response Time</p>
                <Progress value={75} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-1">Active Incidents</p>
                <Progress value={100} className="mt-3" />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Subscribe to Updates */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Stay Informed</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to receive status updates via email or SMS
              </p>
            </div>
            <Button>
              Subscribe to Updates
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
