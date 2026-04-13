"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Orders", href: "/dashboard" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
