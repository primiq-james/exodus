// src/components/Layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import civiqGuideLogo from "../assets/civiq-guide.svg";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const siteGradient =
    "bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4]";
  const TOOLBAR_HEIGHT_PX = 120;

  return (
    <div className={`relative min-h-screen text-white ${siteGradient}`}>
      {/* Toolbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 overflow-hidden ${siteGradient}`}
        style={{ height: `${TOOLBAR_HEIGHT_PX}px` }}
      >
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Company Name / Logo – top-left, links to home */}
          <div className="flex items-center gap-0">
            <Link
              to="/"
              className="inline-block cursor-pointer select-none transition hover:opacity-90"
            >
              <img
                src={civiqGuideLogo}
                alt="CivIQ Guide"
                className="h-16 sm:h-20 md:h-24 w-auto cursor-pointer pointer-events-auto"
              />
            </Link>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 text-lg font-semibold text-white">
            <Link to="/features" className="hover:text-gray-300 transition">
              FEATURES
            </Link>
            <Link to="/benefits" className="hover:text-gray-300 transition">
              BENEFITS
            </Link>
            <Link to="/pricing" className="hover:text-gray-300 transition">
              PRICING
            </Link>
            <Link to="/waitlist" className="hover:text-gray-300 transition">
              WAITLIST
            </Link>
            <Link to="/request-demo" className="hover:text-gray-300 transition">
              REQUEST DEMO
            </Link>
            <Link to="/contact" className="hover:text-gray-300 transition">
              CONTACT
            </Link>
          </nav>

          {/* Hamburger Menu Button – mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-gray-300 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Full-screen collapsing menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-[#17A2B8]/95 flex flex-col items-center justify-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <nav className="flex flex-col items-center space-y-8 text-3xl sm:text-4xl font-medium">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Home
            </Link>
            <Link
              to="/features"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Features
            </Link>
            <Link
              to="/benefits"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Benefits
            </Link>
            <Link
              to="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Pricing
            </Link>
            <Link
              to="/waitlist"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Waitlist
            </Link>
            <Link
              to="/request-demo"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Request demo
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-gray-400 transition"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}

      {/* Content with safe-area padding */}
      <div
        className="relative z-10 pb-0 md:pb-0 min-h-screen"
        style={{
          paddingTop: `calc(${TOOLBAR_HEIGHT_PX}px + env(safe-area-inset-top))`,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
