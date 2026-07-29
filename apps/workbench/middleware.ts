import { NextResponse, type NextRequest } from "next/server";

// Phase 2 (P2-08): apps/workbench mixes private pages (triage, engagements) with public ones
// (the self-serve trial flow, shareable report URLs) in the same app, so Vercel's
// deployment-wide Standard Protection can't gate one without blocking the other — see
// CLAUDE.md's "Workbench auth and public-report defaults" decision. This middleware is that
// gate: everything is private by default except this allowlist.
const PUBLIC_PATH_PREFIXES = ["/login", "/api/login", "/trial", "/report"];

export const AUTH_COOKIE_NAME = "valence_wb_auth";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.WORKBENCH_SHARED_SECRET;
  if (!secret) {
    // No secret configured: fail open only in local dev, never silently in a deployed env.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
    throw new Error("WORKBENCH_SHARED_SECRET must be set to serve private workbench routes");
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie === secret) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
