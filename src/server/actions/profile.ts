"use server";

import { TRPCError } from "@trpc/server";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { createServerCaller } from "@/server/trpc/client";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators/profile";

type UpdateProfileResult =
  | { success: true }
  | { success: false; code: TRPC_ERROR_CODE_KEY; message: string };

export async function updateProfileAction(input: ProfileUpdateInput): Promise<UpdateProfileResult> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "BAD_REQUEST",
      message: "The profile data is invalid.",
    };
  }

  try {
    const caller = await createServerCaller();
    await caller.user.updateProfile(parsed.data);
    return { success: true };
  } catch (error) {
    if (error instanceof TRPCError) {
      return { success: false, code: error.code, message: error.message };
    }

    return {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    };
  }
}
