import { useEffect, useState } from "react";
import { getValidCognitoIdToken } from "../../lib/cognitoSession";
import {
  buildDemoLoginUrl,
  buildDemoLogoutUrl,
  clearDemoAuth,
} from "../../lib/demoAuth";

type DemoAuthControlProps = {
  compact?: boolean;
};

export default function DemoAuthControl({ compact }: DemoAuthControlProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    () => !!getValidCognitoIdToken(),
  );

  useEffect(() => {
    const onStorage = () => setIsSignedIn(!!getValidCognitoIdToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (isSignedIn) {
    return (
      <a
        href={buildDemoLogoutUrl()}
        onClick={() => {
          // Best-effort: clear local tokens immediately, then let Cognito clear its session.
          clearDemoAuth();
        }}
        className={
          compact
            ? "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-gray-50"
            : "px-4 py-2 rounded-lg bg-white text-teal-800 font-semibold border border-gray-200 hover:bg-gray-50 transition"
        }
      >
        Sign out
      </a>
    );
  }

  return (
    <a
      href={buildDemoLoginUrl()}
      className={
        compact
          ? "rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          : "px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 transition"
      }
    >
      Sign in
    </a>
  );
}
