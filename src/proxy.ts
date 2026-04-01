import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/portal-auth";
import { nanoid } from "nanoid";

const PUBLIC_ROUTES = ["/auth/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Check local session cookie
  const token = request.cookies.get("__portal_session")?.value;
  const secret = process.env.PORTAL_APP_SECRET ?? "";

  if (token) {
    const user = await verifySessionToken(token, secret);
    if (user) {
      // Valid session — inject user into headers for pages
      const response = NextResponse.next();
      response.headers.set("x-portal-user", JSON.stringify(user));
      return response;
    }
  }

  // No valid session → silent check against portal
  const portalUrl = process.env.PORTAL_URL ?? "";
  const appId = process.env.PORTAL_APP_ID ?? "";
  const state = nanoid();
  const callbackUrl = `${request.nextUrl.origin}/auth/sso/callback`;

  const silentUrl = new URL(`${portalUrl}/api/sso/silent`);
  silentUrl.searchParams.set("app_id", appId);
  silentUrl.searchParams.set("redirect_uri", callbackUrl);
  silentUrl.searchParams.set("state", state);
  silentUrl.searchParams.set("return_to", pathname);

  const response = NextResponse.redirect(silentUrl.toString());
  response.cookies.set("sso_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60,
    path: "/auth/sso/callback",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
