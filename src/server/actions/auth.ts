"use server";

import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { createServerCaller } from "@/server/trpc/client";
import { type SignUpInput } from "@/lib/validators/auth";

export async function signOutAction(): Promise<never> {
  redirect("/api/auth/signout?callbackUrl=/");
}

type RegisterResult =
  | { success: true }
  | { success: false; code: TRPC_ERROR_CODE_KEY; message: string };

export async function registerAction(input: SignUpInput): Promise<RegisterResult> {
  try {
    const caller = await createServerCaller();
    await caller.auth.register(input);
    return { success: true };
  } catch (error) {
    if (error instanceof TRPCError) {
      return { success: false, code: error.code, message: error.message };
    }
    return { success: false, code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." };
  }
}
