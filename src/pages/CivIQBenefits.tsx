import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Link2, Globe2, Clock3, ShieldCheck, TrendingUp } from "lucide-react";
import civiqGuideLogo from "../assets/civiq-guide.svg";
import CiviqFooter from "../components/CiviqFooter";

const useCases = [
  {
    title: "311 + FAQ Deflection",
    detail:
      "Answer routine resident questions instantly with source-linked responses.",
  },
  {
    title: "Permits + Licensing Guidance",
    detail: "Guide applicants through requirements, forms, and next steps.",
  },
  {
    title: "Utilities + Billing Support",
    detail:
      "Handle payment, outage, and account questions without call center wait times.",
  },
  {
    title: "Escalation + Human Handoff",
    detail:
      "Route legal, dispute, and complex scenarios to staff with context attached.",
  },
] as const;

const residentExperienceBlocks = [
  {
    title: "Source-Grounded Answers",
    detail:
      "Grounded in your official city content for higher accuracy and trust.",
    metric: "Builds resident confidence in every answer.",
    icon: "shield",
  },
  {
    title: "Direct Links to Forms & Services",
    detail: "Residents move directly from answer to action.",
    metric: "Speeds resolution and reduces drop-off.",
    icon: "link",
  },
  {
    title: "24/7 Availability",
    detail: "Serve residents anytime without expanding staff coverage.",
    metric: "Commonly reduces routine call volume.",
    icon: "clock",
  },
  {
    title: "Multilingual Support",
    detail:
      "Expand equitable access across language needs in one assistant experience.",
    metric: "Improves inclusion across the community.",
    icon: "globe",
  },
  {
    title: "Human Handoff with Context",
    detail:
      "Escalate complex issues with context preserved so residents are not asked to repeat details.",
    metric: "Shortens time to resolution on complex cases.",
    icon: "chart",
  },
  {
    title: "Confidence Indicator",
    detail:
      "Highlight lower-confidence responses so staff can quickly verify and intervene when needed.",
    metric: "Reduces risk on sensitive guidance.",
    icon: "shield",
  },
] as const;

