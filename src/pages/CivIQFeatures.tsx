import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Link2, Clock3, ShieldCheck, TrendingUp, Globe2 } from "lucide-react";
import civiqGuideHeroLogo from "../assets/civiq-guide-hero.svg";
import CiviqFooter from "../components/CiviqFooter";

const features = [
  {
    category: "Assistant",
    text: "24/7/365 AI assistant availability for resident questions and city service guidance",
  },
  {
    category: "Knowledge",
    text: "Source-grounded answers from your ingested city/demo content (not generic only)",
  },
  {
    category: "Knowledge",
    text: "Clickable citations/direct links in responses (styled clearly as links)",
  },
  {
    category: "Knowledge",
    text: "Smart direct-link handling for forms/docs (PDF/DOCX/XLSX links)",
  },
  { category: "Assistant", text: "Multi-language response selection in chat" },
  {
    category: "Trust",
    text: 'AI disclosure/trust messaging each session ("AI assistant, not a human")',
  },
  {
    category: "Trust",
    text: "Confidence indicator on responses (high/medium/low + score)",
  },
  {
    category: "Trust",
    text: "Resident feedback loop on answers (Helpful, Not helpful, Flag)",
  },
  {
    category: "Handoff",
    text: "Human handoff for complex topics (legal/appeals/disputes) with context carryover",
  },
  {
    category: "Handoff",
    text: "Handoff package includes ticket ID, summary, and conversation context so users do not repeat themselves",
  },
  {
    category: "Assistant",
    text: "Proactive civic nudges (e.g., voter deadline reminder, air-quality alert) with CTA actions",
  },
  {
    category: "Assistant",
    text: "Emotional intelligence lite tone adaptation when users are frustrated",
  },
  {
    category: "Identity",
    text: "Logged-in form prefill (v1) for contact workflow from profile claims",
  },
  {
    category: "Assistant",
    text: "Persistent chat history and chat state continuity",
  },
  {
    category: "Admin",
    text: "Admin console for operations + analytics visibility",
  },
  {
    category: "Admin",
    text: "Analytics dashboard for top query types, volumes, failure signals, escalation rates",
  },
  {
    category: "Admin",
    text: "Auto-suggested new intents from real uncategorized resident questions",
  },
  {
    category: "Pipeline",
    text: "Site extraction trigger/status flow from admin console",
  },
  {
    category: "Pipeline",
    text: "Crawl output pipeline into knowledge base (S3 + OpenSearch indexing flow)",
  },
  {
    category: "Admin",
    text: "Registered-user counts surfaced in admin console (Cognito stats)",
  },
  {
    category: "UX",
    text: "Resizable chat widget UX with theme toggle and accessibility improvements",
  },
  {
    category: "Admin",
    text: "Hallucination monitoring panel with grounded/weak/not-found states and review workflow",
  },
  {
    category: "Admin",
    text: "Kanban work-item board in admin for tracking prompt, content, and QA fixes",
  },
  {
    category: "Admin",
    text: "Alarm management center with threshold-based API and KPI alerts plus saved alarm list",
  },
  {
    category: "Pipeline",
    text: "Per-component API health checks surfaced in dashboard with status and latency snapshots",
  },
  {
    category: "Knowledge",
    text: "Improved retrieval grounding with top-source visibility, chunk metadata, and fallback controls",
  },
] as const;

