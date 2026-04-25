import { cn } from "@/lib/utils";
import { type Order } from "@/types/index";

type OrderStatus = Order["status"];

type StatusBadgeProps = {
  status: OrderStatus;
};

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

type OrdersTableProps = {
  orders: Order[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-gray-900">No orders yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Orders will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Tracking
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ETA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Weight
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">
                {order.id}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {order.trackingNumber}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="leading-5">
                  <div className="font-medium">{order.originAddress.street}</div>
                  <div className="text-gray-500">
                    {order.originAddress.city}, {order.originAddress.province}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="leading-5">
                  <div className="font-medium">{order.destinationAddress.street}</div>
                  <div className="text-gray-500">
                    {order.destinationAddress.city}, {order.destinationAddress.province}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {order.weightKg.toFixed(1)} kg
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
