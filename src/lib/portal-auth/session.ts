import { SignJWT, jwtVerify } from "jose";
import type { PortalUser } from "./types";

const ALGORITHM = "HS256";

export async function createSessionToken(
  user: PortalUser,
  secret: string,
  maxAge: number
): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(`${maxAge}s`)
    .setIssuedAt()
    .sign(new TextEncoder().encode(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<PortalUser | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as unknown as PortalUser;
  } catch {
    return null;
  }
}
