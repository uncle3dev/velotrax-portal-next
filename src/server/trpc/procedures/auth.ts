import { router, publicProcedure } from "@/server/trpc/trpc";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { gatewayFetch } from "@/lib/gateway";
import { type SignInResponse, type SignUpResponse } from "@/types/index";

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input }) => {
      return gatewayFetch<SignInResponse>("/v1/auth/login", input);
    }),

  register: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      return gatewayFetch<SignUpResponse>("/v1/auth/register", {
        fullName: input.fullName,
        email: input.email,
        password: input.password,
      });
    }),
});
