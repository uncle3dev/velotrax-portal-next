import { router, protectedProcedure } from "@/server/trpc/trpc";
import { gatewayFetch } from "@/lib/gateway";
import { type GatewayOrder, type Order, type OrdersResponse } from "@/types/index";

function normalizeOrder(order: GatewayOrder): Order {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status.toLowerCase() as Order["status"],
    trackingNumber: order.tracking_number,
    originAddress: {
      street: order.origin_address.street,
      city: order.origin_address.city,
      province: order.origin_address.province,
      postalCode: order.origin_address.postal_code,
      country: order.origin_address.country,
    },
    destinationAddress: {
      street: order.destination_address.street,
      city: order.destination_address.city,
      province: order.destination_address.province,
      postalCode: order.destination_address.postal_code,
      country: order.destination_address.country,
    },
    estimatedDelivery: order.estimated_delivery,
    weightKg: order.weight_kg,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const response = await gatewayFetch<OrdersResponse>("/v1/orders", {}, ctx.accessToken);
    return response.orders.map(normalizeOrder);
  }),
});
