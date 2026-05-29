import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ScanSearch,
  DatabaseZap,
  MessageSquareText,
  BarChart3,
  Wrench,
  Globe2,
  Users,
  Building2,
  Link2,
  Clock3,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  MessagesSquare,
  Eye,
  Lock,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import civiqGuideHeroLogo from "../assets/civiq-guide-hero.svg";
import CiviqFooter from "../components/CiviqFooter";

const workflow = [
  {
    step: "Extract / Crawl",
    detail:
      "Automatically crawl public city pages, documents, forms, and policy content to gather service information.",
    result: "Keeps answers current without manual updates.",
    icon: "extract",
  },
  {
    step: "Ingest",
    detail:
      "Automatically ingest and structure the captured content into the knowledge pipeline with no manual copy/paste.",
    result: "Eliminates copy/paste and reduces staff workload.",
    icon: "ingest",
  },
  {
    step: "Answer",
    detail: "Provide 24/7 source-grounded responses with direct links.",
    result: "Residents get faster service with fewer calls.",
    icon: "answer",
  },
  {
    step: "Measure",
    detail: "Track volume, feedback, confidence, and escalations.",
    result: "Leadership sees ROI and risk in real time.",
    icon: "measure",
  },
  {
    step: "Improve",
    detail: "Continuously refine prompts, routing, and knowledge.",
    result: "System gets smarter every month.",
    icon: "improve",
  },
] as const;

const useCases = [
  {
    title: "311 + FAQ Deflection",
    detail:
      "Answer routine resident questions instantly with source-linked responses.",
    question: "Can residents get 311 help after city offices close?",
    scenarioId: "usecase_311_after_hours",
  },
  {
    title: "Permits + Licensing Guidance",
    detail: "Guide applicants through requirements, forms, and next steps.",
    question: "What do I need before applying for a business permit?",
    scenarioId: "usecase_permit_start",
  },
  {
    title: "Utilities + Billing Review",
    detail:
      "Handle high-bill, outage, and account questions without long call-center delays.",
    question: "My utility bill is higher than expected. What should I do?",
    scenarioId: "usecase_utility_bill",
  },
  {
    title: "Parking + Citation Resolution",
    detail:
      "Help residents pay citations, review dispute options, and avoid late penalties.",
    question: "How can I pay a parking citation online?",
    scenarioId: "usecase_parking_payment",
  },
  {
    title: "Resident Form Assist",
    detail:
      "Help residents locate and complete common city forms with direct document links.",
    question: "Where can I find the right city form for my request?",
    scenarioId: "usecase_forms_lookup",
  },
  {
    title: "Emergency Readiness",
    detail:
      "Surface preparedness checklists, alert signups, and non-emergency safety resources.",
    question:
      "Where can residents find emergency preparedness and public safety guidance?",
    scenarioId: "usecase_emergency_preparedness",
  },
  {
    title: "Council + Civic Transparency",
    detail:
      "Direct residents to council agendas, recordings, and open data portals.",
    question: "Where can I watch council meetings and access city open data?",
    scenarioId: "usecase_council_open_data",
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

type TopicTooltip = {
  x: number;
  y: number;
  type: string;
  count: number;
};

type MockLatencyPoint = {
  timestamp: string;
  avg_duration_ms: number;
  invocations: number;
  errors: number;
};

type HeroChatScenario = {
  id: string;
  question: string;
  answer: string;
  citations: string[];
  actionLabel: string;
  actionHref: string;
};

type HeroTheme = "dark" | "light";
type AdminOversightView = 0 | 1 | 2;

const heroChatScenarios: HeroChatScenario[] = [
  {
    id: "pothole",
    question: "How do I report a pothole on Oak Street?",
    answer:
      "Use Report Issue, include nearest address, lane direction, and photo. Urgent roadway hazards are prioritized first.",
    citations: [
      "apps/demo/src/pages/demo/ThreeOneOne.tsx:111",
      "apps/demo/src/pages/demo/ThreeOneOne.tsx:187",
    ],
    actionLabel: "Open report issue",
    actionHref: "/demo/report",
  },
  {
    id: "utility",
    question: "My water bill seems high. What should I do first?",
    answer:
      "Check your usage history and submit a billing review request. City staff can verify meter reads and possible leaks.",
    citations: [
      "apps/demo/src/pages/demo/Utilities.tsx:178",
      "apps/demo/src/pages/demo/Utilities.tsx:194",
    ],
    actionLabel: "View utilities help",
    actionHref: "/demo/utilities",
  },
  {
    id: "permit",
    question: "I need a business permit. Where do I start?",
    answer:
      "Start in Permits & Licenses, choose your business type, and review required inspections before submission.",
    citations: [
      "apps/demo/src/pages/demo/Permits.tsx:134",
      "apps/demo/src/pages/demo/Permits.tsx:179",
    ],
    actionLabel: "Go to permits",
    actionHref: "/demo/permits",
  },
];

const useCaseDemoScenarios: HeroChatScenario[] = [
  {
    id: "usecase_311_after_hours",
    question: "Can residents get 311 help after city offices close?",
    answer:
      "- Exodus 311 is the city's non-emergency contact center for reporting issues and getting information on city services. You can call, text, or submit requests online 24/7. - Common requests include reporting potholes, missed trash pickup, streetlight outages, code violations, and more. For emergencies, always call 911.",
    citations: [
      "Exodus 311 - https://civiqguide.com/demo/311",
      "Exodus Department / 311 - https://civiqguide.com/demo/department/311",
      "Exodus Home - https://civiqguide.com/demo",
    ],
    actionLabel: "Open 311 services",
    actionHref: "/demo/311",
  },
  {
    id: "usecase_permit_start",
    question: "What do I need before applying for a business permit?",
    answer:
      "You can start at Permits & Licenses (https://civiqguide.com/demo/services/permits). Select your permit type there and complete the form to submit your request.",
    citations: [],
    actionLabel: "View permits",
    actionHref: "/demo/permits",
  },
  {
    id: "usecase_utility_bill",
    question: "My utility bill is higher than expected. What should I do?",
    answer:
      "Utilities: - Verify your account details, pay bills, and manage your utility services through the official Utilities page. - For payment assistance programs, outages, or safety issues, contact the Utilities department. - Report hazards, downed lines, or flooding by calling 911 for emergencies or 311 for non-emergency follow-up. - Request cart repairs, schedule waste pickup, and track holiday changes through the Waste Pickup service.",
    citations: [
      "Exodus Resident / Utilities - https://civiqguide.com/demo/resident/utilities",
      "Exodus Department / 311 - https://civiqguide.com/demo/department/311",
      "Exodus Records Retention - https://civiqguide.com/demo/records-retention",
    ],
    actionLabel: "Get utilities help",
    actionHref: "/demo/utilities",
  },
  {
    id: "usecase_parking_payment",
    question: "How can I pay a parking citation online?",
    answer:
      "Parking Permits: - Exodus offers residential, visitor, and commercial parking permits to manage on-street parking. - Residential permits are required to park overnight on-street and require proof of residency. - Visitor/guest permits are available for daily or weekly use by residents. - Commercial/business permits are available for employees and customers. Paying Parking For more details on parking rules, permit requirements, and payment options, check the Exodus Parking Services page: https://civiqguide.com/demo/services/parking",
    citations: [
      "Exodus Services / Parking - https://civiqguide.com/demo/services/parking",
      "Exodus Services / Payments - https://civiqguide.com/demo/services/payments",
      "Exodus Services - https://civiqguide.com/demo/services",
    ],
    actionLabel: "Pay citation",
    actionHref: "/demo/services/payments",
  },
  {
    id: "usecase_forms_lookup",
    question: "Where can I find the right city form for my request?",
    answer:
      "- Cooling/warming center updates during extreme weather - Benefits counseling and referral support for local assistance, paperwork, or referrals - Care coordination pathways for complex needs - Information on city transportation options like shuttles and paratransit - Resources for medical trips and senior center routes - Guidance on requesting accommodations for city services - Help finding the right city contact for your needs You can find more details and links on the Exodus Resident.",
    citations: [
      "Exodus Resident / Senior Services Hub - https://civiqguide.com/demo/resident/senior-services-hub",
      "Exodus Resident / Families - https://civiqguide.com/demo/resident/families",
      "Exodus Resident / Neighborhoods - https://civiqguide.com/demo/resident/neighborhoods",
    ],
    actionLabel: "Browse forms",
    actionHref: "/demo/forms",
  },
  {
    id: "usecase_emergency_preparedness",
    question:
      "Where can residents find emergency preparedness and public safety guidance?",
    answer:
      "- Know two evacuation routes from your neighborhood in case you need to leave quickly. - Plan ahead for your pets - have carriers, medications, and extra food ready. - Identify meeting points, one nearby and one outside your local area. - Include backup plans for school, childcare, and elder care in your emergency planning.",
    citations: [
      "Exodus Resident / Emergency Preparedness - https://civiqguide.com/demo/resident/emergency-preparedness",
      "Exodus Resident / Public Safety - https://civiqguide.com/demo/resident/public-safety",
      "Exodus Resident / Public Safety Employment - https://civiqguide.com/demo/resident/public-safety-employment",
    ],
    actionLabel: "View preparedness info",
    actionHref: "/demo/resident/emergency-preparedness",
  },
  {
    id: "usecase_council_open_data",
    question: "Where can I watch council meetings and access city open data?",
    answer:
      "You can contact City Council here: City Council (https://civiqguide.com/demo/council) and Contact (https://civiqguide.com/demo/contact). Use the Council page for meetings and public comment details.",
    citations: [],
    actionLabel: "Open civic transparency tools",
    actionHref: "/demo/council",
  },
];

const heroChatLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Vietnamese",
  "Hindi",
  "Mandarin Chinese",
  "Cantonese Chinese",
  "Arabic",
  "Korean",
] as const;

type HeroLanguage = (typeof heroChatLanguages)[number];
const PREVIEW_SESSION_TIMEOUT_MS = 5 * 60 * 1000;
const PREVIEW_SESSION_TIMEOUT_LABEL = "5 minutes";

const mockTopicCounts = [
  { type: "other", count: 542 },
  { type: "permits", count: 222 },
  { type: "payments", count: 181 },
  { type: "report_issue", count: 132 },
  { type: "contact", count: 86 },
  { type: "utilities", count: 38 },
  { type: "business_license", count: 63 },
] as const;

const mockLatencySeries: MockLatencyPoint[] = [
  {
    timestamp: "2026-02-18T08:00:00.000Z",
    avg_duration_ms: 624.3,
    invocations: 321,
    errors: 2,
  },
  {
    timestamp: "2026-02-18T09:00:00.000Z",
    avg_duration_ms: 578.9,
    invocations: 336,
    errors: 1,
  },
  {
    timestamp: "2026-02-18T10:00:00.000Z",
    avg_duration_ms: 611.4,
    invocations: 354,
    errors: 2,
  },
  {
    timestamp: "2026-02-18T11:00:00.000Z",
    avg_duration_ms: 559.7,
    invocations: 346,
    errors: 1,
  },
  {
    timestamp: "2026-02-18T12:00:00.000Z",
    avg_duration_ms: 522.1,
    invocations: 332,
    errors: 0,
  },
  {
    timestamp: "2026-02-18T13:00:00.000Z",
    avg_duration_ms: 507.2,
    invocations: 319,
    errors: 1,
  },
  {
    timestamp: "2026-02-18T14:00:00.000Z",
    avg_duration_ms: 548.8,
    invocations: 340,
    errors: 1,
  },
  {
    timestamp: "2026-02-18T15:00:00.000Z",
    avg_duration_ms: 531.6,
    invocations: 328,
    errors: 0,
  },
] as const;

const oversightWeeklySeries = [
  { label: "Mon", requests: 1225, escalations: 29 },
  { label: "Tue", requests: 1318, escalations: 32 },
  { label: "Wed", requests: 1289, escalations: 27 },
  { label: "Thu", requests: 1394, escalations: 35 },
  { label: "Fri", requests: 1420, escalations: 31 },
  { label: "Sat", requests: 1107, escalations: 22 },
  { label: "Sun", requests: 1038, escalations: 19 },
] as const;

const oversightUptimeSeries = [
  { component: "Chat Router", uptime: 99.72 },
  { component: "OpenSearch", uptime: 99.93 },
  { component: "Ingestion Pipeline", uptime: 99.41 },
  { component: "Escalation Webhook", uptime: 98.86 },
] as const;

const oversightConfidenceMix = [
  { label: "High", value: 71, color: "#10B981" },
  { label: "Medium", value: 22, color: "#F59E0B" },
  { label: "Low", value: 7, color: "#EF4444" },
] as const;

type PreviewHealthTone = "up" | "degraded" | "down" | "unknown";

const PREVIEW_HEALTH_TONE_STYLES: Record<
  PreviewHealthTone,
  { pill: string; dot: string }
> = {
  up: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
  degraded: {
    pill: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  down: {
    pill: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
  },
  unknown: {
    pill: "border-gray-200 bg-gray-50 text-gray-700",
    dot: "bg-gray-400",
  },
};

type HealthPreviewPillProps = {
  tone: PreviewHealthTone;
  label: string;
  detail?: string;
  compact?: boolean;
};

function HealthPreviewPill({
  tone,
  label,
  detail,
  compact = false,
}: HealthPreviewPillProps) {
  const style = PREVIEW_HEALTH_TONE_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} ${style.pill}`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${style.dot}`}
        aria-hidden="true"
      />
      <span>{label}</span>
      {detail ? (
        <span className={compact ? "hidden sm:inline" : "font-medium"}>
          {detail}
        </span>
      ) : null}
    </span>
  );
}

