"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface SidebarUserProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export function SidebarUser({ name, email }: SidebarUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(name, email);

  return (
    <div className="border-t border-gray-200">
      {/* User toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-left">
          {name && <div className="text-sm font-medium text-gray-900">{name}</div>}
          <div className="truncate text-xs text-gray-500">{email}</div>
        </div>
      </button>

      {/* Expanded menu */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
          {/* Profile link */}
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Profile
          </Link>

          {/* Sign out button */}
          <div className="pt-1">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
