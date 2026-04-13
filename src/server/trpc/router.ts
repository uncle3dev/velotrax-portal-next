import { router } from "@/server/trpc/trpc";
import { authRouter } from "@/server/trpc/procedures/auth";
import { ordersRouter } from "@/server/trpc/procedures/orders";
import { userRouter } from "@/server/trpc/procedures/user";
import { trackingRouter } from "@/server/trpc/procedures/tracking";

export const appRouter = router({
  auth: authRouter,
  orders: ordersRouter,
  user: userRouter,
  tracking: trackingRouter,
});

export type AppRouter = typeof appRouter;
