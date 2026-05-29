// src/pages/demo/Council.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function Council() {
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
            City Council
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Meet our elected leaders, view meeting agendas, watch live streams,
            and learn how to participate in city government.
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
                About the City Council
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The Exodus City Council is the governing body of our city,
                responsible for setting policy, adopting the budget, and
                overseeing city operations. The Council consists of a Mayor and
                six Council Members, elected at-large by residents.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                Meetings are held on the first and third Tuesday of each month
                at 6:00 PM in City Hall Council Chambers (123 Main Street). All
                meetings are open to the public.
              </p>
            </div>

            {/* Council Members */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Council Members
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-teal-700">
                    M
                  </div>
                  <h3 className="text-xl font-bold text-teal-700">
                    Mayor Maria Gonzalez
                  </h3>
                  <p className="text-gray-600">Term: 2024–2028</p>
                  <p className="text-gray-700 mt-2">
                    Leading with vision and community focus.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-teal-700">
                    J
                  </div>
                  <h3 className="text-xl font-bold text-teal-700">
                    Council Member John Ramirez
                  </h3>
                  <p className="text-gray-600">District 1 • Term: 2023–2027</p>
                  <p className="text-gray-700 mt-2">
                    Public safety & infrastructure advocate.
                  </p>
                </div>

                {/* Add placeholders for other 5 members */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-teal-700">
                    S
                  </div>
                  <h3 className="text-xl font-bold text-teal-700">
                    Council Member Sarah Lee
                  </h3>
                  <p className="text-gray-600">At-Large • Term: 2024–2028</p>
                  <p className="text-gray-700 mt-2">
                    Education & parks champion.
                  </p>
                </div>

                {/* Repeat for remaining members or use a loop if you add data */}
              </div>
            </div>

            {/* Meetings & Participation */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <h2 className="text-3xl font-bold mb-6 text-teal-800">
                Meetings & How to Participate
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Upcoming Meetings
                  </h3>
                  <p className="text-gray-700 mb-4">
                    First and third Tuesday of each month at 6:00 PM. Agendas
                    posted 72 hours in advance.
                  </p>
                  <Link
                    to="/demo/action?action=council_agendas"
                    className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    View Agendas & Minutes →
                  </Link>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Watch Live</h3>
                  <p className="text-gray-700">
                    Stream meetings live on our website or YouTube channel.
                  </p>
                  <Link
                    to="/demo/action?action=council_live"
                    className="inline-flex items-center mt-4 px-6 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition"
                  >
                    Watch Live Stream
                  </Link>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Public Comment</h3>
                  <p className="text-gray-700">
                    Speak during meetings (3 minutes per speaker) or submit
                    written comments via email or online form.
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
                  Council News
                </h4>
                <p className="text-gray-600">Recent decisions & updates</p>
              </Link>

              <Link
                to="/demo/contact"
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-gray-200 text-center group hover:border-teal-400"
              >
                <h4 className="text-xl font-bold mb-2 text-teal-700 group-hover:text-teal-800">
                  Contact Council
                </h4>
                <p className="text-gray-600">Email your representatives</p>
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
