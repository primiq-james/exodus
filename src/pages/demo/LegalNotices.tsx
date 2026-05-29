// src/pages/demo/LegalNotices.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function LegalNotices() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/demo" aria-label="Go to Home">
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

          <div className="hidden md:flex items-center gap-3">
            <DemoAuthControl />
          </div>
        </div>
      </header>

      <section className="relative text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/palo-verde-bg.png"
            alt="City skyline background"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Legal Notices
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Disclaimers, intellectual property, and website use notices for the
            City of Exodus.
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
              This page provides general legal notices for the City of Palo
              Verde website. It is presented for informational purposes and does
              not constitute legal advice.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Website Disclaimer
            </h3>
            <p className="text-gray-700 mb-8">
              Content is provided on an &quot;as available&quot; basis. The City
              makes reasonable efforts to keep information current, but does not
              guarantee accuracy, completeness, or uninterrupted access.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              External Links
            </h3>
            <p className="text-gray-700 mb-8">
              This site may link to third-party websites. Those sites are not
              under City control, and linking does not imply endorsement. Use
              third-party sites at your own risk.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Copyright &amp; Trademarks
            </h3>
            <p className="text-gray-700 mb-8">
              Unless otherwise noted, City-created content on this website is
              owned by the City of Exodus. Third-party marks, logos, and
              content belong to their respective owners.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Public Records
            </h3>
            <p className="text-gray-700 mb-8">
              Communications with the City may be subject to public records laws
              and disclosure, as permitted by law.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              Security &amp; Acceptable Use
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>No attempts to gain unauthorized access to City systems.</li>
              <li>No disruption, scraping, or abusive automated traffic.</li>
              <li>No uploading malware, phishing, or harmful content.</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">Contact</h3>
            <p className="text-gray-700 mb-8">
              For questions about these notices, use the City contact page:{" "}
              <Link
                to="/demo/contact"
                className="text-teal-700 hover:underline"
              >
                Contact Us
              </Link>
              .
            </p>

            <p className="text-sm text-gray-600 italic">
              This is a fictional demonstration page for the CivIQ demo.
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
