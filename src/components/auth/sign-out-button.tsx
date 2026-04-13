"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <Button variant="ghost" loading={loading} onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
