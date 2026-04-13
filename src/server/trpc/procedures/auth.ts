import { router, publicProcedure } from "@/server/trpc/trpc";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { gatewayFetch } from "@/lib/gateway";
import { type SignInResponse, type SignUpResponse } from "@/types/index";

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input }) => {
      return gatewayFetch<SignInResponse>("/auth/sign-in", input);
    }),

  register: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      return gatewayFetch<SignUpResponse>("/auth/register", {
        email: input.email,
        password: input.password,
      });
    }),
});
