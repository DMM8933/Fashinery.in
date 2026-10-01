import React from 'react';
import { Order, OrderStatus } from '../types';
import { 
  Check, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

interface OrderStatusTimelineProps {
  order: Order;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
  const statusHistory = order.statusHistory || [];

  // Helper to format timestamps beautifully
  const formatMilestoneTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Find timestamp in statusHistory for a given status (or similar/legacy ones)
  const getTimestampForStatus = (status: OrderStatus): string | undefined => {
    if (status === 'Order Placed' || status === 'Pending') {
      return order.createdAt;
    }
    // Search in history
    const found = statusHistory.find(
      (h) =>
        h.status === status ||
        (status === 'Order Confirmed' && (h.status === 'Confirmed' || h.status === 'Processing'))
    );
    if (found) return found.changedAt;

    // Fallbacks based on current orderStatus transitions
    if (order.orderStatus === status) {
      return order.updatedAt || order.createdAt;
    }

    return undefined;
  };

  // Check if status has been achieved based on history or current status
  const isStatusAchieved = (status: OrderStatus): boolean => {
    if (status === 'Order Placed' || status === 'Pending') {
      return true;
    }
    if (order.orderStatus === status) {
      return true;
    }
    // Is it in the history?
    const inHistory = statusHistory.some(
      (h) =>
        h.status === status ||
        (status === 'Order Confirmed' && (h.status === 'Confirmed' || h.status === 'Processing'))
    );
    if (inHistory) return true;

    // Standard chronological index lookup for fallback
    const milestoneOrder: OrderStatus[] = [
      'Order Placed',
      'Order Confirmed',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];
    const currentIndex = milestoneOrder.indexOf(order.orderStatus);
    const targetIndex = milestoneOrder.indexOf(status);

    if (currentIndex !== -1 && targetIndex !== -1) {
      return targetIndex <= currentIndex;
    }

    return false;
  };

  // Standard milestones with elegant Lucide icons
  const standardMilestones: { key: OrderStatus; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'Order Placed', label: 'Placed', icon: FileText },
    { key: 'Order Confirmed', label: 'Confirmed', icon: ShieldCheck },
    { key: 'Packed', label: 'Packed', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  // Check if order is in a terminal/exceptional status
  const isTerminalStatus = [
    'Cancelled',
    'Return Requested',
    'Return Approved',
    'Returned',
    'Refunded',
    'Cancellation Requested',
    'Exchange Requested',
  ].includes(order.orderStatus);

  // Determine standard indices
  const currentStatusIndex = standardMilestones.findIndex((m) => {
    if (m.key === order.orderStatus) return true;
    if (m.key === 'Order Confirmed' && (order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing')) return true;
    if (m.key === 'Order Placed' && order.orderStatus === 'Pending') return true;
    return false;
  });

  return (
    <div className="w-full space-y-4">
      <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block">
        Order Status Progress
      </span>

      {/* Timeline Grid */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2 p-1 pt-3">
        {/* Progress bar connector for desktop */}
        <div className="absolute top-[18px] left-8 right-8 h-0.5 bg-stone-100 hidden md:block -z-10">
          <div
            className="h-full bg-amber-900 transition-all duration-500"
            style={{
              width: `${
                isTerminalStatus
                  ? 100
                  : currentStatusIndex === -1
                  ? 0
                  : (currentStatusIndex / (standardMilestones.length - 1)) * 100
              }%`,
            }}
          />
        </div>

        {standardMilestones.map((m, idx) => {
          const achieved = isStatusAchieved(m.key);
          const isCurrent =
            order.orderStatus === m.key ||
            (m.key === 'Order Confirmed' &&
              (order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing')) ||
            (m.key === 'Order Placed' && order.orderStatus === 'Pending');

          const timestamp = getTimestampForStatus(m.key);
          const formattedTime = formatMilestoneTime(timestamp);
          const Icon = m.icon;

          // Render each step
          return (
            <div
              key={m.key}
              className="flex md:flex-col items-center md:text-center flex-1 w-full gap-4 md:gap-2.5 relative"
            >
              {/* Connector line for mobile (vertical timeline connector) */}
              {idx < standardMilestones.length - 1 && (
                <div
                  className={`absolute left-[17px] top-9 bottom-[-24px] w-0.5 md:hidden -z-10 ${
                    achieved ? 'bg-amber-900' : 'bg-stone-100'
                  }`}
                />
              )}

              {/* Milestone Bubble */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 relative ${
                  isCurrent
                    ? 'bg-amber-900 border-amber-900 text-amber-100 ring-4 ring-amber-100'
                    : achieved
                    ? 'bg-amber-50 border-amber-900 text-amber-900 shadow-sm'
                    : 'bg-white border-stone-200 text-stone-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                
                {/* Tiny completed check badge on bubble */}
                {achieved && !isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-900 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              {/* Labels */}
              <div className="flex flex-col md:items-center text-left md:text-center min-w-0">
                <span
                  className={`text-[11px] font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'text-amber-950 font-extrabold'
                      : achieved
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-400 font-medium'
                  }`}
                >
                  {m.label}
                </span>
                {achieved && formattedTime ? (
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5 whitespace-nowrap">
                    {formattedTime}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-300 font-mono mt-0.5">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exceptional / Terminal Status Highlight block */}
      {isTerminalStatus && (
        <div
          className={`p-3.5 rounded-2xl text-xs border flex items-start gap-2.5 mt-2 ${
            order.orderStatus === 'Cancelled'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertTriangle
            className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${
              order.orderStatus === 'Cancelled' ? 'text-rose-700' : 'text-amber-700'
            }`}
          />
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[11px] block">
              {order.orderStatus === 'Cancelled' ? 'Order Cancelled' : order.orderStatus}
            </span>
            <p className="text-[11px] text-stone-700">
              {order.orderStatus === 'Cancelled' ? (
                <>
                  Reason:{' '}
                  <strong className="text-stone-950">
                    {order.cancelledBy?.toLowerCase() === 'admin'
                      ? order.cancellationReason || 'Order could not be fulfilled'
                      : order.customerCancellationReason || order.cancellationReason || 'Customer requested cancellation'}
                  </strong>
                  {order.cancellationDetails && ` ("${order.cancellationDetails}")`}
                </>
              ) : (
                <>
                  Status:{' '}
                  <strong className="text-stone-950">
                    {order.returnReason || 'Return requested by customer'}
                  </strong>
                  {order.returnNotes && ` ("${order.returnNotes}")`}
                </>
              )}
            </p>
            <span className="text-[10px] text-stone-400 block font-mono">
              {formatMilestoneTime(order.cancelledAt || order.returnRequestedAt || order.updatedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
