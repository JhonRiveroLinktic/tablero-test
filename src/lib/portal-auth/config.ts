import type { PortalAuthConfig } from "./types";

const clean = (v: string) => v.replace(/^["']|["']$/g, "");

export function getConfig(): PortalAuthConfig {
  const portalUrl = clean(process.env.PORTAL_URL ?? "");
  const appId = clean(process.env.PORTAL_APP_ID ?? "");
  const appSecret = clean(process.env.PORTAL_APP_SECRET ?? "");

  if (!portalUrl || !appId || !appSecret) {
    throw new Error("Missing PORTAL_URL, PORTAL_APP_ID, or PORTAL_APP_SECRET");
  }

  return {
    portalUrl,
    appId,
    appSecret,
    cookieName: "__portal_session",
    cookieMaxAge: 28800, // 8 hours
  };
}
