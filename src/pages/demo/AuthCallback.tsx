import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { exchangeDemoCodeForTokens } from "../../lib/demoAuth";

export default function DemoAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get("code") || "";
    const err = sp.get("error") || "";
    const errDesc = sp.get("error_description") || "";

    if (err) {
      setError(`${err}${errDesc ? `: ${errDesc}` : ""}`);
      return;
    }

    if (!code) {
      setError("Missing code in callback.");
      return;
    }

    (async () => {
      try {
        await exchangeDemoCodeForTokens(code);
        // Clear query string so the code isn't left in browser history.
        window.history.replaceState(
          null,
          document.title,
          window.location.pathname,
        );
        const host = window.location.hostname.toLowerCase();
        const returnPath = host === "board.civiqguide.com" ? "/" : "/demo";
        navigate(returnPath, { replace: true });
      } catch (e: any) {
        setError(e?.message ? String(e.message) : "Login failed.");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-teal-800">Signing you in...</h1>
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">Login failed</p>
            <p className="mt-2 text-red-700">{error}</p>
            <div className="mt-4">
              <Link
                to="/demo"
                className="text-teal-700 font-medium hover:underline"
              >
                Return to Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