const adminPillars = [
  {
    id: "kpi",
    title: "Executive Impact KPIs",
    image: "/civiq-pillars/kpi.png",
    front:
      "Calls deflected, hours saved, after-hours coverage, and cost impact in one place.",
    back: "Leadership gets immediate ROI visibility with metrics they can use in council updates and budget planning.",
  },
  {
    id: "questions",
    title: "Question Analytics",
    image: "/civiq-pillars/questions.png",
    front: "See what residents are asking most by topic and timeframe.",
    back: "Surface demand patterns quickly so teams can prioritize updates, policy clarifications, and service improvements.",
  },
  {
    id: "training",
    title: "Training Impact",
    image: "/civiq-pillars/training.png",
    front: "Track answer-rate lift before and after ingestion/tuning cycles.",
    back: "Shows measurable quality gains over time so stakeholders see improvement, not just static chatbot performance.",
  },
  {
    id: "registeredusers",
    title: "Registered Users",
    image: "/civiq-pillars/registeredusers.png",
    front: "Monitor total, confirmed, and active registered users in one view.",
    back: "Gives teams quick adoption visibility and helps correlate resident engagement with service outcomes.",
  },
  {
    id: "guardrail",
    title: "Guardrail Monitor",
    image: "/civiq-pillars/guardrail.png",
    front: "Track escalations, refusals, and policy-trigger reasons.",
    back: "Gives admins a trust and safety lens to validate behavior and tune escalation handling.",
  },
  {
    id: "feedback",
    title: "Feedback Queue",
    image: "/civiq-pillars/feedbackfix.png",
    front: "Review flagged and not-helpful answers with a fix workflow.",
    back: "Closes the quality loop by converting resident feedback into concrete improvements.",
  },
  {
    id: "scenario",
    title: "Scenario Runner",
    image: "/civiq-pillars/scenariorunner.png",
    front: "Run permit, utility, and escalation test suites on demand.",
    back: "Validate readiness before launches and after prompt/content changes with pass/fail visibility.",
  },
  {
    id: "health",
    title: "Channel Health",
    image: "/civiq-pillars/health.png",
    front:
      "Monitor chat router latency/errors, downstream lambdas, and OpenSearch status.",
    back: "Single-pane operational health helps teams identify system issues before residents feel impact.",
  },
  {
    id: "knowledge",
    title: "Knowledge Freshness",
    image: "/civiq-pillars/knowledgefreshness.png",
    front: "Last crawl and ingest timestamps with stale-content warnings.",
    back: "Confirms your assistant is serving from fresh content and shows when the pipeline needs attention.",
  },
  {
    id: "prompt",
    title: "Prompt Config",
    image: "/civiq-pillars/promptconfig.png",
    front: "Edit system prompt, concise mode, and tone rules in one panel.",
    back: "Admins can tune response style and policy framing without redeploying the full application.",
  },
  {
    id: "siteextraction",
    title: "Site Extraction Ops",
    image: "/civiq-pillars/siteextraction.png",
    front: "Trigger extraction and track run status directly from admin.",
    back: "Operational controls simplify refresh cycles and reduce dependency on engineering for routine updates.",
  },
  {
    id: "export",
    title: "Export & Reporting",
    image: "/civiq-pillars/export.png",
    front: "Generate export-ready reports for stakeholders and oversight.",
    back: "Creates clear accountability artifacts for leadership reviews, council briefings, and compliance workflows.",
  },
] as const;

const adminOperationsBlocks = [
  {
    title: "Executive ROI KPIs",
    detail:
      "Track deflected calls, hours saved, and per-interaction cost impact for budget decisions.",
    metric: "Makes value clear for budget and council conversations.",
    icon: "chart",
  },
  {
    title: "Question Analytics",
    detail: "See what residents ask most and where responses need improvement.",
    metric: "Pinpoints high-friction intents quickly.",
    icon: "chart",
  },
  {
    title: "Knowledge Freshness",
    detail:
      "Confirm your assistant is using current policy and service information.",
    metric: "Protects quality and policy alignment over time.",
    icon: "shield",
  },
  {
    title: "Feedback Queue",
    detail:
      "Convert flagged responses into measurable improvements through a closed-loop workflow.",
    metric: "Improves performance with every review cycle.",
    icon: "link",
  },
  {
    title: "Export & Reporting",
    detail:
      "Produce audit-ready PDFs for council, leadership, and oversight reviews.",
    metric: "Simplifies compliance and stakeholder reporting.",
    icon: "link",
  },
  {
    title: "Assistant Control",
    detail: "Maintain immediate operational control at all times.",
    metric: "Lets teams respond instantly to operational needs.",
    icon: "clock",
  },
  {
    title: "Hallucination Review",
    detail:
      "Audit weakly grounded responses and route correction tasks to content or prompt owners.",
    metric: "Reduces false answers and improves trust over time.",
    icon: "shield",
  },
  {
    title: "Kanban Workflows",
    detail:
      "Track work from backlog through validation for prompts, sources, and QA findings.",
    metric: "Keeps operational fixes visible across teams.",
    icon: "chart",
  },
  {
    title: "Alarm Configuration",
    detail:
      "Define component alarms with thresholds and manage enabled notifications from one place.",
    metric: "Speeds response to degraded services.",
    icon: "clock",
  },
] as const;

const featureHighlights = [
  {
    title: "Hallucination Monitoring",
    detail:
      "Review grounded vs weak responses, inspect citations, and assign fixes before bad behavior scales.",
    badge: "Trust Layer",
  },
  {
    title: "Admin Kanban Board",
    detail:
      "Move prompt and content tasks through triage, in-progress, QA, and done with clear ownership.",
    badge: "Operations",
  },
  {
    title: "Alarm Center",
    detail:
      "Set thresholds for API and KPI metrics, receive alerts, and maintain a clean list of active alarms.",
    badge: "Monitoring",
  },
] as const;

