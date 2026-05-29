import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DemoAuthControl from "../../components/demo/DemoAuthControl";

type ActionId =
  | "permits_apply"
  | "report_issue"
  | "utilities_account"
  | "parking_permit"
  | "open_data_portal"
  | "council_agendas"
  | "council_live"
  | "connect_app_download"
  | "three_one_one_request";

function getActionTitle(action: ActionId): string {
  switch (action) {
    case "permits_apply":
      return "Online Permit Application (Demo)";
    case "report_issue":
      return "Submit a Service Report (Demo)";
    case "utilities_account":
      return "Utilities Account Access (Demo)";
    case "parking_permit":
      return "Parking Permit Application (Demo)";
    case "open_data_portal":
      return "Open Data Portal (Demo)";
    case "council_agendas":
      return "Agendas & Minutes (Demo)";
    case "council_live":
      return "Live Stream (Demo)";
    case "connect_app_download":
      return "Download Exodus Connect (Demo)";
    case "three_one_one_request":
      return "Submit a 311 Request (Demo)";
    default:
      return "Demo Action";
  }
}

function isActionId(value: string | null): value is ActionId {
  return (
    value === "permits_apply" ||
    value === "report_issue" ||
    value === "utilities_account" ||
    value === "parking_permit" ||
    value === "open_data_portal" ||
    value === "council_agendas" ||
    value === "council_live" ||
    value === "connect_app_download" ||
    value === "three_one_one_request"
  );
}

export default function DemoAction() {
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get("action");
  const action: ActionId = isActionId(actionParam)
    ? actionParam
    : "report_issue";
  const title = useMemo(() => getActionTitle(action), [action]);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    details: "",
  });
  const isUtilitiesAccount = action === "utilities_account";
  const sampleUtilityStatement = useMemo(
    () => ({
      accountName: "Jordan Taylor",
      serviceAddress: "742 Exodus Dr, Exodus, TX",
      accountNumberMasked: "****-1842",
      statementDate: "Feb 1, 2026",
      dueDate: "Feb 21, 2026",
      lastPayment: { date: "Jan 12, 2026", amount: 79.11 },
      lineItems: [
        { label: "Water service", amount: 42.18 },
        { label: "Wastewater", amount: 29.54 },
        { label: "Trash & recycling", amount: 12.55 },
      ],
    }),
    [],
  );
  const sampleAmountDue = useMemo(
    () =>
      sampleUtilityStatement.lineItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
    [sampleUtilityStatement.lineItems],
  );

  const showForm =
    action === "permits_apply" ||
    action === "report_issue" ||
    action === "utilities_account" ||
    action === "parking_permit" ||
    action === "three_one_one_request" ||
    action === "open_data_portal" ||
    action === "connect_app_download";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
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
              <p className="text-sm text-gray-600">Demo Portal</p>
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

      <section className="relative text-white py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/palo-verde-bg.png"
            alt="Exodus background"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="relative container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            {title}
          </h2>
          <p className="mt-3 text-teal-50 max-w-3xl">
            This is a demo-only destination so every button in the demo routes
            somewhere real.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {action === "council_agendas" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-8">
            <h3 className="text-2xl font-bold text-teal-800">
              Agendas & Minutes
            </h3>
            <p className="mt-2 text-gray-700">
              Demo placeholder. In a production portal, this would list PDFs and
              recordings by date.
            </p>
            <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-2">
              <li>Agenda: Regular Meeting (Sample) – February 2026</li>
              <li>Minutes: Regular Meeting (Sample) – January 2026</li>
              <li>Agenda: Workshop Session (Sample) – December 2025</li>
            </ul>
          </div>
        )}

        {action === "council_live" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-8">
            <h3 className="text-2xl font-bold text-teal-800">Live Stream</h3>
            <p className="mt-2 text-gray-700">
              Demo placeholder. In production, this would embed the live stream
              or link out to the official channel.
            </p>
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
              Live stream embed area
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-8">
            {isUtilitiesAccount ? (
              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-teal-800">
                      Sample Utility Statement (Demo)
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Sample data for UI testing only. Not actual city rates or
                      a real account balance.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/demo/services/payments"
                      className="rounded-xl bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Pay Now (Demo)
                    </Link>
                    <Link
                      to="/demo/utilities"
                      className="rounded-xl bg-white px-5 py-3 text-teal-800 font-bold border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Utilities Home
                    </Link>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount due</p>
                        <p className="text-4xl font-extrabold text-teal-800">
                          ${sampleAmountDue.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Due {sampleUtilityStatement.dueDate}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Last payment
                        </p>
                        <p className="text-sm text-gray-600">
                          {sampleUtilityStatement.lastPayment.date}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          $
                          {sampleUtilityStatement.lastPayment.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-lg font-bold text-teal-800">
                      Account Details
                    </h4>
                    <div className="mt-4 space-y-3 text-sm text-gray-700">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-semibold">
                          {sampleUtilityStatement.accountName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Service address</p>
                        <p className="font-semibold">
                          {sampleUtilityStatement.serviceAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account</p>
                        <p className="font-semibold">
                          {sampleUtilityStatement.accountNumberMasked}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Statement date</p>
                        <p className="font-semibold">
                          {sampleUtilityStatement.statementDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h4 className="text-lg font-bold text-teal-800">
                    Charges This Statement
                  </h4>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 pr-6 font-semibold">Item</th>
                          <th className="py-2 text-right font-semibold">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-800">
                        {sampleUtilityStatement.lineItems.map((item) => (
                          <tr key={item.label} className="border-t">
                            <td className="py-3 pr-6">{item.label}</td>
                            <td className="py-3 text-right font-semibold">
                              ${item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t">
                          <td className="py-3 pr-6 font-bold text-gray-900">
                            Total due
                          </td>
                          <td className="py-3 text-right font-extrabold text-teal-800">
                            ${sampleAmountDue.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/demo/services/payments"
                      className="rounded-xl bg-teal-700 px-5 py-3 text-white font-bold hover:bg-teal-800 transition"
                    >
                      Make a Payment (Demo)
                    </Link>
                    <Link
                      to="/demo/contact"
                      className="rounded-xl bg-white px-5 py-3 text-teal-800 font-bold border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Contact Utilities
                    </Link>
                  </div>
                </div>
              </div>
            ) : !submitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address / Location (optional)
                    </label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    value={form.details}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, details: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 min-h-[140px]"
                    placeholder="Describe what you need..."
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-teal-700 text-white font-bold rounded-xl shadow hover:bg-teal-800 transition"
                  >
                    Submit (Demo)
                  </button>
                  <Link
                    to="/demo"
                    className="px-8 py-3 bg-white text-teal-800 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-center"
                  >
                    Back to Demo Home
                  </Link>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-6">
                <h4 className="text-xl font-bold text-teal-900">Submitted</h4>
                <p className="mt-2 text-teal-900">
                  Demo submission recorded locally (no real city system). You
                  can continue browsing the demo.
                </p>
                <div className="mt-4">
                  <Link
                    to="/demo"
                    className="text-teal-800 font-medium hover:underline"
                  >
                    Return to Demo Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-teal-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg mb-4">
            © {new Date().getFullYear()} City of Exodus, Texas • Demo only
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
    </div>
  );
}
