// src/pages/demo/Privacy.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react"; // ← Added this import

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            How the City of Exodus collects, uses, and protects your
            personal information.
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg prose-teal max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-teal-800">
              Last Updated: February 7, 2026
            </h2>

            <p className="text-gray-700 mb-8">
              The City of Exodus is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website, use our
              online services, or interact with city departments.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              1. Information We Collect
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                <strong>Personal Information</strong>: Name, email, phone,
                address when you submit forms, apply for permits, or contact us.
              </li>
              <li>
                <strong>Usage Data</strong>: IP address, browser type, pages
                visited, time/date of access (collected automatically via
                cookies and analytics).
              </li>
              <li>
                <strong>Payment Information</strong>: Processed securely through
                third-party providers (we do not store full credit card
                details).
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              2. How We Use Your Information
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                To provide and improve city services (e.g., process permit
                applications, respond to requests)
              </li>
              <li>
                To communicate with you (e.g., send confirmations, alerts,
                newsletters)
              </li>
              <li>
                To comply with legal obligations and protect public safety
              </li>
              <li>
                For analytics and website improvement (aggregated/anonymized
                data only)
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              3. Information Sharing
            </h3>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share it with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                Service providers (e.g., payment processors, hosting, analytics)
                under strict contracts
              </li>
              <li>Government agencies when required by law</li>
              <li>Third parties with your consent</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              4. Chatbot & AI Assistant
            </h3>
            <p className="text-gray-700 mb-4">
              This website may offer a chatbot (AI Assistant) to help you find
              information about city services. When you use the chatbot, we may
              collect and process information you provide in the conversation.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                <strong>What to avoid sharing</strong>: Do not include sensitive
                personal information (e.g., Social Security numbers, bank/credit
                card numbers, passwords, or health information) in chatbot
                messages.
              </li>
              <li>
                <strong>Conversation data</strong>: We may log chatbot messages
                and related technical data (for example, timestamps and a page
                URL) to operate the service, troubleshoot issues, and improve
                responses.
              </li>
              <li>
                <strong>Service providers</strong>: The chatbot may be operated
                with the help of contracted vendors. Vendors may process
                conversation data on our behalf under agreements intended to
                protect privacy and security.
              </li>
              <li>
                <strong>No emergencies</strong>: The chatbot is not monitored
                24/7 for emergency response. If this is an emergency, call 911.
              </li>
              <li>
                <strong>Public records</strong>: Communications with the City
                may be subject to public records requests, as permitted by law.
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              5. Cookies & Tracking
            </h3>
            <p className="text-gray-700 mb-8">
              We use cookies for essential functions, analytics, and user
              experience. You can manage preferences in your browser. We do not
              track you across third-party sites for advertising.
            </p>

            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 mb-8">
              <h4 className="text-xl font-bold text-teal-800 mb-2">
                Records Retention Compliance
              </h4>
              <p className="text-gray-700 mb-4">
                For how the City retains and disposes of official records
                (including chatbot interaction records), see:
              </p>
              <Link
                to="/demo/records-retention"
                className="inline-flex items-center px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
              >
                View Records Retention →
              </Link>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              6. Data Security
            </h3>
            <p className="text-gray-700 mb-8">
              We use industry-standard security measures to protect your
              information. However, no method is 100% secure.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              7. Your Rights
            </h3>
            <p className="text-gray-700 mb-4">
              You may request access, correction, or deletion of your personal
              information by contacting us.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              8. Contact Us
            </h3>
            <p className="text-gray-700 mb-8">
              Questions about this policy? Email{" "}
              <a
                href="mailto:privacy@paloverde.tx.gov"
                className="text-teal-600 hover:underline"
              >
                privacy@paloverde.tx.gov
              </a>{" "}
              or call (555) 010-2026.
            </p>

            <p className="text-sm text-gray-600 italic">
              This is a fictional demonstration privacy policy for the CivIQ
              demo. Not legally binding.
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
            <Link to="/demo/records-retention" className="hover:underline">
              Records Retention
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
