import { cookies } from "next/headers";
import { verifySessionToken } from "./session";
import { getConfig } from "./config";
import type { PortalUser } from "./types";

export async function getPortalUser(): Promise<PortalUser | null> {
  const config = getConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookieName ?? "__portal_session")?.value;

  if (!token) return null;

  return verifySessionToken(token, config.appSecret);
}
