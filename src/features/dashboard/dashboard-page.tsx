/**
 * Dashboard Page Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Palette,
  Truck,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
} from '@/components/ui';
import { PageHeader, StatusBadge, ErrorState } from '@/components/shared';
import { useDashboardAnalytics, useRecentActivity, useSystemStatus } from './hooks';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Activity } from '@/lib/types';

// ============================================================================
// KPI Card Component
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function KPICard({ title, value, change, icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs flex items-center gap-1 mt-1",
            change >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// System Status Widget
// ============================================================================

function SystemStatusWidget() {
  const { data: status, isLoading, error } = useSystemStatus();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Failed to load status</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Real-time service monitoring</CardDescription>
        </div>
        {!isLoading && status && (
          <StatusBadge status={status.overall} />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {status?.services.slice(0, 5).map((service) => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    service.status === 'operational' ? 'bg-green-500' : 
                    service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm">{service.name}</span>
                </div>
                {service.latency && (
                  <span className="text-xs text-muted-foreground">
                    {service.latency}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Uptime: {status?.uptime || 99.9}%
          </span>
          <Link to="/status">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View Details
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Recent Activity Widget
// ============================================================================

function RecentActivityWidget() {
  const { data: activities, isLoading, error } = useRecentActivity();

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'order_created':
      case 'order_updated':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'order_shipped':
        return <Truck className="h-4 w-4 text-green-500" />;
      case 'artwork_uploaded':
      case 'artwork_approved':
        return <Palette className="h-4 w-4 text-purple-500" />;
      case 'compliance_sync':
        return <Shield className="h-4 w-4 text-emerald-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Failed to load activity</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest updates across your organization</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                    {activity.userName && ` • ${activity.userName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Quick Stats Widget
// ============================================================================

function QuickStatsWidget() {
  const { data: analytics, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const orderStats = analytics?.orders.ordersByStatus;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
        <CardDescription>Current order status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Pending</span>
            </div>
            <Badge variant="secondary">{orderStats?.pending || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm">In Production</span>
            </div>
            <Badge variant="info">{orderStats?.in_production || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Ready to Ship</span>
            </div>
            <Badge variant="warning">{orderStats?.ready_to_ship || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Delivered</span>
            </div>
            <Badge variant="success">{orderStats?.delivered || 0}</Badge>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link to="/orders">
            <Button variant="outline" size="sm" className="w-full">
              View All Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Dashboard Page
// ============================================================================

export function DashboardPage() {
  const { data: analytics, isLoading, error, refetch } = useDashboardAnalytics();

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your packaging operations" />
        <ErrorState
          title="Failed to load dashboard"
          message="We couldn't load your dashboard data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your packaging operations"
        actions={
          <Link to="/orders">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard
          title="Total Orders"
          value={analytics?.orders.totalOrders || 0}
          change={analytics?.orders.ordersChange}
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          loading={isLoading}
        />
        <KPICard
          title="Open Approvals"
          value={analytics?.artwork.totalSubmissions || 0}
          icon={<Palette className="h-4 w-4 text-primary" />}
          loading={isLoading}
        />
        <KPICard
          title="Shipments (MTD)"
          value={analytics?.compliance.transfersCompleted || 0}
          icon={<Truck className="h-4 w-4 text-primary" />}
          loading={isLoading}
        />
        <KPICard
          title="Compliance Score"
          value={`${analytics?.compliance.complianceScore || 0}%`}
          icon={<Shield className="h-4 w-4 text-primary" />}
          loading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivityWidget />
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <SystemStatusWidget />
          <QuickStatsWidget />
        </div>
      </div>
    </div>
  );
}
