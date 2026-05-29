import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DemoAuthControl from "../../../components/demo/DemoAuthControl";
import ChatbotWidget from "../../../components/chat/ChatbotWidget";

type DepartmentSpec = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  hours: string;
  phone: string;
  email: string;
  location: string;
  commonRequests: Array<{ label: string; to: string }>;
  keyServices: string[];
};

const DEPARTMENTS: Record<string, DepartmentSpec> = {
  police: {
    slug: "police",
    title: "Police Department",
    tagline: "Public safety, community policing, and non-emergency support.",
    summary:
      "The Police Department provides law enforcement services, community outreach, and public safety programs. For emergencies, always call 911.",
    hours: "Mon–Fri 8:00 AM–5:00 PM (Dispatch 24/7)",
    phone: "(555) 311-0101",
    email: "police@paloverde.gov",
    location: "100 Civic Center Dr, Exodus, TX",
    commonRequests: [
      { label: "Report a non-emergency issue", to: "/demo/services/report" },
      { label: "Parking and towing info", to: "/demo/services/parking" },
      { label: "Start with 311", to: "/demo/311" },
    ],
    keyServices: [
      "Non-emergency reports",
      "Community programs",
      "Public records guidance",
      "Traffic and parking enforcement",
    ],
  },
  fire: {
    slug: "fire",
    title: "Fire Department",
    tagline: "Fire response, EMS coordination, and prevention education.",
    summary:
      "The Fire Department provides fire suppression, prevention, inspections, and emergency medical response coordination. For emergencies, call 911.",
    hours: "Mon–Fri 8:00 AM–5:00 PM (Response 24/7)",
    phone: "(555) 311-0202",
    email: "fire@paloverde.gov",
    location: "200 Station Way, Exodus, TX",
    commonRequests: [
      { label: "Report a safety concern", to: "/demo/services/report" },
      { label: "Permits and inspections", to: "/demo/services/permits" },
      { label: "Contact the City", to: "/demo/contact" },
    ],
    keyServices: [
      "Fire prevention education",
      "Safety inspections",
      "Emergency response",
      "Community preparedness",
    ],
  },
  "public-works": {
    slug: "public-works",
    title: "Public Works",
    tagline: "Streets, infrastructure, and maintenance services.",
    summary:
      "Public Works maintains streets, right-of-way assets, and core infrastructure. Submit service requests for potholes, streetlights, and repairs.",
    hours: "Mon–Fri 7:00 AM–4:00 PM",
    phone: "(555) 311-0303",
    email: "publicworks@paloverde.gov",
    location: "300 Works Yard Rd, Exodus, TX",
    commonRequests: [
      {
        label: "Report potholes or street issues",
        to: "/demo/services/report",
      },
      { label: "Utilities information", to: "/demo/utilities" },
      { label: "Start with 311", to: "/demo/311" },
    ],
    keyServices: [
      "Street maintenance",
      "Streetlight repairs",
      "Signage and signals",
      "Right-of-way maintenance",
    ],
  },
  planning: {
    slug: "planning",
    title: "Community Development & Planning",
    tagline: "Zoning, development review, and long-term planning.",
    summary:
      "Planning supports responsible growth through zoning guidance, development review, and long-range planning initiatives.",
    hours: "Mon–Fri 8:30 AM–4:30 PM",
    phone: "(555) 311-0404",
    email: "planning@paloverde.gov",
    location: "400 Planning Ave, Exodus, TX",
    commonRequests: [
      { label: "Permits and licenses", to: "/demo/services/permits" },
      { label: "Open Data and records", to: "/demo/open-data" },
      { label: "Contact the City", to: "/demo/contact" },
    ],
    keyServices: [
      "Zoning guidance",
      "Development review",
      "Planning initiatives",
      "Public information and meetings",
    ],
  },
  parks: {
    slug: "parks",
    title: "Parks & Recreation",
    tagline: "Parks, programs, facilities, and community activities.",
    summary:
      "Parks & Recreation manages parks, trails, and community programs. Find activities, facility information, and upcoming events.",
    hours: "Mon–Fri 9:00 AM–5:00 PM",
    phone: "(555) 311-0505",
    email: "parks@paloverde.gov",
    location: "500 Park Blvd, Exodus, TX",
    commonRequests: [
      { label: "City news and events", to: "/demo/news" },
      { label: "Report a park issue", to: "/demo/services/report" },
      { label: "Contact the City", to: "/demo/contact" },
    ],
    keyServices: [
      "Parks and trail maintenance",
      "Community programs",
      "Facility rentals guidance",
      "Recreation information",
    ],
  },
  finance: {
    slug: "finance",
    title: "Finance & Administration",
    tagline: "Payments, billing support, and administrative services.",
    summary:
      "Finance & Administration supports billing questions, payment processing, and administrative services. For current rates and account-specific details, use official payment channels.",
    hours: "Mon–Fri 8:00 AM–5:00 PM",
    phone: "(555) 311-0606",
    email: "finance@paloverde.gov",
    location: "600 Finance Ln, Exodus, TX",
    commonRequests: [
      { label: "Payments portal", to: "/demo/services/payments" },
      { label: "Utilities billing info", to: "/demo/utilities" },
      { label: "Contact the City", to: "/demo/contact" },
    ],
    keyServices: [
      "Payments and receipts guidance",
      "Billing support routing",
      "Records and administration",
      "Procurement guidance",
    ],
  },
};

