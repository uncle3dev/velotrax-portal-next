import { Suspense } from "react";
import { createServerCaller } from "@/server/trpc/client";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { OrdersTableSkeleton } from "@/components/dashboard/orders-table-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function OrdersList() {
  const caller = await createServerCaller();
  const orders = await caller.orders.list();
  return <OrdersTable orders={orders} />;
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          A list of all orders in your account.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">All Orders</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<OrdersTableSkeleton />}>
            <OrdersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
