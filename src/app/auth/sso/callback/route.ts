import { NextResponse, type NextRequest } from "next/server";
import { getConfig, createSessionToken } from "@/lib/portal-auth";
import type { PortalUser } from "@/lib/portal-auth";

function redirectToPortalWithError(
  portalUrl: string,
  error: string,
  appName: string
) {
  const url = new URL(portalUrl);
  url.searchParams.set("sso_error", error);
  url.searchParams.set("app", appName);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const returnTo = searchParams.get("return_to") ?? "/";

  const config = getConfig();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Aplicación";

  // Portal returned an error (no_session, no_access, unauthorized)
  if (error) {
    console.log("[sso/callback] Portal returned error:", error);
    return redirectToPortalWithError(config.portalUrl, error, appName);
  }

  const expectedState = request.cookies.get("sso_state")?.value;

  // Invalid state or no code
  if (!code || !state || state !== expectedState) {
    console.log("[sso/callback] Invalid state, code:", !!code, "state match:", state === expectedState);
    return redirectToPortalWithError(config.portalUrl, "invalid_state", appName);
  }

  // Verify code with portal (server-to-server)
  const res = await fetch(`${config.portalUrl}/api/sso/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      app_id: config.appId,
      app_secret: config.appSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log("[sso/callback] Verify failed:", res.status, err);
    return redirectToPortalWithError(
      config.portalUrl,
      err?.error ?? "verify_failed",
      appName
    );
  }

  const user: PortalUser = await res.json();
  console.log("[sso/callback] User verified:", user.email, "role:", user.role);

  // Create local session
  const maxAge = config.cookieMaxAge ?? 28800;
  const token = await createSessionToken(user, config.appSecret, maxAge);

  const response = NextResponse.redirect(`${origin}${returnTo}`);
  response.cookies.set(config.cookieName ?? "__portal_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  response.cookies.delete("sso_state");

  return response;
}
