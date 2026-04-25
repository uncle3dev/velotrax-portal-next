import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";

export async function withAuthNotFound<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN")
    ) {
      redirect("/sign-in");
    }

    if (
      error instanceof TRPCError &&
      (error.code === "NOT_FOUND" || error.code === "INTERNAL_SERVER_ERROR")
    ) {
      notFound();
    }

    throw error;
  }
}

export const withAuthRedirect = withAuthNotFound;
