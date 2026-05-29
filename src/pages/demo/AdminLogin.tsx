import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminBasePath,
  buildAdminLoginUrl,
  clearAdminAuth,
  exchangeAdminCodeForTokens,
  getAdminClaims,
  getAdminPostLoginPath,
  getAdminRedirectUri,
  getValidAdminIdToken,
  isAdminAllowed,
  setAdminPostLoginPath,
} from "../../lib/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);
  const token = getValidAdminIdToken();
  const claims = getAdminClaims();
  const allowed = isAdminAllowed();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return;

      setIsHandlingCallback(true);
      try {
        const redirectUri = getAdminRedirectUri();
        await exchangeAdminCodeForTokens(code, redirectUri);
        window.history.replaceState({}, "", window.location.pathname);
        navigate(getAdminPostLoginPath(), { replace: true });
      } catch {
        clearAdminAuth();
        window.history.replaceState({}, "", window.location.pathname);
      } finally {
        setIsHandlingCallback(false);
      }
    };

    void run();
  }, [navigate]);

  const denialReason = useMemo(() => {
    if (!token) return "";
    if (allowed) return "";
    const email = String((claims as any).email || "").trim();
    if (email) {
      return `Signed in as ${email}, but this account is not on the Exodus admin allowlist.`;
    }
    return "This account is not on the Exodus admin allowlist.";
  }, [allowed, token, claims]);

  const handleSignIn = () => {
    const adminBasePath = getAdminBasePath();
    setAdminPostLoginPath(adminBasePath);
    window.location.href = buildAdminLoginUrl(getAdminRedirectUri());
  };

  const handleSignOut = () => {
    clearAdminAuth();
    window.location.reload();
  };

  const handleContinue = () => {
    navigate(getAdminBasePath(), { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="fixed inset-0 z-0">
        <img
          src="/palo-verde-bg-03f9.png"
          alt="Exodus skyline"
          className="h-full w-full object-cover brightness-[0.52]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/65 via-black/40 to-cyan-950/70" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-black/45 p-8 shadow-2xl backdrop-blur-md">
          <p className="mb-3 inline-flex rounded-full border border-emerald-300/40 bg-emerald-900/35 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-emerald-100">
            SECURE ACCESS
          </p>
          <h1 className="text-4xl font-black leading-tight text-white">
            Exodus Admin Console
          </h1>
          <p className="mt-3 text-sm text-gray-200">
            Authorized municipal staff only. Access is restricted to approved
            admin accounts.
          </p>

          {!token && !isHandlingCallback && (
            <button
              type="button"
              onClick={handleSignIn}
              className="mt-8 w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-bold text-emerald-950 transition hover:bg-emerald-400"
            >
              Sign In With Cognito
            </button>
          )}

          {!token && isHandlingCallback && (
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white">
              Signing you in…
            </div>
          )}

          {token && allowed && (
            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-900/25 px-4 py-3 text-sm text-emerald-100">
                Signed in and verified for admin access.
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="w-full rounded-xl bg-cyan-400 px-5 py-3 text-base font-bold text-cyan-950 transition hover:bg-cyan-300"
              >
                Continue To Admin Console
              </button>
            </div>
          )}

          {token && !allowed && (
            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-amber-300/40 bg-amber-900/25 px-4 py-3 text-sm text-amber-100">
                {denialReason}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Sign Out
              </button>
            </div>
          )}

          <p className="mt-6 text-xs text-gray-300">
            Configure admin allowlist via:
            <code className="ml-1 rounded bg-black/40 px-1 py-0.5">
              VITE_ADMIN_ALLOWED_EMAILS
            </code>
            ,
            <code className="ml-1 rounded bg-black/40 px-1 py-0.5">
              VITE_ADMIN_ALLOWED_SUBS
            </code>
            ,
            <code className="ml-1 rounded bg-black/40 px-1 py-0.5">
              VITE_ADMIN_ALLOWED_GROUPS
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