function getDepartment(slug: string | undefined): DepartmentSpec | null {
  if (!slug) return null;
  return DEPARTMENTS[slug] || null;
}

export default function DepartmentPage() {
  const params = useParams();
  const department = useMemo(
    () => getDepartment(params.departmentSlug),
    [params.departmentSlug],
  );

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!department) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <h1 className="text-3xl font-extrabold text-teal-800">
            Department Not Found
          </h1>
          <p className="mt-3 text-gray-700">
            That department page doesn’t exist in the demo.
          </p>
          <div className="mt-6">
            <Link
              to="/demo/departments"
              className="inline-flex rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 transition"
            >
              Back to Departments
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      <section className="relative text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/palo-verde-bg.png"
            alt="Sunny city skyline"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
              Department
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold drop-shadow-lg">
              {department.title}
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-white/95 drop-shadow">
              {department.tagline}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-8 py-4 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition text-lg"
                type="button"
              >
                Ask the Assistant
              </button>
              <Link
                to="/demo/departments"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition text-lg"
              >
                Back to Departments
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-6xl grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-teal-800">Overview</h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              {department.summary}
            </p>

            <h3 className="mt-10 text-2xl font-bold text-teal-800">
              Key Services
            </h3>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {department.keyServices.map((service) => (
                <li
                  key={service}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-900">{service}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <h3 className="text-lg font-bold text-teal-800">
                Contact & Hours
              </h3>
              <p className="mt-3 text-sm text-gray-700">
                <span className="font-semibold">Hours:</span> {department.hours}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Phone:</span> {department.phone}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {department.email}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Location:</span>{" "}
                {department.location}
              </p>
              <div className="mt-4">
                <Link
                  to="/demo/contact"
                  className="inline-flex w-full justify-center rounded-xl bg-teal-600 px-4 py-3 font-bold text-white hover:bg-teal-700 transition"
                >
                  Contact the City
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Common Requests
              </h3>
              <div className="mt-3 space-y-2">
                {department.commonRequests.map((req) => (
                  <Link
                    key={req.to}
                    to={req.to}
                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-teal-800 hover:border-teal-300 hover:bg-teal-50 transition"
                  >
                    {req.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-teal-700 transition transform hover:scale-110"
            aria-label="Open Exodus AI Assistant"
            type="button"
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
                aria-label="Close chat"
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
