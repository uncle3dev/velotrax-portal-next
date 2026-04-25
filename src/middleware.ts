import { withAuth } from "next-auth/middleware";
import { ROLES } from "@/lib/constants";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const token = req.nextauth.token as { role?: string } | null;

    // Protect dashboard routes for SHIPPER role
    // SHIPPERs are blocked from accessing /dashboard/*
    if (token?.role === ROLES.SHIPPER && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/sign-in" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