export default function CivIQBenefits() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isActiveTab = (path: string) => normalizedPath === path;
  const [monthlyCalls, setMonthlyCalls] = useState(12000);
  const [deflectionRate, setDeflectionRate] = useState(35);
  const [avgCallMinutes, setAvgCallMinutes] = useState(6);
  const [costPerMinute, setCostPerMinute] = useState(1.2);

  const deflectedCalls = Math.round(monthlyCalls * (deflectionRate / 100));
  const savedHoursPerMonth = Math.round((deflectedCalls * avgCallMinutes) / 60);
  const monthlySavings = Math.round(
    deflectedCalls * avgCallMinutes * costPerMinute,
  );
  const annualSavings = monthlySavings * 12;

  const ctaButtonClass =
    "inline-block rounded-xl bg-[#17A2B8] px-10 py-4 text-lg font-bold text-white transition hover:bg-[#138496]";
  const storyIcons = {
    link: Link2,
    globe: Globe2,
    clock: Clock3,
    shield: ShieldCheck,
    chart: TrendingUp,
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF1F7] via-[#F4F7FA] to-white text-[#1F2933]">
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <section
        id="benefits"
        className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-10 sm:py-14"
      >
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
            Results That Matter
          </h1>
          <p className="mx-auto mb-8 max-w-4xl text-center text-base text-[#D9E2EC] sm:text-lg md:text-2xl">
            Automation, insight, and accountability for modern public service.
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

      <section className="py-8 sm:py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3">
          <article className="rounded-2xl border border-[#D9E2EC] bg-white p-6">
            <h2 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What the Public Gets
            </h2>
            <p className="text-base text-[#52606D]">
              Fast, accurate support in multiple languages with direct links to
              official pages, forms, and service steps.
            </p>
          </article>
          <article className="rounded-2xl border border-[#D9E2EC] bg-white p-6">
            <h2 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What Staff Get
            </h2>
            <p className="text-base text-[#52606D]">
              Fewer repetitive calls, cleaner routing, and better coverage
              after-hours without increasing headcount.
            </p>
          </article>
          <article className="rounded-2xl border border-[#D9E2EC] bg-white p-6">
            <h2 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What Leadership Gets
            </h2>
            <p className="text-base text-[#52606D]">
              Measurable impact on response times, service quality, and agency
              efficiency from one executive view.
            </p>
          </article>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Resident Experience
            </h2>
            <p className="mb-6 text-base font-medium text-[#52606D]">
              Improve access, clarity, and response time for the community.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {residentExperienceBlocks.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-4"
                >
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#0B3C5D]">
                    {(() => {
                      const Icon = storyIcons[item.icon];
                      return (
                        <Icon
                          className="h-4 w-4 text-[#17A2B8]"
                          aria-hidden="true"
                        />
                      );
                    })()}
                    <span>{item.title}</span>
                  </h3>
                  <p className="mt-1 text-sm text-[#52606D]">{item.detail}</p>
                  <p className="mt-2 text-xs font-semibold text-[#0B3C5D]">
                    {item.metric}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roi-calculator" className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-3 text-center text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              ROI Calculator
            </h2>
            <p className="mx-auto mb-8 max-w-4xl text-center text-base text-[#52606D] sm:text-lg">
              Estimate annual impact based on your current call volume and
              staffing assumptions.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="text-base text-[#52606D]">
                Monthly call volume:{" "}
                <span className="font-semibold text-[#0B3C5D]">
                  {monthlyCalls.toLocaleString()}
                </span>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={500}
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                  className="mt-2 w-full accent-[#17A2B8]"
                />
              </label>
              <label className="text-base text-[#52606D]">
                Deflection rate:{" "}
                <span className="font-semibold text-[#0B3C5D]">
                  {deflectionRate}%
                </span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={1}
                  value={deflectionRate}
                  onChange={(e) => setDeflectionRate(Number(e.target.value))}
                  className="mt-2 w-full accent-[#17A2B8]"
                />
              </label>
              <label className="text-base text-[#52606D]">
                Avg call duration:{" "}
                <span className="font-semibold text-[#0B3C5D]">
                  {avgCallMinutes} min
                </span>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  value={avgCallMinutes}
                  onChange={(e) => setAvgCallMinutes(Number(e.target.value))}
                  className="mt-2 w-full accent-[#17A2B8]"
                />
              </label>
              <label className="text-base text-[#52606D]">
                Staff cost per minute:{" "}
                <span className="font-semibold text-[#0B3C5D]">
                  ${costPerMinute.toFixed(2)}
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={costPerMinute}
                  onChange={(e) => setCostPerMinute(Number(e.target.value))}
                  className="mt-2 w-full accent-[#17A2B8]"
                />
              </label>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#D9E2EC] bg-[#F4F7FA] p-5">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Calls Deflected / Mo
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0B3C5D]">
                  {deflectedCalls.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-[#D9E2EC] bg-[#F4F7FA] p-5">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Staff Hours Saved / Mo
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0B3C5D]">
                  {savedHoursPerMonth.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-[#D9E2EC] bg-[#F4F7FA] p-5">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Estimated Annual Savings
                </div>
                <div className="mt-1 text-2xl font-bold text-[#2E7D32]">
                  ${annualSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
            Use Cases
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {useCases.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[#D9E2EC] bg-white p-5"
              >
                <h3 className="mb-2 text-xl font-bold text-[#0B3C5D]">
                  {item.title}
                </h3>
                <p className="text-[#52606D]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-8 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Link to="/contact" className={ctaButtonClass}>
            Schedule a Demo
          </Link>
        </div>
      </section>

      <CiviqFooter />
    </div>
  );
}
