import { withAuth } from "next-auth/middleware";
import { ROLES } from "@/lib/constants";
import { NextResponse } from "next/server";

export default withAuth({
  pages: { signIn: "/sign-in" },
  middleware: (req: { auth: any; url: string | URL | undefined; nextUrl: { pathname: string; }; }) => {
    const session = req.auth;

    // Redirect unauthenticated users to sign-in page
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Protect dashboard routes for SHIPPER role
    // SHIPPERs are blocked from accessing /dashboard/*
    if (session.user?.role === ROLES.SHIPPER && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};