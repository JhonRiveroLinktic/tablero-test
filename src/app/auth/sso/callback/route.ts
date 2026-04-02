import { NextResponse, type NextRequest } from "next/server";
import { getConfig, createSessionToken } from "@/lib/portal-auth";
import type { PortalUser } from "@/lib/portal-auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const returnTo = searchParams.get("return_to") ?? "/";

  const config = getConfig();
  const portalLogin = config.portalUrl;

  // Portal returned an error (no_session, no_access, unauthorized)
  if (error) {
    console.log("[sso/callback] Portal returned error:", error);
    // Send user to the portal to log in
    return NextResponse.redirect(portalLogin);
  }

  const expectedState = request.cookies.get("sso_state")?.value;

  console.log("[sso/callback] code:", !!code, "state match:", state === expectedState);

  // Invalid state or no code → send to portal
  if (!code || !state || state !== expectedState) {
    console.log("[sso/callback] Invalid state, redirecting to portal");
    return NextResponse.redirect(portalLogin);
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
    // Verification failed → send to portal
    return NextResponse.redirect(portalLogin);
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
