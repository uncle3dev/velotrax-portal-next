import { createServerCaller } from "@/server/trpc/client";
import { withAuthNotFound } from "@/server/auth/with-auth-redirect";
import { TrackingPageContent } from "@/components/dashboard/tracking-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type TrackingSearchParams = {
  orderId?: string | string[];
};

function getOrderId(searchParams?: TrackingSearchParams): string {
  const value = searchParams?.orderId;
  const orderId = Array.isArray(value) ? value[0] : value;
  return orderId?.trim() || "";
}

export default async function TrackingPage({
  searchParams,
}: {
  searchParams?: TrackingSearchParams;
}) {
  const orderId = getOrderId(searchParams);

  const tracking = orderId
    ? await withAuthNotFound(async () => {
        const caller = await createServerCaller();
        return caller.tracking.get({ orderId });
      })
    : null;

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
          <TrackingPageContent tracking={tracking} initialOrderId={orderId} />
        </CardContent>
      </Card>
    </div>
  );
}
