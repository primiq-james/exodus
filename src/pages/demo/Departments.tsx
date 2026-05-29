// src/pages/demo/Departments.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react"; // Ensure this is imported

export default function Departments() {
  const [isChatOpen, setIsChatOpen] = useState(false); // ← THIS FIXES THE ERROR
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Header – consistent with Home/Services */}
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
              className="font-medium text-teal-600 font-semibold"
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
              <DemoAuthControl />
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

      {/* Hero / Intro Section */}
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
            City Departments
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Learn about the departments that keep Exodus running — from
            public safety to community development.
          </p>
        </div>
      </section>

      {/* Main Departments Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-teal-800">
            Our Departments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Public Safety / Police */}
            <Link
              to="/demo/departments/police"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Police Department
              </h3>
              <p className="text-gray-700 mb-4">
                Law enforcement, community policing, crime prevention, and
                public safety programs.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Police →
              </span>
            </Link>

            {/* Fire Department */}
            <Link
              to="/demo/departments/fire"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Fire Department
              </h3>
              <p className="text-gray-700 mb-4">
                Fire suppression, emergency medical services, fire prevention,
                and public education.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Fire →
              </span>
            </Link>

            {/* Public Works */}
            <Link
              to="/demo/departments/public-works"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Public Works
              </h3>
              <p className="text-gray-700 mb-4">
                Streets, water/sewer utilities, solid waste, parks maintenance,
                and infrastructure.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Public Works →
              </span>
            </Link>

            {/* Community Development / Planning */}
            <Link
              to="/demo/departments/planning"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Community Development & Planning
              </h3>
              <p className="text-gray-700 mb-4">
                Zoning, building permits, economic development, and long-term
                city planning.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Planning →
              </span>
            </Link>

            {/* Parks & Recreation */}
            <Link
              to="/demo/departments/parks"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Parks & Recreation
              </h3>
              <p className="text-gray-700 mb-4">
                Parks, trails, community centers, sports leagues, and youth
                programs.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Parks →
              </span>
            </Link>

            {/* Finance & Administration */}
            <Link
              to="/demo/departments/finance"
              className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-xl transition border border-gray-200 cursor-pointer block group hover:border-teal-400"
            >
              <h3 className="text-2xl font-bold mb-4 text-teal-700 group-hover:text-teal-800">
                Finance & Administration
              </h3>
              <p className="text-gray-700 mb-4">
                Budgeting, payroll, human resources, and city administration.
              </p>
              <span className="text-teal-600 font-medium group-hover:underline">
                View Finance →
              </span>
            </Link>
          </div>

          {/* Quick Contact */}
          <div className="mt-12 text-center">
            <p className="text-xl text-gray-700 mb-6">
              Need to contact a specific department?
            </p>
            <Link
              to="/demo/contact"
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition text-lg"
            >
              Contact a Department →
            </Link>
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
