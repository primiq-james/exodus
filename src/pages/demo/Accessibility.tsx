import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useEffect, useState } from "react";

export default function Accessibility() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("pv_contrast");
    const isHigh =
      document.documentElement.getAttribute("data-pv-contrast") === "high" ||
      saved === "high";
    setIsHighContrast(isHigh);
  }, []);

  const setHighContrast = (on: boolean) => {
    if (on) {
      document.documentElement.setAttribute("data-pv-contrast", "high");
      window.localStorage.setItem("pv_contrast", "high");
      setIsHighContrast(true);
    } else {
      document.documentElement.removeAttribute("data-pv-contrast");
      window.localStorage.removeItem("pv_contrast");
      setIsHighContrast(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Header – consistent across demo */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              PV
            </div>
            <div>
              <h1 className="text-2xl font-bold text-teal-700">
                Exodus, Texas
              </h1>
              <p className="text-sm text-gray-600">Official City Website</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/demo"
              className="font-medium hover:text-teal-600 transition"
            >
              Home
            </Link>
            <Link
              to="/demo/services"
              className="font-medium hover:text-teal-600 transition"
            >
              Services
            </Link>
            <Link
              to="/demo/departments"
              className="font-medium hover:text-teal-600 transition"
            >
              Departments
            </Link>
            <Link
              to="/demo/news"
              className="font-medium hover:text-teal-600 transition"
            >
              News
            </Link>
            <Link
              to="/demo/contact"
              className="font-medium hover:text-teal-600 transition"
            >
              Contact
            </Link>
            <Link
              to="/demo/forms"
              className="font-medium hover:text-teal-600 transition"
            >
              Forms
            </Link>
            <Link
              to="/demo/admin"
              className="font-medium hover:text-teal-600 transition"
            >
              Admin
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <DemoAuthControl />
          </div>
        </div>
      </header>

      {/* Hero / Intro */}
      <section className="relative text-white py-16 md:py-24 overflow-hidden">
        {/* Sunny city photo background */}
        <div className="absolute inset-0">
          <img
            src="/palo-verde-bg.png"
            alt="Sunny city skyline with bicycles and modern buildings"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Accessibility Statement
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Our commitment to making the City of Exodus website accessible
            to everyone.
          </p>
        </div>
      </section>

      {/* Accessibility Statement Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg prose-teal max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-teal-800">
              Last Updated: February 7, 2026
            </h2>

            <p className="text-gray-700 mb-8">
              The City of Exodus is committed to providing an accessible
              website that is inclusive and usable for all individuals,
              including those with disabilities. We strive to align with the
              Americans with Disabilities Act (ADA) and Section 508
              requirements, and to meet or exceed the Web Content Accessibility
              Guidelines (WCAG) 2.1 Level AA standards.
            </p>

            <div className="not-prose rounded-2xl border border-teal-200 bg-teal-50 p-6 mb-10">
              <h3 className="text-xl font-bold text-teal-900 mb-2">
                High Contrast Mode
              </h3>
              <p className="text-gray-800 mb-4">
                Turn on a higher-contrast experience with stronger focus
                indicators. Keyboard shortcut: <kbd>Alt</kbd>+<kbd>Shift</kbd>+
                <kbd>C</kbd>.
              </p>
              <button
                type="button"
                onClick={() => setHighContrast(!isHighContrast)}
                aria-pressed={isHighContrast}
                className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow hover:bg-teal-800"
              >
                {isHighContrast
                  ? "Turn Off High Contrast"
                  : "Turn On High Contrast"}
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Our Accessibility Goals
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-8">
              <li>
                Ensure all content is perceivable, operable, understandable, and
                robust.
              </li>
              <li>
                Provide text alternatives for non-text content (e.g., images,
                videos).
              </li>
              <li>Make navigation and forms keyboard-accessible.</li>
              <li>Use sufficient color contrast and resizable text.</li>
              <li>Support screen readers and assistive technologies.</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Accessibility Features
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-8">
              <li>Skip navigation links for keyboard users</li>
              <li>Alt text on all meaningful images</li>
              <li>Descriptive link text (no "click here")</li>
              <li>High contrast modes and text resizing up to 200%</li>
              <li>Closed captioning on videos when available</li>
              <li>ARIA landmarks and labels where needed</li>
              <li>
                Accessible chatbot input, controls, and screen reader updates
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Known Limitations & Ongoing Work
            </h3>
            <p className="text-gray-700 mb-4">
              While we work to meet WCAG 2.1 AA, some areas may still be in
              progress, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                Older PDF documents (we are working on making them accessible)
              </li>
              <li>Third-party embedded tools (e.g., maps, calendars)</li>
              <li>Some interactive applications</li>
            </ul>
            <p className="text-gray-700 mb-8">
              We regularly test with assistive technology and welcome feedback.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              How to Report an Accessibility Issue
            </h3>
            <p className="text-gray-700 mb-6">
              If you encounter any accessibility barriers on this website,
              please let us know. Provide details about the issue and how to
              reproduce it.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link
                to="/demo/contact"
                className="inline-flex items-center px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition"
              >
                Report Accessibility Issue →
              </Link>
              <a
                href="mailto:accessibility@paloverde.tx.gov"
                className="inline-flex items-center px-8 py-4 bg-white border-2 border-teal-600 text-teal-700 font-bold rounded-2xl shadow hover:bg-teal-50 transition"
              >
                Email Accessibility Team
              </a>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Assistive Technology Support
            </h3>
            <p className="text-gray-700 mb-8">
              This site is tested with screen readers (NVDA, VoiceOver),
              keyboard-only navigation, and zoom up to 400%. If you use other
              tools and experience issues, please contact us.
            </p>

            <p className="text-sm text-gray-600 italic">
              This is a fictional demonstration accessibility statement for the
              CivIQ demo. Not legally binding.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg mb-4">
            © {new Date().getFullYear()} City of Exodus, Texas • All rights
            reserved
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link to="/demo/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/demo/terms" className="hover:underline">
              Terms of Use
            </Link>
            <Link
              to="/demo/accessibility"
              className="hover:underline font-semibold"
            >
              Accessibility
            </Link>
            <Link to="/demo/contact" className="hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-teal-700 transition transform hover:scale-110"
            aria-label="Open Exodus AI Assistant"
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        ) : (
          <div className="chat-resizable w-96 h-[500px] bg-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-teal-700 flex flex-col">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-700 font-bold">
                  PV
                </div>
                <div>
                  <h3 className="font-semibold">Exodus Assistant</h3>
                  <p className="text-sm opacity-90">
                    Online • Ask anything about city services
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                type="button"
                aria-label="Close assistant"
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatbotWidget />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
