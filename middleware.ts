import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if ((pathname === "/signin" || pathname === "/signup" || pathname.startsWith("/(auth)")) && token) {
    const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin", request.url)
      );
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin", request.url)
      );
    }

    if (token.role === "admin") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Protect API routes
  if (pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/api/admin") && token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (pathname.startsWith("/api/dashboard") && token.role === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/signin",
    "/signup",
    "/(auth)/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
  ],
};