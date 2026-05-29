// src/pages/Waitlist.tsx
import { useState } from "react";

const API_ENDPOINT =
  "https://6vtp1tuus1.execute-api.us-east-1.amazonaws.com/waitlist";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) throw new Error("Failed to join waitlist");

      setStatus("success");
      setMessage("You're on the list! We'll email you when CivIQ is ready.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Something went wrong. Try again or email us directly.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#072F4F] text-white px-4 sm:px-6 font-hero">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light mb-8">
          Join the CivIQ Waitlist
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-light mb-10 md:mb-12 text-gray-300">
          Be the first to know when CivIQ launches. Early access, exclusive
          updates, and more.
        </p>

        {status === "success" ? (
          <div className="bg-green-900/35 border border-green-500/50 p-6 sm:p-8 rounded-2xl mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-light mb-4">You're In!</h2>
            <p className="text-lg">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-5 sm:px-6 py-4 sm:py-5 bg-black/35 border border-[#D9E2EC]/40 rounded-xl focus:outline-none focus:border-[#17A2B8] focus:ring-2 focus:ring-[#17A2B8]/30 text-white text-base sm:text-lg placeholder-gray-300 disabled:opacity-50"
              disabled={status === "loading"}
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-4 sm:py-5 px-8 sm:px-10 rounded-xl font-semibold text-lg sm:text-xl transition-all shadow-lg ${
                status === "loading"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#17A2B8] hover:bg-[#138496] hover:shadow-cyan-500/30 active:scale-95"
              }`}
            >
              {status === "loading" ? "Joining..." : "Join Waitlist"}
            </button>

            {status === "error" && message && (
              <p className="text-red-400 text-lg mt-4">{message}</p>
            )}
          </form>
        )}

        <p className="mt-12 text-gray-400">
          Questions? Reach out at{" "}
          <a
            href="mailto:info@primiq.ai"
            className="text-[#17A2B8] hover:underline"
          >
            info@primiq.ai
          </a>
        </p>
      </div>
    </div>
  );
}
