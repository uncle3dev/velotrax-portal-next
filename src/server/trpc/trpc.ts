import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Context = {
  accessToken?: string;
};

export async function createContext(): Promise<Context> {
  const session = await getServerSession(authOptions);
  return {
    accessToken: session?.accessToken,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.accessToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      accessToken: ctx.accessToken,
    },
  });
});
