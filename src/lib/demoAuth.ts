const LS_ID_TOKEN = "cognito_id_token";
const LS_TOKEN_EXPIRY = "cognito_token_expiry";

function envString(name: string): string | null {
  const v = (import.meta as any)?.env?.[name];
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

export function getCognitoDomain(): string {
  return (
    envString("VITE_COGNITO_DOMAIN") ||
    "primiq-login.auth.us-east-1.amazoncognito.com"
  );
}

export function getCognitoClientId(): string {
  return envString("VITE_COGNITO_CLIENT_ID") || "1bvpusv769uqvqqrl6k94mgalj";
}

function isBoardHost(hostname: string): boolean {
  const host = String(hostname || "").trim().toLowerCase();
  return host === "board.civiqguide.com" || host === "board.primiq.ai";
}

function getDemoAuthRedirectPath(): string {
  return isBoardHost(window.location.hostname) ? "/auth" : "/demo/auth";
}

function getDemoLogoutPath(): string {
  return isBoardHost(window.location.hostname) ? "/" : "/demo";
}

export function buildDemoLoginUrl(): string {
  const domain = getCognitoDomain();
  const clientId = getCognitoClientId();
  const redirectUri = `${window.location.origin}${getDemoAuthRedirectPath()}`;
  const scope = "openid email profile";
  // Cognito user pool client is configured for the auth code flow.
  return `https://${domain}/login?response_type=code&client_id=${encodeURIComponent(
    clientId,
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scope,
  )}`;
}

export function buildDemoLogoutUrl(): string {
  const domain = getCognitoDomain();
  const clientId = getCognitoClientId();
  const logoutUri = `${window.location.origin}${getDemoLogoutPath()}`;
  return `https://${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(
    logoutUri,
  )}`;
}

export async function exchangeDemoCodeForTokens(code: string): Promise<void> {
  const domain = getCognitoDomain();
  const clientId = getCognitoClientId();
  const redirectUri = `${window.location.origin}${getDemoAuthRedirectPath()}`;
  const tokenEndpoint = `https://${domain}/oauth2/token`;

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status})`);
  }

  const tokens: any = await res.json();
  const expiresInMs = Number(tokens.expires_in || 0) * 1000;
  const idToken = String(tokens.id_token || "");
  if (!idToken) throw new Error("Missing id_token");

  localStorage.setItem(LS_ID_TOKEN, idToken);
  localStorage.setItem(
    LS_TOKEN_EXPIRY,
    String(Date.now() + Math.max(0, expiresInMs)),
  );
}

export function clearDemoAuth(): void {
  localStorage.removeItem(LS_ID_TOKEN);
  localStorage.removeItem(LS_TOKEN_EXPIRY);
}

export function storeDemoTokens(
  idToken: string,
  expiresInSeconds: number,
): void {
  const expMs = Date.now() + Math.max(0, Number(expiresInSeconds || 0)) * 1000;
  localStorage.setItem(LS_ID_TOKEN, idToken);
  localStorage.setItem(LS_TOKEN_EXPIRY, String(expMs));
}
