// src/pages/demo/resident/Neighborhoods.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ResidentNeighborhoods() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
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

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3 text-sm text-gray-600">
          <Link to="/demo/resident" className="hover:underline text-teal-700">
            Resident Hub
          </Link>{" "}
          <span aria-hidden="true">/</span> Neighborhoods
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-extrabold text-teal-800 mb-4">
                Neighborhoods
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Resources for staying connected locally: community info, how to
                report concerns, and what to include so requests route quickly.
              </p>

              <div className="mb-10 rounded-2xl border border-teal-200 bg-teal-50 p-6">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Neighborhood Resources
                </h2>
                <p className="text-gray-700 mb-4">
                  Quick links for common neighborhood questions and community
                  resources.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/demo/resident/education"
                    className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                  >
                    Education
                  </Link>
                  <Link
                    to="/demo/resident/libraries"
                    className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Libraries
                  </Link>
                  <Link
                    to="/demo/resident/families"
                    className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Families
                  </Link>
                  <Link
                    to="/demo/resident/neighborhood-community"
                    className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Community
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Report Local Issues
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Streetlights, potholes, signage, and maintenance requests
                    should go through official reporting.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/services/report"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Report an Issue
                    </Link>
                    <Link
                      to="/demo/department/311"
                      className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                    >
                      311
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Community Groups
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Looking for meetings, updates, or local initiatives? Start
                    with city news and contact pages.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                    <li>
                      Review neighborhood plans and public meeting notices.
                    </li>
                    <li>
                      Find district offices and community engagement staff.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/news"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      News
                    </Link>
                    <Link
                      to="/demo/contact"
                      className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    What Helps Requests Move Faster
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Exact location or nearest cross street</li>
                    <li>Photo (optional) and a short description</li>
                    <li>When you noticed the issue</li>
                    <li>Any safety risks (traffic, flooding, downed lines)</li>
                    <li>Repeat occurrence details if this is ongoing</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Pets and Neighbors
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Animal concerns often come up at the neighborhood level.
                    Route those requests through official reporting.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/resident/pets-and-adoption"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Pets & Adoption
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                    >
                      Ask Assistant
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-8">
                <h2 className="text-2xl font-bold text-teal-800 mb-3">
                  Quick help: route the request
                </h2>
                <p className="text-gray-700 mb-4">
                  If you are not sure which department owns an issue, start with
                  311 and include the details you have.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/demo/department/311"
                    className="rounded-lg bg-teal-700 px-6 py-3 text-white font-bold hover:bg-teal-800 transition"
                  >
                    311 Help Center
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="rounded-lg bg-white px-6 py-3 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                  >
                    Ask Assistant
                  </button>
                </div>
              </div>
            </div>

            <aside className="w-full lg:w-[360px] rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-teal-800 mb-3">
                Related Pages
              </h2>
              <div className="space-y-3">
                <Link
                  to="/demo/resident/education"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Education</p>
                  <p className="text-sm text-gray-600">
                    Enrollment basics and learning resources.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/libraries"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Libraries</p>
                  <p className="text-sm text-gray-600">
                    Cards, programs, and digital access.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/families"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Families</p>
                  <p className="text-sm text-gray-600">
                    Youth resources and community support.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/neighborhood-community"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">
                    Neighborhood &amp; Community
                  </p>
                  <p className="text-sm text-gray-600">
                    Meetings, engagement, and community updates.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/household"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Household Basics</p>
                  <p className="text-sm text-gray-600">
                    Waste, pets, and home upkeep.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/trash-recycling-and-composting"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">
                    Trash, Recycling & Compost
                  </p>
                  <p className="text-sm text-gray-600">
                    Missed pickup, carts, and request details.
                  </p>
                </Link>
                <Link
                  to="/demo/services/report"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Report an Issue</p>
                  <p className="text-sm text-gray-600">
                    Submit a request through official channels.
                  </p>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
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
        </div>
      )}
    </div>
  );
}
