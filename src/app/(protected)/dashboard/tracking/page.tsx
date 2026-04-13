import { Suspense } from "react";
import { createServerCaller } from "@/server/trpc/client";
import { TrackingPageContent } from "@/components/dashboard/tracking-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function TrackingContent({ searchParams }: { searchParams?: { orderId?: string } }) {
  const caller = await createServerCaller();
  const orderId = searchParams?.orderId || "ORD-001"; // Default to first mock order
  const tracking = await caller.tracking.get({ orderId });
  return <TrackingPageContent tracking={tracking} orderId={orderId} />;
}

export default async function TrackingPage({
  searchParams,
}: {
  searchParams?: { orderId?: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your order's delivery progress through our hubs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Delivery Tracking</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<TrackingSkeleton />}>
            <TrackingContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="mt-2 h-10 w-full rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
