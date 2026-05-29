// src/pages/ThankYou.tsx
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center bg-gradient-to-r from-[#1a0d4a] via-[#311b92] to-[#6b21a8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
        <div className="text-6xl sm:text-7xl mb-8">🎉</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-6">
          Thank You!
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Your message has been successfully sent. Our team will review it and
          get back to you within <strong>1-2 business days</strong>.
        </p>
        <p className="text-lg text-gray-400 mb-12">
          In the meantime, check your inbox (and spam folder) for a confirmation
          email from us.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-primary-600 hover:bg-primary-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-105"
          >
            Back to Home
          </Link>
          <Link
            to="/services" // or whatever your services/about page is
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg border border-gray-600 transition-all hover:scale-105"
          >
            Explore Our Services
          </Link>
        </div>

        <div className="mt-16 text-gray-500">
          <p>Follow us for updates:</p>
          <div className="flex justify-center gap-6 mt-4 text-2xl">
            {/* Add your social icons/links here, e.g. X, LinkedIn */}
            <a
              href="https://x.com/primiqai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400"
            >
              𝕏
            </a>
            <a
              href="https://linkedin.com/company/primiq"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
