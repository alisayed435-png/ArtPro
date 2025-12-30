/**
 * Analytics Page
 * Business intelligence and reporting dashboard with charts
 */

import React from 'react';
import { useAnalyticsQuery } from './hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  CheckCircle, 
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = [
  'hsl(142, 76%, 36%)', // emerald-600
  'hsl(142, 72%, 29%)', // emerald-700
  'hsl(142, 64%, 24%)', // emerald-800
  'hsl(142, 69%, 58%)', // emerald-400
  'hsl(142, 77%, 73%)', // emerald-300
];

export function AnalyticsPage() {
  const { data: analytics, isLoading, error, refetch } = useAnalyticsQuery();

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Business intelligence and reporting"
        />
        <ErrorState
          title="Failed to load analytics"
          description="Unable to fetch analytics data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Business intelligence and reporting"
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Last 30 days</span>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={analytics?.revenue.totalRevenue}
          change={analytics?.revenue.revenueChange}
          icon={DollarSign}
          isLoading={isLoading}
          format="currency"
        />
        <KPICard
          title="Total Orders"
          value={analytics?.orders.totalOrders}
          change={analytics?.orders.ordersChange}
          icon={Package}
          isLoading={isLoading}
        />
        <KPICard
          title="Avg Order Value"
          value={analytics?.orders.avgOrderValue}
          change={analytics?.orders.avgOrderValueChange}
          icon={TrendingUp}
          isLoading={isLoading}
          format="currency"
        />
        <KPICard
          title="Approval Rate"
          value={analytics?.artwork.approvalRate}
          icon={CheckCircle}
          isLoading={isLoading}
          format="percentage"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.revenue.revenueTrend || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Monthly order volume</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.orders.ordersTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Orders']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(142, 76%, 36%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue by Product */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Product Type</CardTitle>
            <CardDescription>Breakdown of revenue by packaging type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics?.revenue.revenueByProduct || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="revenue"
                      nameKey="productType"
                    >
                      {(analytics?.revenue.revenueByProduct || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {(analytics?.revenue.revenueByProduct || []).map((item, index) => (
                    <div key={item.productType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm capitalize">{item.productType}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>METRC tracking performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <ComplianceMetric
                  label="Compliance Score"
                  value={analytics?.compliance.complianceScore || 0}
                  suffix="%"
                />
                <ComplianceMetric
                  label="Total Packages"
                  value={analytics?.compliance.totalPackages || 0}
                />
                <ComplianceMetric
                  label="Transfers Completed"
                  value={analytics?.compliance.transfersCompleted || 0}
                />
                <ComplianceMetric
                  label="Incidents"
                  value={analytics?.compliance.incidentCount || 0}
                  highlight={analytics?.compliance.incidentCount ? analytics.compliance.incidentCount > 0 : false}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Artwork Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Artwork Performance</CardTitle>
          <CardDescription>Submission and approval metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : (
              <>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-foreground">
                    {analytics?.artwork.totalSubmissions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Submissions
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-emerald-600">
                    {analytics?.artwork.approvalRate || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Approval Rate
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-3xl font-bold text-foreground">
                    <Clock className="h-6 w-6" />
                    {analytics?.artwork.avgApprovalTime || 0}h
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Avg. Approval Time
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface KPICardProps {
  title: string;
  value?: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  format?: 'currency' | 'percentage' | 'number';
}

function KPICard({ title, value, change, icon: Icon, isLoading, format = 'number' }: KPICardProps) {
  const formatValue = (val: number | undefined) => {
    if (val === undefined) return '-';
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {change !== undefined && (
              <p className={cn(
                "text-xs flex items-center gap-1",
                change >= 0 ? "text-emerald-600" : "text-destructive"
              )}>
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {change >= 0 ? '+' : ''}{change}% from last period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ComplianceMetricProps {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}

function ComplianceMetric({ label, value, suffix = '', highlight = false }: ComplianceMetricProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        "text-lg font-semibold",
        highlight ? "text-destructive" : "text-foreground"
      )}>
        {value.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
