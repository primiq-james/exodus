// src/pages/demo/Resident.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ResidentHub() {
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
            alt="City skyline background"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 drop-shadow-lg">
            Resident Hub
          </h1>
          <p className="text-lg md:text-2xl max-w-4xl mx-auto drop-shadow">
            A practical starting point for day-to-day living in Exodus:
            household basics, getting settled, and utility help.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo/resident/household"
              className="bg-white text-teal-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              Household Basics
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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/demo/resident/household"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h2 className="text-2xl font-bold mb-3 text-teal-800">
                Household
              </h2>
              <p className="text-gray-700 mb-6">
                Trash and recycling, neighborhood services, pets, and home
                upkeep.
              </p>
              <span className="text-teal-700 font-semibold group-hover:underline">
                Explore household →
              </span>
            </Link>

            <Link
              to="/demo/resident/getting-home"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h2 className="text-2xl font-bold mb-3 text-teal-800">
                Getting a Home
              </h2>
              <p className="text-gray-700 mb-6">
                Moving checklist, permits, address updates, and settling in.
              </p>
              <span className="text-teal-700 font-semibold group-hover:underline">
                See moving steps →
              </span>
            </Link>

            <Link
              to="/demo/resident/utilities"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h2 className="text-2xl font-bold mb-3 text-teal-800">
                Utilities
              </h2>
              <p className="text-gray-700 mb-6">
                Start/stop service, billing questions, and outage guidance.
              </p>
              <span className="text-teal-700 font-semibold group-hover:underline">
                Get utility help →
              </span>
            </Link>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-extrabold text-teal-800">
              More Resident Topics
            </h2>
            <p className="text-gray-700 mt-2">
              Practical starting points for common household and neighborhood
              questions.
            </p>

            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <Link
                to="/demo/resident/trash-recycling-and-composting"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Trash, Recycling & Compost
                </h3>
                <p className="text-gray-700">
                  Missed pickup, cart issues, and what to include in a request.
                </p>
              </Link>
              <Link
                to="/demo/resident/gardening-and-home-improvements"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Gardening & Home Improvements
                </h3>
                <p className="text-gray-700">
                  Permits, cleanup planning, and neighborhood standards.
                </p>
              </Link>
              <Link
                to="/demo/resident/pets-and-adoption"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Pets & Adoption
                </h3>
                <p className="text-gray-700">
                  Lost/found pets, adoption, licensing, and animal concerns.
                </p>
              </Link>
              <Link
                to="/demo/resident/neighborhoods"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Neighborhoods
                </h3>
                <p className="text-gray-700">
                  Report local issues, community info, and fast routing tips.
                </p>
              </Link>
              <Link
                to="/demo/resident/senior-services-hub"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Senior Services Hub
                </h3>
                <p className="text-gray-700">
                  Programs, resource navigation, and caregiver guidance.
                </p>
              </Link>
              <Link
                to="/demo/resident/education"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Education
                </h3>
                <p className="text-gray-700">
                  Enrollment basics, youth programs, and learning resources.
                </p>
              </Link>
              <Link
                to="/demo/resident/libraries"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Libraries
                </h3>
                <p className="text-gray-700">
                  Cards, programs, and digital access.
                </p>
              </Link>
              <Link
                to="/demo/resident/families"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Families
                </h3>
                <p className="text-gray-700">
                  Youth resources, recreation, and community support.
                </p>
              </Link>
              <Link
                to="/demo/resident/neighborhood-community"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Neighborhood &amp; Community
                </h3>
                <p className="text-gray-700">
                  Community updates, meetings, and local engagement.
                </p>
              </Link>
              <Link
                to="/demo/resident/health"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">Health</h3>
                <p className="text-gray-700">
                  Public health resources, animal services, and wellness info.
                </p>
              </Link>
              <Link
                to="/demo/resident/public-safety"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Public Safety
                </h3>
                <p className="text-gray-700">
                  Emergency preparedness, fire safety, courts, and crime
                  resources.
                </p>
              </Link>
              <Link
                to="/demo/resident/arts-and-leisure"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition block"
              >
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Arts &amp; Leisure
                </h3>
                <p className="text-gray-700">
                  Parks, trails, events, and community programs.
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-teal-200 bg-teal-50 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-teal-800">
                  Need a fast answer?
                </h3>
                <p className="text-gray-700">
                  The Exodus Assistant can route you to official city pages
                  and forms.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-lg bg-teal-700 px-6 py-3 text-white font-bold hover:bg-teal-800 transition"
                >
                  Ask the Assistant
                </button>
                <Link
                  to="/demo/services"
                  className="rounded-lg bg-white px-6 py-3 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                >
                  Browse Services
                </Link>
              </div>
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
