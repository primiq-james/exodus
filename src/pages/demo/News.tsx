// src/pages/demo/News.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import { useState } from "react"; // ← Added this import

export default function News() {
  const [isChatOpen, setIsChatOpen] = useState(false); // ← Added this line – fixes chatbot toggle error
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Header – consistent across demo */}
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
              className="font-medium text-teal-600 font-semibold"
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
            News & Updates
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow">
            Stay informed with the latest announcements, council decisions,
            community events, and city projects in Exodus.
          </p>
        </div>
      </section>

      {/* News Grid – all 6 stories */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
                alt="Riverfront park with green space and trails"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  FEB 07 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  City Council Approves Funding for New Riverfront Park
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  The project will add 15 acres of green space, walking trails,
                  and a playground for families.
                </p>
                <Link
                  to="/demo/news/riverfront-park"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>

            {/* News Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                alt="People in library tech workshop"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  FEB 04 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  Free Tech Workshops Launch at Exodus Public Library
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  Residents can learn coding, digital literacy, and resume
                  building — all at no cost.
                </p>
                <Link
                  to="/demo/news/tech-workshops"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>

            {/* News Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="/repair.jpg"
                alt="Downtown street repair project with construction crew"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  JAN 29 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  Downtown Street Repair Project Completed Ahead of Schedule
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  New pavement and LED lighting now installed along Main Street.
                </p>
                <Link
                  to="/demo/news/street-repair"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>

            {/* News Card 4 */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80"
                alt="Senior residents at a community center event"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  JAN 22 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  Mayor Announces New Senior Center Expansion
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  Additional programs and transportation services for older
                  residents.
                </p>
                <Link
                  to="/demo/news/senior-center"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>

            {/* News Card 5 – Recycling */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
                alt="City recycling bins lined up for curbside pickup"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  JAN 15 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  Recycling Program Upgrades – New Collection Days
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  Updated schedule and larger bins now available citywide.
                </p>
                <Link
                  to="/demo/news/recycling-upgrades"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>

            {/* News Card 6 – Flood Grant */}
            <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                alt="Stormwater infrastructure and drainage improvements"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="text-xs text-teal-600 font-medium mb-2">
                  JAN 10 • 2025
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight">
                  Flood Mitigation Grant Awarded to Exodus
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  $2.8 million to improve drainage in low-lying neighborhoods.
                </p>
                <Link
                  to="/demo/news/flood-grant"
                  className="text-teal-600 text-sm font-medium mt-4 inline-block hover:underline"
                >
                  Read full story →
                </Link>
              </div>
            </div>
          </div>

          {/* Pagination / More News (placeholder) */}
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 transition">
              Load More News
            </button>
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
