import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

// ─── Type Definition ──────────────────────────────────────────────────────────

interface AuthToken extends JWT {
  id: string;
  email: string;
  role: string;
}

// ─── Middleware Function ──────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  }) as AuthToken | null;

  // Redirect authenticated users away from auth pages
  if ((pathname === "/signin" || pathname === "/signup" || pathname.startsWith("/(auth)")) && token) {
    const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect API routes - admin endpoints
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
  }

  // Protect API routes - dashboard endpoints
  if (pathname.startsWith("/api/dashboard")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    if (token.role === "admin") {
      return NextResponse.json(
        { error: "Forbidden: User access only" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// ─── Middleware Configuration ──────────────────────────────────────────────────

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/signin",
    "/signup",
    "/(auth)/:path*",
    "/api/admin/:path*",
    "/api/dashboard/:path*",
  ],
};