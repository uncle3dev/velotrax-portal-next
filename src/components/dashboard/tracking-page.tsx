"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrackingInfo } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TrackingPageProps {
  tracking: TrackingInfo | null;
  initialOrderId: string;
}

interface TrackingStep {
  status: string;
  label: string;
  description: string;
  location?: string;
  completed: boolean;
  current: boolean;
}

export function TrackingPageContent({ tracking, initialOrderId }: TrackingPageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialOrderId);

  useEffect(() => {
    setOrderId(initialOrderId);
  }, [initialOrderId]);

  const steps = useMemo(() => (tracking ? createTrackingSteps(tracking) : []), [tracking]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedOrderId = orderId.trim();
    if (!trimmedOrderId) {
      return;
    }

    router.push(`/tracking?orderId=${encodeURIComponent(trimmedOrderId)}`);
  }

  return (
    <div className="p-6">
      {/* Order ID Input */}
      <div className="mb-6">
        <form onSubmit={handleSubmit}>
          <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">
            Enter Order ID
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="order-id"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="e.g., ORD-001"
              className="block w-full rounded-l-md border-gray-300 pl-3 pr-12 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
            />
            <button
              type="submit"
              className="rounded-r-md border border-l-0 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Track
            </button>
          </div>
        </form>
      </div>

      {!tracking ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter an order ID to view tracking information.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Order {tracking.orderId}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Status: <span className="font-medium capitalize">{tracking.orderStatus.replace(/_/g, " ")}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">
                {steps.filter((s) => s.completed).length}/{steps.length} completed
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-3 bottom-0 w-0.5 bg-gray-200" />

            {steps.map((step, index) => (
              <div
                key={step.status}
                className={cn(
                  "relative pl-16 pb-6",
                  index === steps.length - 1 && "pb-0"
                )}
              >
                {/* Status circle */}
                <div
                  className={cn(
                    "absolute left-5 -translate-x-1/2 h-8 w-8 flex items-center justify-center rounded-full border-2",
                    step.completed
                      ? "bg-green-500 border-green-600 text-white"
                      : step.current
                        ? "bg-blue-500 border-blue-600 text-white"
                        : "bg-white border-gray-300"
                  )}
                >
                  {step.completed ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.current ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("text-sm font-semibold", step.current ? "text-blue-700" : "text-gray-900")}>
                      {step.label}
                    </h4>
                    {step.location && (
                      <span className="text-xs text-gray-500">{step.location}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hub Locations */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Route</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.slice(0, 3).map((step, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        step.completed ? "bg-green-500" : step.current ? "bg-blue-500" : "bg-gray-300"
                      )} />
                      <span className="text-xs font-medium text-gray-500 uppercase">Hub {i + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{step.label}</p>
                    <p className="text-xs text-gray-500 truncate">{step.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function createTrackingSteps(tracking: TrackingInfo): TrackingStep[] {
  const statusLabels: Record<string, string> = {
    pending: "Order Placed",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const statusDescriptions: Record<string, string> = {
    pending: "Your order has been received and is being processed.",
    confirmed: "Your order has been confirmed and is awaiting processing.",
    processing: "Your order is being prepared for shipment.",
    shipped: "Your order has been shipped and is on its way.",
    in_transit: "Your order is currently in transit to your location.",
    out_for_delivery: "Your order is out for delivery today.",
    delivered: "Your order has been successfully delivered.",
    cancelled: "Your order has been cancelled.",
  };

  // Sort events by timestamp (most recent first)
  const sortedEvents = [...(tracking.events || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get the most recent event for current status
  const currentEvent = sortedEvents[0];

  // Create steps based on events, or create default steps
  const steps: TrackingStep[] = (currentEvent ? sortedEvents : tracking.events || []).map((event, index, arr) => ({
    status: event.status,
    label: statusLabels[event.status] || event.status,
    description: statusDescriptions[event.status] || event.description,
    location: event.location,
    completed: true,
    current: index === 0,
  }));

  // If no events, create default steps based on order status
  if (steps.length === 0 && tracking.orderId) {
    const orderedStatuses = ["pending", "confirmed", "in_transit", "out_for_delivery", "delivered", "cancelled"] as const;
    const currentIndex = orderedStatuses.indexOf(tracking.orderStatus as (typeof orderedStatuses)[number]);

    return orderedStatuses.map((status, index) => ({
      status,
      label: statusLabels[status],
      description: statusDescriptions[status],
      completed: currentIndex >= 0 && index <= currentIndex,
      current: index === currentIndex,
    }));
  }

  // Fill in missing status steps
  const allStatuses = ["pending", "confirmed", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "cancelled"];
  const existingStatuses = steps.map((s) => s.status);
  const missingStatuses = allStatuses.filter((s) => !existingStatuses.includes(s));

  missingStatuses.forEach((status) => {
    const index = steps.findIndex((s) => {
      const statusOrder = allStatuses.indexOf(s.status);
      const currentOrder = allStatuses.indexOf(status);
      return statusOrder > currentOrder;
    });

    if (index >= 0) {
      steps.splice(index, 0, {
        status,
        label: statusLabels[status],
        description: statusDescriptions[status],
        location: undefined,
        completed: false,
        current: false,
      });
    }
  });

  return steps;
}
