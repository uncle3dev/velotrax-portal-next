import { router, protectedProcedure } from "@/server/trpc/trpc";
import { gatewayFetch } from "@/lib/gateway";
import { z } from "zod";
import { type TrackingInfo } from "@/types/index";

export const trackingRouter = router({
  get: protectedProcedure
    .input(z.object({ orderId: z.string().trim().min(1) }))
    .query(async ({ input, ctx }) => {
      return gatewayFetch<TrackingInfo>("/tracking", input, ctx.accessToken);
    }),
});
