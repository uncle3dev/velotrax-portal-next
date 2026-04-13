"use server";

import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export async function signOutAction(): Promise<never> {
  await signOut({ redirect: false });
  redirect("/");
}
