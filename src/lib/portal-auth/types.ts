export interface PortalUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: string;
  app_slug: string;
}

export interface PortalAuthConfig {
  portalUrl: string;
  appId: string;
  appSecret: string;
  cookieName?: string;
  cookieMaxAge?: number;
}
