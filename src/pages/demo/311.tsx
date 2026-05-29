// src/pages/demo/311.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ThreeOneOne() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
              className="font-medium text-teal-600 font-semibold"
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
            Exodus 311
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Non-emergency help, service requests, and city information —
            available 24/7.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* What is 311? */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                What is Exodus 311?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Exodus 311 is your one-stop non-emergency contact center for
                city services. Whether you need to report a pothole, schedule
                bulk trash pickup, ask about water billing, or get information
                on city programs — just call, text, or submit online.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                For emergencies, always call 911.
              </p>
            </div>

            {/* How to Contact 311 */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                How to Reach 311
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl mb-4">📞</div>
                  <h3 className="text-xl font-bold mb-2">Call or Text</h3>
                  <p className="text-gray-700">
                    Dial{" "}
                    <a href="tel:311" className="text-teal-600 hover:underline">
                      311
                    </a>
                    <br />
                    or (555) 010-2026
                    <br />
                    Available 24/7
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold mb-2">Online Request</h3>
                  <p className="text-gray-700">
                    Submit requests anytime
                    <br />
                    Track status online
                  </p>
                  <Link
                    to="/demo/action?action=three_one_one_request"
                    className="inline-flex items-center mt-4 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    Submit Request →
                  </Link>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">Chat with AI</h3>
                  <p className="text-gray-700">
                    Instant answers 24/7
                    <br />
                    Get help right here
                  </p>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="inline-flex items-center mt-4 px-6 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition"
                  >
                    Chat Now
                  </button>
                </div>
              </div>
            </div>

            {/* Common Request Types */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Common Requests
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-3 text-teal-700">
                    Streets & Infrastructure
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Potholes & road damage</li>
                    <li>Streetlights out</li>
                    <li>Sidewalk / curb issues</li>
                    <li>Storm drain clogs</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-3 text-teal-700">
                    Waste & Environment
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Missed trash/recycling pickup</li>
                    <li>Bulk waste scheduling</li>
                    <li>Illegal dumping</li>
                    <li>Code violations (e.g., overgrown lots)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-3 text-teal-700">
                    Parks & Public Spaces
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Park maintenance</li>
                    <li>Graffiti removal</li>
                    <li>Playground equipment issues</li>
                    <li>Tree trimming requests</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-3 text-teal-700">
                    Other Non-Emergency
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Abandoned vehicles</li>
                    <li>Noise complaints</li>
                    <li>Animal control (non-emergency)</li>
                    <li>General city questions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Link
                to="/demo/services/report"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Submit a Request
                </h4>
                <p className="text-gray-600">Online form</p>
              </Link>

              <Link
                to="/demo/contact"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Call or Email
                </h4>
                <p className="text-gray-600">311 or department contacts</p>
              </Link>

              <Link
                to="/demo"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Back to Home
                </h4>
                <p className="text-gray-600">Explore more</p>
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
