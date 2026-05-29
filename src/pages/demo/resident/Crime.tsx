import { Link } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import { useState } from "react";

export default function ResidentCrime() {
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
          <span aria-hidden="true">/</span> Crime & Public Safety
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-extrabold text-teal-800 mb-4">
              Crime & Public Safety
            </h1>
            <p className="text-lg text-gray-700 mb-10">
              Learn how Exodus Police supports neighborhood safety through
              non-emergency reporting, crime data tools, prevention programs,
              and victim support services.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Emergencies
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Call 911 for emergencies in progress.</li>
                  <li>
                    Follow dispatch instructions and move to safety if you can.
                  </li>
                  <li>
                    If safe, note location and a description of what you see.
                  </li>
                  <li>
                    Use 311 for non-urgent city concerns that are not active
                    crimes.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Non‑Emergency Reports
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Use 311 for non-emergency service requests and city intake.
                  </li>
                  <li>
                    File non-emergency police reports for theft, vandalism, and
                    property incidents.
                  </li>
                  <li>
                    Find district contacts and neighborhood policing resources.
                  </li>
                  <li>
                    Follow city guidance for welfare checks and suspicious
                    activity reports.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-8">
              <h2 className="text-2xl font-bold text-teal-800 mb-3">
                Records, Data & Victim Support
              </h2>
              <p className="text-gray-700 mb-4">
                Exodus provides transparency resources and support pathways
                in addition to prevention education.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request police reports and public records</li>
                <li>
                  Review neighborhood incident maps and city crime dashboards
                </li>
                <li>Victim assistance referrals and legal resource links</li>
                <li>
                  Neighborhood watch, fraud prevention, and safety outreach
                </li>
                <li>Community initiatives like National Night Out</li>
                <li>Specialized response resources for gang suppression</li>
              </ul>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-teal-800 mb-3">
                Related Pages
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/resident/courts"
                  >
                    Courts
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/resident/emergency-preparedness"
                  >
                    Emergency Preparedness
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/resident/fire-safety"
                  >
                    Fire Safety
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-teal-700 hover:underline"
                    to="/demo/resident/public-safety-employment"
                  >
                    Public Safety Employment
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
