// src/pages/demo/OpenData.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function OpenData() {
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
            Open Data Portal
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Explore public data, budgets, performance metrics, and more to
            understand how Exodus operates.
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
                What is the Open Data Portal?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The Exodus Open Data Portal provides free, public access to
                a wide range of city data in machine-readable formats. Our goal
                is transparency, accountability, and innovation — empowering
                residents, researchers, developers, and businesses to explore
                how the city works.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                Data is updated regularly and includes budgets, permits, crime
                statistics, infrastructure projects, and more.
              </p>
            </div>

            {/* Data Categories */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Available Data Categories
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Budgets & Finance
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Annual budgets & expenditures</li>
                    <li>Property tax rolls</li>
                    <li>Financial audits & reports</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Permits & Development
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Building permits issued</li>
                    <li>Zoning applications & approvals</li>
                    <li>Business licenses</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Public Safety
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Crime statistics & maps</li>
                    <li>Fire incidents</li>
                    <li>911 call summaries (non-emergency)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow border border-gray-200">
                  <h3 className="text-2xl font-bold mb-4 text-teal-700">
                    Infrastructure & Environment
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Street & sidewalk projects</li>
                    <li>Water usage & quality reports</li>
                    <li>Recycling & waste collection stats</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How to Access */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                How to Access Open Data
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Online Portal</h3>
                  <p className="text-gray-700 mb-4">
                    Browse, search, download, and visualize data directly from
                    our portal. No login required.
                  </p>
                  <Link
                    to="/demo/action?action=open_data_portal"
                    className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    Visit Open Data Portal →
                  </Link>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Data Formats</h3>
                  <p className="text-gray-700">
                    CSV, JSON, Excel, GeoJSON, and API access for developers.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Questions or Suggestions?
                  </h3>
                  <p className="text-gray-700">
                    Email open-data@paloverde.tx.gov or use the form below.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Link
                to="/demo/news"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Latest News
                </h4>
                <p className="text-gray-600">City announcements & updates</p>
              </Link>

              <Link
                to="/demo/contact"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Contact Us
                </h4>
                <p className="text-gray-600">Questions about data</p>
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
