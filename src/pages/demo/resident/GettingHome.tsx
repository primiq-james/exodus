// src/pages/demo/resident/GettingHome.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ResidentGettingHome() {
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3 text-sm text-gray-600">
          <Link to="/demo/resident" className="hover:underline text-teal-700">
            Resident Hub
          </Link>{" "}
          <span aria-hidden="true">/</span> Getting a Home
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-extrabold text-teal-800 mb-4">
              Getting a Home
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              A simple checklist for getting settled in Exodus. This page is
              a general guide; for official requirements, use the city services
              pages.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">
                  Moving Checklist
                </h2>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                  <li>Set up utilities and confirm billing details.</li>
                  <li>
                    Update your address and contact information as needed.
                  </li>
                  <li>Review permits if you plan renovations or additions.</li>
                  <li>Know how to report neighborhood issues (311).</li>
                  <li>
                    Review trash, recycling, and bulk collection schedules.
                  </li>
                  <li>
                    Check parking rules and neighborhood signage guidance.
                  </li>
                </ol>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/demo/resident/utilities"
                    className="rounded-lg bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                  >
                    Utility Setup
                  </Link>
                  <Link
                    to="/demo/department/311"
                    className="rounded-lg bg-white px-5 py-3 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    311 Help Center
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">
                  Permits & Inspections
                </h2>
                <p className="text-gray-700 mb-4">
                  If you are planning construction, remodeling, signage, or
                  business work at your property, start here.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>
                    Confirm permit, inspection, and timeline requirements.
                  </li>
                  <li>Check drainage, right-of-way, and setback standards.</li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/demo/services/permits"
                    className="rounded-lg bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                  >
                    Permits & Licenses
                  </Link>
                  <Link
                    to="/demo/forms"
                    className="rounded-lg bg-white px-5 py-3 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Forms Library
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">
                  Questions Along the Way
                </h2>
                <p className="text-gray-700 mb-4">
                  Not sure which page applies? Ask the Assistant and it will
                  route you to the right official page or form.
                </p>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-lg bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                >
                  Ask the Assistant
                </button>
              </div>
            </div>

            <aside className="rounded-xl border border-gray-200 bg-gray-50 p-6 h-fit">
              <h2 className="text-xl font-bold text-teal-800 mb-3">
                Helpful Links
              </h2>
              <div className="space-y-3">
                <Link
                  to="/demo/contact"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Contact</p>
                  <p className="text-sm text-gray-600">
                    Get help from city staff.
                  </p>
                </Link>
                <Link
                  to="/demo/services/payments"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Payments</p>
                  <p className="text-sm text-gray-600">Pay bills and fees.</p>
                </Link>
                <Link
                  to="/demo/resident/household"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Household</p>
                  <p className="text-sm text-gray-600">
                    Waste pickup and neighborhood basics.
                  </p>
                </Link>
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
