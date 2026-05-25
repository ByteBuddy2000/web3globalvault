import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  console.log("TOKEN:", token);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Not logged in
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin", request.url)
      );
    }

    // Not admin
    if (token.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Not logged in
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin", request.url)
      );
    }

    // Prevent admin from entering user dashboard
    if (token.role === "admin") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};