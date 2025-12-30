/**
 * Order Details Drawer Component
 */

import { X, Package, Truck, RefreshCw, Calendar, MapPin, Clock } from 'lucide-react';
import {
  Button,
  Separator,
  ScrollArea,
} from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useReorderMutation } from './hooks';
import type { Order } from '@/lib/types';

interface OrderDetailsDrawerProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ order, open, onClose }: OrderDetailsDrawerProps) {
  const reorderMutation = useReorderMutation();

  if (!order) return null;

  const handleReorder = () => {
    reorderMutation.mutate(order.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-background border-l shadow-xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formatDate(order.createdAt)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Order Timeline */}
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order Timeline
                </h3>
                <div className="relative pl-6 space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                      {index < order.timeline.length - 1 && (
                        <div className="absolute -left-[14px] top-5 h-full w-0.5 bg-border" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.timestamp)}
                          {event.userName && ` • ${event.userName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Line Items ({order.lineItems.length})
                </h3>
                <div className="space-y-3">
                  {order.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku} • Qty: {item.quantity.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(item.totalPrice)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)}/unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shippingAddress.street1}</p>
                  {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>

              {order.estimatedDelivery && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Estimated Delivery
                    </h3>
                    <p className="text-sm">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Order Summary */}
              <div>
                <h3 className="text-sm font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-muted/30">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReorder}
                disabled={reorderMutation.isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${reorderMutation.isPending ? 'animate-spin' : ''}`} />
                {reorderMutation.isPending ? 'Creating...' : 'Reorder'}
              </Button>
              <Button variant="outline" className="flex-1">
                <Truck className="mr-2 h-4 w-4" />
                Track Shipment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
