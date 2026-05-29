import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CivIQContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "https://r60sxw3g98.execute-api.us-east-1.amazonaws.com/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            message,
            subject: "New Contact from CivIQ Guide Website",
            route: "info",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.");
      }

      navigate("/thank-you");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#1F2933] font-hero">
      <section className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#072F4F] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-6">
            Contact CivIQ Guide
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#D9E2EC] font-light">
            Tell us about your city goals and we will help you evaluate fit,
            rollout, and impact.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-lg sm:text-xl font-light mb-4 text-[#52606D]">
            Questions before scheduling?
          </p>
          <a
            href="mailto:info@civiqguide.com"
            className="text-[#17A2B8] hover:text-[#138496] text-xl sm:text-2xl font-semibold underline break-all"
          >
            info@civiqguide.com
          </a>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 md:p-12 rounded-xl shadow-sm border border-[#D9E2EC] max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <label
              htmlFor="name"
              className="block text-lg font-medium mb-3 text-[#1F2933]"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-5 py-4 bg-[#F8FBFF] border border-[#D9E2EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17A2B8] text-[#1F2933] text-lg placeholder-[#7B8794]"
              placeholder="Your name"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="email"
              className="block text-lg font-medium mb-3 text-[#1F2933]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 bg-[#F8FBFF] border border-[#D9E2EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17A2B8] text-[#1F2933] text-lg placeholder-[#7B8794]"
              placeholder="your.email@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-10">
            <label
              htmlFor="message"
              className="block text-lg font-medium mb-3 text-[#1F2933]"
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="w-full px-5 py-4 bg-[#F8FBFF] border border-[#D9E2EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17A2B8] text-[#1F2933] text-lg placeholder-[#7B8794]"
              placeholder="Tell us about your city, goals, and timeline..."
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full sm:w-fit sm:mx-auto px-8 sm:px-12 py-4 sm:py-5 bg-[#17A2B8] hover:bg-[#138496] text-white font-bold text-lg sm:text-xl rounded-xl transition-all duration-300 shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
