// Minimal Google OAuth 2.0 "Authorization Code" flow -- no extra SDK needed,
// just two HTTPS calls to Google's own endpoints.

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getGoogleRedirectUri(appUrl: string): string {
  return `${appUrl.replace(/\/$/, "")}/api/auth/customer/google/callback`;
}

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(appUrl),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(appUrl),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${await tokenRes.text()}`);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`Google userinfo request failed: ${await userRes.text()}`);
  }
  return (await userRes.json()) as GoogleProfile;
}
