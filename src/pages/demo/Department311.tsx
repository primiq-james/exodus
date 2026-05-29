// src/pages/demo/Department311.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function Department311() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/demo" aria-label="Go to Home" onClick={closeMobileMenu}>
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                PV
              </div>
            </Link>
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

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <DemoAuthControl />
            </div>

            <div className="md:hidden flex items-center gap-3">
              <DemoAuthControl compact />
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-2xl leading-none text-teal-700 shadow-sm hover:bg-gray-50"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full border-t border-gray-200 bg-white shadow-lg">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <Link
                to="/demo"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Home
              </Link>
              <Link
                to="/demo/services"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Services
              </Link>
              <Link
                to="/demo/departments"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Departments
              </Link>
              <Link
                to="/demo/news"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                News
              </Link>
              <Link
                to="/demo/contact"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Contact
              </Link>
              <Link
                to="/demo/forms"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Forms
              </Link>
              <Link
                to="/demo/admin"
                onClick={closeMobileMenu}
                className="font-medium hover:text-teal-600 transition"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/palo-verde-bg.png"
            alt="Sunny city skyline background"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            City Help Center
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold mb-5 drop-shadow-lg">
            311 Services
          </h1>
          <p className="text-lg md:text-2xl max-w-4xl mx-auto drop-shadow">
            A simple way to report non-emergency issues, request city help, and
            get routed to the right department.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo/services/report"
              className="bg-white text-teal-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              Report an Issue
            </Link>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition"
            >
              Ask the Assistant
            </button>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-teal-800 mb-4">
                When To Use 311
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                Use 311 for city service requests and non-emergency reporting.
                If there is immediate danger, call 911.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-xl font-bold text-teal-700 mb-2">
                    Good For 311
                  </h3>
                  <ul className="text-gray-700 space-y-2 list-disc pl-5">
                    <li>Potholes, streetlights, and sidewalk issues</li>
                    <li>Graffiti cleanup requests</li>
                    <li>Missed trash pickup or cart issues</li>
                    <li>Code complaints (non-urgent)</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-xl font-bold text-teal-700 mb-2">
                    Not For 311
                  </h3>
                  <ul className="text-gray-700 space-y-2 list-disc pl-5">
                    <li>Crimes in progress or threats to safety</li>
                    <li>Medical emergencies</li>
                    <li>Fire emergencies</li>
                    <li>Situations requiring immediate response</li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 rounded-xl border border-teal-200 bg-teal-50 p-6">
                <h3 className="text-xl font-bold text-teal-800 mb-3">
                  What To Include In Your Request
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-gray-800">
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Exact location (address or nearest intersection)</li>
                    <li>Clear description of the problem</li>
                    <li>When you noticed it (today, this week, etc.)</li>
                  </ul>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Photos (if you have them)</li>
                    <li>
                      Any safety details (blocked lane, sharp debris, etc.)
                    </li>
                    <li>Best contact method for follow-ups</li>
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/demo/services/report"
                    className="rounded-lg bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                  >
                    Start a 311 Request
                  </Link>
                  <Link
                    to="/demo/resident"
                    className="rounded-lg bg-white px-5 py-3 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Browse Resident Hub
                  </Link>
                </div>
              </div>
            </div>

            <aside className="rounded-xl border border-gray-200 bg-gray-50 p-6 h-fit">
              <h3 className="text-xl font-bold text-teal-800 mb-3">
                Popular Shortcuts
              </h3>
              <div className="space-y-3">
                <Link
                  to="/demo/services/report"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Report an Issue</p>
                  <p className="text-sm text-gray-600">
                    Non-emergency requests and service issues.
                  </p>
                </Link>
                <Link
                  to="/demo/utilities"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Utilities</p>
                  <p className="text-sm text-gray-600">
                    Start service, billing help, outages.
                  </p>
                </Link>
                <Link
                  to="/demo/services/payments"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Payments</p>
                  <p className="text-sm text-gray-600">
                    Pay bills, fines, and city fees.
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full rounded-lg bg-teal-700 px-4 py-3 text-white font-bold hover:bg-teal-800 transition"
                >
                  Ask the Assistant
                </button>
              </div>
            </aside>
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
            <Link to="/demo/accessibility" className="hover:underline">
              Accessibility
            </Link>
            <Link to="/demo/contact" className="hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Widget */}
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
                className="text-white hover:text-gray-200 text-2xl"
                aria-label="Close assistant"
                type="button"
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