export default function CivIQFeatures() {
  const [featureFilter, setFeatureFilter] = useState<
    | "All"
    | "Assistant"
    | "Knowledge"
    | "Trust"
    | "Handoff"
    | "Identity"
    | "Admin"
    | "Pipeline"
    | "UX"
  >("All");
  const [selectedPillarId, setSelectedPillarId] = useState<
    (typeof adminPillars)[number]["id"]
  >(adminPillars[0].id);
  const [zoomedPillar, setZoomedPillar] = useState<{
    title: string;
    image: string;
  } | null>(null);
  const [imageZoom, setImageZoom] = useState(1.25);

  const uniqueFeatures = useMemo(() => {
    const seen = new Set<string>();
    return features.filter((item) => {
      const key = item.text.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const filteredFeatures = useMemo(
    () =>
      featureFilter === "All"
        ? uniqueFeatures
        : uniqueFeatures.filter((item) => item.category === featureFilter),
    [featureFilter, uniqueFeatures],
  );

  const selectedPillar = useMemo(
    () =>
      adminPillars.find((pillar) => pillar.id === selectedPillarId) ||
      adminPillars[0],
    [selectedPillarId],
  );

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
        id="capabilities"
        className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-10 sm:py-14"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <div className="mx-auto w-fit">
              <img
                src={civiqGuideHeroLogo}
                alt="CivIQ Guide"
                className="mx-auto -mt-4 mb-2 h-[288px] w-auto sm:-mt-6 sm:h-[384px] md:h-[480px]"
              />
              <a
                href="https://primiq.ai"
                target="_blank"
                rel="noreferrer"
                className="-mt-36 mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#D9E2EC] transition hover:text-white sm:-mt-48 sm:text-sm md:-mt-60"
              >
                A primIQ platform
              </a>
            </div>
            <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#D9E2EC]/40" />
          </div>
          <h1 className="mb-5 text-center text-3xl font-semibold leading-tight text-[#F4F7FA] sm:text-5xl md:text-6xl">
            Everything your AI needs to serve a city, in one place.
          </h1>
          <p className="mx-auto mb-8 max-w-4xl text-center text-base text-[#D9E2EC] sm:text-lg md:text-2xl">
            Deploy, govern, measure, and improve every resident interaction from
            a single, secure platform.
          </p>

          <div className="h-[92px] sm:h-[104px]" aria-hidden="true" />
        </div>
      </section>

      {zoomedPillar && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl rounded-2xl border border-[#D9E2EC] bg-[#0B1F2A] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white">
                {zoomedPillar.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.max(1, z - 0.15))}
                  className="rounded-md bg-[#17A2B8] px-3 py-1 text-sm font-bold text-white hover:bg-[#138496]"
                >
                  -
                </button>
                <span className="min-w-[70px] text-center text-sm font-semibold text-[#D9E2EC]">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.min(2.6, z + 0.15))}
                  className="rounded-md bg-[#17A2B8] px-3 py-1 text-sm font-bold text-white hover:bg-[#138496]"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedPillar(null)}
                  className="ml-1 rounded-md border border-[#D9E2EC] bg-transparent px-3 py-1 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[78vh] overflow-auto rounded-lg border border-[#D9E2EC]/30 bg-[#102A43] p-3">
              <img
                src={zoomedPillar.image}
                alt={`${zoomedPillar.title} enlarged screenshot`}
                className="mx-auto h-auto w-full origin-top rounded-lg border border-[#D9E2EC] object-contain bg-white"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: "top center",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Administration & Oversight
            </h2>
            <p className="mb-6 text-base font-medium text-[#52606D]">
              Understand performance, reduce risk, and prove impact.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {adminOperationsBlocks.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[#D9E2EC] bg-gradient-to-br from-white to-[#F2FAFF] p-4 shadow-[0_8px_20px_rgba(11,60,93,0.08)] transition hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(11,60,93,0.14)]"
                >
                  <div className="mb-2 inline-flex rounded-full border border-[#A9DCE4] bg-[#EAF9FB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B3C5D]">
                    Admin Surface
                  </div>
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

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featureHighlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-[0_6px_18px_rgba(11,60,93,0.08)]"
              >
                <div className="mb-3 inline-flex rounded-full bg-[#0B3C5D] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                  {item.badge}
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#0B3C5D]">
                  {item.title}
                </h3>
                <p className="text-sm font-medium text-[#52606D]">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <h2 className="mb-4 text-center text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
            Feature Library
          </h2>
          <p className="mx-auto mb-8 max-w-4xl text-center text-base text-[#52606D] sm:text-lg">
            Filter by category to explore capabilities across resident
            experience, trust, handoff, and operations.
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {(
              [
                "Assistant",
                "Knowledge",
                "Trust",
                "Handoff",
                "Identity",
                "Admin",
                "Pipeline",
                "UX",
                "All",
              ] as const
            ).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setFeatureFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  featureFilter === filter
                    ? "border-[#17A2B8] bg-[#17A2B8] text-white"
                    : "border-[#D9E2EC] bg-white text-[#0B3C5D] hover:bg-[#F4F7FA]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredFeatures.map((item, index) => (
              <article
                key={`${item.text}-${index}`}
                className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-sm font-bold uppercase tracking-wide text-[#0B3C5D]">
                    {item.category}
                  </div>
                  <span className="rounded-full border border-[#BCE6EE] bg-[#EAF9FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B3C5D]">
                    Live in Demo
                  </span>
                </div>
                <p className="text-base font-medium text-[#1F2933] sm:text-lg">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="mb-3 text-center text-3xl font-bold text-white sm:text-4xl">
              Admin Console Pillars
            </h2>
            <p className="mx-auto mb-6 max-w-3xl text-center text-sm text-[#D9E2EC] sm:text-base">
              Select a capability to view the screenshot and why it matters for
              agency operations.
            </p>
            <div className="mb-5 flex flex-wrap justify-center gap-2">
              {adminPillars.map((pillar) => (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setSelectedPillarId(pillar.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedPillarId === pillar.id
                      ? "border-[#17A2B8] bg-[#17A2B8] text-white"
                      : "border-[#D9E2EC]/50 bg-white/95 text-[#0B3C5D] hover:bg-[#F4F7FA]"
                  }`}
                >
                  {pillar.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
              <article className="overflow-hidden rounded-2xl border border-[#D9E2EC]/35 bg-white/95">
                <div className="bg-[#102A43] p-3">
                  <img
                    src={selectedPillar.image}
                    alt={`${selectedPillar.title} screenshot`}
                    className="h-[340px] w-full rounded-lg border border-[#D9E2EC] object-contain bg-white"
                  />
                </div>
                <div className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setZoomedPillar({
                        title: selectedPillar.title,
                        image: selectedPillar.image,
                      });
                      setImageZoom(1.25);
                    }}
                    className="rounded-lg border border-[#D9E2EC] bg-white px-4 py-2 text-sm font-semibold text-[#0B3C5D] hover:bg-[#F4F7FA]"
                  >
                    Zoom Photo
                  </button>
                </div>
              </article>

              <article className="rounded-2xl border border-[#D9E2EC]/35 bg-white/95 p-5 sm:p-6">
                <h3 className="mb-3 text-2xl font-bold text-[#0B3C5D]">
                  {selectedPillar.title}
                </h3>
                <p className="mb-4 text-base font-medium text-[#1F2933]">
                  {selectedPillar.front}
                </p>
                <p className="text-base text-[#364152]">
                  {selectedPillar.back}
                </p>
              </article>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D9E2EC]/30 bg-[#072F4F]/70 p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 text-center sm:mb-8">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Admin & Analytics
              </h2>
              <p className="text-base text-[#D9E2EC] sm:text-lg">
                Track outcomes in real time: deflection, department mix,
                question trends, exports, and assistant controls.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-[#D9E2EC]/35 bg-white/95 p-4">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Calls Deflected
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0B3C5D]">
                  41%
                </div>
              </div>
              <div className="rounded-xl border border-[#D9E2EC]/35 bg-white/95 p-4">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Hours Saved
                </div>
                <div className="mt-1 text-2xl font-bold text-[#2E7D32]">
                  312
                </div>
              </div>
              <div className="rounded-xl border border-[#D9E2EC]/35 bg-white/95 p-4">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  After-Hours Coverage
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0B3C5D]">
                  63%
                </div>
              </div>
              <div className="rounded-xl border border-[#D9E2EC]/35 bg-white/95 p-4">
                <div className="text-xs uppercase tracking-wide text-[#52606D]">
                  Export-Ready Reports
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0B3C5D]">
                  PDF
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/contact" className={ctaButtonClass}>
                Request Admin Console Demo
              </Link>
            </div>
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
