import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/portal-auth";
import { nanoid } from "nanoid";

// Only the SSO callback needs to be fully public
const PUBLIC_ROUTES = ["/auth/sso/"];

// These errors mean "try again" — proxy will retry silent check
const RETRYABLE_ERRORS = new Set(["invalid_state", "no_session"]);

function buildSilentCheckRedirect(request: NextRequest, returnTo: string) {
  const portalUrl = process.env.PORTAL_URL ?? "";
  const appId = process.env.PORTAL_APP_ID ?? "";
  const state = nanoid();
  const callbackUrl = `${request.nextUrl.origin}/auth/sso/callback`;

  const silentUrl = new URL(`${portalUrl}/api/sso/silent`);
  silentUrl.searchParams.set("app_id", appId);
  silentUrl.searchParams.set("redirect_uri", callbackUrl);
  silentUrl.searchParams.set("state", state);
  silentUrl.searchParams.set("return_to", returnTo);

  const response = NextResponse.redirect(silentUrl.toString());
  response.cookies.set("sso_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60,
    path: "/auth/sso/callback",
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow SSO callback route
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // If landing on /auth/error with a retryable reason, retry silent check instead
  if (pathname === "/auth/error") {
    const reason = searchParams.get("reason") ?? "";
    if (RETRYABLE_ERRORS.has(reason)) {
      return buildSilentCheckRedirect(request, "/");
    }
    // Non-retryable errors (no_access, verify_failed) → show error page
    return NextResponse.next();
  }

  // Check local session cookie
  const token = request.cookies.get("__portal_session")?.value;
  const secret = process.env.PORTAL_APP_SECRET ?? "";

  if (token) {
    const user = await verifySessionToken(token, secret);
    if (user) {
      const response = NextResponse.next();
      response.headers.set("x-portal-user", JSON.stringify(user));
      return response;
    }
  }

  // No valid session → silent check against portal
  return buildSilentCheckRedirect(request, pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
