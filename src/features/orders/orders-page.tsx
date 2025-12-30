/**
 * Orders Page Component
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  MoreHorizontal,
  Download,
  Plus,
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge,
} from '@/components/ui';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { useOrdersQuery, useReorderMutation } from './hooks';
import { OrderDetailsDrawer } from './order-details-drawer';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus, OrderPriority } from '@/lib/types';

// ============================================================================
// Constants
// ============================================================================

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'ready_to_ship', label: 'Ready to Ship' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityVariants: Record<OrderPriority, string> = {
  low: 'secondary',
  normal: 'secondary',
  high: 'warning',
  urgent: 'destructive',
};

// ============================================================================
// Orders Table Component
// ============================================================================

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onReorder: (orderId: string) => void;
  isReordering: boolean;
}

function OrdersTable({ orders, onViewOrder, onReorder, isReordering }: OrdersTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="hidden md:table-cell">Items</TableHead>
            <TableHead className="hidden lg:table-cell">Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewOrder(order)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariants[order.priority] as 'default' | 'secondary' | 'destructive' | 'warning'}>
                  {order.priority}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-muted-foreground">
                  {order.lineItems.slice(0, 2).map(li => li.productName).join(', ')}
                  {order.lineItems.length > 2 && ` +${order.lineItems.length - 2}`}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewOrder(order); }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onReorder(order.id); }}
                      disabled={isReordering}
                    >
                      <RefreshCw className={cn("mr-2 h-4 w-4", isReordering && "animate-spin")} />
                      Reorder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// Orders Page
// ============================================================================

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const reorderMutation = useReorderMutation();

  const { data, isLoading, error, refetch } = useOrdersQuery({
    page,
    pageSize,
    filters: {
      search: search || undefined,
      status: statusFilter !== 'all' ? [statusFilter as OrderStatus] : undefined,
    },
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleReorder = (orderId: string) => {
    reorderMutation.mutate(orderId);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="Manage and track your packaging orders" />
        <ErrorState
          title="Failed to load orders"
          message="We couldn't load your orders. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Manage and track your packaging orders"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <LoadingState variant="table" count={5} />
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            variant="orders"
            title="No orders found"
            description={search || statusFilter !== 'all' 
              ? "Try adjusting your filters to find what you're looking for."
              : "Get started by creating your first order."}
            action={
              search || statusFilter !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearch(''); setStatusFilter('all'); } }
                : { label: 'Create Order', onClick: () => {} }
            }
          />
        </Card>
      ) : (
        <>
          <OrdersTable
            orders={data?.data || []}
            onViewOrder={handleViewOrder}
            onReorder={handleReorder}
            isReordering={reorderMutation.isPending}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of {data.total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-8"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
