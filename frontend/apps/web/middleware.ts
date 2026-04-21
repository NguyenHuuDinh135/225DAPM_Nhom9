import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/tasks", "/works", "/incidents", "/trees", "/plans", "/staff", "/settings", "/analytics", "/reports", "/replacements"];

// Routes only accessible by Administrator or Manager (not Employee)
const MANAGER_ONLY = ["/staff", "/plans", "/analytics", "/reports", "/replacements", "/settings/admin"];

// Routes only accessible by Administrator
const ADMIN_ONLY = ["/settings/admin", "/analytics"];

function decodeRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob may fail on non-standard base64 padding — use manual padding
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload["role"] ??
      null;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (token && isProtected) {
    const role = decodeRole(token);

    if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && role !== "Administrator") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("forbidden", "1");
      return NextResponse.redirect(url);
    }

    if (MANAGER_ONLY.some((p) => pathname.startsWith(p)) && role === "Employee") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("forbidden", "1");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/tasks/:path*", "/works/:path*", "/incidents/:path*",
    "/trees/:path*", "/plans/:path*", "/staff/:path*", "/settings/:path*",
    "/analytics/:path*", "/reports/:path*", "/replacements/:path*", "/login",
  ],
};
