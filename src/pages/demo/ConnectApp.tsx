// src/pages/demo/ConnectApp.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ConnectApp() {
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
            Exodus Connect App
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Manage city services, pay bills, report issues, and stay connected —
            all from your phone.
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
                What is Exodus Connect?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Exodus Connect is the official mobile app for residents and
                visitors. It puts city services at your fingertips — pay bills,
                report problems, track service requests, view news, and more,
                all in one secure place.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                Available for free on iOS and Android — download today and get
                connected!
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Key Features
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Pay Bills & Fees
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Utilities, fines, permits, taxes</li>
                    <li>Autopay & paperless billing</li>
                    <li>View payment history</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Report Issues
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Potholes, streetlights, graffiti</li>
                    <li>Upload photos & track status</li>
                    <li>Non-emergency 311 requests</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Stay Informed
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Latest news & alerts</li>
                    <li>Trash/recycling schedule</li>
                    <li>Community events calendar</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    More Tools
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Service request tracking</li>
                    <li>Permit status checks</li>
                    <li>Direct chat with AI assistant</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Download & Get Started */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200 text-center">
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Download Exodus Connect
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Get the app today and manage city services on the go.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/demo/action?action=connect_app_download"
                  className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-900 transition"
                >
                  <span className="mr-3"></span> App Store
                </Link>
                <Link
                  to="/demo/action?action=connect_app_download"
                  className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition"
                >
                  <span className="mr-3">Google Play</span>
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Scan QR code or search "Exodus Connect" in your app store.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Link
                to="/demo/services/payments"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Pay Bills
                </h4>
                <p className="text-gray-600">Utilities & fines</p>
              </Link>

              <Link
                to="/demo/services/report"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Report Issues
                </h4>
                <p className="text-gray-600">Potholes, trash, etc.</p>
              </Link>

              <Link
                to="/demo/contact"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Need Help?
                </h4>
                <p className="text-gray-600">Contact support</p>
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
