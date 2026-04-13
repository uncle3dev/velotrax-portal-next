import { router, protectedProcedure } from "@/server/trpc/trpc";
import { gatewayFetch } from "@/lib/gateway";
import { type Order } from "@/types/index";

export const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return gatewayFetch<Order[]>("/orders", {}, ctx.accessToken);
  }),
});
