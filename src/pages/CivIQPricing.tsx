import { Link, NavLink, useLocation } from "react-router-dom";
import civiqGuideLogo from "../assets/civiq-guide.svg";
import CiviqFooter from "../components/CiviqFooter";

const plans = [
  {
    name: "Standard",
    subtitle: "SaaS in your AWS",
    accent: "border-[#17A2B8] bg-[#F0FBFD]",
    details: [
      "Multi-tenant CivIQ deployment operated in your AWS account.",
      "Fastest path to launch with lower operational overhead.",
      "Includes resident assistant, analytics, and admin controls.",
      "Best for cities that want speed and predictable operating model.",
    ],
  },
  {
    name: "Premium",
    subtitle: "Dedicated single tenant",
    accent: "border-[#0B3C5D] bg-[#F4F7FA]",
    details: [
      "Single-tenant CivIQ environment with dedicated isolation.",
      "Higher customization for integrations, workflows, and governance.",
      "Enhanced support posture and deployment controls.",
      "Best for larger agencies with stricter operational requirements.",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "Optional city-owned cloud",
    accent: "border-[#52606D] bg-white",
    details: [
      "Optional city-owned cloud model with agency-directed boundaries.",
      "Supports advanced compliance and procurement constraints.",
      "Flexible architecture for long-term city technology strategy.",
      "Best for complex organizations requiring maximum control.",
    ],
  },
] as const;

export default function CivIQPricing() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isActiveTab = (path: string) => normalizedPath === path;
  const ctaButtonClass =
    "inline-block rounded-xl bg-[#17A2B8] px-10 py-4 text-lg font-bold text-white transition hover:bg-[#138496]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF1F7] via-[#F4F7FA] to-white text-[#1F2933]">
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <section className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <div className="mx-auto w-fit">
              <img
                src={civiqGuideLogo}
                alt="CivIQ Guide"
                className="mx-auto -mt-4 mb-2 h-24 w-auto sm:-mt-6 sm:h-32 md:h-40"
              />
              <a
                href="https://primiq.ai"
                target="_blank"
                rel="noreferrer"
                className="-mt-1 mb-5 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#D9E2EC] transition hover:text-white sm:text-sm"
              >
                A primIQ platform
              </a>
            </div>
            <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#D9E2EC]/40" />
          </div>
          <h1 className="mb-5 text-center text-3xl font-semibold leading-tight text-[#F4F7FA] sm:text-5xl md:text-6xl">
            Flexible Pricing for Every City
          </h1>
          <p className="mx-auto mb-8 max-w-4xl text-center text-base text-[#D9E2EC] sm:text-lg md:text-2xl">
            Options aligned to your scale, security requirements, and
            operational structure.
          </p>
          <div className="h-6 sm:h-8" aria-hidden="true" />

          <div className="mt-3 mb-2 flex flex-wrap justify-center gap-2 rounded-xl border border-[#D9E2EC]/30 bg-[#072F4F]/50 p-2">
            <NavLink
              to="/civiq#overview"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${isActiveTab("/civiq") ? "bg-[#17A2B8] text-white" : "text-[#D9E2EC] hover:bg-white/10"}`}
            >
              Overview
            </NavLink>
            <NavLink
              to="/civiq/features#capabilities"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${isActiveTab("/civiq/features") ? "bg-[#17A2B8] text-white" : "text-[#D9E2EC] hover:bg-white/10"}`}
            >
              Features
            </NavLink>
            <NavLink
              to="/civiq/benefits#benefits"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${isActiveTab("/civiq/benefits") ? "bg-[#17A2B8] text-white" : "text-[#D9E2EC] hover:bg-white/10"}`}
            >
              Benefits
            </NavLink>
            <NavLink
              to="/civiq/pricing"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${isActiveTab("/civiq/pricing") ? "bg-[#17A2B8] text-white" : "text-[#D9E2EC] hover:bg-white/10"}`}
            >
              Pricing
            </NavLink>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-6 shadow-sm ${plan.accent}`}
              >
                <h2 className="text-3xl font-bold text-[#0B3C5D]">
                  {plan.name}
                </h2>
                <p className="mt-1 text-base font-semibold text-[#52606D]">
                  {plan.subtitle}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-[#364152]">
                  {plan.details.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#17A2B8]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#D9E2EC] bg-white p-6 text-center sm:p-8">
            <p className="mx-auto mb-5 max-w-3xl text-base text-[#52606D] sm:text-lg">
              We can recommend the right model based on procurement constraints,
              integration needs, and security posture.
            </p>
            <Link to="/civiq/contact" className={ctaButtonClass}>
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <CiviqFooter />
    </div>
  );
}
