import { router, protectedProcedure } from "@/server/trpc/trpc";
import { gatewayFetch } from "@/lib/gateway";
import { type UserProfile } from "@/types/index";

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    return gatewayFetch<UserProfile>("/user/profile", {}, ctx.accessToken);
  }),
});
