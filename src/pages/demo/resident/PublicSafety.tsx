import { Link } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import { useState } from "react";

export default function ResidentPublicSafety() {
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
          <span aria-hidden="true">/</span> Public Safety
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-extrabold text-teal-800 mb-4">
              Public Safety
            </h1>
            <p className="text-lg text-gray-700 mb-10">
              Exodus public safety includes police, fire rescue, and
              emergency preparedness. If this is an emergency, call 911. For
              service requests and non-emergencies, use 311.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/demo/resident/crime"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition block group"
              >
                <h2 className="text-xl font-bold text-teal-800 mb-2 group-hover:underline">
                  Crime & Public Safety
                </h2>
                <p className="text-gray-700">
                  Reporting guidance, prevention resources, and community safety
                  programs.
                </p>
              </Link>

              <Link
                to="/demo/resident/fire-safety"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition block group"
              >
                <h2 className="text-xl font-bold text-teal-800 mb-2 group-hover:underline">
                  Fire Safety
                </h2>
                <p className="text-gray-700">
                  Prevention tips, seasonal risks, and safety reminders.
                </p>
              </Link>

              <Link
                to="/demo/resident/emergency-preparedness"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition block group"
              >
                <h2 className="text-xl font-bold text-teal-800 mb-2 group-hover:underline">
                  Emergency Preparedness
                </h2>
                <p className="text-gray-700">
                  Planning guidance for severe weather, outages, and
                  emergencies.
                </p>
              </Link>

              <Link
                to="/demo/resident/courts"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition block group"
              >
                <h2 className="text-xl font-bold text-teal-800 mb-2 group-hover:underline">
                  Courts
                </h2>
                <p className="text-gray-700">
                  Municipal court basics: citations, hearings, and services.
                </p>
              </Link>
            </div>

            <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-8">
              <h2 className="text-2xl font-bold text-teal-800 mb-3">
                Safety Operations & Transparency
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Distinguish when to call 911 versus 311 city services</li>
                <li>Access records, data dashboards, and incident resources</li>
                <li>Find neighborhood safety and preparedness programs</li>
                <li>
                  Connect to victim support and legal assistance resources
                </li>
                <li>
                  Find coordinated police, fire, and emergency management info
                </li>
                <li>Review community risk reduction and resilience planning</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Interested in working with Exodus public safety?
              </p>
              <Link
                className="inline-block mt-2 text-teal-700 font-bold hover:underline"
                to="/demo/resident/public-safety-employment"
              >
                View Public Safety Employment
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-teal-800 mb-3">
                Related Pages
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/resident/health"
                  >
                    Health
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/contact"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
