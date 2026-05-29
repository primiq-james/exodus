type JwtClaims = Record<string, unknown>;

const LS_ID_TOKEN = "cognito_id_token";
const LS_TOKEN_EXPIRY = "cognito_token_expiry";
const LS_POST_LOGIN_PATH = "admin_post_login_path";
const DEFAULT_ADMIN_ALLOWED_EMAILS = [
  "james.johnson@primiq.ai",
  "brandon.judd@primiq.ai",
  "preston.gross@primiq.ai",
];

function envString(name: string): string | null {
  const v = (import.meta as any)?.env?.[name];
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAdminCognitoDomain(): string {
  return (
    envString("VITE_ADMIN_COGNITO_DOMAIN") ||
    envString("VITE_COGNITO_DOMAIN") ||
    "primiq-login.auth.us-east-1.amazoncognito.com"
  );
}

export function getAdminCognitoClientId(): string {
  return (
    envString("VITE_ADMIN_COGNITO_CLIENT_ID") ||
    envString("VITE_COGNITO_CLIENT_ID") ||
    // Fallback from the earlier in-repo Cognito integration.
    "1bvpusv769uqvqqrl6k94mgalj"
  );
}

export function getAdminBasePath(): string {
  const host = window.location.hostname.toLowerCase();
  if (host === "admin.civiqguide.com") {
    return "/admin";
  }
  return "/demo/admin";
}

export function getAdminRedirectUri(): string {
  return `${window.location.origin}${getAdminBasePath()}/login`;
}

export function buildAdminLoginUrl(redirectUri: string): string {
  const domain = getAdminCognitoDomain();
  const clientId = getAdminCognitoClientId();
  return `https://${domain}/login?response_type=code&client_id=${encodeURIComponent(
    clientId,
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeAdminCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<void> {
  const domain = getAdminCognitoDomain();
  const clientId = getAdminCognitoClientId();
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

  const tokens = await res.json();
  const expiresInMs = Number(tokens.expires_in || 0) * 1000;
  const idToken = String(tokens.id_token || "");
  if (!idToken) throw new Error("Missing id_token");

  localStorage.setItem(LS_ID_TOKEN, idToken);
  localStorage.setItem(
    LS_TOKEN_EXPIRY,
    String(Date.now() + Math.max(0, expiresInMs)),
  );
}

export function getValidAdminIdToken(): string | null {
  const token = localStorage.getItem(LS_ID_TOKEN);
  const expiry = localStorage.getItem(LS_TOKEN_EXPIRY);
  if (!token || !expiry) return null;
  const exp = Number(expiry);
  if (!Number.isFinite(exp) || Date.now() >= exp) return null;
  return token;
}

export function clearAdminAuth(): void {
  localStorage.removeItem(LS_ID_TOKEN);
  localStorage.removeItem(LS_TOKEN_EXPIRY);
  localStorage.removeItem(LS_POST_LOGIN_PATH);
}

export function setAdminPostLoginPath(path: string): void {
  localStorage.setItem(LS_POST_LOGIN_PATH, path || "/admin");
}

export function getAdminPostLoginPath(): string {
  return localStorage.getItem(LS_POST_LOGIN_PATH) || getAdminBasePath();
}

export function getAdminClaims(): JwtClaims {
  const token = getValidAdminIdToken();
  if (!token) return {};
  const parts = token.split(".");
  if (parts.length < 2) return {};
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

export function isAdminAllowed(): boolean {
  const token = getValidAdminIdToken();
  if (!token) return false;

  const claims = getAdminClaims();
  const email = String((claims as any).email || "")
    .trim()
    .toLowerCase();
  const sub = String((claims as any).sub || "").trim();
  const groupsClaim = (claims as any)["cognito:groups"];
  const groups: string[] = Array.isArray(groupsClaim)
    ? groupsClaim.map((g) => String(g))
    : typeof groupsClaim === "string"
      ? [groupsClaim]
      : [];

  const configuredAllowedEmails = parseCsv(envString("VITE_ADMIN_ALLOWED_EMAILS"));
  const allowedEmails = (
    configuredAllowedEmails.length
      ? configuredAllowedEmails
      : DEFAULT_ADMIN_ALLOWED_EMAILS
  ).map((e) => e.toLowerCase());
  const allowedSubs = parseCsv(envString("VITE_ADMIN_ALLOWED_SUBS"));
  const allowedGroups = parseCsv(envString("VITE_ADMIN_ALLOWED_GROUPS"));

  if (allowedEmails.length && email && allowedEmails.includes(email))
    return true;
  if (allowedSubs.length && sub && allowedSubs.includes(sub)) return true;
  if (allowedGroups.length && groups.length) {
    for (const g of groups) {
      if (allowedGroups.includes(g)) return true;
    }
  }

  // If no allowlists are configured, default deny.
  return false;
}
