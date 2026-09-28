import React from 'react';
import { Order, OrderStatus } from '../types';
import { Check, Dot, AlertTriangle } from 'lucide-react';

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

  // Standard milestones
  const standardMilestones: { key: OrderStatus; label: string }[] = [
    { key: 'Order Placed', label: 'Order Placed' },
    { key: 'Order Confirmed', label: 'Order Confirmed' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' },
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
      <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase block">
        Order Progress Tracker
      </span>

      {/* Timeline Grid */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2 p-1 pt-3">
        {/* Progress bar connector for desktop */}
        <div className="absolute top-[23px] left-8 right-8 h-0.5 bg-stone-100 hidden md:block -z-10">
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

          // Render each step
          return (
            <div
              key={m.key}
              className="flex md:flex-col items-center md:text-center flex-1 w-full gap-4 md:gap-2 relative"
            >
              {/* Connector line for mobile (vertical timeline connector) */}
              {idx < standardMilestones.length - 1 && (
                <div
                  className={`absolute left-[13px] top-7 bottom-[-24px] w-0.5 md:hidden -z-10 ${
                    achieved ? 'bg-amber-900' : 'bg-stone-100'
                  }`}
                />
              )}

              {/* Milestone Bubble */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-900 border-amber-900 text-white ring-4 ring-amber-100'
                    : achieved
                    ? 'bg-amber-50 border-amber-900 text-amber-900'
                    : 'bg-white border-stone-200 text-stone-400'
                }`}
              >
                {isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : achieved ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                )}
              </div>

              {/* Labels */}
              <div className="flex flex-col md:items-center text-left md:text-center min-w-0">
                <span
                  className={`text-[11px] font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'text-amber-950 font-extrabold'
                      : achieved
                      ? 'text-stone-900'
                      : 'text-stone-400'
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