export default function CivIQ() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isActiveTab = (path: string) => normalizedPath === path;
  const [activeValueCard, setActiveValueCard] = useState<
    "public" | "staff" | "leadership"
  >("staff");
  const [hoveredWorkflowStep, setHoveredWorkflowStep] = useState<number | null>(
    null,
  );
  const [activeResidentBlock, setActiveResidentBlock] = useState(0);
  const [useCaseScenarioIndex, setUseCaseScenarioIndex] = useState(0);
  const [useCaseLanguage, setUseCaseLanguage] =
    useState<HeroLanguage>("English");
  const [useCaseMenuOpen, setUseCaseMenuOpen] = useState(false);
  const [useCaseLanguageMenuOpen, setUseCaseLanguageMenuOpen] = useState(false);
  const [useCaseExpanded, setUseCaseExpanded] = useState(false);
  const [selectedTopicType, setSelectedTopicType] = useState<string | null>(
    null,
  );
  const [topicTooltip, setTopicTooltip] = useState<TopicTooltip | null>(null);
  const [latencySelectedIndex, setLatencySelectedIndex] = useState<
    number | null
  >(null);
  const [heroScenarioIndex, setHeroScenarioIndex] = useState(0);
  const [showHeroAirAlert, setShowHeroAirAlert] = useState(true);
  const [heroTheme, setHeroTheme] = useState<HeroTheme>("light");
  const [heroLanguage, setHeroLanguage] = useState<HeroLanguage>("English");
  const [heroMenuOpen, setHeroMenuOpen] = useState(false);
  const [heroLanguageMenuOpen, setHeroLanguageMenuOpen] = useState(false);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [adminOversightView, setAdminOversightView] =
    useState<AdminOversightView>(0);
  const [heroLastInteractionAt, setHeroLastInteractionAt] = useState(() =>
    Date.now(),
  );
  const [useCaseLastInteractionAt, setUseCaseLastInteractionAt] = useState(() =>
    Date.now(),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroScenarioIndex(
        (current) => (current + 1) % heroChatScenarios.length,
      );
    }, 6200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUseCaseScenarioIndex(
        (current) => (current + 1) % useCaseDemoScenarios.length,
      );
    }, 12000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showHeroAirAlert) return;
    const timer = window.setTimeout(() => {
      setShowHeroAirAlert(false);
    }, 5600);
    return () => window.clearTimeout(timer);
  }, [showHeroAirAlert]);

  useEffect(() => {
    if (!topicTooltip) return;

    const dismiss = () => setTopicTooltip(null);
    document.addEventListener("click", dismiss);
    window.addEventListener("scroll", dismiss, true);

    return () => {
      document.removeEventListener("click", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [topicTooltip]);

  useEffect(() => {
    if (!heroMenuOpen && !heroLanguageMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".hero-chat-header-controls")) return;
      setHeroMenuOpen(false);
      setHeroLanguageMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHeroMenuOpen(false);
        setHeroLanguageMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [heroMenuOpen, heroLanguageMenuOpen]);

  useEffect(() => {
    if (!useCaseMenuOpen && !useCaseLanguageMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".usecase-chat-header-controls")) return;
      setUseCaseMenuOpen(false);
      setUseCaseLanguageMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUseCaseMenuOpen(false);
        setUseCaseLanguageMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [useCaseMenuOpen, useCaseLanguageMenuOpen]);

  const ctaButtonClass =
    "inline-block rounded-xl bg-[#17A2B8] px-10 py-4 text-lg font-bold text-white transition hover:bg-[#138496]";

  const workflowIcons = {
    extract: ScanSearch,
    ingest: DatabaseZap,
    answer: MessageSquareText,
    measure: BarChart3,
    improve: Wrench,
  } as const;
  const storyIcons = {
    link: Link2,
    globe: Globe2,
    clock: Clock3,
    shield: ShieldCheck,
    chart: TrendingUp,
  } as const;
  const latencySeries = mockLatencySeries;
  const latencyValues = latencySeries
    .map((point) =>
      typeof point.avg_duration_ms === "number" ? point.avg_duration_ms : null,
    )
    .filter((value): value is number => value !== null);
  const latencyMin = latencyValues.length ? Math.min(...latencyValues) : 0;
  const latencyMax = latencyValues.length ? Math.max(...latencyValues) : 0;
  const latencyRange = Math.max(latencyMax - latencyMin, 1);
  const latencyPolyline = latencySeries
    .map((point, index) => {
      const value =
        typeof point.avg_duration_ms === "number"
          ? point.avg_duration_ms
          : latencyMin;
      const x =
        latencySeries.length <= 1
          ? 0
          : (index / (latencySeries.length - 1)) * 100;
      const y = 100 - ((value - latencyMin) / latencyRange) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  const mockTotalQuestions = mockTopicCounts.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const mockAverageLatencyMs = latencyValues.length
    ? latencyValues.reduce((sum, value) => sum + value, 0) /
      latencyValues.length
    : 0;
  const mockTotalInvocations = latencySeries.reduce(
    (sum, point) => sum + point.invocations,
    0,
  );
  const mockTotalErrors = latencySeries.reduce(
    (sum, point) => sum + point.errors,
    0,
  );
  const mockSuccessRate = mockTotalInvocations
    ? ((mockTotalInvocations - mockTotalErrors) / mockTotalInvocations) * 100
    : 0;
  const mockEscalations = 27;
  const mockFailureSignals = 5;
  const mockSuggestedIntents = 8;
  const adminKpis = [
    {
      key: "total_questions",
      label: "Total Questions",
      value: `${mockTotalQuestions}`,
      subtext: "Last 30 days",
      tone: "from-teal-600 to-cyan-500",
    },
    {
      key: "avg_latency",
      label: "Avg Latency",
      value: `${mockAverageLatencyMs.toFixed(1)} ms`,
      subtext: "Chat router average",
      tone: "from-emerald-600 to-teal-500",
    },
    {
      key: "request_success",
      label: "Request Success",
      value: `${mockSuccessRate.toFixed(1)}%`,
      subtext: "Successful responses",
      tone: "from-indigo-600 to-violet-500",
    },
    {
      key: "escalations",
      label: "Escalations",
      value: `${mockEscalations}`,
      subtext: `${((mockEscalations / Math.max(mockTotalQuestions, 1)) * 100).toFixed(2)}% of questions`,
      tone: "from-amber-600 to-orange-500",
    },
    {
      key: "failure_signals",
      label: "Failure Signals",
      value: `${mockFailureSignals}`,
      subtext: `${((mockFailureSignals / Math.max(mockTotalQuestions, 1)) * 100).toFixed(2)}% of questions`,
      tone: "from-rose-600 to-red-500",
    },
    {
      key: "suggested_intents",
      label: "Suggested Intents",
      value: `${mockSuggestedIntents}`,
      subtext: "Auto-detected patterns",
      tone: "from-fuchsia-600 to-violet-500",
    },
  ] as const;
  const channelHealthPreview = [
    {
      component: "Chat Router",
      status: mockSuccessRate >= 99 ? "UP" : "DEGRADED",
      tone: mockSuccessRate >= 99 ? "up" : "degraded",
      detail: `${mockAverageLatencyMs.toFixed(1)} ms avg • ${mockTotalErrors} errors`,
    },
    {
      component: "Downstream Lambdas",
      status: mockFailureSignals <= 5 ? "UP" : "DEGRADED",
      tone: mockFailureSignals <= 5 ? "up" : "degraded",
      detail: "14 monitored • 0 failed update checks",
    },
    {
      component: "OpenSearch",
      status: "UP",
      tone: "up",
      detail: "1 node • 0 unassigned shards",
    },
  ] as const;
  const feedbackQueuePreview = [
    { id: "FB-1042", topic: "Billing dispute follow-up", age: "14m" },
    { id: "FB-1036", topic: "Permit citation mismatch", age: "32m" },
    { id: "FB-1031", topic: "Spanish response quality", age: "57m" },
  ] as const;
  const latencySelectedPoint =
    latencySelectedIndex !== null ? latencySeries[latencySelectedIndex] : null;
  const latencySelectedValue =
    latencySelectedPoint &&
    typeof latencySelectedPoint.avg_duration_ms === "number"
      ? latencySelectedPoint.avg_duration_ms
      : null;
  const latencySelectedX =
    latencySelectedIndex === null || latencySeries.length <= 1
      ? null
      : (latencySelectedIndex / (latencySeries.length - 1)) * 100;
  const latencySelectedY =
    latencySelectedValue === null || latencySelectedX === null
      ? null
      : 100 - ((latencySelectedValue - latencyMin) / latencyRange) * 100;

  const handleLatencyChartClick = (event: MouseEvent<SVGSVGElement>) => {
    if (latencySeries.length <= 1) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const rawIndex = Math.round(ratio * (latencySeries.length - 1));
    const clampedIndex = Math.max(
      0,
      Math.min(latencySeries.length - 1, rawIndex),
    );
    setLatencySelectedIndex(clampedIndex);
  };

  const formatTopicLabel = (value: string) => value.replace(/_/g, " ");
  const sortedTopicCounts = [...mockTopicCounts].sort(
    (a, b) => b.count - a.count,
  );
  const topTopic = sortedTopicCounts[0] || null;
  const topTopicPercent = topTopic
    ? (topTopic.count / Math.max(mockTotalQuestions, 1)) * 100
    : 0;
  const totalQueueItems = feedbackQueuePreview.length;
  const oldestQueueItemAge = feedbackQueuePreview.reduce((oldest, item) => {
    const currentMinutes = Number(item.age.replace(/[^0-9]/g, "")) || 0;
    const oldestMinutes = Number(oldest.replace(/[^0-9]/g, "")) || 0;
    return currentMinutes > oldestMinutes ? item.age : oldest;
  }, "0m");

  const oversightTotalRequests = oversightWeeklySeries.reduce(
    (sum, item) => sum + item.requests,
    0,
  );
  const oversightTotalEscalations = oversightWeeklySeries.reduce(
    (sum, item) => sum + item.escalations,
    0,
  );
  const oversightEscalationRate =
    (oversightTotalEscalations / Math.max(oversightTotalRequests, 1)) * 100;
  const oversightAverageUptime =
    oversightUptimeSeries.reduce((sum, item) => sum + item.uptime, 0) /
    Math.max(oversightUptimeSeries.length, 1);
  const oversightMaxRequests = Math.max(
    ...oversightWeeklySeries.map((item) => item.requests),
    1,
  );
  const oversightMaxEscalations = Math.max(
    ...oversightWeeklySeries.map((item) => item.escalations),
    1,
  );

  const frontOversightCards = [
    {
      title: "Latency Trend",
      detail: `${mockAverageLatencyMs.toFixed(1)} ms avg across ${latencySeries.length} datapoints.`,
      metric: `Range ${latencyMin.toFixed(1)}-${latencyMax.toFixed(1)} ms`,
    },
    {
      title: "Topic Distribution",
      detail: topTopic
        ? `${formatTopicLabel(topTopic.type)} leads resident demand.`
        : "Topic mix currently unavailable.",
      metric: topTopic
        ? `${topTopicPercent.toFixed(1)}% of total questions`
        : "-",
    },
    {
      title: "Channel + Queue Status",
      detail: `${channelHealthPreview.filter((item) => item.status === "UP").length}/${channelHealthPreview.length} core services currently healthy.`,
      metric: `${totalQueueItems} open feedback items • oldest ${oldestQueueItemAge}`,
    },
  ] as const;

  const backOversightCards = [
    {
      title: "Weekly Request Volume",
      detail: `${oversightWeeklySeries.length} day operational workload view.`,
      metric: `${oversightTotalRequests.toLocaleString()} requests`,
    },
    {
      title: "Escalation Rate",
      detail: "Escalations compared against total incoming requests.",
      metric: `${oversightEscalationRate.toFixed(2)}% escalation rate`,
    },
    {
      title: "Platform Uptime",
      detail: "Aggregate reliability across core assistant services.",
      metric: `${oversightAverageUptime.toFixed(2)}% average uptime`,
    },
  ] as const;
  const apiHealthSnapshotPreview = [
    {
      base: "https://mgq245mb03.execute-api.us-east-1.amazonaws.com",
      checkedAt: "2026-02-21T09:05:00.000Z",
      checks: [
        {
          id: "assistant_status",
          label: "Assistant",
          endpoint: "GET /admin/assistant-status",
          tone: "up",
          detail: "182ms",
        },
        {
          id: "chat_analytics",
          label: "Analytics",
          endpoint: "GET /admin/get_chat_analytics",
          tone: "up",
          detail: "205ms",
        },
        {
          id: "channel_health",
          label: "Channel Health",
          endpoint: "GET /admin/channel-health",
          tone: "up",
          detail: "164ms",
        },
        {
          id: "alarm_test",
          label: "Alarms",
          endpoint: "POST /admin/alarm/test",
          tone: "up",
          detail: "221ms",
        },
        {
          id: "prompt_config",
          label: "Prompt Config",
          endpoint: "POST /admin/prompt-config",
          tone: "up",
          detail: "246ms",
        },
      ],
    },
  ] as const;
  const apiHealthCheckTotal = apiHealthSnapshotPreview.reduce(
    (sum, snapshot) => sum + snapshot.checks.length,
    0,
  );
  const apiHealthCheckHealthy = apiHealthSnapshotPreview.reduce(
    (sum, snapshot) =>
      sum + snapshot.checks.filter((check) => check.tone === "up").length,
    0,
  );
  const thirdOversightCards = [
    {
      title: "Chat Prompt Controls",
      detail: "System prompt versioning, tone, and escalation guardrails.",
      metric: "Draft v12 ready for review",
    },
    {
      title: "Alarm Creation",
      detail: "Compose alert thresholds, cooldowns, and notification targets.",
      metric: "4 active alarms • 1 staged",
    },
    {
      title: "API Health Snapshot",
      detail: "Endpoint response health and recent error trend checks.",
      metric: `${apiHealthCheckHealthy}/${apiHealthCheckTotal} routes healthy`,
    },
  ] as const;
  const activeOversightCards =
    adminOversightView === 0
      ? frontOversightCards
      : adminOversightView === 1
        ? backOversightCards
        : thirdOversightCards;
  const adminOversightDescription =
    adminOversightView === 0
      ? "Run the city with signal, not guesswork."
      : adminOversightView === 1
        ? "Alternative operations view with additional console-style charts."
        : "Prompt controls, alarm creation, and API route health in one control pane.";
  const cycleAdminOversightView = () => {
    setAdminOversightView((current) =>
      current === 2 ? 0 : ((current + 1) as AdminOversightView),
    );
  };

  const topicTooltipStyle: CSSProperties | undefined = topicTooltip
    ? (() => {
        const maxWidth = 260;
        const offset = 12;
        const viewportW =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const viewportH =
          typeof window !== "undefined" ? window.innerHeight : 800;
        const left = Math.max(
          8,
          Math.min(topicTooltip.x + offset, viewportW - maxWidth - 8),
        );
        const top = Math.max(
          8,
          Math.min(topicTooltip.y + offset, viewportH - 72),
        );
        return { left, top, width: maxWidth };
      })()
    : undefined;
  const activeHeroScenario = heroChatScenarios[heroScenarioIndex];
  const activeUseCaseScenario = useCaseDemoScenarios[useCaseScenarioIndex];
  const useCaseScenarioIndexById = useCaseDemoScenarios.reduce<
    Record<string, number>
  >((acc, scenario, index) => {
    acc[scenario.id] = index;
    return acc;
  }, {});
  const markHeroSessionActive = () => setHeroLastInteractionAt(Date.now());
  const markUseCaseSessionActive = () =>
    setUseCaseLastInteractionAt(Date.now());
  const resetHeroPreviewSession = () => {
    setHeroScenarioIndex(0);
    setShowHeroAirAlert(true);
    setHeroMenuOpen(false);
    setHeroLanguageMenuOpen(false);
    setHeroExpanded(false);
  };
  const resetUseCasePreviewSession = () => {
    setUseCaseScenarioIndex(0);
    setUseCaseMenuOpen(false);
    setUseCaseLanguageMenuOpen(false);
    setUseCaseExpanded(false);
  };
  const startNewHeroConversation = () => {
    resetHeroPreviewSession();
    markHeroSessionActive();
  };
  const handleHeroLanguageSelect = (nextLanguage: HeroLanguage) => {
    setHeroLanguage(nextLanguage);
    setHeroScenarioIndex(0);
    setShowHeroAirAlert(false);
    setHeroLanguageMenuOpen(false);
    setHeroMenuOpen(false);
    markHeroSessionActive();
  };
  const startNewUseCaseConversation = () => {
    resetUseCasePreviewSession();
    markUseCaseSessionActive();
  };
  const handleUseCaseLanguageSelect = (nextLanguage: HeroLanguage) => {
    setUseCaseLanguage(nextLanguage);
    setUseCaseScenarioIndex(0);
    setUseCaseLanguageMenuOpen(false);
    setUseCaseMenuOpen(false);
    markUseCaseSessionActive();
  };
  const setUseCaseScenarioById = (scenarioId: string) => {
    const nextIndex = useCaseScenarioIndexById[scenarioId];
    if (typeof nextIndex !== "number") return;
    setUseCaseScenarioIndex(nextIndex);
    setUseCaseMenuOpen(false);
    setUseCaseLanguageMenuOpen(false);
    markUseCaseSessionActive();
  };
  const useCaseLeftRail = useCases.slice(0, 3);
  const useCaseRightRail = [useCases[3], useCases[4], useCases[5], useCases[6]];
  const renderUseCaseCard = (
    item: (typeof useCases)[number],
    className = "",
  ) => {
    const isActive = activeUseCaseScenario.id === item.scenarioId;
    return (
      <button
        key={item.title}
        type="button"
        onClick={() => setUseCaseScenarioById(item.scenarioId)}
        className={`${className} h-full rounded-xl border p-3.5 text-left transition ${
          isActive
            ? "border-[#17A2B8] bg-[#F0FBFD] shadow-[0_6px_18px_rgba(11,60,93,0.08)]"
            : "border-[#D9E2EC] bg-[#F8FBFF] hover:border-[#A9C8DA] hover:bg-white"
        }`}
      >
        <h3 className="mb-1 text-base font-bold text-[#0B3C5D]">
          {item.title}
        </h3>
        <p className="text-[13px] font-semibold text-[#364152]">
          {item.detail}
        </p>
        <p className="mt-2 text-[11px] font-semibold text-[#3E4C59]">
          Question: "{item.question}"
        </p>
      </button>
    );
  };

  useEffect(() => {
    const resetIdlePreviews = () => {
      const now = Date.now();

      if (now - heroLastInteractionAt >= PREVIEW_SESSION_TIMEOUT_MS) {
        resetHeroPreviewSession();
        setHeroLastInteractionAt(now);
      }

      if (now - useCaseLastInteractionAt >= PREVIEW_SESSION_TIMEOUT_MS) {
        resetUseCasePreviewSession();
        setUseCaseLastInteractionAt(now);
      }
    };

    const timer = window.setInterval(resetIdlePreviews, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetIdlePreviews();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [heroLastInteractionAt, useCaseLastInteractionAt]);
  const heroWindowHeightClass = heroExpanded
    ? "min-h-[580px] sm:min-h-[700px]"
    : "min-h-[500px] sm:min-h-[620px]";
  const useCaseWindowHeightClass = useCaseExpanded
    ? "min-h-[470px] sm:min-h-[530px]"
    : "min-h-[360px] sm:min-h-[420px]";
  const heroWindowWidthClass = heroExpanded ? "max-w-[420px]" : "max-w-[380px]";
  const heroIsLightTheme = heroTheme === "light";
  const heroShellClassName = heroIsLightTheme
    ? "border-[#CBD5E1] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]"
    : "border-[#9EDBE4]/45 bg-[#0F172A]/95 shadow-2xl";
  const heroHeaderClassName = heroIsLightTheme
    ? "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]"
    : "border-[#334155] bg-[#17A2B8] text-white";
  const heroHeaderAvatarClassName = heroIsLightTheme
    ? "bg-[#0B3C5D] text-white"
    : "bg-white text-[#0B3C5D]";
  const heroHeaderMetaClassName = heroIsLightTheme
    ? "text-[#64748B]"
    : "text-[#DFF7FA]";
  const heroHeaderControlButtonClassName = heroIsLightTheme
    ? "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#CBD5E1] bg-white text-[#0F172A] transition hover:bg-[#EEF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]"
    : "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/[0.08] text-white transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A]";
  const heroBodyClassName = heroIsLightTheme ? "bg-[#F8FAFC]" : "bg-[#111827]";
  const heroPromptBubbleClassName = heroIsLightTheme
    ? "border-[#CBD5E1] bg-white text-[#0F172A]"
    : "border-[#475569] bg-[#1F2937] text-[#E2E8F0]";
  const heroAnswerBubbleClassName = heroIsLightTheme
    ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#0F172A]"
    : "border-[#3B82F6]/30 bg-[#1E293B] text-[#E2E8F0]";

  return (
    <div className="civiq-page min-h-screen bg-gradient-to-b from-[#EAF1F7] via-[#F4F7FA] to-white text-[#1F2933]">
      <style>{`
        html { scroll-behavior: smooth; }
        .civiq-page .text-xs,
        .civiq-page .text-sm {
          font-weight: 600;
        }
        @keyframes howLineNodeIn {
          0% { opacity: 0; transform: scale(0.78); }
          70% { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes valueCardIn {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes howStepBadgeIn {
          0% { opacity: 0; transform: scale(0.82); }
          70% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heroChatSwap {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroAlertIn {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes oversightFlipFront {
          0% { opacity: 0; transform: perspective(1200px) rotateY(-92deg); }
          100% { opacity: 1; transform: perspective(1200px) rotateY(0deg); }
        }
        @keyframes oversightFlipBack {
          0% { opacity: 0; transform: perspective(1200px) rotateY(92deg); }
          100% { opacity: 1; transform: perspective(1200px) rotateY(0deg); }
        }
        @keyframes oversightFlipSide {
          0% { opacity: 0; transform: perspective(1200px) rotateX(-18deg) scale(0.98); }
          100% { opacity: 1; transform: perspective(1200px) rotateX(0deg) scale(1); }
        }
        .how-line-node {
          opacity: 1;
          transform: scale(1);
          transform-origin: center;
          animation: howLineNodeIn 560ms ease both;
        }
        .value-card {
          animation: valueCardIn 500ms ease both;
        }
        .cta-badge {
          animation: howLineNodeIn 700ms ease both;
        }
        .interactive-card {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
        }
        .interactive-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(11, 60, 93, 0.08);
        }
        .how-step-badge {
          animation: howStepBadgeIn 460ms ease both;
        }
        .how-step-card:hover .how-step-badge {
          transform: scale(1.06);
          transition: transform 160ms ease;
        }
        .how-line-node {
          cursor: pointer;
        }
        .hero-chat-swap {
          animation: heroChatSwap 320ms ease both;
        }
        .hero-alert-in {
          animation: heroAlertIn 260ms ease both;
        }
        .oversight-flip-front {
          animation: oversightFlipFront 520ms ease both;
          transform-origin: center;
        }
        .oversight-flip-back {
          animation: oversightFlipBack 520ms ease both;
          transform-origin: center;
        }
        .oversight-flip-side {
          animation: oversightFlipSide 520ms ease both;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .how-line-node,
          .value-card,
          .cta-badge,
          .how-step-badge,
          .hero-chat-swap,
          .hero-alert-in,
          .oversight-flip-front,
          .oversight-flip-back,
          .oversight-flip-side {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      {topicTooltip && (
        <div
          className="fixed z-[1000] pointer-events-none"
          style={topicTooltipStyle}
        >
          <div className="rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-gray-900">
              {formatTopicLabel(topicTooltip.type)}
            </p>
            <p className="text-xs text-gray-700">
              {topicTooltip.count} questions
            </p>
          </div>
        </div>
      )}

      <section
        id="overview"
        className="relative bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-10 sm:py-14"
      >
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
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
            <div className="relative left-1/2 mb-4 w-screen -translate-x-1/2 border-t border-[#D9E2EC]/40" />
            <div className="mt-8 sm:mt-10 md:mt-12">
              <h1 className="font-hero mb-7 text-3xl font-semibold leading-tight text-[#F4F7FA] sm:text-5xl md:text-6xl">
                Public service, reimagined.
              </h1>
              <p className="mx-auto mb-6 max-w-4xl text-base text-[#D9E2EC] sm:text-lg md:text-2xl">
                Always-on multilingual support grounded in official sources,
                guiding residents directly to the right action.
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
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
                <Link to="/contact" className={ctaButtonClass}>
                  Request a Demo
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-10 w-full max-w-[920px] sm:mt-12">
            <div
              className={`mx-auto flex w-full ${heroWindowWidthClass} ${heroWindowHeightClass} flex-col overflow-hidden rounded-2xl border ${heroShellClassName}`}
            >
              <div
                className={`flex items-center justify-between border-b px-3 py-2.5 ${heroHeaderClassName}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-extrabold ${heroHeaderAvatarClassName}`}
                  >
                    PV
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold">
                      Exodus Assistant
                    </p>
                    <p className={`text-[11px] ${heroHeaderMetaClassName}`}>
                      Online • Demo preview
                    </p>
                  </div>
                </div>
                <div className="hero-chat-header-controls relative flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      markHeroSessionActive();
                      setHeroLanguageMenuOpen((current) => !current);
                      setHeroMenuOpen(false);
                    }}
                    className={heroHeaderControlButtonClassName}
                    aria-haspopup="menu"
                    aria-expanded={heroLanguageMenuOpen}
                    aria-label={`Select language. Current ${heroLanguage}`}
                    title={`Language (${heroLanguage})`}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a14 14 0 0 1 0 18" />
                      <path d="M12 3a14 14 0 0 0 0 18" />
                    </svg>
                  </button>
                  {heroLanguageMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-[104px] top-[calc(100%+6px)] z-20 flex max-h-56 w-52 flex-col gap-1 overflow-y-auto rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-xl"
                    >
                      {heroChatLanguages.map((languageOption) => (
                        <button
                          key={languageOption}
                          type="button"
                          role="menuitemradio"
                          aria-checked={heroLanguage === languageOption}
                          onClick={() =>
                            handleHeroLanguageSelect(languageOption)
                          }
                          className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                            heroLanguage === languageOption
                              ? "border-[#0D9488] bg-[#CCFBF1] text-[#0F766E]"
                              : "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                          }`}
                        >
                          {languageOption}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      markHeroSessionActive();
                      setHeroExpanded((current) => !current);
                      setHeroLanguageMenuOpen(false);
                      setHeroMenuOpen(false);
                    }}
                    className={heroHeaderControlButtonClassName}
                    aria-pressed={heroExpanded}
                    aria-label={
                      heroExpanded
                        ? "Collapse preview chat"
                        : "Expand preview chat"
                    }
                    title={
                      heroExpanded
                        ? "Collapse preview chat"
                        : "Expand preview chat"
                    }
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M8 3H3v5" />
                      <path d="M3 3l6 6" />
                      <path d="M16 3h5v5" />
                      <path d="M21 3l-6 6" />
                      <path d="M8 21H3v-5" />
                      <path d="M3 21l6-6" />
                      <path d="M16 21h5v-5" />
                      <path d="M21 21l-6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markHeroSessionActive();
                      setHeroMenuOpen((current) => !current);
                      setHeroLanguageMenuOpen(false);
                    }}
                    className={heroHeaderControlButtonClassName}
                    aria-haspopup="menu"
                    aria-expanded={heroMenuOpen}
                    aria-label="Open preview chat menu"
                    title="Open preview chat menu"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="6" cy="12" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="18" cy="12" r="1.8" />
                    </svg>
                  </button>
                  {heroMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+6px)] z-10 flex w-48 flex-col gap-1 rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          startNewHeroConversation();
                          setHeroMenuOpen(false);
                        }}
                        className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs font-semibold transition hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                        role="menuitem"
                      >
                        New conversation
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          markHeroSessionActive();
                          setHeroTheme((current) =>
                            current === "dark" ? "light" : "dark",
                          );
                          setHeroMenuOpen(false);
                        }}
                        className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs font-semibold transition hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                        role="menuitem"
                      >
                        {heroIsLightTheme
                          ? "Switch to dark theme"
                          : "Switch to light theme"}
                      </button>
                      <p className="px-1 pt-1 text-[11px] font-semibold text-[#64748B]">
                        Language: {heroLanguage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`relative flex-1 overflow-y-auto px-3 pb-2 pt-3 sm:px-4 ${heroBodyClassName}`}
              >
                {showHeroAirAlert && (
                  <div className="hero-alert-in mb-3 flex items-start justify-between gap-3 rounded-lg border border-[#F6C453]/40 bg-[#FFF7CC] px-3 py-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8A5B11]">
                        Air Quality Alert
                      </p>
                      <p className="text-xs font-semibold text-[#5F370E] sm:text-sm">
                        AQI advisory active until 7:00 PM. Sensitive groups
                        should limit outdoor exertion.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHeroAirAlert(false)}
                      className="rounded border border-[#B7791F]/35 bg-white px-2 py-0.5 text-sm font-bold text-[#8A5B11] hover:bg-[#FFF2A8]"
                      aria-label="Dismiss air quality alert"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div
                    className={`max-w-[92%] rounded-xl rounded-bl-md border px-3 py-2 text-left text-[13px] font-semibold leading-[1.35] ${heroPromptBubbleClassName}`}
                  >
                    Hi, I can help with city services. What do you need today?
                  </div>

                  <div
                    key={activeHeroScenario.id}
                    className="hero-chat-swap space-y-2.5"
                  >
                    <div className="ml-auto max-w-[92%] rounded-xl rounded-br-md bg-[#1D4ED8] px-3 py-2 text-right text-[13px] font-semibold leading-[1.35] text-white sm:max-w-[84%]">
                      {activeHeroScenario.question}
                    </div>
                    <div
                      className={`max-w-[92%] rounded-xl rounded-bl-md border px-3 py-2 text-left text-[13px] font-semibold leading-[1.35] sm:max-w-[88%] ${heroAnswerBubbleClassName}`}
                    >
                      <p>{activeHeroScenario.answer}</p>
                      {activeHeroScenario.citations.length > 0 && (
                        <div
                          className={`mt-2 border-t pt-2 ${
                            heroIsLightTheme
                              ? "border-[#BFDBFE]/80"
                              : "border-[#475569]"
                          }`}
                        >
                          <p
                            className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                              heroIsLightTheme
                                ? "text-[#1E3A8A]"
                                : "text-[#BFDBFE]"
                            }`}
                          >
                            Citations
                          </p>
                          <ul
                            className={`mt-1 list-disc space-y-0.5 pl-4 text-[10px] font-semibold ${
                              heroIsLightTheme
                                ? "text-[#1E3A8A]"
                                : "text-[#E2E8F0]"
                            }`}
                          >
                            {activeHeroScenario.citations.map((citation) => (
                              <li key={`${activeHeroScenario.id}-${citation}`}>
                                {citation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link
                        to={activeHeroScenario.actionHref}
                        className={`mt-2 inline-block rounded-md border px-2.5 py-1 text-xs font-bold transition ${
                          heroIsLightTheme
                            ? "border-[#38BDF8]/50 bg-[#DBEAFE] text-[#1E3A8A] hover:bg-[#BFDBFE]"
                            : "border-[#67E8F9]/45 bg-[#0B3C5D] text-[#A5F3FC] hover:bg-[#0E7490]"
                        }`}
                      >
                        {activeHeroScenario.actionLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border-t px-3 pb-3 pt-2 sm:px-4 ${
                  heroIsLightTheme
                    ? "border-[#CBD5E1] bg-[#F8FAFC]"
                    : "border-[#334155] bg-[#0F172A]"
                }`}
              >
                <div
                  className={`mb-2 flex flex-wrap items-center gap-2 text-[11px] ${
                    heroIsLightTheme ? "text-[#475569]" : "text-[#94A3B8]"
                  }`}
                >
                  <Link
                    to="/demo/privacy"
                    className="underline underline-offset-2"
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/demo/terms"
                    className="underline underline-offset-2"
                  >
                    AI Disclosure
                  </Link>
                  <span>Sources appear as citations when available.</span>
                </div>
                <p
                  className={`text-[11px] font-semibold ${
                    heroIsLightTheme ? "text-[#64748B]" : "text-[#CBD5E1]"
                  }`}
                >
                  AI assistant disclosure: This assistant is automated and not a
                  human representative.
                </p>
                <p
                  className={`mt-1 text-[11px] ${
                    heroIsLightTheme ? "text-[#64748B]" : "text-[#94A3B8]"
                  }`}
                >
                  Session auto-resets after {PREVIEW_SESSION_TIMEOUT_LABEL} of
                  inactivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF1F7] py-8 sm:py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <h2 className="text-center text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Value for Residents, Staff, and Leadership
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveValueCard("public")}
            className={`value-card rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
              activeValueCard === "public"
                ? "border-2 border-[#17A2B8] shadow-md md:scale-[1.04]"
                : "border-[#D9E2EC]"
            }`}
            style={{ animationDelay: "40ms" }}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1F7] text-[#0B3C5D]">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What the Public Gets
            </h3>
            <p className="mb-3 text-base font-bold text-[#1F2933]">
              Fast, multilingual help with direct links to official forms and
              services.
            </p>
            <ul className="space-y-1 text-sm font-bold text-[#1F2933]">
              <li>24/7 availability</li>
              <li>Source-grounded answers</li>
              <li>Clear next steps</li>
            </ul>
          </button>
          <button
            type="button"
            onClick={() => setActiveValueCard("staff")}
            className={`value-card relative rounded-2xl border bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              activeValueCard === "staff"
                ? "border-2 border-[#17A2B8] shadow-md md:scale-[1.04]"
                : "border-[#D9E2EC]"
            }`}
            style={{ animationDelay: "120ms" }}
          >
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#F6C453]/60 bg-[#FFF7CC] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8A5B11]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Important
            </span>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1F7] text-[#0B3C5D]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What Staff Get
            </h3>
            <p className="mb-3 text-base font-bold text-[#1F2933]">
              Fewer repetitive calls and smarter routing without added
              headcount.
            </p>
            <ul className="space-y-1 text-sm font-bold text-[#1F2933]">
              <li>Reduced call volume</li>
              <li>Better escalations</li>
              <li>After-hours coverage</li>
            </ul>
          </button>
          <button
            type="button"
            onClick={() => setActiveValueCard("leadership")}
            className={`value-card rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
              activeValueCard === "leadership"
                ? "border-2 border-[#17A2B8] shadow-md md:scale-[1.04]"
                : "border-[#D9E2EC]"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1F7] text-[#0B3C5D]">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-[#0B3C5D]">
              What Leadership Gets
            </h3>
            <p className="mb-3 text-base font-bold text-[#1F2933]">
              Clear visibility into performance, savings, and service quality.
            </p>
            <ul className="space-y-1 text-sm font-bold text-[#1F2933]">
              <li>Calls deflected</li>
              <li>Hours saved</li>
              <li>Cost per interaction</li>
            </ul>
          </button>

          <div className="md:col-span-3 mt-1">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {adminKpis.map((kpi) => (
                <div
                  key={`value-kpi-${kpi.key}`}
                  className="rounded-xl border border-teal-200 bg-white p-2.5 text-center shadow-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#52606D]">
                    {kpi.label}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex w-full items-baseline justify-center rounded-lg bg-gradient-to-r ${kpi.tone} px-2 py-1 text-base font-extrabold text-white`}
                    >
                      {kpi.value}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-[#52606D]">
                    {kpi.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D9E2EC] bg-white py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#52606D] sm:text-base">
            Built For Public-Sector Trust
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] px-5 py-4 text-center">
              <p className="text-base font-bold text-[#0B3C5D] sm:text-lg">
                Pilot-Ready Deployment
              </p>
              <p className="mt-1 text-sm font-semibold text-[#364152] sm:text-base">
                Fast launch for city teams
              </p>
            </div>
            <div className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] px-5 py-4 text-center">
              <p className="text-base font-bold text-[#0B3C5D] sm:text-lg">
                Disclosure First
              </p>
              <p className="mt-1 text-sm font-semibold text-[#364152] sm:text-base">
                AI identification every session
              </p>
            </div>
            <div className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] px-5 py-4 text-center">
              <p className="text-base font-bold text-[#0B3C5D] sm:text-lg">
                Guardrails + Oversight
              </p>
              <p className="mt-1 text-sm font-semibold text-[#364152] sm:text-base">
                Operational controls built in
              </p>
            </div>
            <div className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] px-5 py-4 text-center">
              <p className="text-base font-bold text-[#0B3C5D] sm:text-lg">
                Audit-Ready Reporting
              </p>
              <p className="mt-1 text-sm font-semibold text-[#364152] sm:text-base">
                Exportable metrics for leadership
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-[#E6EEF5] sm:text-4xl">
            How It Works
          </h2>
          <div className="rounded-2xl border border-[#D9E2EC] bg-[#17A2B8] p-6 sm:p-8">
            <div className="relative md:hidden overflow-hidden">
              <svg
                viewBox="0 0 900 180"
                className="block h-[118px] w-full sm:h-[136px]"
                aria-hidden="true"
              >
                <path
                  d="M 0 84 C 80 108, 130 36, 225 62 C 320 90, 380 146, 485 118 C 595 90, 635 34, 745 78 C 820 108, 860 84, 900 74"
                  fill="none"
                  stroke="#D9E2EC"
                  strokeWidth="2.8"
                />
                <path
                  d="M 0 98 C 85 122, 135 50, 230 76 C 325 104, 387 162, 492 136 C 600 108, 640 48, 751 92 C 825 124, 865 98, 900 88"
                  fill="none"
                  stroke="#072F4F"
                  strokeWidth="2.6"
                />
                {[
                  { cx: 30, cy: 94, color: "white" },
                  { cx: 212, cy: 76, color: "teal" },
                  { cx: 400, cy: 124, color: "white" },
                  { cx: 592, cy: 84, color: "teal" },
                  { cx: 790, cy: 102, color: "white" },
                ].map((node, index) => (
                  <g
                    key={`workflow-node-mobile-${index}`}
                    className="how-line-node"
                    style={{ transitionDelay: `${index * 90}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Highlight step ${index + 1}`}
                    onMouseEnter={() => setHoveredWorkflowStep(index)}
                    onMouseLeave={() => setHoveredWorkflowStep(null)}
                    onFocus={() => setHoveredWorkflowStep(index)}
                    onBlur={() => setHoveredWorkflowStep(null)}
                  >
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="13"
                      fill={
                        hoveredWorkflowStep === index
                          ? "#FFFFFF"
                          : node.color === "white"
                            ? "#FFFFFF"
                            : "#22D3EE"
                      }
                      stroke={
                        hoveredWorkflowStep === index
                          ? "#0B3C5D"
                          : node.color === "white"
                            ? "#17A2B8"
                            : "#E6EEF5"
                      }
                      strokeWidth={hoveredWorkflowStep === index ? "4" : "3"}
                    />
                    <text
                      x={node.cx}
                      y={node.cy + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="900"
                      fill={node.color === "white" ? "#0B3C5D" : "#072F4F"}
                    >
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="relative hidden md:block">
              <svg
                viewBox="0 0 1000 240"
                className="h-[220px] w-full"
                aria-hidden="true"
              >
                <path
                  d="M 0 112 C 95 142, 140 44, 235 76 C 330 108, 390 188, 500 152 C 610 116, 650 40, 760 94 C 860 146, 910 98, 1000 84"
                  fill="none"
                  stroke="#D9E2EC"
                  strokeWidth="2.8"
                />
                <path
                  d="M 0 128 C 100 158, 150 58, 240 90 C 335 126, 400 206, 510 170 C 615 136, 655 54, 766 108 C 862 162, 912 114, 1000 100"
                  fill="none"
                  stroke="#072F4F"
                  strokeWidth="2.6"
                />
                {[
                  { cx: 70, cy: 124, color: "white" },
                  { cx: 250, cy: 90, color: "teal" },
                  { cx: 445, cy: 156, color: "white" },
                  { cx: 650, cy: 100, color: "teal" },
                  { cx: 850, cy: 132, color: "white" },
                ].map((node, index) => (
                  <g
                    key={`workflow-node-${index}`}
                    className="how-line-node"
                    style={{ transitionDelay: `${index * 90}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Highlight step ${index + 1}`}
                    onMouseEnter={() => setHoveredWorkflowStep(index)}
                    onMouseLeave={() => setHoveredWorkflowStep(null)}
                    onFocus={() => setHoveredWorkflowStep(index)}
                    onBlur={() => setHoveredWorkflowStep(null)}
                  >
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="14"
                      fill={
                        hoveredWorkflowStep === index
                          ? "#FFFFFF"
                          : node.color === "white"
                            ? "#FFFFFF"
                            : "#22D3EE"
                      }
                      stroke={
                        hoveredWorkflowStep === index
                          ? "#0B3C5D"
                          : node.color === "white"
                            ? "#17A2B8"
                            : "#E6EEF5"
                      }
                      strokeWidth={
                        hoveredWorkflowStep === index ? "4.4" : "3.2"
                      }
                    />
                    <text
                      x={node.cx}
                      y={node.cy + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="900"
                      fill={node.color === "white" ? "#0B3C5D" : "#072F4F"}
                    >
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-1 hidden md:grid grid-cols-5 gap-4 px-3">
            {workflow.map((item) => (
              <div
                key={`${item.step}-connector`}
                className="flex justify-center"
              >
                <span className="h-6 w-px bg-[#9EB6C9]/60" />
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-5">
            {workflow.map((item, index) => (
              <article
                key={item.step}
                className={`how-step-card rounded-xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                  hoveredWorkflowStep === index
                    ? "border-2 border-[#B7791F] bg-[#FFF7CC] shadow-xl ring-4 ring-[#F6C453]/45"
                    : "border-[#D9E2EC]"
                }`}
                onMouseEnter={() => setHoveredWorkflowStep(index)}
                onMouseLeave={() => setHoveredWorkflowStep(null)}
              >
                <div
                  className="how-step-badge mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0B3C5D] bg-[#F4F7FA] text-sm font-extrabold text-[#0B3C5D]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {index + 1}
                </div>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-[#1F2933]">
                  {(() => {
                    const Icon = workflowIcons[item.icon];
                    return (
                      <Icon
                        className="h-4 w-4 text-[#0B3C5D]"
                        aria-hidden="true"
                      />
                    );
                  })()}
                  <span>{item.step}</span>
                </h3>
                <p className="text-sm font-semibold leading-6 text-[#364152]">
                  {item.detail}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#0B3C5D]">
                  → {item.result}
                </p>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-4xl text-center text-lg font-semibold text-[#D9E2EC] sm:text-xl">
            From content ingestion to measurable ROI, CivIQ Guide turns city
            knowledge into always-on service delivery.
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Resident Experience
            </h2>
            <p className="mb-6 text-base font-semibold text-[#364152]">
              Improve access, clarity, and response time for the community.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {residentExperienceBlocks.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveResidentBlock(index)}
                  className={`interactive-card rounded-xl border p-4 text-left ${
                    index === activeResidentBlock
                      ? "border-[#17A2B8] bg-[#F0FBFD]"
                      : "border-[#D9E2EC] bg-[#F8FBFF]"
                  }`}
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
                  <p className="mt-1 text-sm font-semibold text-[#364152]">
                    {item.detail}
                  </p>
                  <p
                    className={`mt-2 text-xs font-semibold ${index === activeResidentBlock ? "text-[#0B3C5D]" : "text-[#3E4C59]"}`}
                  >
                    → {item.metric}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-7 sm:p-10">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
                Administration & Oversight
              </h2>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={cycleAdminOversightView}
                  className="rounded-full border border-[#B8CDD9] px-2.5 py-1 text-xs text-[#3E4C59] transition hover:border-[#17A2B8] hover:text-[#0B3C5D]"
                >
                  Flip {adminOversightView + 1}/3
                </button>
              </div>
            </div>
            <p className="mb-8 text-base font-semibold text-[#364152] sm:text-lg">
              {adminOversightDescription}
            </p>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {activeOversightCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-4 text-left"
                >
                  <h3 className="text-base font-bold text-[#0B3C5D] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#364152]">
                    {item.detail}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#3E4C59]">
                    → {item.metric}
                  </p>
                </div>
              ))}
            </div>

            {adminOversightView === 0 ? (
              <div className="oversight-flip-front grid grid-cols-1 gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  <div className="mb-3 rounded-xl border border-teal-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-600">
                          Chat Router Latency Trend
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          Click the line to inspect a datapoint.
                        </p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold text-teal-800">
                          {latencySeries.length}
                        </span>{" "}
                        points • period{" "}
                        <span className="font-semibold text-teal-800">
                          3600s
                        </span>{" "}
                        • min{" "}
                        <span className="font-semibold text-teal-800">
                          {latencyMin.toFixed(1)} ms
                        </span>{" "}
                        • max{" "}
                        <span className="font-semibold text-teal-800">
                          {latencyMax.toFixed(1)} ms
                        </span>
                      </div>
                    </div>

                    {latencySeries.length > 1 ? (
                      <>
                        <div className="mt-3 h-40 w-full rounded-xl border border-teal-100 bg-teal-50 p-3">
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="w-full h-full cursor-pointer"
                            onClick={handleLatencyChartClick}
                            role="img"
                            aria-label="Chat router latency timeseries chart"
                          >
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.25"
                              className="text-teal-700"
                              points={latencyPolyline}
                            />
                            {latencySelectedX !== null &&
                              latencySelectedY !== null && (
                                <>
                                  <circle
                                    cx={latencySelectedX}
                                    cy={latencySelectedY}
                                    r="2.75"
                                    className="text-teal-700"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx={latencySelectedX}
                                    cy={latencySelectedY}
                                    r="6.5"
                                    className="text-teal-700/20"
                                    fill="currentColor"
                                  />
                                </>
                              )}
                          </svg>
                        </div>

                        {latencySelectedPoint ? (
                          <div className="mt-3 rounded-lg border border-teal-100 bg-white px-3 py-2 text-xs text-gray-700">
                            <span className="font-semibold text-teal-800">
                              {typeof latencySelectedPoint.avg_duration_ms ===
                              "number"
                                ? `${latencySelectedPoint.avg_duration_ms.toFixed(1)} ms`
                                : "-"}
                            </span>{" "}
                            at{" "}
                            <span className="font-semibold">
                              {new Date(
                                latencySelectedPoint.timestamp,
                              ).toLocaleString()}
                            </span>
                            {typeof latencySelectedPoint.invocations ===
                            "number" ? (
                              <>
                                {" "}
                                • invocations{" "}
                                <span className="font-semibold">
                                  {latencySelectedPoint.invocations}
                                </span>
                              </>
                            ) : null}
                            {typeof latencySelectedPoint.errors === "number" ? (
                              <>
                                {" "}
                                • errors{" "}
                                <span className="font-semibold">
                                  {latencySelectedPoint.errors}
                                </span>
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-gray-600">
                            Tip: click anywhere on the line to see the nearest
                            value.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-gray-600">
                        Not enough datapoints yet for charting.
                      </p>
                    )}

                    <h3 className="mt-5 text-2xl font-bold text-teal-800">
                      Latency
                    </h3>
                    <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Channel Health
                      </p>
                      <div className="mt-2 space-y-2">
                        {channelHealthPreview.map((row) => (
                          <div
                            key={row.component}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/70 bg-white px-2.5 py-2"
                          >
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {row.component}
                              </p>
                              <p className="text-[11px] text-gray-600">
                                {row.detail}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                row.tone === "up"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-teal-100 bg-white p-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Feedback Queue
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {feedbackQueuePreview.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-md border border-gray-100 px-2.5 py-2"
                          >
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {item.id}
                              </p>
                              <p className="text-[11px] text-gray-600">
                                {item.topic}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold text-teal-800">
                              {item.age}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  {(() => {
                    const raw = mockTopicCounts;
                    const cleaned = raw
                      .filter((item) => item && typeof item.count === "number")
                      .map((item) => ({
                        type: String(item.type || "other"),
                        count: Math.max(0, Number(item.count) || 0),
                      }))
                      .filter((item) => item.count > 0);

                    const total = cleaned.reduce(
                      (sum, item) => sum + item.count,
                      0,
                    );
                    if (!total) return null;

                    const palette = [
                      "#0ea5a4",
                      "#2563eb",
                      "#7c3aed",
                      "#f59e0b",
                      "#ef4444",
                      "#10b981",
                      "#06b6d4",
                      "#d946ef",
                      "#84cc16",
                      "#f97316",
                      "#0ea5e9",
                      "#64748b",
                    ];

                    const sorted = [...cleaned].sort(
                      (a, b) => b.count - a.count,
                    );
                    const segments = sorted;

                    const fmtLabel = (v: string) => v.replace(/_/g, " ");
                    const round1 = (v: number) => Math.round(v * 10) / 10;

                    const cx = 50;
                    const cy = 50;
                    const r = 48;
                    const innerR = 28;

                    const polar = (angleDeg: number, radius: number) => {
                      const rad = ((angleDeg - 90) * Math.PI) / 180;
                      return {
                        x: cx + radius * Math.cos(rad),
                        y: cy + radius * Math.sin(rad),
                      };
                    };

                    const arcPath = (startAngle: number, endAngle: number) => {
                      const start = polar(endAngle, r);
                      const end = polar(startAngle, r);
                      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                      return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
                    };

                    let angle = 0;
                    const slices = segments.map((seg, idx) => {
                      const value = seg.count;
                      const sweep = (value / total) * 360;
                      const startAngle = angle;
                      const endAngle = angle + sweep;
                      angle = endAngle;
                      return {
                        ...seg,
                        startAngle,
                        endAngle,
                        color: palette[idx % palette.length],
                        percent: (value / total) * 100,
                        path: arcPath(startAngle, endAngle),
                      };
                    });

                    const selectedSlice = selectedTopicType
                      ? (slices.find((s) => s.type === selectedTopicType) ??
                        null)
                      : null;
                    const selectedLabel = selectedSlice
                      ? fmtLabel(selectedSlice.type)
                      : "";
                    const selectedLabelShort =
                      selectedLabel.length > 14
                        ? `${selectedLabel.slice(0, 14)}...`
                        : selectedLabel;

                    return (
                      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <h3 className="text-xl font-bold text-teal-800">
                            Topic Distribution
                          </h3>
                          <div className="text-right">
                            {selectedSlice ? (
                              <div className="text-xs text-gray-700 space-y-0.5">
                                <p>
                                  <span className="text-gray-500">Topic:</span>{" "}
                                  <span className="font-semibold text-teal-800">
                                    {fmtLabel(selectedSlice.type)}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Questions:
                                  </span>{" "}
                                  <span className="font-semibold text-teal-800">
                                    {selectedSlice.count}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Percent of{" "}
                                <span className="font-semibold text-teal-800">
                                  {total}
                                </span>{" "}
                                questions
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTopicType(null);
                                setTopicTooltip(null);
                              }}
                              className={`mt-1 text-[11px] font-semibold ${
                                selectedSlice
                                  ? "text-teal-700 hover:text-teal-900 underline underline-offset-2"
                                  : "text-gray-400 cursor-default"
                              }`}
                              disabled={!selectedSlice}
                            >
                              Clear selection
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-center">
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full max-w-[980px] aspect-square"
                              role="img"
                              aria-label="Topic distribution donut chart"
                            >
                              {slices.map((s) => (
                                <path
                                  key={s.type}
                                  d={s.path}
                                  fill={s.color}
                                  className="cursor-pointer transition-opacity"
                                  style={{
                                    opacity:
                                      selectedTopicType &&
                                      selectedTopicType !== s.type
                                        ? 0.35
                                        : 1,
                                  }}
                                  stroke="rgba(255,255,255,0.95)"
                                  strokeWidth={
                                    selectedTopicType === s.type ? "1.2" : "0.6"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTopicType((current) =>
                                      current === s.type ? null : s.type,
                                    );
                                    setTopicTooltip({
                                      x: e.clientX,
                                      y: e.clientY,
                                      type: s.type,
                                      count: s.count,
                                    });
                                  }}
                                />
                              ))}
                              <circle cx={cx} cy={cy} r={innerR} fill="white" />
                              <text
                                x={cx}
                                y={cy - 1}
                                textAnchor="middle"
                                className="fill-gray-900"
                                fontSize="9"
                                fontWeight="700"
                              >
                                {selectedSlice ? selectedSlice.count : total}
                              </text>
                              <text
                                x={cx}
                                y={cy + 10}
                                textAnchor="middle"
                                className="fill-gray-600"
                                fontSize="6.5"
                                fontWeight="600"
                              >
                                {selectedSlice
                                  ? selectedLabelShort
                                  : "questions"}
                              </text>
                            </svg>
                          </div>

                          <div className="space-y-2">
                            {slices.map((s) => (
                              <button
                                type="button"
                                key={`legend-${s.type}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTopicType((current) =>
                                    current === s.type ? null : s.type,
                                  );
                                  setTopicTooltip({
                                    x: e.clientX,
                                    y: e.clientY,
                                    type: s.type,
                                    count: s.count,
                                  });
                                }}
                                className={`flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2 text-left transition ${
                                  selectedTopicType === s.type
                                    ? "border-teal-200 bg-white shadow-sm"
                                    : "border-white/60 bg-white/70 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="h-3 w-3 rounded-sm"
                                    style={{ backgroundColor: s.color }}
                                  />
                                  <span className="text-sm font-semibold text-gray-800 whitespace-normal break-words">
                                    {fmtLabel(s.type)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  <span className="font-semibold">
                                    {round1(s.percent)}%
                                  </span>{" "}
                                  <span className="text-gray-500">
                                    ({s.count})
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </article>
              </div>
            ) : adminOversightView === 1 ? (
              <div className="oversight-flip-back grid grid-cols-1 gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  <div className="rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-teal-800">
                        Weekly Request Volume
                      </h3>
                      <p className="text-sm font-semibold text-gray-700">
                        {oversightTotalRequests.toLocaleString()} total requests
                      </p>
                    </div>
                    <div className="space-y-2">
                      {oversightWeeklySeries.map((row) => (
                        <div key={`weekly-${row.label}`} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{row.label}</span>
                            <span>{row.requests.toLocaleString()}</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full border border-teal-100 bg-[#ECFEFF]">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500"
                              style={{
                                width: `${Math.max(6, (row.requests / oversightMaxRequests) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-base font-bold text-teal-800">
                        Escalation Trend
                      </h4>
                      <span className="text-xs font-semibold text-gray-700">
                        {oversightEscalationRate.toFixed(2)}% weekly rate
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {oversightWeeklySeries.map((row) => (
                        <div
                          key={`escalation-${row.label}`}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="relative h-20 w-full rounded border border-amber-100 bg-[#FFFBEB]">
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded-b bg-gradient-to-t from-amber-500 to-orange-400"
                              style={{
                                height: `${Math.max(8, (row.escalations / oversightMaxEscalations) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-700">
                            {row.escalations}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500">
                            {row.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  <div className="rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-teal-800">
                        Service Uptime
                      </h3>
                      <span className="text-xs font-semibold text-gray-700">
                        {oversightAverageUptime.toFixed(2)}% avg
                      </span>
                    </div>
                    <div className="space-y-3">
                      {oversightUptimeSeries.map((item) => (
                        <div key={item.component}>
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.component}</span>
                            <span>{item.uptime.toFixed(2)}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full border border-emerald-100 bg-[#ECFDF5]">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              style={{
                                width: `${Math.max(6, item.uptime)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <h4 className="mb-2 text-base font-bold text-teal-800">
                      Confidence Mix
                    </h4>
                    <p className="mb-3 text-xs font-semibold text-gray-700">
                      Distribution of high, medium, and low confidence answers.
                    </p>
                    <div className="space-y-2.5">
                      {oversightConfidenceMix.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.label}</span>
                            <span>{item.value}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full border border-gray-100 bg-gray-50">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${Math.max(4, item.value)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            ) : (
              <div className="oversight-flip-side grid grid-cols-1 gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  <div className="rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-teal-800">
                        Chat Prompt Configuration
                      </h3>
                      <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                        Draft v12
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Prompt controls mirror the admin console and guide tone,
                      escalation behavior, and citation requirements.
                    </p>
                    <div className="mt-3 rounded-lg border border-teal-100 bg-[#F8FBFF] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                        System Prompt
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        You are CivIQ Guide. Answer with city policy links, keep
                        responses concise, avoid speculation, and escalate when
                        confidence is low or policy risk is high.
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-md border border-teal-100 bg-[#F0FDFA] px-3 py-2 text-xs font-semibold text-teal-800">
                        Concise Mode: ON
                      </div>
                      <div className="rounded-md border border-teal-100 bg-[#F0FDFA] px-3 py-2 text-xs font-semibold text-teal-800">
                        Citations Required: ON
                      </div>
                      <div className="rounded-md border border-amber-100 bg-[#FFFBEB] px-3 py-2 text-xs font-semibold text-amber-800">
                        Low Confidence Escalation: Enabled
                      </div>
                      <div className="rounded-md border border-indigo-100 bg-[#EEF2FF] px-3 py-2 text-xs font-semibold text-indigo-800">
                        Language Guardrails: 8 locales
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-teal-100 bg-white p-3">
                      <p className="text-xs font-semibold text-gray-800">
                        Prompt test
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        Resident prompt: &quot;How do I apply for a garage sale
                        permit?&quot;
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        Result: high-confidence answer, 2 citations, no
                        escalation.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-teal-800">
                        Alarm Creation
                      </h4>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Staged Rule
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-gray-700 sm:grid-cols-2">
                      {[
                        {
                          label: "Alarm Name",
                          value: "Latency Spike > 500 ms",
                        },
                        { label: "Component", value: "chat_router" },
                        { label: "Threshold", value: "500 ms for 5 min" },
                        { label: "Cooldown", value: "15 minutes" },
                        { label: "Notify", value: "ops@city.gov + Teams" },
                        {
                          label: "Escalation",
                          value: "Create ticket if repeated",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-md border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-800">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                        Save Alarm Draft
                      </span>
                      <span className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">
                        Send Test Alarm
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <h4 className="text-base font-bold text-teal-800">
                      Integrations
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-gray-700">
                      Connected services available in the admin console for
                      alerting and ticket workflows.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "Jira",
                        "ServiceNow",
                        "Microsoft Teams",
                        "Email Notifications",
                        "OpenSearch Health",
                        "OpenAI API",
                      ].map((name) => (
                        <span
                          key={name}
                          className="rounded-full border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-1 text-xs font-semibold text-[#0B3C5D]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                  <div className="rounded-lg border border-teal-100 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-teal-800">
                        API Health Snapshot
                      </h3>
                      <span className="text-xs font-semibold text-gray-700">
                        {apiHealthCheckHealthy}/{apiHealthCheckTotal} healthy
                        checks
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-gray-700">
                      Endpoint status rollup per configured API base.
                    </p>
                    <div className="space-y-3">
                      {apiHealthSnapshotPreview.map((snapshot) => {
                        const totalChecks = snapshot.checks.length;
                        const okCount = snapshot.checks.filter(
                          (check) => check.tone === "up",
                        ).length;
                        const snapshotTone: PreviewHealthTone =
                          okCount === totalChecks
                            ? "up"
                            : okCount === 0
                              ? "down"
                              : "degraded";
                        return (
                          <div
                            key={snapshot.base}
                            className="rounded-lg border border-[#D9E2EC] bg-[#F8FBFF] p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold text-gray-800">
                                  {snapshot.base}
                                </p>
                                <HealthPreviewPill
                                  tone={snapshotTone}
                                  label={`${okCount}/${totalChecks} OK`}
                                  detail="Last check"
                                  compact
                                />
                              </div>
                              <p className="text-[11px] text-gray-600">
                                Last checked:{" "}
                                {new Date(snapshot.checkedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {snapshot.checks.map((check) => (
                                <div
                                  key={check.id}
                                  className="rounded-md border border-[#D9E2EC] bg-white px-2.5 py-2"
                                >
                                  <p className="text-xs font-semibold text-gray-800">
                                    {check.label}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-gray-600">
                                    {check.endpoint}
                                  </p>
                                  <div className="mt-1.5">
                                    <HealthPreviewPill
                                      tone={check.tone}
                                      label={
                                        check.tone === "up"
                                          ? "UP"
                                          : check.tone === "down"
                                            ? "DOWN"
                                            : "DEGRADED"
                                      }
                                      detail={check.detail}
                                      compact
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <h4 className="text-base font-bold text-teal-800">
                      Channel Health Cross-Check
                    </h4>
                    <div className="mt-2 space-y-2">
                      {channelHealthPreview.map((row) => (
                        <div
                          key={`ops-health-${row.component}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              {row.component}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              {row.detail}
                            </p>
                          </div>
                          <HealthPreviewPill
                            tone={row.tone}
                            label={row.status}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-100 bg-white p-4">
                    <h4 className="text-base font-bold text-teal-800">
                      Recent API Events
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-md border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">
                          09:42 AM • Alarm test notification delivered
                        </p>
                        <p className="text-[11px] text-gray-600">
                          Rule: Latency Spike &gt; 500 ms • Channel: Teams +
                          email
                        </p>
                      </div>
                      <div className="rounded-md border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">
                          09:21 AM • Prompt draft saved
                        </p>
                        <p className="text-[11px] text-gray-600">
                          Added escalation note for compliance-sensitive
                          questions.
                        </p>
                      </div>
                      <div className="rounded-md border border-[#D9E2EC] bg-[#F8FBFF] px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">
                          09:05 AM • API health check complete
                        </p>
                        <p className="text-[11px] text-gray-600">
                          0 degraded endpoints detected in latest polling cycle.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-center text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Use Cases
            </h2>
            <p className="mb-5 text-center text-base font-semibold text-[#364152]">
              Common workflows cities can launch quickly with CivIQ Guide.
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(360px,500px)_minmax(220px,1fr)] lg:grid-rows-[auto_auto] lg:items-center">
              <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
                {useCaseLeftRail.map((item) => renderUseCaseCard(item))}
              </div>

              <aside className="mx-auto h-full w-full max-w-[560px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
                <div
                  className={`mx-auto flex h-full w-full max-w-[500px] ${useCaseWindowHeightClass} flex-col overflow-hidden rounded-2xl border border-[#9EDBE4]/45 bg-[#0F172A]/95 shadow-2xl`}
                >
                  <div className="flex items-center justify-between border-b border-[#334155] bg-[#17A2B8] px-3 py-2.5 text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white font-extrabold text-[#0B3C5D]">
                        PV
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-semibold">
                          Exodus Assistant
                        </p>
                        <p className="text-[11px] text-[#DFF7FA]">
                          Online • Use-case preview
                        </p>
                      </div>
                    </div>
                    <div className="usecase-chat-header-controls relative flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          markUseCaseSessionActive();
                          setUseCaseLanguageMenuOpen((current) => !current);
                          setUseCaseMenuOpen(false);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/[0.08] text-white transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A]"
                        aria-haspopup="menu"
                        aria-expanded={useCaseLanguageMenuOpen}
                        aria-label={`Select language. Current ${useCaseLanguage}`}
                        title={`Language (${useCaseLanguage})`}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18" />
                          <path d="M12 3a14 14 0 0 1 0 18" />
                          <path d="M12 3a14 14 0 0 0 0 18" />
                        </svg>
                      </button>
                      {useCaseLanguageMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-[104px] top-[calc(100%+6px)] z-20 flex max-h-56 w-52 flex-col gap-1 overflow-y-auto rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-xl"
                        >
                          {heroChatLanguages.map((languageOption) => (
                            <button
                              key={`usecase-language-${languageOption}`}
                              type="button"
                              role="menuitemradio"
                              aria-checked={useCaseLanguage === languageOption}
                              onClick={() =>
                                handleUseCaseLanguageSelect(languageOption)
                              }
                              className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                                useCaseLanguage === languageOption
                                  ? "border-[#0D9488] bg-[#CCFBF1] text-[#0F766E]"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                              }`}
                            >
                              {languageOption}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          markUseCaseSessionActive();
                          setUseCaseExpanded((current) => !current);
                          setUseCaseLanguageMenuOpen(false);
                          setUseCaseMenuOpen(false);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/[0.08] text-white transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A]"
                        aria-pressed={useCaseExpanded}
                        aria-label={
                          useCaseExpanded
                            ? "Collapse use-case preview chat"
                            : "Expand use-case preview chat"
                        }
                        title={
                          useCaseExpanded
                            ? "Collapse use-case preview chat"
                            : "Expand use-case preview chat"
                        }
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 3H3v5" />
                          <path d="M3 3l6 6" />
                          <path d="M16 3h5v5" />
                          <path d="M21 3l-6 6" />
                          <path d="M8 21H3v-5" />
                          <path d="M3 21l6-6" />
                          <path d="M16 21h5v-5" />
                          <path d="M21 21l-6-6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          markUseCaseSessionActive();
                          setUseCaseMenuOpen((current) => !current);
                          setUseCaseLanguageMenuOpen(false);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/[0.08] text-white transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A]"
                        aria-haspopup="menu"
                        aria-expanded={useCaseMenuOpen}
                        aria-label="Open use-case preview chat menu"
                        title="Open use-case preview chat menu"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="6" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="18" cy="12" r="1.8" />
                        </svg>
                      </button>
                      {useCaseMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-[calc(100%+6px)] z-10 flex w-48 flex-col gap-1 rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-xl"
                        >
                          <button
                            type="button"
                            onClick={startNewUseCaseConversation}
                            className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs font-semibold transition hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                            role="menuitem"
                          >
                            New conversation
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              markUseCaseSessionActive();
                              setUseCaseScenarioIndex(
                                (current) =>
                                  (current + 1) % useCaseDemoScenarios.length,
                              );
                              setUseCaseMenuOpen(false);
                              setUseCaseLanguageMenuOpen(false);
                            }}
                            className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs font-semibold transition hover:border-[#94A3B8] hover:bg-[#EEF2FF]"
                            role="menuitem"
                          >
                            Next use case
                          </button>
                          <p className="px-1 pt-1 text-[11px] font-semibold text-[#64748B]">
                            Language: {useCaseLanguage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-y-auto bg-[#111827] px-3 pb-2 pt-3 sm:px-4">
                    <div className="space-y-2.5">
                      <div className="max-w-[92%] rounded-xl rounded-bl-md border border-[#475569] bg-[#1F2937] px-3 py-2 text-left text-[13px] font-semibold leading-[1.35] text-[#E2E8F0]">
                        I can help with core city services. What do you need
                        today?
                      </div>

                      <div
                        key={activeUseCaseScenario.id}
                        className="hero-chat-swap space-y-2.5"
                      >
                        <div className="ml-auto max-w-[92%] rounded-xl rounded-br-md bg-[#1D4ED8] px-3 py-2 text-right text-[13px] font-semibold leading-[1.35] text-white sm:max-w-[84%]">
                          {activeUseCaseScenario.question}
                        </div>
                        <div className="max-w-[92%] rounded-xl rounded-bl-md border border-[#3B82F6]/30 bg-[#1E293B] px-3 py-2 text-left text-[13px] font-semibold leading-[1.35] text-[#E2E8F0] sm:max-w-[88%]">
                          <p>{activeUseCaseScenario.answer}</p>
                          {activeUseCaseScenario.citations.length > 0 && (
                            <div className="mt-2 border-t border-[#475569] pt-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#BFDBFE]">
                                Citations
                              </p>
                              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] font-semibold text-[#E2E8F0]">
                                {activeUseCaseScenario.citations.map(
                                  (citation) => (
                                    <li
                                      key={`${activeUseCaseScenario.id}-${citation}`}
                                    >
                                      {citation}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                          <Link
                            to={activeUseCaseScenario.actionHref}
                            className="mt-2 inline-block rounded-md border border-[#67E8F9]/45 bg-[#0B3C5D] px-2.5 py-1 text-xs font-bold text-[#A5F3FC] transition hover:bg-[#0E7490]"
                          >
                            {activeUseCaseScenario.actionLabel}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#334155] bg-[#0F172A] px-3 pb-3 pt-2 sm:px-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
                      <Link
                        to="/demo/privacy"
                        className="underline underline-offset-2"
                      >
                        Privacy
                      </Link>
                      <Link
                        to="/demo/terms"
                        className="underline underline-offset-2"
                      >
                        AI Disclosure
                      </Link>
                      <span>Answers cite city sources when available.</span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#CBD5E1]">
                      Demo preview includes {useCaseDemoScenarios.length} common
                      resident intents. Residents can also type their own
                      message in the live chat widget.
                    </p>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">
                      Session auto-resets after {PREVIEW_SESSION_TIMEOUT_LABEL}{" "}
                      of inactivity.
                    </p>
                  </div>
                </div>
              </aside>

              <div className="flex flex-col gap-3 lg:col-start-3 lg:row-start-1">
                {useCaseRightRail.map((item) => renderUseCaseCard(item))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Knowledge & Safety Layer
            </h2>
            <p className="mb-6 text-base font-semibold text-[#364152]">
              Keep answers current, controlled, and auditable with operational
              safeguards built into the platform.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <RefreshCw
                    className="h-5 w-5 text-[#17A2B8]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Knowledge Freshness
                </h3>
                <p className="text-sm font-semibold text-[#364152]">
                  Track last crawl and ingest activity, document counts, and
                  stale-content warnings so the assistant stays aligned with
                  current policy.
                </p>
              </article>
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <ShieldAlert
                    className="h-5 w-5 text-[#17A2B8]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Guardrail Monitoring
                </h3>
                <p className="text-sm font-semibold text-[#364152]">
                  Monitor escalations, refusals, and flagged responses to
                  identify risk patterns and improve policy-safe behavior.
                </p>
              </article>
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <MessagesSquare
                    className="h-5 w-5 text-[#17A2B8]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Feedback-to-Improvement Loop
                </h3>
                <p className="text-sm font-semibold text-[#364152]">
                  Route not-helpful and flagged answers into a review queue so
                  teams can mark fixes and steadily raise answer quality.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              Security, Privacy & Trust Posture
            </h2>
            <p className="mb-2 text-base font-semibold text-[#364152]">
              Built for public-sector accountability with concrete controls for
              data handling, access, infrastructure, and governance.
            </p>
            <p className="mb-6 text-sm font-semibold text-[#364152]">
              Formal compliance certifications are on the product roadmap as
              deployments expand.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <Eye className="h-5 w-5 text-[#17A2B8]" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Data Handling
                </h3>
                <ul className="space-y-2 text-[17px] font-extrabold leading-relaxed text-[#1F2933] sm:text-lg">
                  <li>
                    Conversations can be logged for quality and oversight
                    workflows.
                  </li>
                  <li>Agencies control data retention policies.</li>
                  <li>No training on resident data.</li>
                </ul>
              </article>
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <Lock className="h-5 w-5 text-[#17A2B8]" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Access Model
                </h3>
                <ul className="space-y-2 text-[17px] font-extrabold leading-relaxed text-[#1F2933] sm:text-lg">
                  <li>Role-based admin access controls.</li>
                  <li>
                    Permissioned operations for sensitive actions and
                    configuration.
                  </li>
                  <li>
                    Support for authenticated workflow alignment as deployments
                    mature.
                  </li>
                </ul>
              </article>
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <ShieldCheck
                    className="h-5 w-5 text-[#17A2B8]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Infrastructure
                </h3>
                <ul className="space-y-2 text-[17px] font-extrabold leading-relaxed text-[#1F2933] sm:text-lg">
                  <li>Hosted in secure cloud environments.</li>
                  <li>Encrypted in transit.</li>
                  <li>Encrypted at rest.</li>
                </ul>
              </article>
              <article className="rounded-xl border border-[#D9E2EC] bg-[#F8FBFF] p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF9FB] text-[#0B3C5D]">
                  <FileCheck2
                    className="h-5 w-5 text-[#17A2B8]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0B3C5D]">
                  Governance
                </h3>
                <ul className="space-y-2 text-[17px] font-extrabold leading-relaxed text-[#1F2933] sm:text-lg">
                  <li>
                    Human escalation pathways for complex or sensitive issues.
                  </li>
                  <li>
                    Audit visibility for operational and leadership review.
                  </li>
                  <li>
                    Assistant can be disabled immediately by authorized staff.
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-gradient-to-r from-[#072F4F] via-[#0B3C5D] to-[#7FA8C4] py-8 sm:mt-10 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 text-center sm:p-8">
            <div className="cta-badge mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFE9EE] bg-[#EAF9FB] px-4 py-2 text-sm font-semibold text-[#0B3C5D]">
              <Sparkles className="h-4 w-4 text-[#17A2B8]" aria-hidden="true" />
              <span>Live Platform Preview</span>
            </div>
            <h2 className="mb-3 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
              See CivIQ Guide in Action
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-base font-semibold text-[#364152] sm:text-lg">
              See how your community can get faster, clearer answers while your
              teams gain measurable operational relief.
            </p>
            <Link to="/contact" className={ctaButtonClass}>
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      <CiviqFooter />
    </div>
  );
}
