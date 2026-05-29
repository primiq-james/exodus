// src/pages/demo/resident/SeniorServicesHub.tsx
import { Link } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../../components/chat/ChatbotWidget";
import { useState } from "react";

export default function ResidentSeniorServicesHub() {
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
          <span aria-hidden="true">/</span> Senior Services Hub
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-extrabold text-teal-800 mb-4">
                Senior Services Hub
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                A starting point for older adults, caregivers, and families:
                activities, resource navigation, and how to contact the city for
                help.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Programs & Activities
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Community events, wellness programs, and local activities
                    geared toward older adults.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                    <li>Meal, fitness, and social participation programs.</li>
                    <li>
                      Cooling/warming center updates during extreme weather.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/news"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      See Events
                    </Link>
                    <Link
                      to="/demo/departments"
                      className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                    >
                      Departments
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Benefits Navigation
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Help finding the right place to ask about local assistance,
                    paperwork, or referrals.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                    <li>Benefits counseling and referral support.</li>
                    <li>Care coordination pathways for complex needs.</li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Ask Assistant
                    </button>
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
                    Transportation Options
                  </h2>
                  <p className="text-gray-700 mb-4">
                    City shuttles and accessible options vary by availability.
                    Use official channels to confirm eligibility.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                    <li>Paratransit eligibility and booking guidance.</li>
                    <li>Medical trip and senior-center route resources.</li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/services"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Services
                    </Link>
                    <Link
                      to="/demo/forms"
                      className="rounded-lg bg-white px-4 py-2 text-teal-800 font-bold border border-teal-200 hover:bg-teal-50 transition"
                    >
                      Forms
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Caregiver Resources
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Checklists for common city paperwork</li>
                    <li>How to request accommodations for city services</li>
                    <li>Where to ask about home safety and preparedness</li>
                  </ul>
                  <div className="mt-4">
                    <Link
                      to="/demo/resident/emergency-preparedness"
                      className="text-teal-700 hover:underline font-semibold"
                    >
                      Emergency preparedness tips
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-8">
                <h2 className="text-2xl font-bold text-teal-800 mb-3">
                  Need help finding the right contact?
                </h2>
                <p className="text-gray-700 mb-4">
                  Ask the assistant and it will point you to the closest
                  official page or form.
                </p>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-lg bg-teal-700 px-6 py-3 text-white font-bold hover:bg-teal-800 transition"
                >
                  Ask the Assistant
                </button>
              </div>
            </div>

            <aside className="w-full lg:w-[360px] rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-teal-800 mb-3">
                Quick Links
              </h2>
              <div className="space-y-3">
                <Link
                  to="/demo/contact"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Contact the City</p>
                  <p className="text-sm text-gray-600">
                    Call, email, or submit a request.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/household"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Household Basics</p>
                  <p className="text-sm text-gray-600">
                    Waste, pets, neighborhoods, and upkeep.
                  </p>
                </Link>
                <Link
                  to="/demo/resident/utilities"
                  className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition"
                >
                  <p className="font-bold text-teal-700">Utilities</p>
                  <p className="text-sm text-gray-600">
                    Billing, outages, and service setup.
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
