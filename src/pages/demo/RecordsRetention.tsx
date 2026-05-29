import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function RecordsRetention() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
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

      <section className="relative text-white py-16 md:py-24 overflow-hidden">
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
            Records Retention Compliance
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            How Exodus manages retention, legal holds, and disposal of
            official records, including chatbot interactions.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg prose-teal max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-teal-800">
              Last Updated: February 18, 2026
            </h2>

            <p className="text-gray-700 mb-8">
              The City of Exodus maintains records to support public
              services, accountability, and transparency. Records are retained
              and disposed of in accordance with applicable laws and adopted
              retention schedules.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              1. What Counts as a City Record
            </h3>
            <p className="text-gray-700 mb-6">
              A record may include documents, emails, forms, requests, reports,
              uploads, and system logs that document city business. Not every
              copy is an official record; departments designate official records
              and manage working or convenience copies appropriately.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              2. Retention Schedules
            </h3>
            <p className="text-gray-700 mb-6">
              Retention schedules define minimum retention periods for common
              types of local government records. Records may be kept longer when
              needed for operational, historical, or legal reasons.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              3. Legal Holds (No Destruction During Open Matters)
            </h3>
            <p className="text-gray-700 mb-6">
              If a record is related to litigation, claims, audits,
              negotiations, or open public information requests, it is placed on
              hold and is not destroyed until the matter is resolved.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              4. Chatbot Interaction Records
            </h3>
            <p className="text-gray-700 mb-4">
              The City website may offer a chatbot to help residents find
              information about city services. Chatbot messages and related
              technical metadata may be captured to operate the service,
              troubleshoot issues, improve response quality, and satisfy
              records-related obligations.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>
                Conversation logs may be retained according to applicable
                schedules and operational needs.
              </li>
              <li>
                Records related to public information requests or other holds
                are preserved until the request or matter is complete.
              </li>
              <li>
                For privacy, do not include sensitive personal information in
                chatbot messages.
              </li>
            </ul>

            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
              <h4 className="text-xl font-bold text-teal-800 mb-2">
                Looking for privacy details?
              </h4>
              <p className="text-gray-700 mb-0">
                See the{" "}
                <Link
                  to="/demo/privacy"
                  className="text-teal-700 hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                for what data we collect and how it is used.
              </p>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              5. Requests and Contact
            </h3>
            <p className="text-gray-700 mb-8">
              If you have questions about record retention or need help with a
              records request, contact the City Clerk or the appropriate
              department.
            </p>

            <p className="text-sm text-gray-600 italic">
              This is a fictional demonstration policy for the CivIQ demo. Not
              legal advice and not legally binding.
            </p>
          </div>
        </div>
      </section>

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

      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-teal-700 transition transform hover:scale-110"
            aria-label="Open Exodus AI Assistant"
            type="button"
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
                type="button"
                aria-label="Close assistant"
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
