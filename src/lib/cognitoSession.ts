const LS_ID_TOKEN = "cognito_id_token";
const LS_TOKEN_EXPIRY = "cognito_token_expiry";

export function getValidCognitoIdToken(): string | null {
  const token = localStorage.getItem(LS_ID_TOKEN);
  const expiry = localStorage.getItem(LS_TOKEN_EXPIRY);
  if (!token || !expiry) return null;
  const exp = Number(expiry);
  if (!Number.isFinite(exp) || Date.now() >= exp) return null;
  return token;
}
