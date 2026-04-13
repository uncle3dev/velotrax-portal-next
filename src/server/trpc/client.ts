import { appRouter } from "@/server/trpc/router";
import { createContext } from "@/server/trpc/trpc";

export async function createServerCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}
