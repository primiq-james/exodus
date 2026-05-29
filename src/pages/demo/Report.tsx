// src/pages/demo/Report.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react"; // ← Added this import

export default function Report() {
  const [isChatOpen, setIsChatOpen] = useState(false); // ← Added this line – fixes chatbot toggle error

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
              className="font-medium text-teal-600 font-semibold"
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
            Report a Problem
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Submit non-emergency requests for potholes, streetlights, graffiti,
            abandoned vehicles, and more.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Overview */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Overview
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Use this service to report non-emergency issues in Exodus.
                Reports help us identify and fix problems quickly. For
                emergencies, call 911.
              </p>
            </div>

            {/* Common Issues */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-teal-700">
                  Potholes & Street Damage
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide location & photos if possible</li>
                  <li>Priority based on safety risk</li>
                  <li>Repaired within 7–14 days typically</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-teal-700">
                  Streetlights Out
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Report pole number or intersection</li>
                  <li>Repaired within 3–10 days</li>
                  <li>Emergency lights (dark intersections) prioritized</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-teal-700">
                  Graffiti & Vandalism
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Photos help with removal</li>
                  <li>Removed within 48–72 hours</li>
                  <li>Anonymous reports accepted</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-teal-700">
                  Other Issues
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Abandoned vehicles</li>
                  <li>Illegal dumping</li>
                  <li>Tree/park maintenance</li>
                  <li>Sidewalk damage</li>
                </ul>
              </div>
            </div>

            {/* How to Report */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                How to Report
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Online Form (Recommended)
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Submit details, upload photos, and track status online —
                    fastest option.
                  </p>
                  <Link
                    to="/demo/action?action=report_issue"
                    className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    Submit Report Online →
                  </Link>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">By Phone – 311</h3>
                  <p className="text-gray-700">
                    Call or text 311 (or (555) 010-2026) for assistance or to
                    report verbally.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    In Person / Email
                  </h3>
                  <p className="text-gray-700">
                    Visit City Hall or email report@paloverde.tx.gov with photos
                    and location details.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    What Happens Next?
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Receive confirmation number via email/text</li>
                    <li>Track status online</li>
                    <li>Most issues resolved in 3–14 days</li>
                    <li>High-priority (safety) addressed first</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Link
                to="/demo/services/permits"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Apply for Permits
                </h4>
                <p className="text-gray-600">Building & business permits</p>
              </Link>

              <Link
                to="/demo/services/payments"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Pay a Fine
                </h4>
                <p className="text-gray-600">Traffic or parking citations</p>
              </Link>

              <Link
                to="/demo/contact"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Need Assistance?
                </h4>
                <p className="text-gray-600">Contact Public Works</p>
              </Link>
            </div>
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
