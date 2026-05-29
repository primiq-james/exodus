// src/pages/demo/Terms.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react"; // ← Added this import

export default function Terms() {
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
            Terms of Use
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Please read these terms carefully before using the City of Palo
            Verde website or services.
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg prose-teal max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-teal-800">
              Last Updated: February 7, 2026
            </h2>

            <p className="text-gray-700 mb-8">
              Welcome to the official website of the City of Exodus, Texas.
              By accessing or using this website, you agree to be bound by these
              Terms of Use. If you do not agree, please do not use the site.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              1. Use of the Website
            </h3>
            <p className="text-gray-700 mb-6">
              This site is provided for informational purposes only. You may use
              it to access public information, submit service requests, apply
              for permits, or contact city departments.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li>
                You agree not to misuse the site (e.g., no hacking, spamming, or
                uploading malicious content).
              </li>
              <li>
                All content is owned by the City of Exodus or licensed to us
                and protected by copyright law.
              </li>
              <li>
                Permitted use: personal, non-commercial viewing and printing for
                personal reference.
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              2. User Submissions
            </h3>
            <p className="text-gray-700 mb-6">
              When you submit information (forms, requests, comments), you grant
              the City a non-exclusive, royalty-free license to use, reproduce,
              and distribute it for official purposes.
            </p>
            <p className="text-gray-700 mb-8">
              You are responsible for the accuracy of any information you
              submit. False or misleading submissions may violate law.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              3. Links to Third-Party Sites
            </h3>
            <p className="text-gray-700 mb-8">
              This site may contain links to external sites. We are not
              responsible for their content, privacy practices, or availability.
              Use them at your own risk.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              4. Disclaimer of Warranties
            </h3>
            <p className="text-gray-700 mb-8">
              The website and its content are provided "as is" without
              warranties of any kind. The City does not guarantee accuracy,
              completeness, or uninterrupted access.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              5. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-8">
              The City shall not be liable for any damages arising from use of
              the site, including direct, indirect, incidental, or consequential
              damages.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              6. Changes to Terms
            </h3>
            <p className="text-gray-700 mb-8">
              We may update these terms at any time. Continued use after changes
              constitutes acceptance.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              7. Governing Law
            </h3>
            <p className="text-gray-700 mb-8">
              These terms are governed by the laws of the State of Texas.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-teal-800">
              8. Contact Us
            </h3>
            <p className="text-gray-700 mb-8">
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:legal@paloverde.tx.gov"
                className="text-teal-600 hover:underline"
              >
                legal@paloverde.tx.gov
              </a>{" "}
              or (555) 010-2026.
            </p>

            <p className="text-sm text-gray-600 italic">
              This is a fictional demonstration Terms of Use for the CivIQ demo.
              Not legally binding.
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
            <Link to="/demo/terms" className="hover:underline font-semibold">
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
