import { useEffect, useRef, useState } from "react";

const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");
const API_BASES: string[] = String(
  import.meta.env.VITE_CHATBOT_API_BASES || API_BASE,
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => value.replace(/\/$/, ""));

const SYSTEM_PROMPT_MAX = 6000;
const TONE_RULES_MAX = 2000;

type AdminTab =
  | "overview"
  | "analytics"
  | "quality"
  | "knowledge"
  | "controls"
  | "alarms"
  | "integrations";

type OverviewWidgetKey =
  | "operational_health"
  | "api_health"
  | "topic_mix"
  | "feedback";

type ApiHealthCheck = {
  id: string;
  label: string;
  path: string;
};

type ApiHealthResult = {
  ok: boolean;
  url: string;
  status?: number;
  ms?: number;
  error?: string;
  checkedAt: string;
};

type ApiHealthSnapshot = {
  base: string;
  results: Record<string, ApiHealthResult>;
};

const CHATBOT_API_CHECKS: ApiHealthCheck[] = [
  {
    id: "assistant_status",
    label: "Assistant",
    path: "/admin/assistant-status",
  },
  { id: "prompt_config", label: "Prompt Config", path: "/admin/prompt-config" },
  {
    id: "channel_health",
    label: "Channel Health",
    path: "/admin/channel-health?window_hours=1&period_seconds=60",
  },
  {
    id: "chat_analytics",
    label: "Analytics",
    path: "/admin/chat-analytics?days=1",
  },
  {
    id: "knowledge_freshness",
    label: "Knowledge",
    path: "/admin/knowledge-freshness",
  },
  {
    id: "guardrail_monitor",
    label: "Guardrails",
    path: "/admin/guardrail-monitor?days=1",
  },
  {
    id: "feedback_queue",
    label: "Feedback",
    path: "/admin/feedback-queue?days=1&limit=1",
  },
  {
    id: "hallucination_queue",
    label: "Hallucinations",
    path: "/admin/hallucination-queue?days=1&limit=1&status=open",
  },
  { id: "registered_users", label: "Users", path: "/admin/registered-users" },
  {
    id: "reporting_config",
    label: "Reporting",
    path: "/admin/reporting-config",
  },
  { id: "alarm_config", label: "Alarms", path: "/admin/alarm-config" },
  { id: "uploads", label: "Uploads", path: "/admin/uploads" },
  {
    id: "site_extraction",
    label: "Extraction",
    path: "/admin/site-extraction/status",
  },
  { id: "github_config", label: "GitHub", path: "/admin/github-config" },
  { id: "jira_config", label: "Jira", path: "/admin/jira-config" },
  {
    id: "servicenow_config",
    label: "ServiceNow",
    path: "/admin/servicenow-config",
  },
  { id: "teams_config", label: "Teams", path: "/admin/teams-config" },
];

const ADMIN_TAB_DETAILS: Record<
  AdminTab,
  { label: string; icon: string; description: string }
> = {
  overview: {
    label: "Global Dashboard",
    icon: "⬢",
    description: "Executive view across service health and incidents.",
  },
  analytics: {
    label: "Metrics & Signals",
    icon: "◔",
    description: "Observe API health, trends, and activity snapshots.",
  },
  quality: {
    label: "Root Cause & Quality",
    icon: "◎",
    description: "Investigate quality drift and system reliability.",
  },
  knowledge: {
    label: "Knowledge Layer",
    icon: "▣",
    description: "Manage source coverage, freshness, and grounding.",
  },
  controls: {
    label: "Operations Controls",
    icon: "◧",
    description: "Act on live operations and workflow controls.",
  },
  alarms: {
    label: "Alarms & Incidents",
    icon: "⚠",
    description: "Trigger rules, alert routing, and incident response.",
  },
  integrations: {
    label: "Integrations",
    icon: "⇄",
    description: "Configure connectors, providers, and external systems.",
  },
};

const ADMIN_NAV_SECTIONS: Array<{ title: string; items: AdminTab[] }> = [
  {
    title: "Dashboards",
    items: ["overview", "analytics", "quality", "knowledge", "controls"],
  },
  {
    title: "Alerts",
    items: ["alarms"],
  },
  {
    title: "Configuration",
    items: ["integrations"],
  },
];

const ADMIN_TABS: AdminTab[] = [
  "overview",
  "analytics",
  "quality",
  "knowledge",
  "controls",
  "alarms",
  "integrations",
];

const ALARM_COMPARISON_OPTIONS: Array<{
  value: AlarmComparison;
  label: string;
}> = [
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
];

const DEFAULT_ALARM_COMPONENTS: AlarmComponentOption[] = [
  { id: "api-assistant-status", label: "API Assistant Status", kind: "api" },
  { id: "api-prompt-config", label: "API Prompt Config", kind: "api" },
  { id: "api-channel-health", label: "API Channel Health", kind: "api" },
  { id: "api-chat-analytics", label: "API Chat Analytics", kind: "api" },
  {
    id: "api-knowledge-freshness",
    label: "API Knowledge Freshness",
    kind: "api",
  },
  { id: "api-guardrail-monitor", label: "API Guardrail Monitor", kind: "api" },
  { id: "api-feedback-queue", label: "API Feedback Queue", kind: "api" },
  {
    id: "api-hallucination-queue",
    label: "API Hallucination Queue",
    kind: "api",
  },
  { id: "api-registered-users", label: "API Registered Users", kind: "api" },
  { id: "api-reporting-config", label: "API Reporting Config", kind: "api" },
  { id: "api-alarm-config", label: "API Alarm Config", kind: "api" },
  { id: "api-uploads", label: "API Uploads", kind: "api" },
  {
    id: "api-site-extraction-status",
    label: "API Site Extraction Status",
    kind: "api",
  },
  {
    id: "kpi-total-questions",
    label: "KPI Total Questions",
    kind: "kpi",
    unit: "count",
    default_comparison: "lt",
    default_threshold: 100,
  },
  {
    id: "kpi-deflection-rate",
    label: "KPI Deflection Rate",
    kind: "kpi",
    unit: "%",
    default_comparison: "lt",
    default_threshold: 90,
  },
  {
    id: "kpi-answer-rate",
    label: "KPI Answer Rate",
    kind: "kpi",
    unit: "%",
    default_comparison: "lt",
    default_threshold: 85,
  },
  {
    id: "kpi-escalations",
    label: "KPI Escalations",
    kind: "kpi",
    unit: "count",
    default_comparison: "gt",
    default_threshold: 10,
  },
  {
    id: "kpi-failures",
    label: "KPI Failure Signals",
    kind: "kpi",
    unit: "count",
    default_comparison: "gt",
    default_threshold: 5,
  },
  {
    id: "kpi-refusals",
    label: "KPI Refusals",
    kind: "kpi",
    unit: "count",
    default_comparison: "gt",
    default_threshold: 10,
  },
  {
    id: "kpi-flagged-answers",
    label: "KPI Flagged Answers",
    kind: "kpi",
    unit: "count",
    default_comparison: "gt",
    default_threshold: 1,
  },
  {
    id: "kpi-registered-users",
    label: "KPI Registered Users",
    kind: "kpi",
    unit: "count",
    default_comparison: "lt",
    default_threshold: 10,
  },
  {
    id: "kpi-chat-latency-ms",
    label: "KPI Chat Latency (ms)",
    kind: "kpi",
    unit: "ms",
    default_comparison: "gt",
    default_threshold: 2000,
  },
  {
    id: "kpi-chat-error-rate-percent",
    label: "KPI Chat Error Rate (%)",
    kind: "kpi",
    unit: "%",
    default_comparison: "gt",
    default_threshold: 1,
  },
  {
    id: "kpi-opensearch-unassigned-shards",
    label: "KPI OpenSearch Unassigned Shards",
    kind: "kpi",
    unit: "count",
    default_comparison: "gt",
    default_threshold: 0,
  },
];

const DEFAULT_OVERVIEW_WIDGET_ORDER: OverviewWidgetKey[] = [
  "operational_health",
  "api_health",
  "topic_mix",
  "feedback",
];

type AdminCardLayoutState = Record<AdminTab, Record<string, number>>;

const ADMIN_CARD_LAYOUT_STORAGE_KEY = "pv_admin_card_layout_v1";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const formatDateTime = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return DATE_TIME_FORMATTER.format(parsed);
};

const formatNumber = (value?: number | null): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return new Intl.NumberFormat("en-US").format(value);
};

const formatPercent = (value?: number | null): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}%`;
};

const formatSignedPercent = (value?: number | null): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
};

const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return `$${value.toFixed(2)}`;
};

const slugifyCardTitle = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "card";

const readAdminCardLayoutState = (): AdminCardLayoutState => {
  const fallback = {
    overview: {},
    analytics: {},
    quality: {},
    knowledge: {},
    controls: {},
    alarms: {},
    integrations: {},
  } satisfies AdminCardLayoutState;

  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(ADMIN_CARD_LAYOUT_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AdminCardLayoutState>;
    return {
      overview: parsed.overview || {},
      analytics: parsed.analytics || {},
      quality: parsed.quality || {},
      knowledge: parsed.knowledge || {},
      controls: parsed.controls || {},
      alarms: parsed.alarms || {},
      integrations: parsed.integrations || {},
    };
  } catch {
    return fallback;
  }
};

const getAdminTabFromHash = (): AdminTab => {
  if (typeof window === "undefined") return "overview";
  const raw = window.location.hash.replace(/^#/, "").trim().toLowerCase();
  if (ADMIN_TABS.includes(raw as AdminTab)) return raw as AdminTab;
  return "overview";
};

type HealthTone = "up" | "degraded" | "down" | "unknown";

type HealthStatusPillProps = {
  tone: HealthTone;
  label: string;
  detail?: string;
  sparkline?: number[];
  compact?: boolean;
};

const HEALTH_TONE_STYLES: Record<
  HealthTone,
  { pill: string; dot: string; line: string }
> = {
  up: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    line: "text-emerald-600",
  },
  degraded: {
    pill: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    line: "text-amber-600",
  },
  down: {
    pill: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
    line: "text-rose-600",
  },
  unknown: {
    pill: "border-gray-200 bg-gray-50 text-gray-700",
    dot: "bg-gray-400",
    line: "text-gray-500",
  },
};

function HealthStatusPill({
  tone,
  label,
  detail,
  sparkline = [],
  compact = false,
}: HealthStatusPillProps) {
  const style = HEALTH_TONE_STYLES[tone];
  const values = sparkline.filter((value) => Number.isFinite(value));

  const points =
    values.length > 1
      ? (() => {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = Math.max(max - min, 1);
          return values
            .map((value, index) => {
              const x = (index / (values.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 100;
              return `${x},${y}`;
            })
            .join(" ");
        })()
      : "";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${style.pill}`}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full animate-pulse ${style.dot}`}
        aria-hidden="true"
      />
      <span
        className={
          compact ? "text-[11px] font-semibold" : "text-xs font-semibold"
        }
      >
        {label}
      </span>
      {detail ? (
        <span
          className={compact ? "text-[11px] opacity-80" : "text-xs opacity-80"}
        >
          {detail}
        </span>
      ) : null}
      {points ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`${compact ? "h-4 w-10" : "h-4 w-14"} ${style.line}`}
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      ) : null}
    </div>
  );
}

type RunResponse = {
  message?: string;
  request_id?: string;
  status_code?: number;
  run_id?: string;
  error?: string;
};

type SiteExtractionStatus = {
  run_id?: string;
  status?: "running" | "completed" | "failed" | string;
  started_at?: string;
  updated_at?: string;
  pages_processed?: number;
  run_bundle_s3_key?: string;
  run_jsonl_s3_key?: string;
  latest_bundle_s3_key?: string;
  latest_jsonl_s3_key?: string;
  error?: string;
};

type SiteExtractionFrequency = "manual" | "daily" | "weekly" | "monthly";

type SiteExtractionScheduleResponse = {
  enabled: boolean;
  frequency: SiteExtractionFrequency;
  weekly_day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  monthly_day: number;
  start_url: string;
  updated_at?: string;
  error?: string;
};

type AnalyticsTypeCount = {
  type: string;
  count: number;
};

type ConversationTotals = {
  today: number;
  week: number;
  month: number;
};

type ActiveUsersMetrics = {
  now: number;
  day: number;
  week: number;
  month: number;
  returning_percent?: number;
  new_percent?: number;
};

type MessageCounts = {
  user: number;
  assistant: number;
  total?: number;
};

type ConversationSuccess = {
  resolved: number;
  abandoned: number;
  rate_percent?: number;
};

type SessionMetrics = {
  avg_length_messages?: number;
  avg_duration_minutes?: number;
};

type EntryPageMetric = {
  label: string;
  count: number;
};

type PeakUsageMetric = {
  label: string;
  count: number;
};

type DeviceBreakdown = {
  mobile_percent: number;
  desktop_percent: number;
  other_percent?: number;
};

type ModelUsage = {
  model: string;
  count: number;
};

type TokenUsage = {
  input: number;
  output: number;
};

type CostMetrics = {
  per_conversation_usd: number;
  total_usd?: number;
};

type QualityMetrics = {
  hallucination_rate_percent?: number;
  fallback_rate_percent?: number;
  confidence_avg?: number;
};

type ToolCallMetric = {
  tool: string;
  count: number;
};

type CitedDocument = {
  title: string;
  count: number;
};

type MissingKnowledge = {
  count: number;
  rate_percent: number;
};

type RetrievalMetrics = {
  success_rate_percent: number;
};

type ErrorBreakdownMetric = {
  type: string;
  count: number;
};

type FailedResponses = {
  count: number;
  rate_percent?: number;
};

type FeedbackRatings = {
  helpful: number;
  not_helpful: number;
  flag: number;
};

type CitationMetrics = {
  clicks: number;
  impressions: number;
  click_rate_percent?: number;
};

type IndexFreshness = {
  last_ingest_at?: string;
  age_hours?: number | null;
  ingested_docs?: number;
  failed_docs?: number;
  index?: string;
};

type GuardrailTriggers = {
  total: number;
  by_type?: ErrorBreakdownMetric[];
};

type RateLimitEvents = {
  count: number;
  rate_percent?: number;
};

type EscalationMetric = {
  count: number;
  rate_percent?: number;
};

type CustomerEconomics = {
  total_customers: number;
  cost_per_customer_usd: number;
  revenue_per_customer_usd: number;
  margin_percent?: number;
  revenue_total_usd?: number;
  cost_total_usd?: number;
  revenue_configured?: boolean;
  note?: string;
};

type ConversationsPerCustomer = {
  avg_conversations: number;
  total_customers: number;
};

type TrialConversion = {
  trial_users: number;
  paid_users: number;
  conversion_rate_percent?: number;
  note?: string;
};

type UsageVsPlanLimits = {
  conversations_used: number;
  conversations_limit?: number;
  conversations_percent?: number;
  tokens_used?: number;
  tokens_limit?: number;
  tokens_percent?: number;
  active_users_used?: number;
  active_users_limit?: number;
  users_percent?: number;
  note?: string;
};

type ExpansionSignals = {
  heavy_users: EntryPageMetric[];
  threshold?: number;
  average_per_customer?: number;
  note?: string;
};

type ChurnRiskIndicator = {
  label: string;
  days_since_last_seen?: number;
  last_seen_at?: string;
};

type ChurnRiskIndicators = {
  at_risk: ChurnRiskIndicator[];
  note?: string;
};

type IntentTrend = {
  intent: string;
  current_count: number;
  previous_count: number;
  change_percent?: number;
};

type IntentTrends = {
  window_days: number;
  trends: IntentTrend[];
};

type WorkflowCompletion = {
  completed: number;
  total: number;
  rate_percent?: number;
};

type MultiTurnSuccess = {
  completed: number;
  total: number;
  rate_percent?: number;
};

type AgentActionPoint = {
  date: string;
  tool_calls: number;
  handoffs: number;
  guardrails: number;
  failures: number;
};

type StructuredOutputAccuracy = {
  accuracy_percent?: number;
  samples?: number;
  note?: string;
};

type AutoEvaluationScores = {
  average_score?: number;
  p95_score?: number;
  samples?: number;
  note?: string;
};

type ToolStatus = {
  enabled: boolean;
  note?: string;
};

type ToolingStatus = {
  prompt_diff_viewer: ToolStatus;
  model_replay: ToolStatus;
  test_query_playground: ToolStatus;
  evaluation_runner: ToolStatus;
  knowledge_snapshots: ToolStatus;
  trace_view: ToolStatus;
};

type KnowledgeSnapshot = {
  timestamp: string;
  index?: string;
  ingested_docs?: number;
  failed_docs?: number;
};

const FALLBACK_TOPIC_COUNTS: AnalyticsTypeCount[] = [
  { type: "permits", count: 180 },
  { type: "payments", count: 140 },
  { type: "report_issue", count: 112 },
  { type: "contact", count: 86 },
  { type: "utilities", count: 62 },
  { type: "other", count: 94 },
];

const SITE_EXTRACTION_WEEKDAY_OPTIONS: Array<{
  value: SiteExtractionScheduleResponse["weekly_day"];
  label: string;
}> = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

const DEFAULT_SITE_EXTRACTION_SCHEDULE: SiteExtractionScheduleResponse = {
  enabled: true,
  frequency: "daily",
  weekly_day: "mon",
  monthly_day: 1,
  start_url: "https://primiq.ai/demo",
};

const DEFAULT_JIRA_CONFIG: JiraConfigResponse = {
  enabled: false,
  auto_create_api_down: false,
  base_url: "",
  project_key: "",
  email: "",
  has_api_token: false,
  issue_type_api_down: "Bug",
  issue_type_weird_answer: "Task",
};

const DEFAULT_GITHUB_CONFIG: GithubConfigResponse = {
  enabled: false,
  repo_owner: "",
  repo_name: "",
  has_token: false,
};

const DEFAULT_SERVICENOW_CONFIG: ServiceNowConfigResponse = {
  enabled: false,
  auto_create_api_down: false,
  base_url: "",
  username: "",
  has_password: false,
  assignment_group: "",
  business_service: "",
  impact: "2",
  urgency: "2",
  category_api_down: "inquiry",
  category_weird_answer: "inquiry",
};

const DEFAULT_TEAMS_CONFIG: TeamsConfigResponse = {
  enabled: false,
  auto_notify_api_down: false,
  has_webhook: false,
  message_prefix: "CivIQ",
  channel_label: "",
};

type AnalyticsResponse = {
  days: number;
  total_questions: number;
  type_counts: AnalyticsTypeCount[];
  feedback?: {
    helpful: number;
    not_helpful: number;
    flag: number;
  };
  escalations?: {
    count: number;
    rate_percent: number;
  };
  failures?: {
    count: number;
    rate_percent: number;
    by_type: AnalyticsTypeCount[];
  };
  suggested_intents?: {
    intent_name: string;
    observed_count: number;
    sample_question: string;
  }[];
  conversation_totals?: ConversationTotals;
  active_users?: ActiveUsersMetrics;
  message_counts?: MessageCounts;
  conversation_success?: ConversationSuccess;
  session_metrics?: SessionMetrics;
  top_entry_pages?: EntryPageMetric[];
  peak_usage_times?: PeakUsageMetric[];
  device_breakdown?: DeviceBreakdown;
  model_usage?: ModelUsage[];
  token_usage?: TokenUsage;
  cost_metrics?: CostMetrics;
  quality_metrics?: QualityMetrics;
  tool_calls?: ToolCallMetric[];
  top_cited_documents?: CitedDocument[];
  missing_knowledge?: MissingKnowledge;
  retrieval_metrics?: RetrievalMetrics;
  failed_responses?: FailedResponses;
  error_breakdown?: ErrorBreakdownMetric[];
  feedback_ratings?: FeedbackRatings;
  most_searched_topics?: EntryPageMetric[];
  citation_metrics?: CitationMetrics;
  index_freshness?: IndexFreshness;
  guardrail_triggers?: GuardrailTriggers;
  rate_limit_events?: RateLimitEvents;
  escalations_to_human?: EscalationMetric;
  top_users?: EntryPageMetric[];
  top_organizations?: EntryPageMetric[];
  customer_economics?: CustomerEconomics;
  conversations_per_customer?: ConversationsPerCustomer;
  trial_conversion?: TrialConversion;
  usage_vs_plan_limits?: UsageVsPlanLimits;
  expansion_signals?: ExpansionSignals;
  churn_risk?: ChurnRiskIndicators;
  intent_trends?: IntentTrends;
  workflow_completion?: WorkflowCompletion;
  multi_turn_success?: MultiTurnSuccess;
  agent_actions_timeline?: AgentActionPoint[];
  structured_output_accuracy?: StructuredOutputAccuracy;
  auto_evaluation_scores?: AutoEvaluationScores;
  tooling_status?: ToolingStatus;
  knowledge_snapshots?: KnowledgeSnapshot[];
};

type RegisteredUsersResponse = {
  total_users: number;
  confirmed_users: number;
  unconfirmed_users: number;
  enabled_users: number;
};

type ReportingConfigResponse = {
  enabled: boolean;
  frequency: "weekly" | "monthly";
  email: string;
  days: number;
  updated_at?: string;
};

type AlarmComparison = "gt" | "gte" | "lt" | "lte" | "eq" | "neq";
type AlarmKind = "api" | "kpi";

type AlarmComponentOption = {
  id: string;
  label: string;
  kind?: AlarmKind;
  unit?: string;
  default_comparison?: AlarmComparison;
  default_threshold?: number;
};

type AlarmRule = {
  id: string;
  name: string;
  component: string;
  kind: AlarmKind;
  enabled: boolean;
  email: string;
  notify_recovery: boolean;
  cooldown_minutes: number;
  threshold: number;
  comparison: AlarmComparison;
  timeframe_days: number;
  status?: {
    is_down?: boolean;
    consecutive_failures?: number;
    last_checked_at?: string;
    last_sent_at?: string;
    last_error?: string;
    last_value?: number | null;
    last_jira_issue_key?: string;
    last_jira_issue_url?: string;
    last_jira_error?: string;
    last_servicenow_number?: string;
    last_servicenow_url?: string;
    last_servicenow_error?: string;
    last_teams_sent_at?: string;
    last_teams_error?: string;
  };
};

type AlarmConfigResponse = {
  enabled: boolean;
  default_email: string;
  alarms: AlarmRule[];
  available_components: AlarmComponentOption[];
  status?: {
    is_down?: boolean;
    consecutive_failures?: number;
    last_checked_at?: string;
    last_sent_at?: string;
    last_error?: string;
    last_value?: number | null;
  };
  updated_at?: string;
};

type JiraConfigResponse = {
  enabled: boolean;
  auto_create_api_down: boolean;
  base_url: string;
  project_key: string;
  email: string;
  has_api_token: boolean;
  issue_type_api_down: string;
  issue_type_weird_answer: string;
  updated_at?: string;
};

type GithubConfigResponse = {
  enabled: boolean;
  repo_owner: string;
  repo_name: string;
  has_token: boolean;
  updated_at?: string;
};

type ServiceNowConfigResponse = {
  enabled: boolean;
  auto_create_api_down: boolean;
  base_url: string;
  username: string;
  has_password: boolean;
  assignment_group: string;
  business_service: string;
  impact: "1" | "2" | "3";
  urgency: "1" | "2" | "3";
  category_api_down: string;
  category_weird_answer: string;
  updated_at?: string;
};

type TeamsConfigResponse = {
  enabled: boolean;
  auto_notify_api_down: boolean;
  has_webhook: boolean;
  message_prefix: string;
  channel_label: string;
  updated_at?: string;
};

type PromptConfigResponse = {
  system_prompt: string;
  concise_mode: boolean;
  tone_rules: string;
  updatedAt?: string;
};

type ChannelLatencyPoint = {
  timestamp: string;
  avg_duration_ms?: number;
  invocations?: number;
  errors?: number;
  error_rate_percent?: number;
};

type ChannelHealthResponse = {
  generated_at?: string;
  chat_router?: {
    function_name?: string;
    window_minutes?: number;
    invocations?: number;
    errors?: number;
    error_rate_percent?: number;
    avg_duration_ms?: number;
    period_seconds?: number;
    latency_timeseries?: ChannelLatencyPoint[];
    error?: string;
  };
  downstream_lambdas?: {
    function_name: string;
    state?: string;
    last_update_status?: string;
    runtime?: string;
    last_modified?: string;
    error?: string;
  }[];
  opensearch?: {
    status?: string;
    number_of_nodes?: number;
    active_shards?: number;
    unassigned_shards?: number;
    error?: string;
  };
  error?: string;
};

type KnowledgeFreshnessResponse = {
  crawl?: {
    status?: string;
    run_id?: string;
    updated_at?: string;
    pages_processed?: number;
    error?: string;
  };
  ingest?: {
    updated_at?: string;
    processed_objects?: string[];
    ingested_docs?: number;
    failed_docs?: number;
    index?: string;
  };
  docs_indexed_count?: number | null;
  docs_index_error?: string | null;
  stale_content_warning?: boolean;
  warnings?: string[];
  error?: string;
};

type GuardrailMonitorResponse = {
  days: number;
  escalations: number;
  refusals: number;
  flagged_answers: number;
  policy_trigger_reasons: { reason: string; count: number }[];
  error?: string;
};

type HallucinationStatus =
  | "open"
  | "triaged"
  | "confirmed"
  | "dismissed"
  | "fixed";
type HallucinationStatusFilter = HallucinationStatus | "all";

type FeedbackQueueItem = {
  eventDate: string;
  eventId: string;
  feedbackType: "flag" | "not_helpful" | string;
  questionText: string;
  answerText: string;
  url: string;
  chatId: string;
  createdAt: string;
  resolutionStatus: "open" | "fixed" | string;
  resolvedAt?: string;
  resolutionNotes?: string;
  hallucinationStatus?: HallucinationStatus | string;
  hallucinationSeverity?: "high" | "medium" | "low" | string;
  hallucinationScore?: number;
  hallucinationReasons?: string[];
  hallucinationUpdatedAt?: string;
  hallucinationNotes?: string;
};

type FeedbackQueueResponse = {
  days: number;
  count: number;
  items: FeedbackQueueItem[];
  error?: string;
};

type HallucinationQueueResponse = {
  days: number;
  status_filter?: HallucinationStatusFilter;
  count: number;
  open_count: number;
  triaged_count: number;
  confirmed_count: number;
  dismissed_count: number;
  fixed_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  items: FeedbackQueueItem[];
  error?: string;
};

type UploadItem = {
  key: string;
  file_name: string;
  size_bytes: number;
  size_label: string;
  last_modified?: string | null;
};

type UploadsResponse = {
  prefix?: string;
  count: number;
  items: UploadItem[];
  error?: string;
};

type UploadTaskStatus = "queued" | "uploading" | "success" | "failed";

type UploadTask = {
  id: string;
  fileName: string;
  status: UploadTaskStatus;
  message: string;
  file?: File;
};

type ScenarioRunResult = {
  id: string;
  name: string;
  suite: string;
  passed: boolean;
  status_code: number;
  latency_ms?: number | null;
  question: string;
  summary: string;
};

type ScenarioRunResponse = {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  results: ScenarioRunResult[];
  error?: string;
};

type TopicTooltip = {
  x: number;
  y: number;
  type: string;
  count: number;
};

export default function AdminConsole() {
  const [startUrl, setStartUrl] = useState("https://primiq.ai");
  const [running, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [kickoffResult, setKickoffResult] = useState<RunResponse | null>(null);
  const [siteExtractionSchedule, setSiteExtractionSchedule] =
    useState<SiteExtractionScheduleResponse>(DEFAULT_SITE_EXTRACTION_SCHEDULE);
  const [siteExtractionScheduleLoading, setSiteExtractionScheduleLoading] =
    useState(false);
  const [siteExtractionScheduleError, setSiteExtractionScheduleError] =
    useState("");
  const [siteExtractionScheduleStatus, setSiteExtractionScheduleStatus] =
    useState("");

  const [activeRunId, setActiveRunId] = useState<string>("");
  const [extractionStatus, setExtractionStatus] =
    useState<SiteExtractionStatus | null>(null);

  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [selectedTopicType, setSelectedTopicType] = useState<string | null>(
    null,
  );
  const [topicTooltip, setTopicTooltip] = useState<TopicTooltip | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [registeredUsers, setRegisteredUsers] =
    useState<RegisteredUsersResponse | null>(null);
  const [assistantEnabled, setAssistantEnabled] = useState(true);
  const [proactiveNudgesEnabled, setProactiveNudgesEnabled] = useState(true);
  const [assistantToggleLoading, setAssistantToggleLoading] = useState(false);
  const [assistantToggleError, setAssistantToggleError] = useState("");
  const [proactiveNudgesToggleError, setProactiveNudgesToggleError] =
    useState("");
  const [reportingConfig, setReportingConfig] =
    useState<ReportingConfigResponse>({
      enabled: false,
      frequency: "weekly",
      email: "info@primiq.ai",
      days: 30,
    });
  const [reportingLoading, setReportingLoading] = useState(false);
  const [reportingError, setReportingError] = useState("");
  const [reportingStatus, setReportingStatus] = useState("");
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfigResponse>({
    enabled: true,
    default_email: "info@primiq.ai",
    alarms: [],
    available_components: DEFAULT_ALARM_COMPONENTS,
  });
  const [newAlarmComponent, setNewAlarmComponent] = useState<string>(
    DEFAULT_ALARM_COMPONENTS[0]?.id || "api-channel-health",
  );
  const [newAlarmEmail, setNewAlarmEmail] = useState("info@primiq.ai");
  const [newAlarmNotifyRecovery, setNewAlarmNotifyRecovery] = useState(true);
  const [newAlarmCooldownMinutes, setNewAlarmCooldownMinutes] = useState(60);
  const [newAlarmThreshold, setNewAlarmThreshold] = useState(2);
  const [newAlarmComparison, setNewAlarmComparison] =
    useState<AlarmComparison>("gt");
  const [newAlarmTimeframeDays, setNewAlarmTimeframeDays] = useState(30);
  const [alarmLoading, setAlarmLoading] = useState(false);
  const [alarmError, setAlarmError] = useState("");
  const [alarmStatus, setAlarmStatus] = useState("");
  const [githubConfig, setGithubConfig] = useState<GithubConfigResponse>(
    DEFAULT_GITHUB_CONFIG,
  );
  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [githubStatus, setGithubStatus] = useState("");
  const [jiraConfig, setJiraConfig] =
    useState<JiraConfigResponse>(DEFAULT_JIRA_CONFIG);
  const [jiraApiTokenInput, setJiraApiTokenInput] = useState("");
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState("");
  const [jiraStatus, setJiraStatus] = useState("");
  const [jiraIssueLoadingKey, setJiraIssueLoadingKey] = useState("");
  const [jiraIssueError, setJiraIssueError] = useState("");
  const [jiraIssueStatus, setJiraIssueStatus] = useState("");
  const [serviceNowConfig, setServiceNowConfig] =
    useState<ServiceNowConfigResponse>(DEFAULT_SERVICENOW_CONFIG);
  const [serviceNowPasswordInput, setServiceNowPasswordInput] = useState("");
  const [serviceNowLoading, setServiceNowLoading] = useState(false);
  const [serviceNowError, setServiceNowError] = useState("");
  const [serviceNowStatus, setServiceNowStatus] = useState("");
  const [serviceNowTicketLoadingKey, setServiceNowTicketLoadingKey] =
    useState("");
  const [serviceNowTicketError, setServiceNowTicketError] = useState("");
  const [serviceNowTicketStatus, setServiceNowTicketStatus] = useState("");
  const [teamsConfig, setTeamsConfig] =
    useState<TeamsConfigResponse>(DEFAULT_TEAMS_CONFIG);
  const [teamsWebhookInput, setTeamsWebhookInput] = useState("");
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [teamsStatus, setTeamsStatus] = useState("");
  const [teamsMessageLoadingKey, setTeamsMessageLoadingKey] = useState("");
  const [teamsMessageError, setTeamsMessageError] = useState("");
  const [teamsMessageStatus, setTeamsMessageStatus] = useState("");
  const [promptConfig, setPromptConfig] = useState<PromptConfigResponse>({
    system_prompt: "",
    concise_mode: false,
    tone_rules: "",
  });
  const [savedPromptVersion, setSavedPromptVersion] =
    useState<PromptConfigResponse>({
      system_prompt: "",
      concise_mode: false,
      tone_rules: "",
    });
  const [promptConfigLoading, setPromptConfigLoading] = useState(false);
  const [promptConfigError, setPromptConfigError] = useState("");
  const [promptConfigStatus, setPromptConfigStatus] = useState("");
  const [pendingPromptFeedbackIds, setPendingPromptFeedbackIds] = useState<
    Record<string, boolean>
  >({});
  const [channelHealth, setChannelHealth] =
    useState<ChannelHealthResponse | null>(null);
  const [channelHealthLoading, setChannelHealthLoading] = useState(false);
  const [channelHealthError, setChannelHealthError] = useState("");
  const [channelHealthWindowHours, setChannelHealthWindowHours] = useState(24);
  const [latencySelectedIndex, setLatencySelectedIndex] = useState<
    number | null
  >(null);
  const [knowledgeFreshness, setKnowledgeFreshness] =
    useState<KnowledgeFreshnessResponse | null>(null);
  const [knowledgeFreshnessLoading, setKnowledgeFreshnessLoading] =
    useState(false);
  const [knowledgeFreshnessError, setKnowledgeFreshnessError] = useState("");
  const [guardrailMonitor, setGuardrailMonitor] =
    useState<GuardrailMonitorResponse | null>(null);
  const [guardrailDays, setGuardrailDays] = useState(30);
  const [guardrailLoading, setGuardrailLoading] = useState(false);
  const [guardrailError, setGuardrailError] = useState("");
  const [feedbackQueue, setFeedbackQueue] =
    useState<FeedbackQueueResponse | null>(null);
  const [feedbackQueueLoading, setFeedbackQueueLoading] = useState(false);
  const [feedbackQueueError, setFeedbackQueueError] = useState("");
  const [hallucinationQueue, setHallucinationQueue] =
    useState<HallucinationQueueResponse | null>(null);
  const [hallucinationQueueLoading, setHallucinationQueueLoading] =
    useState(false);
  const [hallucinationQueueError, setHallucinationQueueError] = useState("");
  const [hallucinationStatusFilter, setHallucinationStatusFilter] =
    useState<HallucinationStatusFilter>("open");
  const [hallucinationUpdatingId, setHallucinationUpdatingId] = useState("");
  const [feedbackMarkingId, setFeedbackMarkingId] = useState("");
  const [feedbackPromptApplyingId, setFeedbackPromptApplyingId] = useState("");
  const [feedbackFixNotes, setFeedbackFixNotes] = useState<
    Record<string, string>
  >({});
  const [uploads, setUploads] = useState<UploadsResponse | null>(null);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState("");
  const [uploadsStatus, setUploadsStatus] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingUploadKey, setDeletingUploadKey] = useState("");
  const [isUploadDragOver, setIsUploadDragOver] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [scenarioSuite, setScenarioSuite] = useState("all");
  const [scenarioRun, setScenarioRun] = useState<ScenarioRunResponse | null>(
    null,
  );
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    getAdminTabFromHash(),
  );
  const [apiHealth, setApiHealth] = useState<ApiHealthSnapshot[]>([]);
  const [apiHealthLoading, setApiHealthLoading] = useState(false);
  const [apiHealthError, setApiHealthError] = useState("");
  const [apiHealthHasRun, setApiHealthHasRun] = useState(false);
  const [overviewWidgetOrder] = useState<OverviewWidgetKey[]>(
    DEFAULT_OVERVIEW_WIDGET_ORDER,
  );
  const [adminCardLayout, setAdminCardLayout] = useState<AdminCardLayoutState>(
    () => readAdminCardLayoutState(),
  );
  const draggingAdminCardIdRef = useRef<string | null>(null);

  const AVG_CALL_MINUTES = 6;
  const EST_CALL_CENTER_COST = 6.25;
  const EST_AI_INTERACTION_COST = 0.45;

  const fetchExtractionStatus = async (silent = false) => {
    try {
      const res = await fetch(`${API_BASE}/admin/site-extraction/status`);
      const payload = (await res.json()) as SiteExtractionStatus & {
        error?: string;
      };

      if (!res.ok) {
        if (!silent) {
          setStatusMessage(
            payload.error || `Status request failed (${res.status})`,
          );
        }
        return;
      }

      setExtractionStatus(payload);

      if (payload.status === "completed") {
        setRunning(false);
        setStatusMessage(`Run ${payload.run_id || ""} completed.`.trim());
      } else if (payload.status === "failed") {
        setRunning(false);
        setStatusMessage(`Run ${payload.run_id || ""} failed.`.trim());
      } else if (payload.status === "running") {
        setStatusMessage(`Run ${payload.run_id || ""} is running...`.trim());
      }
    } catch (error) {
      if (!silent) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setStatusMessage(`Failed to load extraction status: ${message}`);
      }
    }
  };

  const loadSiteExtractionSchedule = async (silent = false) => {
    if (!silent) {
      setSiteExtractionScheduleError("");
      setSiteExtractionScheduleStatus("");
    }
    setSiteExtractionScheduleLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/site-extraction/schedule`);
      const payload = (await res.json()) as SiteExtractionScheduleResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      const frequency = (
        ["manual", "daily", "weekly", "monthly"].includes(
          payload.frequency || "",
        )
          ? payload.frequency
          : "daily"
      ) as SiteExtractionFrequency;
      const weeklyDay =
        SITE_EXTRACTION_WEEKDAY_OPTIONS.find(
          (option) => option.value === payload.weekly_day,
        )?.value || "mon";
      const monthlyDay = Math.max(1, Math.min(28, payload.monthly_day || 1));
      const nextStartUrl = payload.start_url || startUrl;

      setSiteExtractionSchedule({
        enabled: payload.enabled !== false,
        frequency,
        weekly_day: weeklyDay,
        monthly_day: monthlyDay,
        start_url: nextStartUrl,
        updated_at: payload.updated_at,
      });
      setStartUrl(nextStartUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) {
        setSiteExtractionScheduleError(message);
      }
    } finally {
      setSiteExtractionScheduleLoading(false);
    }
  };

  const saveSiteExtractionSchedule = async () => {
    setSiteExtractionScheduleLoading(true);
    setSiteExtractionScheduleError("");
    setSiteExtractionScheduleStatus("");

    try {
      const payloadBody = {
        enabled: siteExtractionSchedule.enabled,
        frequency: siteExtractionSchedule.frequency,
        weekly_day: siteExtractionSchedule.weekly_day,
        monthly_day: Math.max(
          1,
          Math.min(28, siteExtractionSchedule.monthly_day),
        ),
        start_url: (startUrl || siteExtractionSchedule.start_url || "").trim(),
      };

      const res = await fetch(`${API_BASE}/admin/site-extraction/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });
      const payload = (await res.json()) as SiteExtractionScheduleResponse & {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      const savedStartUrl = payload.start_url || payloadBody.start_url;
      setSiteExtractionSchedule({
        enabled: payload.enabled !== false,
        frequency: payload.frequency || siteExtractionSchedule.frequency,
        weekly_day:
          SITE_EXTRACTION_WEEKDAY_OPTIONS.find(
            (option) => option.value === payload.weekly_day,
          )?.value || siteExtractionSchedule.weekly_day,
        monthly_day: Math.max(1, Math.min(28, payload.monthly_day || 1)),
        start_url: savedStartUrl,
        updated_at: payload.updated_at,
      });
      setStartUrl(savedStartUrl);
      setSiteExtractionScheduleStatus("Site extraction schedule saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSiteExtractionScheduleError(message);
    } finally {
      setSiteExtractionScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchExtractionStatus(true);
    void loadSiteExtractionSchedule(true);
    void loadAnalytics();
    void loadRegisteredUsers(true);
    void loadAssistantStatus(true);
    void loadReportingConfig(true);
    void loadAlarmConfig(true);
    void loadGithubConfig(true);
    void loadJiraConfig(true);
    void loadServiceNowConfig(true);
    void loadTeamsConfig(true);
    void loadPromptConfig(true);
    void loadChannelHealth(true);
    void loadKnowledgeFreshness(true);
    void loadGuardrailMonitor(true);
    void loadFeedbackQueue(true);
    void loadHallucinationQueue(true);
    void loadUploads(true);
    setApiHealthHasRun(true);
    void runApiHealthChecks(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        ADMIN_CARD_LAYOUT_STORAGE_KEY,
        JSON.stringify(adminCardLayout),
      );
    } catch {
      // ignore local storage write errors
    }
  }, [adminCardLayout]);

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

  const runApiHealthChecks = async (silent = false) => {
    if (!silent) setApiHealthError("");
    setApiHealthLoading(true);

    // These endpoints can cold-start; keep the timeout generous to avoid false negatives.
    const timeoutMs = 20_000;

    const checkOne = async (
      base: string,
      check: ApiHealthCheck,
    ): Promise<ApiHealthResult> => {
      const url = `${base}${check.path}`;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      const started = performance.now();

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const ms = Math.round(performance.now() - started);
        return {
          ok: res.ok,
          url,
          status: res.status,
          ms,
          error: res.ok ? undefined : `HTTP ${res.status}`,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        const ms = Math.round(performance.now() - started);
        const message =
          error instanceof Error
            ? error.name === "AbortError"
              ? "Timeout"
              : error.message
            : "Unknown error";
        return {
          ok: false,
          url,
          ms,
          error: message,
          checkedAt: new Date().toISOString(),
        };
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    try {
      const snapshots: ApiHealthSnapshot[] = await Promise.all(
        API_BASES.map(async (base) => {
          // Avoid hammering the API with a burst of parallel requests (can cause throttling/timeouts).
          const resultsEntries: Array<readonly [string, ApiHealthResult]> = [];
          for (const check of CHATBOT_API_CHECKS) {
            // eslint-disable-next-line no-await-in-loop
            const result = await checkOne(base, check);
            resultsEntries.push([check.id, result] as const);
          }
          return {
            base,
            results: Object.fromEntries(resultsEntries),
          };
        }),
      );

      setApiHealth(snapshots);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setApiHealthError(message);
    } finally {
      setApiHealthLoading(false);
    }
  };

  const promptHasUnsavedChanges =
    promptConfig.system_prompt !== savedPromptVersion.system_prompt ||
    promptConfig.tone_rules !== savedPromptVersion.tone_rules ||
    promptConfig.concise_mode !== savedPromptVersion.concise_mode;

  useEffect(() => {
    if (!promptHasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [promptHasUnsavedChanges]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextHash = `#${activeTab}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => setActiveTab(getAdminTabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.querySelector(".admin-console");
    if (!(root instanceof HTMLElement)) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".admin-row-card"),
    );
    if (!cards.length) return;

    const uniqueParents: HTMLElement[] = [];
    cards.forEach((card) => {
      const parent = card.parentElement;
      if (parent instanceof HTMLElement && !uniqueParents.includes(parent)) {
        uniqueParents.push(parent);
      }
    });

    const tabLayout = adminCardLayout[activeTab] || {};
    const nextLayoutEntries: Record<string, number> = {};
    let shouldPatchLayout = false;

    cards.forEach((card, index) => {
      const parent = card.parentElement;
      const parentIndex =
        parent instanceof HTMLElement ? uniqueParents.indexOf(parent) : -1;
      const title =
        card.querySelector("h2, h3, h4")?.textContent || `Card ${index + 1}`;
      const fallbackCardId = `${activeTab}:${parentIndex}:${slugifyCardTitle(title)}:${index}`;
      const cardId = card.dataset.adminCardId || fallbackCardId;
      card.dataset.adminCardId = cardId;
      if (typeof tabLayout[cardId] !== "number") {
        nextLayoutEntries[cardId] = index;
        shouldPatchLayout = true;
      }
      const order =
        typeof tabLayout[cardId] === "number" ? tabLayout[cardId] : index;
      card.style.order = String(order);
      card.draggable = true;
      card.classList.add("admin-card-draggable");
    });

    if (shouldPatchLayout) {
      setAdminCardLayout((prev) => ({
        ...prev,
        [activeTab]: {
          ...(prev[activeTab] || {}),
          ...nextLayoutEntries,
        },
      }));
    }

    const clearDropTargetClass = () => {
      cards.forEach((card) => card.classList.remove("admin-card-drop-target"));
    };

    const handleDragStart = (event: DragEvent) => {
      const card = event.currentTarget as HTMLElement;
      const sourceId = card.dataset.adminCardId;
      if (!sourceId) return;
      draggingAdminCardIdRef.current = sourceId;
      card.classList.add("admin-card-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", sourceId);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      const targetId = target.dataset.adminCardId;
      const sourceId =
        draggingAdminCardIdRef.current ||
        event.dataTransfer?.getData("text/plain") ||
        "";
      if (!sourceId || !targetId || sourceId === targetId) return;
      const sourceCard = cards.find(
        (card) => card.dataset.adminCardId === sourceId,
      );
      if (!sourceCard || sourceCard.parentElement !== target.parentElement)
        return;
      clearDropTargetClass();
      target.classList.add("admin-card-drop-target");
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      (event.currentTarget as HTMLElement).classList.remove(
        "admin-card-drop-target",
      );
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      const targetId = target.dataset.adminCardId;
      const sourceId =
        draggingAdminCardIdRef.current ||
        event.dataTransfer?.getData("text/plain") ||
        "";
      if (!sourceId || !targetId || sourceId === targetId) {
        clearDropTargetClass();
        return;
      }
      const sourceCard = cards.find(
        (card) => card.dataset.adminCardId === sourceId,
      );
      if (!sourceCard || sourceCard.parentElement !== target.parentElement) {
        clearDropTargetClass();
        return;
      }

      const sourceIndex = cards.indexOf(sourceCard);
      const targetIndex = cards.indexOf(target);

      setAdminCardLayout((prev) => {
        const nextTabLayout = { ...(prev[activeTab] || {}) };
        const sourceOrder =
          typeof nextTabLayout[sourceId] === "number"
            ? nextTabLayout[sourceId]
            : sourceIndex;
        const targetOrder =
          typeof nextTabLayout[targetId] === "number"
            ? nextTabLayout[targetId]
            : targetIndex;
        nextTabLayout[sourceId] = targetOrder;
        nextTabLayout[targetId] = sourceOrder;
        return {
          ...prev,
          [activeTab]: nextTabLayout,
        };
      });

      clearDropTargetClass();
    };

    const handleDragEnd = (event: DragEvent) => {
      draggingAdminCardIdRef.current = null;
      (event.currentTarget as HTMLElement).classList.remove(
        "admin-card-dragging",
      );
      clearDropTargetClass();
    };

    cards.forEach((card) => {
      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragover", handleDragOver);
      card.addEventListener("dragleave", handleDragLeave);
      card.addEventListener("drop", handleDrop);
      card.addEventListener("dragend", handleDragEnd);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("dragstart", handleDragStart);
        card.removeEventListener("dragover", handleDragOver);
        card.removeEventListener("dragleave", handleDragLeave);
        card.removeEventListener("drop", handleDrop);
        card.removeEventListener("dragend", handleDragEnd);
        card.classList.remove("admin-card-dragging");
        card.classList.remove("admin-card-drop-target");
      });
    };
  }, [activeTab, adminCardLayout]);

  const isOverviewTab = activeTab === "overview";
  const isAnalyticsTab = activeTab === "analytics";
  const isHealthTab = activeTab === "quality";
  const shouldPollApiHealth = isAnalyticsTab || isOverviewTab;

  useEffect(() => {
    if (!shouldPollApiHealth || apiHealthHasRun) return;
    setApiHealthHasRun(true);
    void runApiHealthChecks(true);
  }, [apiHealthHasRun, shouldPollApiHealth]);

  useEffect(() => {
    if (!shouldPollApiHealth) return;
    const intervalId = window.setInterval(() => {
      void runApiHealthChecks(true);
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [shouldPollApiHealth]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadAnalytics();
      void loadRegisteredUsers(true);
      void loadAssistantStatus(true);
      void loadReportingConfig(true);
      void loadAlarmConfig(true);
      void loadPromptConfig(true);
      void loadChannelHealth(true, channelHealthWindowHours);
      void loadKnowledgeFreshness(true);
      void loadGuardrailMonitor(true);
      void loadFeedbackQueue(true);
      void loadHallucinationQueue(true);
      void loadUploads(true);
      void loadSiteExtractionSchedule(true);
      void fetchExtractionStatus(true);
      void runApiHealthChecks(true);
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [channelHealthWindowHours, hallucinationStatusFilter]);

  useEffect(() => {
    void loadHallucinationQueue(true);
  }, [hallucinationStatusFilter]);

  useEffect(() => {
    if (!running) return;

    const intervalId = window.setInterval(() => {
      fetchExtractionStatus(true);
    }, 4000);

    const timeoutId = window.setTimeout(
      () => {
        setRunning(false);
        setStatusMessage("Status polling timed out. Click Refresh Status.");
      },
      5 * 60 * 1000,
    );

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [running]);

  const runSiteExtraction = async () => {
    setRunning(true);
    setStatusMessage("Starting site extraction...");
    setKickoffResult(null);

    try {
      const res = await fetch(`${API_BASE}/admin/site-extraction/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_url: startUrl.trim(),
        }),
      });

      const payload = (await res.json()) as RunResponse;
      if (!res.ok) {
        throw new Error(payload?.error || `Request failed (${res.status})`);
      }

      setKickoffResult(payload);
      if (payload.run_id) {
        setActiveRunId(payload.run_id);
      }
      setStatusMessage(
        `Run ${payload.run_id || ""} accepted, now polling...`.trim(),
      );

      await fetchExtractionStatus(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRunning(false);
      setStatusMessage(`Failed to run site extraction: ${message}`);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/chat-analytics?days=${analyticsDays}`,
      );
      const payload = (await res.json()) as AnalyticsResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAnalytics(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAnalyticsError(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadRegisteredUsers = async (silent = false) => {
    setUsersLoading(true);
    if (!silent) setUsersError("");
    try {
      const res = await fetch(`${API_BASE}/admin/registered-users`);
      const payload = (await res.json()) as RegisteredUsersResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setRegisteredUsers(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setUsersError(message);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAssistantStatus = async (silent = false) => {
    if (!silent) {
      setAssistantToggleError("");
      setProactiveNudgesToggleError("");
    }
    try {
      const res = await fetch(`${API_BASE}/admin/assistant-status`);
      const payload = (await res.json()) as {
        assistant_enabled?: boolean;
        proactive_nudges_enabled?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAssistantEnabled(payload.assistant_enabled !== false);
      setProactiveNudgesEnabled(payload.proactive_nudges_enabled !== false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setAssistantToggleError(message);
    }
  };

  const setAssistantStatus = async (enabled: boolean) => {
    setAssistantToggleLoading(true);
    setAssistantToggleError("");
    try {
      const res = await fetch(`${API_BASE}/admin/assistant-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant_enabled: enabled,
          proactive_nudges_enabled: proactiveNudgesEnabled,
        }),
      });
      const payload = (await res.json()) as {
        assistant_enabled?: boolean;
        proactive_nudges_enabled?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAssistantEnabled(payload.assistant_enabled !== false);
      setProactiveNudgesEnabled(payload.proactive_nudges_enabled !== false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAssistantToggleError(message);
    } finally {
      setAssistantToggleLoading(false);
    }
  };

  const setProactiveNudgesStatus = async (enabled: boolean) => {
    setAssistantToggleLoading(true);
    setProactiveNudgesToggleError("");
    try {
      const res = await fetch(`${API_BASE}/admin/assistant-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant_enabled: assistantEnabled,
          proactive_nudges_enabled: enabled,
        }),
      });
      const payload = (await res.json()) as {
        assistant_enabled?: boolean;
        proactive_nudges_enabled?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAssistantEnabled(payload.assistant_enabled !== false);
      setProactiveNudgesEnabled(payload.proactive_nudges_enabled !== false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setProactiveNudgesToggleError(message);
    } finally {
      setAssistantToggleLoading(false);
    }
  };

  const loadReportingConfig = async (silent = false) => {
    if (!silent) setReportingError("");
    try {
      const res = await fetch(`${API_BASE}/admin/reporting-config`);
      const payload = (await res.json()) as ReportingConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setReportingConfig({
        enabled: !!payload.enabled,
        frequency: payload.frequency === "monthly" ? "monthly" : "weekly",
        email: payload.email || "info@primiq.ai",
        days: payload.days || 30,
        updated_at: payload.updated_at,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setReportingError(message);
    }
  };

  const loadAlarmConfig = async (silent = false) => {
    if (!silent) setAlarmError("");
    setAlarmLoading(true);
    setAlarmStatus("");

    try {
      const res = await fetch(`${API_BASE}/admin/alarm-config`);
      const payload = (await res.json()) as AlarmConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const components = payload.available_components?.length
        ? payload.available_components
        : DEFAULT_ALARM_COMPONENTS;
      const fallbackEmail = payload.default_email || "info@primiq.ai";
      const normalizedAlarms: AlarmRule[] = (payload.alarms || []).map(
        (rule, index) => {
          const selectedMeta =
            components.find((component) => component.id === rule.component) ||
            DEFAULT_ALARM_COMPONENTS.find(
              (component) => component.id === rule.component,
            );
          const isKpi =
            (rule.kind || selectedMeta?.kind || "api") === "kpi" ||
            String(rule.component).startsWith("kpi-");
          return {
            id: rule.id || `alarm-${index + 1}`,
            name: rule.name || selectedMeta?.label || rule.component,
            component: rule.component,
            kind: isKpi ? "kpi" : "api",
            enabled: rule.enabled !== false,
            email: rule.email || fallbackEmail,
            notify_recovery: rule.notify_recovery !== false,
            cooldown_minutes: Math.max(
              5,
              Math.min(240, Number(rule.cooldown_minutes) || 60),
            ),
            threshold: Number(rule.threshold) || (isKpi ? 1 : 2),
            comparison:
              (rule.comparison as AlarmComparison) ||
              selectedMeta?.default_comparison ||
              "gt",
            timeframe_days: Math.max(
              1,
              Math.min(90, Number(rule.timeframe_days) || 30),
            ),
            status: rule.status,
          };
        },
      );
      setAlarmConfig({
        enabled: !!payload.enabled,
        default_email: fallbackEmail,
        alarms: normalizedAlarms,
        available_components: components,
        status: payload.status,
        updated_at: payload.updated_at,
      });
      if (components.length) {
        setNewAlarmComponent((prev) =>
          components.some((component) => component.id === prev)
            ? prev
            : components[0].id,
        );
      }
      setNewAlarmEmail(fallbackEmail);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setAlarmError(message);
    } finally {
      setAlarmLoading(false);
    }
  };

  const saveAlarmConfig = async () => {
    setAlarmLoading(true);
    setAlarmError("");
    setAlarmStatus("");

    try {
      const res = await fetch(`${API_BASE}/admin/alarm-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: alarmConfig.enabled,
          default_email: alarmConfig.default_email,
          alarms: alarmConfig.alarms,
        }),
      });
      const payload = (await res.json()) as AlarmConfigResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAlarmConfig((prev) => ({
        ...prev,
        ...payload,
      }));
      setAlarmStatus("Alarm settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAlarmError(message);
    } finally {
      setAlarmLoading(false);
    }
  };

  const sendAlarmTest = async () => {
    const target = alarmConfig.alarms.find((rule) => rule.enabled) || null;
    setAlarmLoading(true);
    setAlarmError("");
    setAlarmStatus("");

    try {
      const res = await fetch(`${API_BASE}/admin/alarm/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: target?.email || alarmConfig.default_email,
          alarm_id: target?.id,
          component: target?.component,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setAlarmStatus(
        `Test email sent to ${target?.email || alarmConfig.default_email}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAlarmError(message);
    } finally {
      setAlarmLoading(false);
    }
  };

  const loadGithubConfig = async (silent = false) => {
    if (!silent) {
      setGithubError("");
      setGithubStatus("");
    }
    setGithubLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/github-config`);
      const payload = (await res.json()) as GithubConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setGithubConfig({
        enabled: payload.enabled === true,
        repo_owner: payload.repo_owner || "",
        repo_name: payload.repo_name || "",
        has_token: payload.has_token === true,
        updated_at: payload.updated_at,
      });
      setGithubTokenInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setGithubError(message);
    } finally {
      setGithubLoading(false);
    }
  };

  const saveGithubConfig = async () => {
    setGithubLoading(true);
    setGithubError("");
    setGithubStatus("");
    try {
      const body: Record<string, unknown> = {
        enabled: githubConfig.enabled,
        repo_owner: githubConfig.repo_owner.trim(),
        repo_name: githubConfig.repo_name.trim(),
      };
      if (githubTokenInput.trim()) {
        body.github_token = githubTokenInput.trim();
      }

      const res = await fetch(`${API_BASE}/admin/github-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as GithubConfigResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setGithubConfig({
        enabled: payload.enabled === true,
        repo_owner: payload.repo_owner || "",
        repo_name: payload.repo_name || "",
        has_token: payload.has_token === true,
        updated_at: payload.updated_at,
      });
      setGithubTokenInput("");
      setGithubStatus("GitHub integration settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setGithubError(message);
    } finally {
      setGithubLoading(false);
    }
  };

  const loadJiraConfig = async (silent = false) => {
    if (!silent) {
      setJiraError("");
      setJiraStatus("");
    }
    setJiraLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/jira-config`);
      const payload = (await res.json()) as JiraConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setJiraConfig({
        enabled: payload.enabled === true,
        auto_create_api_down: payload.auto_create_api_down === true,
        base_url: payload.base_url || "",
        project_key: payload.project_key || "",
        email: payload.email || "",
        has_api_token: payload.has_api_token === true,
        issue_type_api_down: payload.issue_type_api_down || "Bug",
        issue_type_weird_answer: payload.issue_type_weird_answer || "Task",
        updated_at: payload.updated_at,
      });
      setJiraApiTokenInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setJiraError(message);
    } finally {
      setJiraLoading(false);
    }
  };

  const saveJiraConfig = async () => {
    setJiraLoading(true);
    setJiraError("");
    setJiraStatus("");
    try {
      const body: Record<string, unknown> = {
        enabled: jiraConfig.enabled,
        auto_create_api_down: jiraConfig.auto_create_api_down,
        base_url: jiraConfig.base_url,
        project_key: jiraConfig.project_key,
        email: jiraConfig.email,
        issue_type_api_down: jiraConfig.issue_type_api_down,
        issue_type_weird_answer: jiraConfig.issue_type_weird_answer,
      };
      if (jiraApiTokenInput.trim()) {
        body.api_token = jiraApiTokenInput.trim();
      }

      const res = await fetch(`${API_BASE}/admin/jira-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as JiraConfigResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setJiraConfig({
        enabled: payload.enabled === true,
        auto_create_api_down: payload.auto_create_api_down === true,
        base_url: payload.base_url || "",
        project_key: payload.project_key || "",
        email: payload.email || "",
        has_api_token: payload.has_api_token === true,
        issue_type_api_down: payload.issue_type_api_down || "Bug",
        issue_type_weird_answer: payload.issue_type_weird_answer || "Task",
        updated_at: payload.updated_at,
      });
      setJiraApiTokenInput("");
      setJiraStatus("Jira integration settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setJiraError(message);
    } finally {
      setJiraLoading(false);
    }
  };

  const testJiraConnection = async () => {
    setJiraLoading(true);
    setJiraError("");
    setJiraStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/jira/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        connected_as?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setJiraStatus(
        `Jira connection OK${payload.connected_as ? ` as ${payload.connected_as}` : ""}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setJiraError(message);
    } finally {
      setJiraLoading(false);
    }
  };

  const createJiraIssue = async (
    payloadBody: Record<string, unknown>,
    loadingKey: string,
    successPrefix: string,
  ) => {
    setJiraIssueLoadingKey(loadingKey);
    setJiraIssueError("");
    setJiraIssueStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/jira/create-issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        key?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const issueRef = payload.key || payload.url || "issue";
      setJiraIssueStatus(`${successPrefix}: ${issueRef}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setJiraIssueError(message);
    } finally {
      setJiraIssueLoadingKey("");
    }
  };

  const createJiraForAlarm = async (
    rule?: AlarmRule | null,
    loadingKey?: string,
  ) => {
    const target =
      rule ||
      alarmConfig.alarms.find(
        (item) =>
          item.enabled &&
          !String(item.component).startsWith("kpi-") &&
          item.status?.is_down,
      ) ||
      alarmConfig.alarms.find(
        (item) => item.enabled && !String(item.component).startsWith("kpi-"),
      ) ||
      null;
    if (!target) {
      setJiraIssueError("No alarm rule available for Jira ticket creation.");
      setJiraIssueStatus("");
      return;
    }
    const reason =
      target.status?.last_error ||
      "API health check failed or degraded unexpectedly.";
    await createJiraIssue(
      {
        template_type: "api_down",
        alarm_name: target.name,
        component: target.component,
        reason,
        checked_at: target.status?.last_checked_at,
      },
      loadingKey || `alarm:${target.id}`,
      "Created Jira API bug",
    );
  };

  const createJiraForFeedback = async (
    item: FeedbackQueueItem,
    loadingKey?: string,
  ) => {
    const rowId = `${item.eventDate}#${item.eventId}`;
    await createJiraIssue(
      {
        template_type: "weird_answer",
        feedback_type: item.feedbackType,
        question: item.questionText,
        answer: item.answerText,
        url: item.url,
      },
      loadingKey || `feedback:${rowId}`,
      "Created Jira answer-quality ticket",
    );
  };

  const loadServiceNowConfig = async (silent = false) => {
    if (!silent) {
      setServiceNowError("");
      setServiceNowStatus("");
    }
    setServiceNowLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/servicenow-config`);
      const payload = (await res.json()) as ServiceNowConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setServiceNowConfig({
        enabled: payload.enabled === true,
        auto_create_api_down: payload.auto_create_api_down === true,
        base_url: payload.base_url || "",
        username: payload.username || "",
        has_password: payload.has_password === true,
        assignment_group: payload.assignment_group || "",
        business_service: payload.business_service || "",
        impact:
          payload.impact === "1" || payload.impact === "3"
            ? payload.impact
            : "2",
        urgency:
          payload.urgency === "1" || payload.urgency === "3"
            ? payload.urgency
            : "2",
        category_api_down: payload.category_api_down || "inquiry",
        category_weird_answer: payload.category_weird_answer || "inquiry",
        updated_at: payload.updated_at,
      });
      setServiceNowPasswordInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setServiceNowError(message);
    } finally {
      setServiceNowLoading(false);
    }
  };

  const saveServiceNowConfig = async () => {
    setServiceNowLoading(true);
    setServiceNowError("");
    setServiceNowStatus("");
    try {
      const body: Record<string, unknown> = {
        enabled: serviceNowConfig.enabled,
        auto_create_api_down: serviceNowConfig.auto_create_api_down,
        base_url: serviceNowConfig.base_url,
        username: serviceNowConfig.username,
        assignment_group: serviceNowConfig.assignment_group,
        business_service: serviceNowConfig.business_service,
        impact: serviceNowConfig.impact,
        urgency: serviceNowConfig.urgency,
        category_api_down: serviceNowConfig.category_api_down,
        category_weird_answer: serviceNowConfig.category_weird_answer,
      };
      if (serviceNowPasswordInput.trim()) {
        body.password = serviceNowPasswordInput.trim();
      }

      const res = await fetch(`${API_BASE}/admin/servicenow-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as ServiceNowConfigResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setServiceNowConfig({
        enabled: payload.enabled === true,
        auto_create_api_down: payload.auto_create_api_down === true,
        base_url: payload.base_url || "",
        username: payload.username || "",
        has_password: payload.has_password === true,
        assignment_group: payload.assignment_group || "",
        business_service: payload.business_service || "",
        impact:
          payload.impact === "1" || payload.impact === "3"
            ? payload.impact
            : "2",
        urgency:
          payload.urgency === "1" || payload.urgency === "3"
            ? payload.urgency
            : "2",
        category_api_down: payload.category_api_down || "inquiry",
        category_weird_answer: payload.category_weird_answer || "inquiry",
        updated_at: payload.updated_at,
      });
      setServiceNowPasswordInput("");
      setServiceNowStatus("ServiceNow integration settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setServiceNowError(message);
    } finally {
      setServiceNowLoading(false);
    }
  };

  const testServiceNowConnection = async () => {
    setServiceNowLoading(true);
    setServiceNowError("");
    setServiceNowStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/servicenow/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        connected_as?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setServiceNowStatus(
        `ServiceNow connection OK${payload.connected_as ? ` as ${payload.connected_as}` : ""}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setServiceNowError(message);
    } finally {
      setServiceNowLoading(false);
    }
  };

  const createServiceNowIncident = async (
    payloadBody: Record<string, unknown>,
    loadingKey: string,
    successPrefix: string,
  ) => {
    setServiceNowTicketLoadingKey(loadingKey);
    setServiceNowTicketError("");
    setServiceNowTicketStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/servicenow/create-incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        number?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const issueRef = payload.number || payload.url || "incident";
      setServiceNowTicketStatus(`${successPrefix}: ${issueRef}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setServiceNowTicketError(message);
    } finally {
      setServiceNowTicketLoadingKey("");
    }
  };

  const createServiceNowForAlarm = async (
    rule?: AlarmRule | null,
    loadingKey?: string,
  ) => {
    const target =
      rule ||
      alarmConfig.alarms.find(
        (item) =>
          item.enabled &&
          !String(item.component).startsWith("kpi-") &&
          item.status?.is_down,
      ) ||
      alarmConfig.alarms.find(
        (item) => item.enabled && !String(item.component).startsWith("kpi-"),
      ) ||
      null;
    if (!target) {
      setServiceNowTicketError(
        "No alarm rule available for ServiceNow incident creation.",
      );
      setServiceNowTicketStatus("");
      return;
    }
    const reason =
      target.status?.last_error ||
      "API health check failed or degraded unexpectedly.";
    await createServiceNowIncident(
      {
        template_type: "api_down",
        alarm_name: target.name,
        component: target.component,
        reason,
        checked_at: target.status?.last_checked_at,
      },
      loadingKey || `alarm:${target.id}`,
      "Created ServiceNow incident",
    );
  };

  const createServiceNowForFeedback = async (
    item: FeedbackQueueItem,
    loadingKey?: string,
  ) => {
    const rowId = `${item.eventDate}#${item.eventId}`;
    await createServiceNowIncident(
      {
        template_type: "weird_answer",
        feedback_type: item.feedbackType,
        question: item.questionText,
        answer: item.answerText,
        url: item.url,
      },
      loadingKey || `feedback:${rowId}`,
      "Created ServiceNow incident",
    );
  };

  const loadTeamsConfig = async (silent = false) => {
    if (!silent) {
      setTeamsError("");
      setTeamsStatus("");
    }
    setTeamsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/teams-config`);
      const payload = (await res.json()) as TeamsConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setTeamsConfig({
        enabled: payload.enabled === true,
        auto_notify_api_down: payload.auto_notify_api_down === true,
        has_webhook: payload.has_webhook === true,
        message_prefix: payload.message_prefix || "CivIQ",
        channel_label: payload.channel_label || "",
        updated_at: payload.updated_at,
      });
      setTeamsWebhookInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setTeamsError(message);
    } finally {
      setTeamsLoading(false);
    }
  };

  const saveTeamsConfig = async () => {
    setTeamsLoading(true);
    setTeamsError("");
    setTeamsStatus("");
    try {
      const body: Record<string, unknown> = {
        enabled: teamsConfig.enabled,
        auto_notify_api_down: teamsConfig.auto_notify_api_down,
        message_prefix: teamsConfig.message_prefix,
        channel_label: teamsConfig.channel_label,
      };
      if (teamsWebhookInput.trim()) {
        body.webhook_url = teamsWebhookInput.trim();
      }

      const res = await fetch(`${API_BASE}/admin/teams-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as TeamsConfigResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setTeamsConfig({
        enabled: payload.enabled === true,
        auto_notify_api_down: payload.auto_notify_api_down === true,
        has_webhook: payload.has_webhook === true,
        message_prefix: payload.message_prefix || "CivIQ",
        channel_label: payload.channel_label || "",
        updated_at: payload.updated_at,
      });
      setTeamsWebhookInput("");
      setTeamsStatus("Teams integration settings saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setTeamsError(message);
    } finally {
      setTeamsLoading(false);
    }
  };

  const testTeamsConnection = async () => {
    setTeamsLoading(true);
    setTeamsError("");
    setTeamsStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/teams/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setTeamsStatus("Teams connection OK.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setTeamsError(message);
    } finally {
      setTeamsLoading(false);
    }
  };

  const sendTeamsMessage = async (
    payloadBody: Record<string, unknown>,
    loadingKey: string,
    successPrefix: string,
  ) => {
    setTeamsMessageLoadingKey(loadingKey);
    setTeamsMessageError("");
    setTeamsMessageStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/teams/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        title?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setTeamsMessageStatus(`${successPrefix}: ${payload.title || "sent"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setTeamsMessageError(message);
    } finally {
      setTeamsMessageLoadingKey("");
    }
  };

  const sendTeamsForAlarm = async (
    rule?: AlarmRule | null,
    loadingKey?: string,
  ) => {
    const target =
      rule ||
      alarmConfig.alarms.find(
        (item) =>
          item.enabled &&
          !String(item.component).startsWith("kpi-") &&
          item.status?.is_down,
      ) ||
      alarmConfig.alarms.find(
        (item) => item.enabled && !String(item.component).startsWith("kpi-"),
      ) ||
      null;
    if (!target) {
      setTeamsMessageError("No alarm rule available for Teams notification.");
      setTeamsMessageStatus("");
      return;
    }
    const reason =
      target.status?.last_error ||
      "API health check failed or degraded unexpectedly.";
    await sendTeamsMessage(
      {
        template_type: "api_down",
        alarm_name: target.name,
        component: target.component,
        reason,
        checked_at: target.status?.last_checked_at,
      },
      loadingKey || `alarm:${target.id}`,
      "Sent Teams alert",
    );
  };

  const sendTeamsForFeedback = async (
    item: FeedbackQueueItem,
    loadingKey?: string,
  ) => {
    const rowId = `${item.eventDate}#${item.eventId}`;
    await sendTeamsMessage(
      {
        template_type: "weird_answer",
        feedback_type: item.feedbackType,
        question: item.questionText,
        answer: item.answerText,
        url: item.url,
      },
      loadingKey || `feedback:${rowId}`,
      "Sent Teams alert",
    );
  };

  const updateAlarmRule = (ruleId: string, updates: Partial<AlarmRule>) => {
    setAlarmConfig((prev) => ({
      ...prev,
      alarms: prev.alarms.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule,
      ),
    }));
  };

  const removeAlarmRule = (ruleId: string) => {
    setAlarmConfig((prev) => ({
      ...prev,
      alarms: prev.alarms.filter((rule) => rule.id !== ruleId),
    }));
  };

  const addAlarmRule = () => {
    const componentMeta =
      alarmConfig.available_components.find(
        (component) => component.id === newAlarmComponent,
      ) ||
      DEFAULT_ALARM_COMPONENTS.find(
        (component) => component.id === newAlarmComponent,
      );
    if (!componentMeta) {
      setAlarmError("Select a valid component.");
      return;
    }
    if (!newAlarmEmail.includes("@")) {
      setAlarmError("Provide a valid alert email.");
      return;
    }

    const nextRule: AlarmRule = {
      id: `alarm-${Date.now()}`,
      name: componentMeta.label,
      component: componentMeta.id,
      kind:
        componentMeta.kind ||
        (componentMeta.id.startsWith("kpi-") ? "kpi" : "api"),
      enabled: true,
      email: newAlarmEmail.trim(),
      notify_recovery: newAlarmNotifyRecovery,
      cooldown_minutes: Math.max(
        5,
        Math.min(240, newAlarmCooldownMinutes || 60),
      ),
      threshold:
        Number(newAlarmThreshold) || (componentMeta.kind === "kpi" ? 1 : 2),
      comparison: (newAlarmComparison ||
        componentMeta.default_comparison ||
        "gt") as AlarmComparison,
      timeframe_days: Math.max(1, Math.min(90, newAlarmTimeframeDays || 30)),
    };

    setAlarmConfig((prev) => ({
      ...prev,
      alarms: [...prev.alarms, nextRule],
    }));
    setAlarmError("");
    setAlarmStatus(`Added ${componentMeta.label}. Save to apply.`);
  };

  const saveReportingConfig = async () => {
    setReportingLoading(true);
    setReportingError("");
    setReportingStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/reporting-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportingConfig),
      });
      const payload = (await res.json()) as ReportingConfigResponse & {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setReportingConfig({
        enabled: !!payload.enabled,
        frequency: payload.frequency === "monthly" ? "monthly" : "weekly",
        email: payload.email || reportingConfig.email,
        days: payload.days || reportingConfig.days,
        updated_at: payload.updated_at,
      });
      setReportingStatus("Reporting schedule saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setReportingError(message);
    } finally {
      setReportingLoading(false);
    }
  };

  const sendReportNow = async () => {
    setReportingLoading(true);
    setReportingError("");
    setReportingStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/reporting/send-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reportingConfig.email,
          days: reportingConfig.days,
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        to?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setReportingStatus(
        `Report sent to ${payload.to || reportingConfig.email}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setReportingError(message);
    } finally {
      setReportingLoading(false);
    }
  };

  const loadPromptConfig = async (silent = false) => {
    setPromptConfigLoading(true);
    if (!silent) setPromptConfigError("");
    try {
      const res = await fetch(`${API_BASE}/admin/prompt-config`);
      const payload = (await res.json()) as PromptConfigResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const nextConfig = {
        system_prompt: payload.system_prompt || "",
        concise_mode: payload.concise_mode === true,
        tone_rules: payload.tone_rules || "",
        updatedAt: payload.updatedAt,
      };
      setPromptConfig(nextConfig);
      setSavedPromptVersion(nextConfig);
      setPendingPromptFeedbackIds({});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setPromptConfigError(message);
    } finally {
      setPromptConfigLoading(false);
    }
  };

  const savePromptConfig = async () => {
    setPromptConfigLoading(true);
    setPromptConfigError("");
    setPromptConfigStatus("");
    if (promptConfig.system_prompt.length > SYSTEM_PROMPT_MAX) {
      setPromptConfigError(
        `system_prompt is too long (max ${SYSTEM_PROMPT_MAX} chars)`,
      );
      setPromptConfigLoading(false);
      return;
    }
    if (promptConfig.tone_rules.length > TONE_RULES_MAX) {
      setPromptConfigError(
        `tone_rules is too long (max ${TONE_RULES_MAX} chars)`,
      );
      setPromptConfigLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/prompt-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: promptConfig.system_prompt,
          concise_mode: promptConfig.concise_mode,
          tone_rules: promptConfig.tone_rules,
          expectedUpdatedAt: promptConfig.updatedAt ?? "",
        }),
      });
      const payload = (await res.json()) as PromptConfigResponse & {
        error?: string;
        conflict?: boolean;
        current?: PromptConfigResponse;
      };
      if (!res.ok) {
        if (res.status === 409 && payload.current) {
          const current = {
            system_prompt: payload.current.system_prompt || "",
            concise_mode: payload.current.concise_mode === true,
            tone_rules: payload.current.tone_rules || "",
            updatedAt: payload.current.updatedAt,
          };
          setPromptConfig(current);
          setSavedPromptVersion(current);
          setPendingPromptFeedbackIds({});
          throw new Error(
            payload.error ||
              "Prompt config changed in another session. Latest version loaded.",
          );
        }
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const savedConfig = {
        system_prompt: payload.system_prompt || "",
        concise_mode: payload.concise_mode === true,
        tone_rules: payload.tone_rules || "",
        updatedAt: payload.updatedAt,
      };
      setPromptConfig(savedConfig);
      setSavedPromptVersion(savedConfig);
      setPendingPromptFeedbackIds({});
      setPromptConfigStatus("Prompt config saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setPromptConfigError(message);
    } finally {
      setPromptConfigLoading(false);
    }
  };

  const loadChannelHealth = async (
    silent = false,
    windowHoursOverride?: number,
  ) => {
    setChannelHealthLoading(true);
    if (!silent) setChannelHealthError("");
    try {
      const selectedWindowHours =
        windowHoursOverride ?? channelHealthWindowHours;
      const periodSeconds =
        selectedWindowHours <= 1 ? 60 : selectedWindowHours <= 6 ? 300 : 900;
      const query = new URLSearchParams({
        window_hours: String(selectedWindowHours),
        period_seconds: String(periodSeconds),
      });
      const res = await fetch(
        `${API_BASE}/admin/channel-health?${query.toString()}`,
      );
      const payload = (await res.json()) as ChannelHealthResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setChannelHealth(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setChannelHealthError(message);
    } finally {
      setChannelHealthLoading(false);
    }
  };

  const loadKnowledgeFreshness = async (silent = false) => {
    setKnowledgeFreshnessLoading(true);
    if (!silent) setKnowledgeFreshnessError("");
    try {
      const res = await fetch(`${API_BASE}/admin/knowledge-freshness`);
      const payload = (await res.json()) as KnowledgeFreshnessResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setKnowledgeFreshness(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setKnowledgeFreshnessError(message);
    } finally {
      setKnowledgeFreshnessLoading(false);
    }
  };

  const loadGuardrailMonitor = async (silent = false) => {
    setGuardrailLoading(true);
    if (!silent) setGuardrailError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/guardrail-monitor?days=${guardrailDays}`,
      );
      const payload = (await res.json()) as GuardrailMonitorResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setGuardrailMonitor(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setGuardrailError(message);
    } finally {
      setGuardrailLoading(false);
    }
  };

  const loadFeedbackQueue = async (silent = false) => {
    setFeedbackQueueLoading(true);
    if (!silent) setFeedbackQueueError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/feedback-queue?days=30&limit=20`,
      );
      const payload = (await res.json()) as FeedbackQueueResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setFeedbackQueue(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setFeedbackQueueError(message);
    } finally {
      setFeedbackQueueLoading(false);
    }
  };

  const loadHallucinationQueue = async (silent = false) => {
    setHallucinationQueueLoading(true);
    if (!silent) setHallucinationQueueError("");
    try {
      const params = new URLSearchParams({
        days: "30",
        limit: "30",
        status: hallucinationStatusFilter,
      });
      const res = await fetch(
        `${API_BASE}/admin/hallucination-queue?${params.toString()}`,
      );
      const payload = (await res.json()) as HallucinationQueueResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setHallucinationQueue(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setHallucinationQueueError(message);
    } finally {
      setHallucinationQueueLoading(false);
    }
  };

  const updateHallucinationStatus = async (
    item: FeedbackQueueItem,
    status: HallucinationStatus,
  ) => {
    const rowId = `${item.eventDate}#${item.eventId}`;
    setHallucinationUpdatingId(rowId);
    setHallucinationQueueError("");
    const notes = (feedbackFixNotes[rowId] || "").trim();
    const severity = String(item.hallucinationSeverity || "")
      .trim()
      .toLowerCase();
    const reasons = Array.isArray(item.hallucinationReasons)
      ? item.hallucinationReasons
      : [];
    try {
      const res = await fetch(`${API_BASE}/admin/hallucination-queue/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate: item.eventDate,
          eventId: item.eventId,
          status,
          notes,
          reasons,
          severity:
            severity === "low" || severity === "medium" || severity === "high"
              ? severity
              : undefined,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      await loadHallucinationQueue(true);
      await loadFeedbackQueue(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setHallucinationQueueError(message);
    } finally {
      setHallucinationUpdatingId("");
    }
  };

  const markFeedbackFixed = async (item: FeedbackQueueItem) => {
    setFeedbackMarkingId(`${item.eventDate}#${item.eventId}`);
    setFeedbackQueueError("");
    const rowId = `${item.eventDate}#${item.eventId}`;
    const promptMarker = `[feedback-fix:${rowId}]`;
    const legacyPromptHeader = `Feedback fix (${item.feedbackType}, ${item.eventDate}, ${item.eventId}):`;
    const appliedToPrompt =
      (promptConfig.tone_rules || "").includes(promptMarker) ||
      (promptConfig.tone_rules || "").includes(legacyPromptHeader);
    const pendingPromptSave = !!pendingPromptFeedbackIds[rowId];
    const typedNote = (feedbackFixNotes[rowId] || "").trim();
    const hasResolutionNotes = typedNote.length >= 8;
    if (!appliedToPrompt && !hasResolutionNotes) {
      setFeedbackQueueError(
        "Add fix guidance (at least 8 chars) or apply this item to Prompt Draft before marking fixed.",
      );
      setFeedbackMarkingId("");
      return;
    }
    if (pendingPromptSave && !hasResolutionNotes) {
      setFeedbackQueueError(
        "This item was added to Prompt Draft but not saved yet. Save Prompt Config or add resolution notes before marking fixed.",
      );
      setFeedbackMarkingId("");
      return;
    }
    const resolutionNotes = typedNote || "Marked fixed from admin console";
    try {
      const res = await fetch(`${API_BASE}/admin/feedback-queue/mark-fixed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate: item.eventDate,
          eventId: item.eventId,
          notes: resolutionNotes,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      await loadFeedbackQueue(true);
      await loadHallucinationQueue(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setFeedbackQueueError(message);
    } finally {
      setFeedbackMarkingId("");
    }
  };

  const applyFeedbackToPromptDraft = (item: FeedbackQueueItem) => {
    const rowId = `${item.eventDate}#${item.eventId}`;
    const marker = `[feedback-fix:${rowId}]`;
    const legacyHeader = `Feedback fix (${item.feedbackType}, ${item.eventDate}, ${item.eventId}):`;
    const note = (feedbackFixNotes[rowId] || "").trim();
    const fallbackGuidance =
      "For similar questions, provide a clear source-grounded answer when available. If policy certainty is low, escalate to human support instead of guessing.";
    const compactQuestion = (item.questionText || "-")
      .replace(/\s+/g, " ")
      .trim();
    const compactAnswer = (item.answerText || "-").replace(/\s+/g, " ").trim();
    const truncate = (value: string, max = 220) =>
      value.length > max ? `${value.slice(0, max).trim()}...` : value;

    const promptRule = [
      marker,
      `Feedback fix (${item.feedbackType}, ${item.eventDate}, ${item.eventId}):`,
      `- Example question: "${truncate(compactQuestion)}"`,
      `- Prior weak response: "${truncate(compactAnswer)}"`,
      `- Required behavior: ${note || fallbackGuidance}`,
    ].join("\n");

    const existingRules = (promptConfig.tone_rules || "").trim();
    const alreadyExists =
      existingRules.includes(marker) || existingRules.includes(legacyHeader);
    if (alreadyExists) {
      setPromptConfigStatus(
        "This feedback item is already in the Tone Rules draft.",
      );
      return;
    }
    const projectedToneRules = existingRules
      ? `${existingRules}\n\n${promptRule}`
      : promptRule;
    if (projectedToneRules.length > TONE_RULES_MAX) {
      setPromptConfigError(
        `Cannot apply: Tone Rules would exceed ${TONE_RULES_MAX} characters.`,
      );
      return;
    }

    setFeedbackPromptApplyingId(rowId);
    setPromptConfigError("");
    setPromptConfig((prev) => {
      const existing = (prev.tone_rules || "").trim();
      if (existing.includes(marker) || existing.includes(legacyHeader))
        return prev;
      const nextToneRules = existing
        ? `${existing}\n\n${promptRule}`
        : promptRule;
      return { ...prev, tone_rules: nextToneRules };
    });
    setPendingPromptFeedbackIds((prev) => ({ ...prev, [rowId]: true }));
    setPromptConfigStatus(
      "Feedback guidance appended to Tone Rules draft. Click Save Prompt Config to apply.",
    );
    setFeedbackPromptApplyingId("");
  };

  const runScenarioSuite = async () => {
    setScenarioLoading(true);
    setScenarioError("");
    try {
      const res = await fetch(`${API_BASE}/admin/scenario-runner/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suite: scenarioSuite }),
      });
      const payload = (await res.json()) as ScenarioRunResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setScenarioRun(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setScenarioError(message);
    } finally {
      setScenarioLoading(false);
    }
  };

  const loadUploads = async (silent = false) => {
    setUploadsLoading(true);
    if (!silent) {
      setUploadsError("");
      setUploadsStatus("");
    }
    try {
      const res = await fetch(`${API_BASE}/admin/uploads`);
      const payload = (await res.json()) as UploadsResponse;
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      setUploads(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (!silent) setUploadsError(message);
    } finally {
      setUploadsLoading(false);
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const commaIndex = dataUrl.indexOf(",");
        if (commaIndex === -1) {
          reject(new Error("Failed to read file data"));
          return;
        }
        resolve(dataUrl.slice(commaIndex + 1));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const uploadSingleFile = async (file: File) => {
    const fileBase64 = await fileToBase64(file);
    const res = await fetch(`${API_BASE}/admin/uploads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileBase64,
        contentType: file.type || "application/octet-stream",
      }),
    });
    const payload = (await res.json()) as {
      ok?: boolean;
      error?: string;
      file_name?: string;
    };
    if (!res.ok) {
      throw new Error(payload.error || `Request failed (${res.status})`);
    }
    return payload.file_name || file.name;
  };

  const updateUploadTask = (taskId: string, patch: Partial<UploadTask>) => {
    setUploadTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
    );
  };

  const handleUploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploadsError("");
    setUploadsStatus("");
    setUploadingFile(true);

    const uploaded: string[] = [];
    const failed: string[] = [];
    const tasks: UploadTask[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      fileName: file.name,
      status: "queued",
      message: "Queued",
      file,
    }));
    setUploadTasks((prev) => [...tasks, ...prev].slice(0, 50));

    try {
      for (let i = 0; i < tasks.length; i += 1) {
        const task = tasks[i];
        const file = task.file;
        if (!file) continue;
        updateUploadTask(task.id, {
          status: "uploading",
          message: `Uploading (${i + 1}/${tasks.length})`,
        });
        setUploadsStatus(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        try {
          const savedName = await uploadSingleFile(file);
          uploaded.push(savedName);
          updateUploadTask(task.id, {
            status: "success",
            message: "Uploaded",
            file: undefined,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed";
          failed.push(file.name);
          updateUploadTask(task.id, { status: "failed", message, file });
        }
      }

      if (uploaded.length && failed.length) {
        setUploadsStatus(
          `Uploaded ${uploaded.length} file(s). Failed: ${failed.join(", ")}`,
        );
      } else if (uploaded.length) {
        setUploadsStatus(
          `Uploaded ${uploaded.length} file(s): ${uploaded.join(", ")}`,
        );
      } else {
        setUploadsError(`Failed to upload files: ${failed.join(", ")}`);
      }

      await loadUploads(true);
      await loadKnowledgeFreshness(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setUploadsError(message);
    } finally {
      setUploadingFile(false);
      setIsUploadDragOver(false);
    }
  };

  const retryUploadTask = async (taskId: string) => {
    const task = uploadTasks.find((row) => row.id === taskId);
    if (!task?.file) return;

    setUploadsError("");
    setUploadsStatus("");
    setUploadingFile(true);
    updateUploadTask(taskId, { status: "uploading", message: "Retrying..." });
    try {
      const savedName = await uploadSingleFile(task.file);
      updateUploadTask(taskId, {
        status: "success",
        message: `Uploaded as ${savedName}`,
        file: undefined,
      });
      setUploadsStatus(`Uploaded ${savedName}.`);
      await loadUploads(true);
      await loadKnowledgeFreshness(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      updateUploadTask(taskId, { status: "failed", message });
      setUploadsError(message);
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteUpload = async (item: UploadItem) => {
    const confirmed = window.confirm(
      `Delete "${item.file_name}" from uploads? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingUploadKey(item.key);
    setUploadsError("");
    setUploadsStatus("");
    try {
      const res = await fetch(`${API_BASE}/admin/uploads/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        opensearch_deleted?: number | null;
        opensearch_remaining_docs?: number | null;
        opensearch_cleanup_confirmed?: boolean | null;
        opensearch_error?: string | null;
      };
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }
      const deletedIndexedText =
        typeof payload.opensearch_deleted === "number"
          ? ` Removed ${payload.opensearch_deleted} indexed docs.`
          : "";
      if (payload.opensearch_error) {
        setUploadsStatus(
          `Deleted ${item.file_name}.${deletedIndexedText} Index cleanup check returned an error; it may take time to fully disappear.`,
        );
      } else if (payload.opensearch_cleanup_confirmed === false) {
        setUploadsStatus(
          `Deleted ${item.file_name}.${deletedIndexedText} ${payload.opensearch_remaining_docs ?? 0} indexed doc(s) still pending cleanup.`,
        );
      } else {
        setUploadsStatus(
          `Deleted ${item.file_name}.${deletedIndexedText} Index cleanup confirmed.`,
        );
      }
      await loadUploads(true);
      await loadKnowledgeFreshness(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setUploadsError(message);
    } finally {
      setDeletingUploadKey("");
    }
  };

  const totalQuestions = analytics?.total_questions ?? 0;
  const totalEscalations = analytics?.escalations?.count ?? 0;
  const interactionsHandledByAI = Math.max(
    totalQuestions - totalEscalations,
    0,
  );

  const callsDeflectedPercent =
    totalQuestions > 0
      ? Math.round((interactionsHandledByAI / totalQuestions) * 100)
      : 41;
  const estimatedStaffHoursSaved =
    totalQuestions > 0
      ? Math.round((interactionsHandledByAI * AVG_CALL_MINUTES) / 60)
      : 312;
  const afterHoursHandledPercent =
    totalQuestions > 0
      ? Math.min(100, Math.max(35, Math.round(callsDeflectedPercent * 1.5)))
      : 63;
  const interactionSavingsPercent = Math.round(
    ((EST_CALL_CENTER_COST - EST_AI_INTERACTION_COST) / EST_CALL_CENTER_COST) *
      100,
  );
  const guardrailEscalations = guardrailMonitor?.escalations ?? null;
  const guardrailRefusals = guardrailMonitor?.refusals ?? null;
  const guardrailFlaggedAnswers = guardrailMonitor?.flagged_answers ?? null;
  const guardrailRate = (count: number | null) =>
    totalQuestions > 0 && count !== null
      ? Math.round((count / totalQuestions) * 10000) / 100
      : null;
  const guardrailTopTriggers = (
    guardrailMonitor?.policy_trigger_reasons || []
  ).slice(0, 3);
  const cleanedLiveTopicCounts = (analytics?.type_counts || [])
    .filter((item) => item && typeof item.count === "number")
    .map((item) => ({
      type: String(item.type || "other"),
      count: Math.max(0, Number(item.count) || 0),
    }))
    .filter((item) => item.count > 0);
  const hasLiveTopicData = cleanedLiveTopicCounts.length > 0;
  const overviewTopicCounts = hasLiveTopicData
    ? cleanedLiveTopicCounts
    : FALLBACK_TOPIC_COUNTS;
  const overviewTopicTotal = overviewTopicCounts.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const overviewTopicPalette = [
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
  const overviewTopicRows = [...overviewTopicCounts]
    .sort((a, b) => b.count - a.count)
    .map((row, index) => ({
      ...row,
      color: overviewTopicPalette[index % overviewTopicPalette.length],
      percent: overviewTopicTotal
        ? Math.round((row.count / overviewTopicTotal) * 1000) / 10
        : 0,
    }));
  const likedCount = analytics?.feedback?.helpful ?? 0;
  const dislikedCount = analytics?.feedback?.not_helpful ?? 0;
  const flaggedCount = analytics?.feedback?.flag ?? 0;
  const feedbackSeriesMax = Math.max(
    likedCount,
    dislikedCount,
    flaggedCount,
    1,
  );
  const feedbackQueueItems = (hallucinationQueue?.items ||
    feedbackQueue?.items ||
    []) as FeedbackQueueItem[];
  const openFeedbackCount =
    hallucinationQueue?.open_count ??
    feedbackQueueItems.filter(
      (item) =>
        String(item.hallucinationStatus || "").toLowerCase() !== "fixed" &&
        item.resolutionStatus !== "fixed",
    ).length;
  const unresolvedFeedbackCount = feedbackQueueItems.filter(
    (item) =>
      String(item.hallucinationStatus || "").toLowerCase() !== "fixed" &&
      String(item.hallucinationStatus || "").toLowerCase() !== "dismissed",
  ).length;
  const overviewApiHealthSnapshots = apiHealth.length
    ? apiHealth
    : API_BASES.map((base): ApiHealthSnapshot => ({ base, results: {} }));

  const hasAnalyticsData = totalQuestions > 0;
  const hasAnalyticsPayload = Boolean(analytics);
  const afterIngestionAnswerRate = hasAnalyticsData
    ? Math.max(
        55,
        Math.min(
          99,
          Math.round(100 - (analytics?.failures?.rate_percent ?? 0)),
        ),
      )
    : 89;
  const beforeIngestionAnswerRate = hasAnalyticsData
    ? Math.max(40, afterIngestionAnswerRate - 27)
    : 62;
  const answerRateUplift = Math.max(
    afterIngestionAnswerRate - beforeIngestionAnswerRate,
    0,
  );
  const analyticsDaysResolved = analytics?.days ?? analyticsDays;
  const avgQuestionsPerDay =
    totalQuestions > 0
      ? Math.round(totalQuestions / Math.max(analyticsDaysResolved, 1))
      : 0;
  const previewConversationBase = avgQuestionsPerDay || 120;

  const conversationTotals: ConversationTotals =
    analytics?.conversation_totals ?? {
      today: previewConversationBase,
      week: previewConversationBase * 7,
      month: previewConversationBase * 30,
    };

  const activeUsers: ActiveUsersMetrics = analytics?.active_users ?? {
    now: Math.max(3, Math.round(conversationTotals.today * 0.06)),
    day: Math.max(24, Math.round(conversationTotals.today * 0.6)),
    week: Math.max(140, Math.round(conversationTotals.week * 0.35)),
    month: Math.max(420, Math.round(conversationTotals.month * 0.25)),
    returning_percent: 42,
    new_percent: 58,
  };

  const messageCounts: MessageCounts = analytics?.message_counts ?? {
    user: Math.round(conversationTotals.month * 1.1),
    assistant: Math.round(conversationTotals.month * 1.15),
  };
  const messageTotal =
    messageCounts.total ?? messageCounts.user + messageCounts.assistant;

  const sessionMetrics: SessionMetrics = analytics?.session_metrics ?? {
    avg_length_messages: 6.4,
    avg_duration_minutes: 5.8,
  };

  const conversationSuccess: ConversationSuccess =
    analytics?.conversation_success ?? {
      resolved: Math.max(
        totalQuestions -
          (analytics?.failures?.count ?? 0) -
          totalEscalations,
        0,
      ),
      abandoned: totalEscalations,
    };
  const successRate =
    conversationSuccess.rate_percent ??
    (conversationSuccess.resolved + conversationSuccess.abandoned > 0
      ? Math.round(
          (conversationSuccess.resolved /
            (conversationSuccess.resolved + conversationSuccess.abandoned)) *
            1000,
        ) / 10
      : 82);

  const peakUsageTimes: PeakUsageMetric[] =
    analytics?.peak_usage_times && analytics.peak_usage_times.length > 0
      ? analytics.peak_usage_times
      : [
          { label: "9–11am", count: 210 },
          { label: "12–2pm", count: 260 },
          { label: "3–5pm", count: 190 },
        ];

  const topEntryPages: EntryPageMetric[] =
    analytics?.top_entry_pages && analytics.top_entry_pages.length > 0
      ? analytics.top_entry_pages
      : [
          { label: "/report-issue", count: 312 },
          { label: "/payments", count: 248 },
          { label: "/utilities", count: 210 },
          { label: "/contact", count: 185 },
        ];

  const deviceBreakdown: DeviceBreakdown =
    analytics?.device_breakdown ?? {
      mobile_percent: 58,
      desktop_percent: 39,
      other_percent: 3,
    };

  const modelUsage: ModelUsage[] =
    analytics?.model_usage && analytics.model_usage.length > 0
      ? analytics.model_usage
      : [
          { model: "gpt-4.1", count: 740 },
          { model: "gpt-4.1-mini", count: 420 },
          { model: "gpt-4o-mini", count: 210 },
        ];

  const tokenUsage: TokenUsage = analytics?.token_usage ?? {
    input: Math.round(conversationTotals.month * 520),
    output: Math.round(conversationTotals.month * 640),
  };

  const costMetrics: CostMetrics = analytics?.cost_metrics ?? {
    per_conversation_usd: 0.04,
    total_usd: Number((conversationTotals.month * 0.04).toFixed(2)),
  };

  const qualityMetrics: QualityMetrics = analytics?.quality_metrics ?? {
    hallucination_rate_percent: analytics?.failures?.rate_percent ?? 4.2,
    fallback_rate_percent: analytics?.failures?.rate_percent ?? 4.2,
    confidence_avg: 0.82,
  };

  const toolCalls: ToolCallMetric[] =
    analytics?.tool_calls && analytics.tool_calls.length > 0
      ? analytics.tool_calls
      : [
          { tool: "search", count: 420 },
          { tool: "summarize", count: 240 },
          { tool: "form_fill", count: 110 },
        ];

  const topCitedDocuments: CitedDocument[] =
    analytics?.top_cited_documents && analytics.top_cited_documents.length > 0
      ? analytics.top_cited_documents
      : [
          { title: "Waste pickup schedule", count: 168 },
          { title: "Parking citation appeals", count: 142 },
          { title: "Water utility rates", count: 120 },
        ];

  const missingKnowledge: MissingKnowledge = analytics?.missing_knowledge ?? {
    count: analytics?.failures?.count ?? Math.round(conversationTotals.week * 0.06),
    rate_percent: analytics?.failures?.rate_percent ?? 3.4,
  };

  const retrievalMetrics: RetrievalMetrics = analytics?.retrieval_metrics ?? {
    success_rate_percent:
      analytics?.failures?.rate_percent !== undefined
        ? Math.max(0, 100 - analytics.failures.rate_percent)
        : 92.6,
  };

  const mostSearchedTopics: EntryPageMetric[] =
    analytics?.most_searched_topics && analytics.most_searched_topics.length > 0
      ? analytics.most_searched_topics
      : overviewTopicCounts.map((item) => ({
          label: String(item.type || "other"),
          count: item.count,
        }));

  const citationMetrics: CitationMetrics = analytics?.citation_metrics ?? {
    clicks: 0,
    impressions: 0,
    click_rate_percent: 0,
  };

  const failedResponses: FailedResponses = analytics?.failed_responses ?? {
    count: analytics?.failures?.count ?? 0,
    rate_percent: analytics?.failures?.rate_percent ?? 0,
  };

  const errorBreakdown: ErrorBreakdownMetric[] =
    analytics?.error_breakdown && analytics.error_breakdown.length > 0
      ? analytics.error_breakdown
      : hasAnalyticsPayload
        ? []
        : [
            { type: "timeout", count: 4 },
            { type: "auth", count: 2 },
            { type: "model", count: 1 },
          ];

  const feedbackRatings: FeedbackRatings =
    analytics?.feedback_ratings ??
    analytics?.feedback ??
    (hasAnalyticsPayload
      ? { helpful: 0, not_helpful: 0, flag: 0 }
      : { helpful: 120, not_helpful: 12, flag: 4 });

  const guardrailFallbackBreakdown: ErrorBreakdownMetric[] = (
    guardrailMonitor?.policy_trigger_reasons || []
  ).map((row) => ({
    type: row.reason,
    count: row.count,
  }));

  const guardrailFallbackTotal = guardrailMonitor
    ? (guardrailMonitor.escalations || 0) +
      (guardrailMonitor.refusals || 0) +
      (guardrailMonitor.flagged_answers || 0)
    : 0;

  const guardrailTriggers: GuardrailTriggers =
    analytics?.guardrail_triggers ??
    (guardrailMonitor
      ? {
          total: guardrailFallbackTotal,
          by_type: guardrailFallbackBreakdown,
        }
      : {
          total: 8,
          by_type: [
            { type: "policy_refusal", count: 4 },
            { type: "safety", count: 3 },
            { type: "privacy", count: 1 },
          ],
        });

  const rateLimitEvents: RateLimitEvents = analytics?.rate_limit_events ?? {
    count: hasAnalyticsPayload ? 0 : 6,
    rate_percent: hasAnalyticsPayload ? 0 : 0.8,
  };

  const escalationsToHuman: EscalationMetric =
    analytics?.escalations_to_human ??
    analytics?.escalations ?? {
      count: totalEscalations,
      rate_percent: guardrailRate(totalEscalations) ?? 0,
    };

  const indexFreshness: IndexFreshness = analytics?.index_freshness ?? {
    last_ingest_at: knowledgeFreshness?.ingest?.updated_at ?? "",
    age_hours: null,
    ingested_docs: knowledgeFreshness?.ingest?.ingested_docs ?? 0,
    failed_docs: knowledgeFreshness?.ingest?.failed_docs ?? 0,
    index: knowledgeFreshness?.ingest?.index ?? "",
  };

  const topUsers: EntryPageMetric[] =
    analytics?.top_users && analytics.top_users.length > 0
      ? analytics.top_users
      : hasAnalyticsPayload
        ? []
        : [
            { label: "guest-1021", count: 24 },
            { label: "resident-204", count: 18 },
            { label: "anon-552", count: 14 },
          ];

  const topOrganizations: EntryPageMetric[] =
    analytics?.top_organizations && analytics.top_organizations.length > 0
      ? analytics.top_organizations
      : hasAnalyticsPayload
        ? []
        : [
            { label: "palo-verde.gov", count: 64 },
            { label: "publicworks", count: 38 },
            { label: "finance", count: 22 },
          ];

  const customerEconomics: CustomerEconomics =
    analytics?.customer_economics ??
    (hasAnalyticsPayload
      ? {
          total_customers: topOrganizations.length,
          cost_per_customer_usd: 0,
          revenue_per_customer_usd: 0,
          margin_percent: 0,
          note: "Connect billing data to compute revenue.",
        }
      : {
          total_customers: 18,
          cost_per_customer_usd: 12.4,
          revenue_per_customer_usd: 84.6,
          margin_percent: 85.3,
        });

  const conversationsPerCustomer: ConversationsPerCustomer =
    analytics?.conversations_per_customer ??
    (hasAnalyticsPayload
      ? {
          avg_conversations: topOrganizations.length
            ? Math.round(conversationTotals.month / topOrganizations.length)
            : 0,
          total_customers: topOrganizations.length,
        }
      : { avg_conversations: 38, total_customers: 18 });

  const trialConversion: TrialConversion =
    analytics?.trial_conversion ??
    (hasAnalyticsPayload
      ? { trial_users: 0, paid_users: 0, conversion_rate_percent: 0 }
      : { trial_users: 42, paid_users: 18, conversion_rate_percent: 42.9 });

  const usageVsPlan: UsageVsPlanLimits =
    analytics?.usage_vs_plan_limits ??
    (hasAnalyticsPayload
      ? {
          conversations_used: conversationTotals.month,
          conversations_limit: undefined,
          conversations_percent: undefined,
          tokens_used: tokenUsage.input + tokenUsage.output,
          tokens_limit: undefined,
          tokens_percent: undefined,
          active_users_used: activeUsers.month,
          active_users_limit: undefined,
          users_percent: undefined,
          note: "Add plan limits to calculate usage %",
        }
      : {
          conversations_used: conversationTotals.month,
          conversations_limit: 4000,
          conversations_percent: 72,
          tokens_used: tokenUsage.input + tokenUsage.output,
          tokens_limit: 900000,
          tokens_percent: 54,
          active_users_used: activeUsers.month,
          active_users_limit: 800,
          users_percent: 52,
        });

  const expansionSignals: ExpansionSignals =
    analytics?.expansion_signals ??
    (hasAnalyticsPayload
      ? {
          heavy_users: topOrganizations.slice(0, 3),
          average_per_customer: conversationsPerCustomer.avg_conversations,
          threshold: undefined,
        }
      : {
          heavy_users: [
            { label: "palo-verde.gov", count: 240 },
            { label: "publicworks", count: 168 },
            { label: "finance", count: 132 },
          ],
          average_per_customer: 38,
          threshold: 80,
        });

  const churnRisk: ChurnRiskIndicators =
    analytics?.churn_risk ??
    (hasAnalyticsPayload
      ? { at_risk: [] }
      : {
          at_risk: [
            { label: "parks", days_since_last_seen: 21 },
            { label: "utilities", days_since_last_seen: 17 },
          ],
        });

  const intentTrends: IntentTrends =
    analytics?.intent_trends ??
    (hasAnalyticsPayload
      ? { window_days: 7, trends: [] }
      : {
          window_days: 7,
          trends: [
            {
              intent: "permits",
              current_count: 92,
              previous_count: 64,
              change_percent: 43.8,
            },
            {
              intent: "payments",
              current_count: 80,
              previous_count: 75,
              change_percent: 6.7,
            },
            {
              intent: "report_issue",
              current_count: 62,
              previous_count: 48,
              change_percent: 29.2,
            },
          ],
        });

  const workflowCompletion: WorkflowCompletion =
    analytics?.workflow_completion ??
    (hasAnalyticsPayload
      ? {
          completed: conversationSuccess.resolved,
          total: conversationSuccess.resolved + conversationSuccess.abandoned,
          rate_percent: successRate,
        }
      : { completed: 820, total: 940, rate_percent: 87.2 });

  const multiTurnSuccess: MultiTurnSuccess =
    analytics?.multi_turn_success ??
    (hasAnalyticsPayload
      ? { completed: 0, total: 0, rate_percent: 0 }
      : { completed: 520, total: 610, rate_percent: 85.2 });

  const agentActionsTimeline: AgentActionPoint[] =
    analytics?.agent_actions_timeline && analytics.agent_actions_timeline.length > 0
      ? analytics.agent_actions_timeline
      : hasAnalyticsPayload
        ? []
        : [
            {
              date: "2026-02-20",
              tool_calls: 62,
              handoffs: 4,
              guardrails: 2,
              failures: 6,
            },
            {
              date: "2026-02-21",
              tool_calls: 58,
              handoffs: 6,
              guardrails: 3,
              failures: 5,
            },
            {
              date: "2026-02-22",
              tool_calls: 71,
              handoffs: 5,
              guardrails: 2,
              failures: 7,
            },
          ];

  const structuredOutputAccuracy: StructuredOutputAccuracy =
    analytics?.structured_output_accuracy ??
    (hasAnalyticsPayload
      ? { accuracy_percent: undefined, samples: 0 }
      : { accuracy_percent: 92.5, samples: 140 });

  const autoEvaluationScores: AutoEvaluationScores =
    analytics?.auto_evaluation_scores ??
    (hasAnalyticsPayload
      ? { average_score: undefined, p95_score: undefined, samples: 0 }
      : { average_score: 0.84, p95_score: 0.93, samples: 220 });

  const toolingStatus: ToolingStatus =
    analytics?.tooling_status ??
    (hasAnalyticsPayload
      ? {
          prompt_diff_viewer: {
            enabled: false,
            note: "Requires prompt version history.",
          },
          model_replay: {
            enabled: false,
            note: "Enable model replay service.",
          },
          test_query_playground: {
            enabled: false,
            note: "Connect to evaluation sandbox.",
          },
          evaluation_runner: {
            enabled: false,
            note: "Upload an evaluation set to run.",
          },
          knowledge_snapshots: {
            enabled: false,
            note: "No snapshot history yet.",
          },
          trace_view: {
            enabled: false,
            note: "Tracing not enabled.",
          },
        }
      : {
          prompt_diff_viewer: { enabled: true },
          model_replay: { enabled: true },
          test_query_playground: { enabled: true },
          evaluation_runner: { enabled: false },
          knowledge_snapshots: { enabled: true },
          trace_view: { enabled: false },
        });

  const knowledgeSnapshots: KnowledgeSnapshot[] =
    analytics?.knowledge_snapshots && analytics.knowledge_snapshots.length > 0
      ? analytics.knowledge_snapshots
      : indexFreshness.last_ingest_at
        ? [
            {
              timestamp: indexFreshness.last_ingest_at,
              index: indexFreshness.index,
              ingested_docs: indexFreshness.ingested_docs,
              failed_docs: indexFreshness.failed_docs,
            },
          ]
        : [];

  const toolStatusRows = [
    { label: "Prompt diff viewer", status: toolingStatus.prompt_diff_viewer },
    {
      label: "Replay conversation (model swap)",
      status: toolingStatus.model_replay,
    },
    {
      label: "Test query playground",
      status: toolingStatus.test_query_playground,
    },
    { label: "Dataset / evaluation runner", status: toolingStatus.evaluation_runner },
    { label: "Knowledge base snapshots", status: toolingStatus.knowledge_snapshots },
    { label: "Trace view (answer rationale)", status: toolingStatus.trace_view },
  ];

  const agentActionsDisplay = agentActionsTimeline.slice(-5);
  const questionAnalyticsPanel = (
    <>
      <h2 className="text-2xl font-bold text-teal-800 mb-2">
        Top Resident Topics (What People Ask)
      </h2>
      <p className="text-gray-700 text-sm mb-4">
        Most common resident question topics in the selected time range.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4 admin-button-row">
        <label
          htmlFor="analyticsDays"
          className="text-sm text-gray-700 font-medium"
        >
          Range
        </label>
        <select
          id="analyticsDays"
          value={analyticsDays}
          onChange={(e) => setAnalyticsDays(Number(e.target.value))}
          className="rounded-lg border border-teal-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <button
          type="button"
          onClick={loadAnalytics}
          disabled={analyticsLoading}
          className={`rounded-lg px-4 py-2 font-semibold transition ${
            analyticsLoading
              ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {analyticsLoading ? "Loading..." : "Load Analytics"}
        </button>
      </div>

      {analyticsError && (
        <p className="text-sm text-red-600 mb-3">
          Failed to load analytics: {analyticsError}
        </p>
      )}

      {(() => {
        const analyticsData: AnalyticsResponse = analytics ?? {
          days: analyticsDays,
          total_questions: 0,
          type_counts: [],
          feedback: { helpful: 0, not_helpful: 0, flag: 0 },
          escalations: { count: 0, rate_percent: 0 },
          failures: { count: 0, rate_percent: 0, by_type: [] },
          suggested_intents: [],
        };
        return ((analytics: AnalyticsResponse) => (
          <div className="rounded-lg border border-teal-200 bg-white p-4">
            <p className="text-sm text-gray-700 mb-4">
              Total questions ({analytics.days} days):{" "}
              <span className="font-bold text-teal-800">
                {analytics.total_questions}
              </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 items-stretch">
              <div className="flex flex-col">
                <div className="h-10 flex items-end">
                  <p className="text-xs uppercase tracking-wide text-gray-600 leading-tight">
                    Escalations
                  </p>
                </div>
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 h-full">
                  <div className="flex items-start gap-3 mt-1">
                    <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-2xl font-extrabold leading-none text-white shadow-sm">
                      {analytics.escalations?.count ?? 0}
                    </span>
                    <p className="text-xs text-gray-600 leading-tight pt-0.5">
                      {analytics.escalations?.rate_percent ?? 0}% of questions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-10 flex items-end">
                  <p className="text-xs uppercase tracking-wide text-gray-600 leading-tight">
                    Failure Signals
                  </p>
                </div>
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 h-full">
                  <div className="flex items-start gap-3 mt-1">
                    <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-red-500 text-2xl font-extrabold leading-none text-white shadow-sm">
                      {analytics.failures?.count ?? 0}
                    </span>
                    <p className="text-xs text-gray-600 leading-tight pt-0.5">
                      {analytics.failures?.rate_percent ?? 0}% of questions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-10 flex items-end">
                  <p className="text-xs uppercase tracking-wide text-gray-600 leading-tight">
                    Suggested Intents
                  </p>
                </div>
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 h-full">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-2xl font-extrabold leading-none text-white shadow-sm">
                      {analytics.suggested_intents?.length ?? 0}
                    </span>
                    <p className="text-xs text-gray-600 leading-tight">
                      real queries
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 mb-5">
              <h3 className="text-sm font-semibold text-teal-800 mb-3">
                Response Feedback
              </h3>
              {(() => {
                const helpful = analytics.feedback?.helpful ?? 0;
                const notHelpful = analytics.feedback?.not_helpful ?? 0;
                const flagged = analytics.feedback?.flag ?? 0;
                const max = Math.max(helpful, notHelpful, flagged, 1);
                const rows = [
                  { key: "liked", value: helpful, color: "bg-emerald-600" },
                  { key: "disliked", value: notHelpful, color: "bg-amber-500" },
                  { key: "flagged", value: flagged, color: "bg-rose-600" },
                ];
                return (
                  <div className="space-y-3">
                    {rows.map((row) => (
                      <div key={row.key}>
                        <div className="mb-1 flex justify-between text-xs text-gray-700">
                          <span className="uppercase tracking-wide">
                            {row.key}
                          </span>
                          <span>{row.value}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-white border border-teal-100">
                          <div
                            className={`h-2.5 rounded-full ${row.color}`}
                            style={{
                              width: `${Math.max(8, Math.round((row.value / max) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {(() => {
              const raw = analytics.type_counts || [];
              const cleanedLive = raw
                .filter((item) => item && typeof item.count === "number")
                .map((item) => ({
                  type: String(item.type || "other"),
                  count: Math.max(0, Number(item.count) || 0),
                }))
                .filter((item) => item.count > 0);
              const fallbackTypeCounts = [
                { type: "permits", count: 180 },
                { type: "payments", count: 140 },
                { type: "report_issue", count: 112 },
                { type: "contact", count: 86 },
                { type: "utilities", count: 62 },
                { type: "other", count: 94 },
              ];
              const hasLiveTopicData = cleanedLive.length > 0;
              const cleaned = hasLiveTopicData
                ? cleanedLive
                : fallbackTypeCounts;

              const total = cleaned.reduce((sum, item) => sum + item.count, 0);
              if (!total) return null;

              const palette = [
                "#0ea5a4", // teal
                "#2563eb", // blue
                "#7c3aed", // violet
                "#f59e0b", // amber
                "#ef4444", // red
                "#10b981", // emerald
                "#06b6d4", // cyan
                "#d946ef", // fuchsia
                "#84cc16", // lime
                "#f97316", // orange
                "#0ea5e9", // sky
                "#64748b", // slate
              ];

              const sorted = [...cleaned].sort((a, b) => b.count - a.count);
              const segments = sorted;

              const fmtLabel = (v: string) => v.replace(/_/g, " ");
              const round1 = (v: number) => Math.round(v * 10) / 10;

              const cx = 50;
              const cy = 50;
              // Make the donut fill more of the SVG (user request: "pie chart itself double size").
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
                ? (slices.find((s) => s.type === selectedTopicType) ?? null)
                : null;
              const selectedLabel = selectedSlice
                ? fmtLabel(selectedSlice.type)
                : "";
              const selectedLabelShort =
                selectedLabel.length > 14
                  ? `${selectedLabel.slice(0, 14)}...`
                  : selectedLabel;

              return (
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 mb-5">
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
                            <span className="text-gray-500">Questions:</span>{" "}
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
                        className="w-full max-w-[612px] aspect-square"
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
                          {selectedSlice ? selectedLabelShort : "questions"}
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
                            <span className="text-gray-500">({s.count})</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {!hasLiveTopicData && (
                      <p className="text-[11px] text-gray-600">
                        Live topic distribution not available yet. Showing a
                        preview mix until analytics data arrives.
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-teal-800 mb-2">
                Top Failure Points
              </h3>
              {analytics.failures?.by_type?.length ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {analytics.failures.by_type.map((item) => (
                    <li key={`failure-${item.type}`}>
                      {item.type.replace("_", " ")}:{" "}
                      <span className="font-semibold">{item.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  No failure signals recorded yet.
                </p>
              )}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-teal-800 mb-2">
                Suggested New Intents
              </h3>
              {analytics.suggested_intents?.length ? (
                <ul className="space-y-2">
                  {analytics.suggested_intents.map((intent) => (
                    <li
                      key={intent.intent_name}
                      className="rounded-lg border border-teal-100 bg-teal-50 p-3"
                    >
                      <p className="text-sm font-semibold text-teal-900">
                        {intent.intent_name}{" "}
                        <span className="text-gray-600">
                          ({intent.observed_count})
                        </span>
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Example: {intent.sample_question || "-"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  No intent suggestions yet (need repeated uncategorized
                  questions).
                </p>
              )}
            </div>
          </div>
        ))(analyticsData);
      })()}
    </>
  );

  const isKnowledgeTab = activeTab === "knowledge";
  const isControlsTab = activeTab === "controls";
  const isAlarmsTab = activeTab === "alarms";
  const isIntegrationsTab = activeTab === "integrations";
  const alarmComponentOptions = alarmConfig.available_components?.length
    ? alarmConfig.available_components
    : DEFAULT_ALARM_COMPONENTS;
  const selectedAlarmComponent =
    alarmComponentOptions.find(
      (component) => component.id === newAlarmComponent,
    ) || alarmComponentOptions[0];
  const selectedAlarmIsKpi =
    (selectedAlarmComponent?.kind || "").toLowerCase() === "kpi" ||
    String(selectedAlarmComponent?.id || "").startsWith("kpi-");
  const enabledAlarmCount = alarmConfig.alarms.filter(
    (rule) => rule.enabled,
  ).length;
  const activeDownAlarm =
    alarmConfig.alarms.find((rule) => rule.enabled && rule.status?.is_down) ||
    null;
  const firstOpenFeedback =
    feedbackQueueItems.find((item) => {
      const status = String(item.hallucinationStatus || "").toLowerCase();
      if (status) {
        return status !== "fixed" && status !== "dismissed";
      }
      return item.resolutionStatus !== "fixed";
    }) ||
    (feedbackQueue?.items || []).find(
      (item) =>
        item.resolutionStatus !== "fixed" &&
        String(item.hallucinationStatus || "").toLowerCase() !== "dismissed",
    ) ||
    null;
  const latencySeries = channelHealth?.chat_router?.latency_timeseries || [];
  const latencyValues = latencySeries
    .map((point) =>
      typeof point.avg_duration_ms === "number" ? point.avg_duration_ms : null,
    )
    .filter((value): value is number => value !== null);
  const avgLatencyMs = latencyValues.length
    ? Math.round(
        latencyValues.reduce((sum, value) => sum + value, 0) /
          latencyValues.length,
      )
    : null;
  const latencyMax = latencyValues.length ? Math.max(...latencyValues) : 0;
  const latencyGuideStepMs = latencyMax > 1500 ? 500 : 250;
  const latencyChartCeiling = Math.max(
    latencyGuideStepMs * 2,
    Math.ceil(
      (Math.max(latencyMax, latencyGuideStepMs) + latencyGuideStepMs) /
        latencyGuideStepMs,
    ) * latencyGuideStepMs,
  );
  const latencyToChartY = (value: number): number =>
    100 -
    (Math.min(Math.max(value, 0), latencyChartCeiling) / latencyChartCeiling) *
      100;
  const latencyGuideLines = Array.from(
    { length: Math.floor(latencyChartCeiling / latencyGuideStepMs) },
    (_, index) => (index + 1) * latencyGuideStepMs,
  )
    .filter((value) => value < latencyChartCeiling)
    .slice(0, 8);
  const latencyPolyline = latencySeries
    .map((point, index) => {
      const value =
        typeof point.avg_duration_ms === "number" ? point.avg_duration_ms : 0;
      const x =
        latencySeries.length <= 1
          ? 0
          : (index / (latencySeries.length - 1)) * 100;
      const y = latencyToChartY(value);
      return `${x},${y}`;
    })
    .join(" ");
  const hasLatencyData = latencySeries.length > 1;
  const fallbackLatencyPolyline = "0,74 16,62 32,69 48,54 64,60 80,47 100,52";
  const latencyDisplayPolyline = hasLatencyData
    ? latencyPolyline
    : fallbackLatencyPolyline;

  const opensearchStatusRaw = String(channelHealth?.opensearch?.status || "")
    .trim()
    .toLowerCase();
  const opensearchStatusTone =
    opensearchStatusRaw === "green"
      ? "ok"
      : opensearchStatusRaw === "yellow"
        ? "warn"
        : opensearchStatusRaw === "red"
          ? "critical"
          : "unknown";
  const opensearchCardClassName =
    opensearchStatusTone === "ok"
      ? "border-emerald-200 bg-emerald-50"
      : opensearchStatusTone === "warn"
        ? "border-amber-200 bg-amber-50"
        : opensearchStatusTone === "critical"
          ? "border-rose-200 bg-rose-50"
          : "border-gray-200 bg-gray-50";
  const opensearchStatusTextClassName =
    opensearchStatusTone === "ok"
      ? "text-emerald-800"
      : opensearchStatusTone === "warn"
        ? "text-amber-800"
        : opensearchStatusTone === "critical"
          ? "text-rose-800"
          : "text-gray-700";

  useEffect(() => {
    setLatencySelectedIndex(null);
  }, [channelHealthWindowHours, channelHealth?.generated_at]);

  useEffect(() => {
    if (!selectedAlarmComponent) return;
    setNewAlarmComparison(
      (selectedAlarmComponent.default_comparison || "gt") as AlarmComparison,
    );
    setNewAlarmThreshold(
      Number(
        selectedAlarmComponent.default_threshold ||
          (selectedAlarmIsKpi ? 1 : 2),
      ),
    );
    setNewAlarmTimeframeDays(selectedAlarmIsKpi ? 30 : 1);
  }, [newAlarmComponent, selectedAlarmComponent, selectedAlarmIsKpi]);

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
      : latencyToChartY(latencySelectedValue);

  const selectLatencyIndexFromClientX = (
    clientX: number,
    rect: DOMRect,
  ): void => {
    if (latencySeries.length <= 1) return;
    if (!rect.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    const rawIndex = Math.round(ratio * (latencySeries.length - 1));
    const clampedIndex = Math.max(
      0,
      Math.min(latencySeries.length - 1, rawIndex),
    );
    setLatencySelectedIndex(clampedIndex);
  };

  const handleLatencyChartClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    selectLatencyIndexFromClientX(event.clientX, rect);
  };

  const handleLatencyChartMouseMove = (
    event: React.MouseEvent<SVGSVGElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    selectLatencyIndexFromClientX(event.clientX, rect);
  };

  const conversationAnalyticsPanel = (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">
            Conversation Analytics
          </h2>
          <p className="text-sm text-gray-700">
            Usage, engagement, quality, and retrieval performance signals.
          </p>
        </div>
        {!analytics && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Preview metrics until analytics data arrives
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Total conversations
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-gray-500">Today</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(conversationTotals.today)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Week</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(conversationTotals.week)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Month</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(conversationTotals.month)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Active users
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-gray-500">Now</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(activeUsers.now)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">DAU</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(activeUsers.day)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">WAU</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(activeUsers.week)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">MAU</p>
              <p className="font-semibold text-teal-800">
                {formatNumber(activeUsers.month)}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <span>Returning</span>
            <span className="font-semibold text-teal-800">
              {formatPercent(activeUsers.returning_percent ?? null)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>New</span>
            <span className="font-semibold text-teal-800">
              {formatPercent(activeUsers.new_percent ?? null)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Messages sent
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>User</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(messageCounts.user)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Assistant</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(messageCounts.assistant)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-teal-100 pt-1 text-xs">
              <span>Total</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(messageTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Engagement
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Avg conversation length</span>
              <span className="font-semibold text-teal-800">
                {sessionMetrics.avg_length_messages ?? "-"} msgs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg session duration</span>
              <span className="font-semibold text-teal-800">
                {sessionMetrics.avg_duration_minutes ?? "-"} min
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Avg response latency
          </p>
          <p className="mt-2 text-2xl font-bold text-teal-800">
            {avgLatencyMs ? `${formatNumber(avgLatencyMs)} ms` : "-"}
          </p>
          <p className="text-xs text-gray-500">
            From chat router latency series.
          </p>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Conversation success
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Resolved</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(conversationSuccess.resolved)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Abandoned</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(conversationSuccess.abandoned)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-teal-100 pt-1 text-xs">
              <span>Success rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(successRate)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Device breakdown
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-gray-500">Mobile</p>
              <p className="font-semibold text-teal-800">
                {formatPercent(deviceBreakdown.mobile_percent)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Desktop</p>
              <p className="font-semibold text-teal-800">
                {formatPercent(deviceBreakdown.desktop_percent)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Other</p>
              <p className="font-semibold text-teal-800">
                {formatPercent(deviceBreakdown.other_percent ?? null)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Peak usage times
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {peakUsageTimes.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Top entry pages
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {topEntryPages.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span className="font-mono text-xs">{item.label}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Model usage
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {modelUsage.map((item) => (
              <li key={item.model} className="flex items-center justify-between">
                <span>{item.model}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Tokens & cost
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Input tokens</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(tokenUsage.input)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Output tokens</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(tokenUsage.output)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cost per convo</span>
              <span className="font-semibold text-teal-800">
                {formatCurrency(costMetrics.per_conversation_usd)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Quality & retrieval
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Fallback / hallucination</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(
                  qualityMetrics.hallucination_rate_percent ??
                    qualityMetrics.fallback_rate_percent ??
                    null,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Confidence score</span>
              <span className="font-semibold text-teal-800">
                {qualityMetrics.confidence_avg
                  ? qualityMetrics.confidence_avg.toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Missing knowledge</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(missingKnowledge.count)} (
                {formatPercent(missingKnowledge.rate_percent)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Retrieval success</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(retrievalMetrics.success_rate_percent)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Tool call frequency
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {toolCalls.map((item) => (
              <li key={item.tool} className="flex items-center justify-between">
                <span>{item.tool}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Top documents cited
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {topCitedDocuments.map((doc) => (
              <li key={doc.title} className="flex items-center justify-between">
                <span>{doc.title}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(doc.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Most searched topics
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {mostSearchedTopics.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span>{item.label.replace(/_/g, " ")}</span>
                <span className="font-semibold text-teal-800">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Citation engagement
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Clicks</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(citationMetrics.clicks)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Impressions</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(citationMetrics.impressions)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Click rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(citationMetrics.click_rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Index freshness
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Last ingest</span>
              <span className="font-semibold text-teal-800">
                {formatDateTime(indexFreshness.last_ingest_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Age (hrs)</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(indexFreshness.age_hours ?? null)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Docs ingested</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(indexFreshness.ingested_docs ?? null)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Failed docs</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(indexFreshness.failed_docs ?? null)}
              </span>
            </div>
            {indexFreshness.index && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Index</span>
                <span className="font-semibold text-teal-800">
                  {indexFreshness.index}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Failed responses
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Count</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(failedResponses.count)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(failedResponses.rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Errors by type
          </p>
          {errorBreakdown.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {errorBreakdown.map((item) => (
                <li key={item.type} className="flex items-center justify-between">
                  <span>{item.type.replace(/_/g, " ")}</span>
                  <span className="font-semibold text-teal-800">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No errors logged yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            User feedback ratings
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Helpful</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(feedbackRatings.helpful)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Not helpful</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(feedbackRatings.not_helpful)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Flagged</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(feedbackRatings.flag)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Escalations to human
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Count</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(escalationsToHuman.count)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(escalationsToHuman.rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Guardrail triggers
          </p>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(guardrailTriggers.total)}
              </span>
            </div>
            {guardrailTriggers.by_type && guardrailTriggers.by_type.length ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {guardrailTriggers.by_type.slice(0, 3).map((item) => (
                  <li
                    key={item.type}
                    className="flex items-center justify-between"
                  >
                    <span>{item.type.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-teal-800">
                      {formatNumber(item.count)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                No guardrail triggers yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Rate limit events
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Count</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(rateLimitEvents.count)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(rateLimitEvents.rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Top users
          </p>
          {topUsers.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {topUsers.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span className="font-mono text-xs">{item.label}</span>
                  <span className="font-semibold text-teal-800">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No user data recorded yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Top organizations
          </p>
          {topOrganizations.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {topOrganizations.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span className="font-mono text-xs">{item.label}</span>
                  <span className="font-semibold text-teal-800">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No organization data recorded yet.
            </p>
          )}
        </div>
      </div>
    </>
  );

  const productAnalyticsPanel = (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">
            Product & Ops Analytics
          </h2>
          <p className="text-sm text-gray-700">
            Business signals, workflow success, and evaluation readiness.
          </p>
        </div>
        {!analytics && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Preview metrics until analytics data arrives
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Cost vs revenue per customer
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Cost / customer</span>
              <span className="font-semibold text-teal-800">
                {formatCurrency(customerEconomics.cost_per_customer_usd)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Revenue / customer</span>
              <span className="font-semibold text-teal-800">
                {formatCurrency(customerEconomics.revenue_per_customer_usd)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Margin</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(customerEconomics.margin_percent ?? null)}
              </span>
            </div>
            {customerEconomics.note && (
              <p className="text-xs text-gray-600">{customerEconomics.note}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Conversations per customer
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Avg conversations</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(conversationsPerCustomer.avg_conversations)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total customers</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(conversationsPerCustomer.total_customers)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Trial to paid conversion
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Trial users</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(trialConversion.trial_users)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Paid users</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(trialConversion.paid_users)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversion rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(trialConversion.conversion_rate_percent ?? null)}
              </span>
            </div>
            {trialConversion.note && (
              <p className="text-xs text-gray-600">{trialConversion.note}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Usage vs plan limits
          </p>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Conversations</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(usageVsPlan.conversations_used)} /{" "}
                {formatNumber(usageVsPlan.conversations_limit ?? null)} (
                {formatPercent(usageVsPlan.conversations_percent ?? null)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tokens</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(usageVsPlan.tokens_used ?? null)} /{" "}
                {formatNumber(usageVsPlan.tokens_limit ?? null)} (
                {formatPercent(usageVsPlan.tokens_percent ?? null)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active users</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(usageVsPlan.active_users_used ?? null)} /{" "}
                {formatNumber(usageVsPlan.active_users_limit ?? null)} (
                {formatPercent(usageVsPlan.users_percent ?? null)})
              </span>
            </div>
            {usageVsPlan.note && (
              <p className="text-xs text-gray-600">{usageVsPlan.note}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Expansion signals
          </p>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Avg per customer</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(expansionSignals.average_per_customer ?? null)}
              </span>
            </div>
            {expansionSignals.heavy_users.length ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {expansionSignals.heavy_users.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="font-mono text-xs">{item.label}</span>
                    <span className="font-semibold text-teal-800">
                      {formatNumber(item.count)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                No heavy-usage accounts yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Churn risk indicators
          </p>
          {churnRisk.at_risk.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {churnRisk.at_risk.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span className="font-mono text-xs">{item.label}</span>
                  <span className="font-semibold text-teal-800">
                    {item.days_since_last_seen ?? "-"} days
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No churn risks flagged.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Intent detection trends
          </p>
          {intentTrends.trends.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {intentTrends.trends.map((item) => (
                <li key={item.intent} className="flex items-center justify-between">
                  <span>{item.intent.replace(/_/g, " ")}</span>
                  <span className="font-semibold text-teal-800">
                    {formatNumber(item.current_count)} (
                    {formatSignedPercent(item.change_percent ?? null)})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No intent trend data yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Workflow completion rate
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(workflowCompletion.completed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(workflowCompletion.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Completion rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(workflowCompletion.rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Multi-turn task success
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Successful</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(multiTurnSuccess.completed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(multiTurnSuccess.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Success rate</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(multiTurnSuccess.rate_percent ?? null)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Agent actions timeline
          </p>
          {agentActionsDisplay.length ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {agentActionsDisplay.map((item) => (
                <li key={item.date} className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    {formatDateTime(item.date)}
                  </span>
                  <span className="font-semibold text-teal-800">
                    {formatNumber(item.tool_calls)} tools /{" "}
                    {formatNumber(item.handoffs)} handoffs
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No agent actions logged yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Structured output accuracy
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Accuracy</span>
              <span className="font-semibold text-teal-800">
                {formatPercent(structuredOutputAccuracy.accuracy_percent ?? null)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Samples</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(structuredOutputAccuracy.samples ?? null)}
              </span>
            </div>
            {structuredOutputAccuracy.note && (
              <p className="text-xs text-gray-600">
                {structuredOutputAccuracy.note}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Auto-evaluation scores
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Average</span>
              <span className="font-semibold text-teal-800">
                {autoEvaluationScores.average_score !== undefined &&
                autoEvaluationScores.average_score !== null
                  ? autoEvaluationScores.average_score.toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>P95</span>
              <span className="font-semibold text-teal-800">
                {autoEvaluationScores.p95_score !== undefined &&
                autoEvaluationScores.p95_score !== null
                  ? autoEvaluationScores.p95_score.toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Samples</span>
              <span className="font-semibold text-teal-800">
                {formatNumber(autoEvaluationScores.samples ?? null)}
              </span>
            </div>
            {autoEvaluationScores.note && (
              <p className="text-xs text-gray-600">
                {autoEvaluationScores.note}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-teal-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-teal-800">
            Ops & Evaluation Tools
          </h3>
          <span className="text-xs text-gray-600">
            Configure integrations to enable advanced tooling.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {toolStatusRows.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-teal-100 bg-teal-50 p-3"
            >
              <p className="text-sm font-semibold text-teal-900">
                {item.label}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                {item.status.enabled ? "Enabled" : "Not enabled"}
              </p>
              {item.status.note && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.status.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-teal-800 mb-2">
            Versioned knowledge snapshots
          </h4>
          {knowledgeSnapshots.length ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {knowledgeSnapshots.map((snap) => (
                <li
                  key={snap.timestamp}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-teal-100 bg-teal-50 px-3 py-2"
                >
                  <span>{formatDateTime(snap.timestamp)}</span>
                  <span className="font-semibold text-teal-800">
                    {snap.index || "default"} ·{" "}
                    {formatNumber(snap.ingested_docs ?? null)} docs
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">
              No knowledge snapshots recorded yet.
            </p>
          )}
        </div>
      </div>
    </>
  );

  const formatTopicLabel = (value: string) => value.replace(/_/g, " ");

  const topicTooltipStyle: React.CSSProperties | undefined = topicTooltip
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

  return (
    <div
      className={`admin-console min-h-screen relative py-16 ${isDarkMode ? "admin-dark" : "admin-light"}`}
    >
      <style>{`
        .admin-console {
          --admin-bg: #F4F7FA;
          --admin-card: #FFFFFF;
          --admin-border: #D9E2EC;
          --admin-text: #1F2933;
          --admin-text-muted: #52606D;
          --admin-accent: #0EA5A4;
          --admin-accent-soft: #CCFBF1;
          --admin-success: #2E7D32;
          --admin-warning: #F59E0B;
          --admin-critical: #C62828;
          font-weight: 600;
          background: var(--admin-bg) !important;
          color: var(--admin-text) !important;
        }

        .admin-console.admin-dark {
          --admin-bg: #0B1F2A;
          --admin-card: #102A43;
          --admin-border: #1F3D57;
          --admin-text: #E6EEF5;
          --admin-text-muted: #B8CAD8;
          --admin-accent: #0EA5A4;
          --admin-accent-soft: #0F3A4A;
          --admin-success: #2E7D32;
          --admin-warning: #F59E0B;
          --admin-critical: #C62828;
        }

        .admin-console .bg-gray-50,
        .admin-console .bg-teal-50,
        .admin-console .bg-white {
          background-color: var(--admin-card) !important;
        }

        .admin-console .border,
        .admin-console .border-teal-200,
        .admin-console .border-teal-100,
        .admin-console .border-gray-200,
        .admin-console .border-teal-300 {
          border-color: var(--admin-border) !important;
        }

        .admin-console .text-gray-900,
        .admin-console .text-gray-700,
        .admin-console .text-gray-600 {
          color: var(--admin-text) !important;
        }

        .admin-console .text-teal-900,
        .admin-console .text-teal-800,
        .admin-console .text-teal-700 {
          color: var(--admin-accent) !important;
        }

        .admin-console .text-xs.text-gray-600,
        .admin-console .text-xs.text-gray-700 {
          color: var(--admin-text-muted) !important;
        }

        /* Make all non-title text easier to read without changing headings. */
        .admin-console .text-sm.text-gray-700,
        .admin-console .text-sm.text-gray-600 {
          font-size: 1rem !important;
          font-weight: 800 !important;
          line-height: 1.35 !important;
        }

        .admin-console .text-xs.text-gray-600,
        .admin-console .text-xs.text-gray-700 {
          font-size: 0.95rem !important;
          font-weight: 800 !important;
          line-height: 1.25 !important;
        }

        .admin-console input,
        .admin-console textarea,
        .admin-console select {
          font-size: 1rem !important;
          font-weight: 800 !important;
        }

        .admin-console .bg-teal-600,
        .admin-console .bg-teal-700 {
          background-color: var(--admin-accent) !important;
        }

        .admin-console .hover\\:bg-teal-700:hover,
        .admin-console .hover\\:bg-teal-100:hover {
          background-color: var(--admin-accent) !important;
          filter: brightness(0.95);
        }

        .admin-console .bg-teal-300 {
          background-color: color-mix(in srgb, var(--admin-accent) 35%, transparent) !important;
        }

        .admin-console .bg-emerald-600,
        .admin-console .bg-emerald-100 {
          background-color: rgba(46, 125, 50, 0.2) !important;
        }

        .admin-console .text-emerald-700,
        .admin-console .text-emerald-800 {
          color: var(--admin-success) !important;
        }

        .admin-console .bg-amber-500 {
          background-color: rgba(245, 158, 11, 0.22) !important;
        }

        .admin-console .text-amber-700,
        .admin-console .text-amber-800 {
          color: var(--admin-warning) !important;
        }

        .admin-console .bg-rose-600,
        .admin-console .bg-rose-100 {
          background-color: rgba(198, 40, 40, 0.22) !important;
        }

        .admin-console .text-red-600,
        .admin-console .text-red-700,
        .admin-console .text-rose-800 {
          color: var(--admin-critical) !important;
        }

        .admin-console input,
        .admin-console select,
        .admin-console textarea {
          background: var(--admin-card) !important;
          color: var(--admin-text) !important;
          border-color: var(--admin-border) !important;
        }

        .admin-console button {
          min-width: 172px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .admin-console .admin-button-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }

        .admin-console .admin-row-card {
          min-height: 560px;
          position: relative;
          resize: both;
          overflow: auto;
          min-width: 320px;
          cursor: grab;
        }

        .admin-console .admin-row-card::after {
          content: "Drag to move / Resize corner";
          position: absolute;
          right: 10px;
          bottom: 8px;
          font-size: 10px;
          color: var(--admin-text-muted);
          pointer-events: none;
          opacity: 0.75;
        }

        .admin-console .admin-row-card.admin-card-dragging {
          opacity: 0.72;
          cursor: grabbing;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
        }

        .admin-console .admin-row-card.admin-card-drop-target {
          outline: 2px dashed color-mix(in srgb, var(--admin-accent) 65%, white);
          outline-offset: 2px;
        }

        .admin-console .admin-grid-top > .admin-row-card,
        .admin-console .admin-grid-insights > .admin-row-card,
        .admin-console .admin-grid-quality > .admin-row-card,
        .admin-console .admin-grid-config > .admin-row-card,
        .admin-console .admin-grid-ops > .admin-row-card {
          min-height: auto;
        }

        @media (max-width: 767px) {
          .admin-console button {
            min-width: 0;
            width: 100%;
            min-height: 40px;
          }

          .admin-console .admin-button-row {
            justify-content: stretch;
          }

          .admin-console .admin-button-row > button {
            width: 100%;
          }
        }

        @media (min-width: 1024px) {
          .admin-console .admin-grid-top > .admin-row-card {
            min-height: 820px;
          }
          .admin-console .admin-grid-insights > .admin-row-card {
            min-height: 380px;
          }
          .admin-console .admin-grid-quality > .admin-row-card {
            min-height: 660px;
          }
          .admin-console .admin-grid-config > .admin-row-card {
            min-height: 680px;
          }
          .admin-console .admin-grid-ops > .admin-row-card {
            min-height: 620px;
          }
        }

        @media (min-width: 1280px) {
          .admin-console .admin-grid-top > .admin-row-card {
            min-height: 760px;
          }
          .admin-console .admin-grid-insights > .admin-row-card {
            min-height: 340px;
          }
          .admin-console .admin-grid-quality > .admin-row-card {
            min-height: 620px;
          }
          .admin-console .admin-grid-config > .admin-row-card {
            min-height: 640px;
          }
          .admin-console .admin-grid-ops > .admin-row-card {
            min-height: 580px;
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
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 rounded-2xl bg-white border border-gray-200 shadow p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-teal-800">
                Exodus Admin Console
              </h1>
              <button
                type="button"
                onClick={() => setIsDarkMode((current) => !current)}
                className="rounded-lg px-4 py-2 font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
              >
                {isDarkMode ? "Switch to Light" : "Switch to Dark"}
              </button>
            </div>
            <p className="text-lg text-gray-700">
              Run backend operations and monitor resident question trends.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="self-start lg:sticky lg:top-20">
              <div className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                  Observe · Investigate · Act · Improve
                </p>
                <h2 className="mt-2 text-lg font-bold text-teal-900">
                  Console Navigation
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Dashboards, alarm response, and integration configuration.
                </p>

                <div className="mt-4 space-y-4">
                  {ADMIN_NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {section.items.map((tab) => {
                          const tabDetails = ADMIN_TAB_DETAILS[tab];
                          const isActive = activeTab === tab;
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveTab(tab)}
                              className={`group w-full rounded-xl border px-3 py-2 text-left transition ${
                                isActive
                                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                                  : "border-teal-200 bg-white text-teal-900 hover:border-teal-400 hover:bg-teal-50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                    isActive
                                      ? "bg-white/20 text-white"
                                      : "bg-teal-100 text-teal-800 group-hover:bg-teal-200"
                                  }`}
                                  aria-hidden="true"
                                >
                                  {tabDetails.icon}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold">
                                    {tabDetails.label}
                                  </span>
                                  <span
                                    className={`mt-0.5 block text-xs leading-snug ${
                                      isActive
                                        ? "text-teal-50"
                                        : "text-gray-600 group-hover:text-gray-700"
                                    }`}
                                  >
                                    {tabDetails.description}
                                  </span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="min-w-0">
          {isAnalyticsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-teal-800">
                    API Health
                  </h2>
                  <p className="text-sm text-gray-700">
                    Lightweight checks against key chatbot admin endpoints for
                    each configured API base.
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Bases:{" "}
                    <span className="font-mono">
                      {API_BASES.length ? API_BASES.join(", ") : API_BASE}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void runApiHealthChecks(false)}
                  disabled={apiHealthLoading}
                  className={`rounded-lg px-4 py-2 font-semibold transition ${
                    apiHealthLoading
                      ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {apiHealthLoading ? "Checking..." : "Refresh API Health"}
                </button>
              </div>

              {apiHealthError && (
                <p className="mt-3 text-sm text-red-600">
                  API health check failed: {apiHealthError}
                </p>
              )}

              <div className="mt-5 space-y-4">
                {(apiHealth.length
                  ? apiHealth
                  : API_BASES.map(
                      (base): ApiHealthSnapshot => ({ base, results: {} }),
                    )
                ).map((snapshot) => {
                  const results = (snapshot.results || {}) as Record<
                    string,
                    ApiHealthResult
                  >;
                  const total = CHATBOT_API_CHECKS.length;
                  const okCount = CHATBOT_API_CHECKS.reduce((sum, check) => {
                    return sum + (results[check.id]?.ok === true ? 1 : 0);
                  }, 0);
                  const healthTone: HealthTone =
                    okCount === total
                      ? "up"
                      : okCount === 0
                        ? "down"
                        : "degraded";
                  const resultValues = Object.values(
                    results,
                  ) as ApiHealthResult[];
                  const lastChecked = resultValues.length
                    ? resultValues
                        .map((r) => r.checkedAt)
                        .sort()
                        .slice(-1)[0]
                    : "";

                  return (
                    <div
                      key={snapshot.base}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold text-teal-900">
                            {snapshot.base}
                          </p>
                          <HealthStatusPill
                            tone={healthTone}
                            label={`${okCount}/${total} OK`}
                            detail={
                              lastChecked ? "Last check" : "No checks yet"
                            }
                            sparkline={resultValues
                              .map((result) =>
                                typeof result.ms === "number"
                                  ? result.ms
                                  : null,
                              )
                              .filter(
                                (value): value is number => value !== null,
                              )}
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          Last checked:{" "}
                          {lastChecked ? formatDateTime(lastChecked) : "—"}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                        {CHATBOT_API_CHECKS.map((check) => {
                          const result = results[check.id];
                          const isOk = result?.ok === true;
                          const endpointTone: HealthTone = result
                            ? isOk
                              ? "up"
                              : "down"
                            : "unknown";
                          const endpointLabel = result
                            ? isOk
                              ? "UP"
                              : "DOWN"
                            : "UNKNOWN";
                          const endpointDetail = result
                            ? isOk
                              ? `${result.ms ?? "-"}ms`
                              : result.status
                                ? `HTTP ${result.status}`
                                : "No response"
                            : "Not checked";

                          return (
                            <div
                              key={check.id}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              <p className="text-xs font-semibold text-gray-700">
                                {check.label}
                              </p>
                              <div
                                className="mt-1"
                                title={result?.error || result?.url || ""}
                              >
                                <HealthStatusPill
                                  tone={endpointTone}
                                  label={endpointLabel}
                                  detail={endpointDetail}
                                  compact
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {isOverviewTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-teal-800">
                  Executive KPIs
                </h2>
                <span className="rounded-full border border-teal-300 bg-white px-3 py-1 text-xs font-semibold text-teal-800">
                  Est. {analytics?.days ?? analyticsDays}-day window
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-teal-200 bg-white p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    Deflected
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 px-3 py-1.5 text-2xl sm:text-3xl font-extrabold text-white shadow-sm">
                      {callsDeflectedPercent}%
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    Hours Saved
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-2xl sm:text-3xl font-extrabold text-white shadow-sm">
                      {estimatedStaffHoursSaved}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    After-hours
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-3 py-1.5 text-2xl sm:text-3xl font-extrabold text-white shadow-sm">
                      {afterHoursHandledPercent}%
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    Cost/Interaction
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-teal-700 to-cyan-500 px-3 py-1.5 text-base font-extrabold text-white shadow-sm">
                        AI ${EST_AI_INTERACTION_COST.toFixed(2)}
                      </span>
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-gray-700 to-gray-500 px-3 py-1.5 text-base font-extrabold text-white shadow-sm">
                        Call ${EST_CALL_CENTER_COST.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      -{interactionSavingsPercent}% vs call center
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-teal-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-teal-800">
                    Quality & Guardrails
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={guardrailDays}
                      onChange={(e) => setGuardrailDays(Number(e.target.value))}
                      className="rounded-lg border border-teal-300 bg-white px-2 py-2 text-sm text-gray-900"
                    >
                      <option value={7}>7d</option>
                      <option value={30}>30d</option>
                      <option value={60}>60d</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => loadGuardrailMonitor(false)}
                      disabled={guardrailLoading}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        guardrailLoading
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {guardrailLoading ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                </div>
                {guardrailError && (
                  <p className="text-sm text-red-600 mb-3">{guardrailError}</p>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      Escalations
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-3 py-1.5 text-2xl font-extrabold text-white shadow-sm">
                        {guardrailEscalations ?? "-"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {guardrailRate(guardrailEscalations) !== null
                        ? `${guardrailRate(guardrailEscalations)}% of questions`
                        : "Rate unavailable"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      Refusals
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1.5 text-2xl font-extrabold text-white shadow-sm">
                        {guardrailRefusals ?? "-"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {guardrailRate(guardrailRefusals) !== null
                        ? `${guardrailRate(guardrailRefusals)}% of questions`
                        : "Rate unavailable"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      Flagged Answers
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-500 px-3 py-1.5 text-2xl font-extrabold text-white shadow-sm">
                        {guardrailFlaggedAnswers ?? "-"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {guardrailRate(guardrailFlaggedAnswers) !== null
                        ? `${guardrailRate(guardrailFlaggedAnswers)}% of questions`
                        : "Rate unavailable"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      Top Policy Trigger
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-baseline rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-3 py-1.5 text-xl font-extrabold text-white shadow-sm">
                        {guardrailTopTriggers[0]?.count ?? "-"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {guardrailTopTriggers[0]
                        ? guardrailTopTriggers[0].reason.replaceAll("_", " ")
                        : "No trigger data"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
                  <p className="text-sm font-semibold text-teal-800 mb-2">
                    Top Policy Trigger Reasons
                  </p>
                  {guardrailTopTriggers.length ? (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {guardrailTopTriggers.map((item) => (
                        <li key={item.reason} className="flex justify-between">
                          <span>{item.reason.replaceAll("_", " ")}</span>
                          <span className="font-semibold text-teal-800">
                            {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No policy triggers recorded yet.
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                Estimates assume {AVG_CALL_MINUTES} min per avoided call and $
                {EST_CALL_CENTER_COST.toFixed(2)} per call-center interaction.
              </p>
            </section>
          )}

          {isOverviewTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-white p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-teal-800">
                    Overview Workspace
                  </h2>
                  <p className="text-sm text-gray-700">
                    Key cards copied from Health, Analytics, and Controls. Drag
                    cards to reorder.
                  </p>
                </div>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                  Drag and drop enabled
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {overviewWidgetOrder.map((widgetKey) => (
                  <article
                    key={widgetKey}
                    className="rounded-xl border border-teal-200 bg-teal-50 p-4 transition opacity-100 shadow-sm admin-row-card"
                  >
                    {widgetKey === "operational_health" && (
                      <>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-teal-800">
                              Operational Health
                            </h3>
                            <p className="text-sm text-gray-700">
                              Live latency and channel status snapshot.
                            </p>
                          </div>
                          <span className="cursor-move select-none rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-800">
                            Drag
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          <HealthStatusPill
                            tone={
                              (channelHealth?.chat_router?.error_rate_percent ??
                                0) > 5
                                ? "degraded"
                                : "up"
                            }
                            label="Chat Router"
                            detail={`${channelHealth?.chat_router?.avg_duration_ms ?? "-"} ms avg`}
                            sparkline={latencyValues}
                          />
                          <HealthStatusPill
                            tone={
                              opensearchStatusTone === "ok"
                                ? "up"
                                : opensearchStatusTone === "warn"
                                  ? "degraded"
                                  : opensearchStatusTone === "critical"
                                    ? "down"
                                    : "unknown"
                            }
                            label="OpenSearch"
                            detail={
                              channelHealth?.opensearch?.status
                                ? String(channelHealth.opensearch.status)
                                : "Unknown"
                            }
                          />
                        </div>
                        <div className="h-36 rounded-lg border border-teal-100 bg-white p-2">
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className={`h-full w-full ${hasLatencyData ? "cursor-pointer" : "cursor-default"}`}
                            onClick={
                              hasLatencyData
                                ? handleLatencyChartClick
                                : undefined
                            }
                            onMouseMove={
                              hasLatencyData
                                ? handleLatencyChartMouseMove
                                : undefined
                            }
                            role="img"
                            aria-label="Latency trend preview"
                          >
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.35"
                              className={
                                hasLatencyData
                                  ? "text-teal-700"
                                  : "text-teal-400"
                              }
                              points={latencyDisplayPolyline}
                            />
                          </svg>
                        </div>
                        {latencySelectedPoint && (
                          <p className="mt-2 text-xs text-gray-700">
                            Selected:{" "}
                            <span className="font-semibold text-teal-800">
                              {typeof latencySelectedPoint.avg_duration_ms ===
                              "number"
                                ? `${latencySelectedPoint.avg_duration_ms.toFixed(1)} ms`
                                : "-"}
                            </span>
                          </p>
                        )}
                      </>
                    )}

                    {widgetKey === "api_health" && (
                      <>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-teal-800">
                              API Health Snapshot
                            </h3>
                            <p className="text-sm text-gray-700">
                              Endpoint status rollup per API base.
                            </p>
                          </div>
                          <span className="cursor-move select-none rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-800">
                            Drag
                          </span>
                        </div>
                        <div className="space-y-2">
                          {overviewApiHealthSnapshots.map((snapshot) => {
                            const results = (snapshot.results || {}) as Record<
                              string,
                              ApiHealthResult
                            >;
                            const okCount = CHATBOT_API_CHECKS.reduce(
                              (sum, check) =>
                                sum + (results[check.id]?.ok ? 1 : 0),
                              0,
                            );
                            const lastChecked = Object.values(results)
                              .map((row) => row.checkedAt)
                              .sort()
                              .slice(-1)[0];
                            const total = CHATBOT_API_CHECKS.length;
                            const tone: HealthTone =
                              okCount === total
                                ? "up"
                                : okCount === 0
                                  ? "down"
                                  : "degraded";
                            return (
                              <div
                                key={snapshot.base}
                                className="rounded-lg border border-teal-100 bg-white px-3 py-2"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-gray-700">
                                    {snapshot.base}
                                  </p>
                                  <HealthStatusPill
                                    tone={tone}
                                    label={`${okCount}/${total} OK`}
                                    detail={lastChecked ? "Checked" : "Pending"}
                                    compact
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {widgetKey === "topic_mix" && (
                      <>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-teal-800">
                              Topic Mix
                            </h3>
                            <p className="text-sm text-gray-700">
                              Top resident intents from analytics.
                            </p>
                          </div>
                          <span className="cursor-move select-none rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-800">
                            Drag
                          </span>
                        </div>
                        <p className="mb-2 text-xs text-gray-700">
                          Total questions:{" "}
                          <span className="font-semibold text-teal-800">
                            {overviewTopicTotal}
                          </span>
                        </p>
                        <div className="space-y-1.5">
                          {overviewTopicRows.slice(0, 7).map((topic) => (
                            <div
                              key={`overview-topic-${topic.type}`}
                              className="flex items-center justify-between gap-2 rounded-md border border-teal-100 bg-white px-3 py-1.5"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-sm"
                                  style={{ backgroundColor: topic.color }}
                                />
                                <span className="text-xs font-semibold text-gray-800">
                                  {formatTopicLabel(topic.type)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700">
                                <span className="font-semibold">
                                  {topic.percent}%
                                </span>{" "}
                                ({topic.count})
                              </span>
                            </div>
                          ))}
                        </div>
                        {!hasLiveTopicData && (
                          <p className="mt-2 text-[11px] text-gray-600">
                            Showing fallback preview until live topic counts
                            arrive.
                          </p>
                        )}
                      </>
                    )}

                    {widgetKey === "feedback" && (
                      <>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-teal-800">
                              Feedback Signals
                            </h3>
                            <p className="text-sm text-gray-700">
                              Liked/disliked trends and queue status.
                            </p>
                          </div>
                          <span className="cursor-move select-none rounded-md border border-teal-200 bg-white px-2 py-1 text-xs font-semibold text-teal-800">
                            Drag
                          </span>
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-teal-100 bg-white px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-gray-600">
                              Open queue
                            </p>
                            <p className="text-lg font-extrabold text-teal-800">
                              {openFeedbackCount}
                            </p>
                          </div>
                          <div className="rounded-lg border border-teal-100 bg-white px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-gray-600">
                              Escalations
                            </p>
                            <p className="text-lg font-extrabold text-teal-800">
                              {analytics?.escalations?.count ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              key: "liked",
                              value: likedCount,
                              color: "bg-emerald-600",
                            },
                            {
                              key: "disliked",
                              value: dislikedCount,
                              color: "bg-amber-500",
                            },
                            {
                              key: "flagged",
                              value: flaggedCount,
                              color: "bg-rose-600",
                            },
                          ].map((row) => (
                            <div key={`overview-feedback-${row.key}`}>
                              <div className="mb-1 flex items-center justify-between text-xs text-gray-700">
                                <span className="uppercase tracking-wide">
                                  {row.key}
                                </span>
                                <span>{row.value}</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full border border-teal-100 bg-white">
                                <div
                                  className={`h-2.5 rounded-full ${row.color}`}
                                  style={{
                                    width: `${Math.max(8, Math.round((row.value / feedbackSeriesMax) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {isHealthTab && (
            <section className="mb-8 grid grid-cols-1 gap-6 items-stretch admin-grid-top">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-teal-800">
                      Channel Health
                    </h2>
                    <p className="text-sm text-gray-700">
                      Live health view for chat routing, downstream lambdas, and
                      OpenSearch.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadChannelHealth(false)}
                    disabled={channelHealthLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      channelHealthLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {channelHealthLoading
                      ? "Refreshing..."
                      : "Refresh Channel Health"}
                  </button>
                  <select
                    value={channelHealthWindowHours}
                    onChange={(e) => {
                      const nextHours = Number(e.target.value);
                      setChannelHealthWindowHours(nextHours);
                      void loadChannelHealth(true, nextHours);
                    }}
                    className="rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value={1}>1h</option>
                    <option value={6}>6h</option>
                    <option value={24}>24h</option>
                    <option value={72}>72h</option>
                    <option value={168}>7d</option>
                  </select>
                </div>

                {channelHealthError && (
                  <p className="text-sm text-red-600 mb-3">
                    Failed to load channel health: {channelHealthError}
                  </p>
                )}

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
                      points
                      {channelHealth?.chat_router?.period_seconds ? (
                        <>
                          {" "}
                          • period{" "}
                          <span className="font-semibold text-teal-800">
                            {channelHealth.chat_router.period_seconds}s
                          </span>
                        </>
                      ) : null}
                      {latencyValues.length ? (
                        <>
                          • max{" "}
                          <span className="font-semibold text-teal-800">
                            {latencyMax.toFixed(1)} ms
                          </span>{" "}
                          • chart ceiling{" "}
                          <span className="font-semibold text-teal-800">
                            {latencyChartCeiling} ms
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 h-64 w-full rounded-xl border border-teal-100 bg-teal-50 p-3">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className={`w-full h-full ${hasLatencyData ? "cursor-pointer" : "cursor-default"}`}
                      onClick={
                        hasLatencyData ? handleLatencyChartClick : undefined
                      }
                      onMouseMove={
                        hasLatencyData ? handleLatencyChartMouseMove : undefined
                      }
                      role="img"
                      aria-label="Chat router latency timeseries chart"
                    >
                      {latencyGuideLines.map((guideValue) => {
                        const y = latencyToChartY(guideValue);
                        return (
                          <g key={`latency-guide-${guideValue}`}>
                            <line
                              x1="0"
                              y1={y}
                              x2="100"
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="0.5"
                              strokeDasharray="1.2 1.2"
                              className="text-teal-300"
                            />
                            <text
                              x="1"
                              y={Math.max(5, y - 1.2)}
                              className="fill-teal-600"
                              fontSize="3.1"
                            >
                              {guideValue} ms
                            </text>
                          </g>
                        );
                      })}
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        className={
                          hasLatencyData ? "text-teal-700" : "text-teal-400"
                        }
                        points={latencyDisplayPolyline}
                      />
                      {hasLatencyData &&
                        latencySelectedX !== null &&
                        latencySelectedY !== null && (
                          <>
                            <line
                              x1={latencySelectedX}
                              y1="0"
                              x2={latencySelectedX}
                              y2="100"
                              stroke="currentColor"
                              strokeWidth="0.6"
                              strokeDasharray="2 2"
                              className="text-teal-400"
                            />
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

                  {hasLatencyData ? (
                    latencySelectedPoint ? (
                      <div className="mt-3 rounded-lg border border-teal-100 bg-white px-3 py-2 text-xs text-gray-700">
                        <span className="font-semibold text-teal-800">
                          {typeof latencySelectedPoint.avg_duration_ms ===
                          "number"
                            ? `${latencySelectedPoint.avg_duration_ms.toFixed(1)} ms`
                            : "-"}
                        </span>{" "}
                        at{" "}
                        <span className="font-semibold">
                          {formatDateTime(latencySelectedPoint.timestamp)}
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
                    )
                  ) : (
                    <p className="mt-2 text-[11px] text-gray-600">
                      Live latency data not available yet. Showing a preview
                      trend until datapoints arrive.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">
                      Chat Router
                    </p>
                    <p className="text-sm text-gray-700">
                      Avg latency:{" "}
                      <span className="font-semibold text-teal-800">
                        {channelHealth?.chat_router?.avg_duration_ms ?? "-"} ms
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Error rate:{" "}
                      <span className="font-semibold text-teal-800">
                        {channelHealth?.chat_router?.error_rate_percent ?? "-"}%
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {channelHealth?.chat_router?.invocations ?? "-"}{" "}
                      invocations / {channelHealth?.chat_router?.errors ?? "-"}{" "}
                      errors (last{" "}
                      {channelHealth?.chat_router?.window_minutes ?? 60}m)
                    </p>
                    {channelHealth?.chat_router?.error && (
                      <p className="text-xs text-red-600 mt-2">
                        {channelHealth.chat_router.error}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">
                      Downstream Lambdas
                    </p>
                    <div className="space-y-2">
                      {(channelHealth?.downstream_lambdas || []).map((fn) => (
                        <div
                          key={fn.function_name}
                          className="rounded border border-teal-100 bg-teal-50 p-2"
                        >
                          <p className="text-xs font-semibold text-teal-900">
                            {fn.function_name}
                          </p>
                          <p className="text-xs text-gray-700">
                            State: {fn.state || "-"} | Update:{" "}
                            {fn.last_update_status || "-"}
                          </p>
                          {fn.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {fn.error}
                            </p>
                          )}
                        </div>
                      ))}
                      {!(channelHealth?.downstream_lambdas || []).length && (
                        <p className="text-sm text-gray-600">
                          No downstream status yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${opensearchCardClassName}`}
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">
                      OpenSearch
                    </p>
                    <p className="text-sm text-gray-700">
                      Cluster status:{" "}
                      <span
                        className={`font-semibold uppercase ${opensearchStatusTextClassName}`}
                      >
                        {channelHealth?.opensearch?.status || "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Nodes:{" "}
                      <span className="font-semibold text-teal-800">
                        {channelHealth?.opensearch?.number_of_nodes ?? "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Active shards:{" "}
                      <span className="font-semibold text-teal-800">
                        {channelHealth?.opensearch?.active_shards ?? "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Unassigned shards:{" "}
                      <span className="font-semibold text-teal-800">
                        {channelHealth?.opensearch?.unassigned_shards ?? "-"}
                      </span>
                    </p>
                    {channelHealth?.opensearch?.error && (
                      <p className="text-xs text-red-600 mt-2">
                        {channelHealth.opensearch.error}
                      </p>
                    )}
                  </div>
                </div>

                {channelHealth?.generated_at && (
                  <p className="mt-3 text-xs text-gray-600">
                    Last refreshed: {formatDateTime(channelHealth.generated_at)}
                  </p>
                )}
              </div>
            </section>
          )}

          {isAnalyticsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
              {questionAnalyticsPanel}
            </section>
          )}

          {isAnalyticsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-white p-6 sm:p-8">
              {conversationAnalyticsPanel}
            </section>
          )}

          {isAnalyticsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-white p-6 sm:p-8">
              {productAnalyticsPanel}
            </section>
          )}

          {isKnowledgeTab && (
            <section className="mb-8 grid grid-cols-1 gap-6 items-stretch admin-grid-insights">
              {isKnowledgeTab && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:p-5 h-full admin-row-card">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-teal-800">
                      Knowledge Freshness
                    </h2>
                    <button
                      type="button"
                      onClick={() => loadKnowledgeFreshness(false)}
                      disabled={knowledgeFreshnessLoading}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        knowledgeFreshnessLoading
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {knowledgeFreshnessLoading ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                  {knowledgeFreshnessError && (
                    <p className="text-sm text-red-600 mb-3">
                      {knowledgeFreshnessError}
                    </p>
                  )}

                  <div className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    <p>
                      Crawl status:{" "}
                      <span className="font-semibold text-teal-800">
                        {knowledgeFreshness?.crawl?.status || "-"}
                      </span>
                    </p>
                    <p>
                      Last crawl:{" "}
                      <span className="font-semibold text-teal-800">
                        {formatDateTime(knowledgeFreshness?.crawl?.updated_at)}
                      </span>
                    </p>
                    <p>
                      Last ingest:{" "}
                      <span className="font-semibold text-teal-800">
                        {formatDateTime(knowledgeFreshness?.ingest?.updated_at)}
                      </span>
                    </p>
                    <p>
                      Docs indexed:{" "}
                      <span className="font-semibold text-teal-800">
                        {knowledgeFreshness?.docs_indexed_count ?? "-"}
                      </span>
                    </p>
                    <p>
                      Ingested docs (last run):{" "}
                      <span className="font-semibold text-teal-800">
                        {knowledgeFreshness?.ingest?.ingested_docs ?? "-"}
                      </span>
                    </p>
                  </div>

                  {!!knowledgeFreshness?.warnings?.length && (
                    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5">
                      <p className="text-sm font-semibold text-amber-800">
                        Stale-content warnings
                      </p>
                      <ul className="mt-1.5 max-h-28 overflow-y-auto list-disc pl-5 text-xs text-amber-900 space-y-1">
                        {knowledgeFreshness.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {isControlsTab && (
            <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch admin-grid-quality">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-teal-800">
                    Feedback Queue
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      void loadFeedbackQueue(false);
                      void loadHallucinationQueue(false);
                    }}
                    disabled={feedbackQueueLoading || hallucinationQueueLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      feedbackQueueLoading || hallucinationQueueLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {feedbackQueueLoading || hallucinationQueueLoading
                      ? "Refreshing..."
                      : "Refresh Queue"}
                  </button>
                </div>
                {feedbackQueueError && (
                  <p className="text-sm text-red-600 mb-3">
                    {feedbackQueueError}
                  </p>
                )}
                {hallucinationQueueError && (
                  <p className="text-sm text-red-600 mb-3">
                    Hallucination queue error: {hallucinationQueueError}
                  </p>
                )}
                {jiraIssueStatus && (
                  <p className="text-sm text-emerald-700 mb-3">
                    {jiraIssueStatus}
                  </p>
                )}
                {jiraIssueError && (
                  <p className="text-sm text-red-600 mb-3">
                    Jira issue error: {jiraIssueError}
                  </p>
                )}
                {serviceNowTicketStatus && (
                  <p className="text-sm text-emerald-700 mb-3">
                    {serviceNowTicketStatus}
                  </p>
                )}
                {serviceNowTicketError && (
                  <p className="text-sm text-red-600 mb-3">
                    ServiceNow issue error: {serviceNowTicketError}
                  </p>
                )}
                {teamsMessageStatus && (
                  <p className="text-sm text-emerald-700 mb-3">
                    {teamsMessageStatus}
                  </p>
                )}
                {teamsMessageError && (
                  <p className="text-sm text-red-600 mb-3">
                    Teams error: {teamsMessageError}
                  </p>
                )}
                {promptHasUnsavedChanges && (
                  <p className="mb-3 text-xs text-amber-700">
                    Prompt draft has unsaved changes. Save Prompt Config before
                    finalizing feedback items tied to prompt updates.
                  </p>
                )}
                <div className="mb-3 rounded-lg border border-teal-200 bg-white p-3 text-xs text-gray-700">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-teal-800">
                      Hallucination Review (V2)
                    </p>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <span>Status</span>
                      <select
                        value={hallucinationStatusFilter}
                        onChange={(e) =>
                          setHallucinationStatusFilter(
                            e.target.value as HallucinationStatusFilter,
                          )
                        }
                        className="rounded border border-teal-200 bg-white px-2 py-1 text-xs text-gray-900"
                      >
                        <option value="open">Open</option>
                        <option value="triaged">Triaged</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="fixed">Fixed</option>
                        <option value="all">All</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <p>
                      Open:{" "}
                      <span className="font-semibold">
                        {hallucinationQueue?.open_count ??
                          unresolvedFeedbackCount}
                      </span>
                    </p>
                    <p>
                      Confirmed:{" "}
                      <span className="font-semibold">
                        {hallucinationQueue?.confirmed_count ?? 0}
                      </span>
                    </p>
                    <p>
                      Fixed:{" "}
                      <span className="font-semibold">
                        {hallucinationQueue?.fixed_count ?? 0}
                      </span>
                    </p>
                    <p>
                      High severity:{" "}
                      <span className="font-semibold">
                        {hallucinationQueue?.high_count ?? 0}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {feedbackQueueItems.length === 0 && (
                    <p className="text-sm text-gray-600">
                      No flagged or not-helpful items found.
                    </p>
                  )}
                  {feedbackQueueItems.map((item) => {
                    const rowId = `${item.eventDate}#${item.eventId}`;
                    const promptMarker = `[feedback-fix:${rowId}]`;
                    const legacyPromptHeader = `Feedback fix (${item.feedbackType}, ${item.eventDate}, ${item.eventId}):`;
                    const alreadyAppliedToPromptDraft =
                      (promptConfig.tone_rules || "").includes(promptMarker) ||
                      (promptConfig.tone_rules || "").includes(
                        legacyPromptHeader,
                      );
                    const requiresPromptSave =
                      !!pendingPromptFeedbackIds[rowId];
                    const typedFixGuidance = (
                      feedbackFixNotes[rowId] || ""
                    ).trim();
                    const hasResolutionNotes = typedFixGuidance.length >= 8;
                    const rowHallucinationStatus = String(
                      item.hallucinationStatus ||
                        (item.resolutionStatus === "fixed" ? "fixed" : "open"),
                    ).toLowerCase();
                    const disableMarkFixed =
                      feedbackMarkingId === rowId ||
                      rowHallucinationStatus === "fixed" ||
                      (requiresPromptSave && !hasResolutionNotes);
                    return (
                      <div
                        key={rowId}
                        className="rounded-lg border border-teal-200 bg-white p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-wide text-gray-600">
                            {item.feedbackType} •{" "}
                            {formatDateTime(item.createdAt)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                rowHallucinationStatus === "fixed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rowHallucinationStatus === "confirmed"
                                    ? "bg-rose-100 text-rose-800"
                                    : rowHallucinationStatus === "dismissed"
                                      ? "bg-slate-100 text-slate-700"
                                      : rowHallucinationStatus === "triaged"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-sky-100 text-sky-800"
                              }`}
                            >
                              {rowHallucinationStatus}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                String(
                                  item.hallucinationSeverity,
                                ).toLowerCase() === "high"
                                  ? "bg-rose-100 text-rose-800"
                                  : String(
                                        item.hallucinationSeverity,
                                      ).toLowerCase() === "low"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {String(item.hallucinationSeverity || "medium")}{" "}
                              risk
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">Q:</span>{" "}
                          {item.questionText || "-"}
                        </p>
                        <p className="mt-1 text-xs text-gray-700">
                          <span className="font-semibold">A:</span>{" "}
                          {item.answerText || "-"}
                        </p>
                        {item.url && (
                          <p className="mt-1 text-xs text-teal-700">
                            {item.url}
                          </p>
                        )}
                        {!!item.hallucinationReasons?.length && (
                          <p className="mt-1 text-[11px] text-gray-600">
                            <span className="font-semibold">Signals:</span>{" "}
                            {item.hallucinationReasons.join(", ")}
                          </p>
                        )}
                        {item.hallucinationNotes && (
                          <p className="mt-1 text-[11px] text-gray-600">
                            <span className="font-semibold">Review notes:</span>{" "}
                            {item.hallucinationNotes}
                          </p>
                        )}
                        {item.resolutionStatus === "fixed" &&
                          item.resolutionNotes && (
                            <p className="mt-2 text-xs text-emerald-700">
                              <span className="font-semibold">
                                Resolution notes:
                              </span>{" "}
                              {item.resolutionNotes}
                            </p>
                          )}
                        {rowHallucinationStatus !== "fixed" && (
                          <>
                            <label className="mt-3 block text-xs text-gray-700">
                              <span className="mb-1 block font-semibold">
                                Fix guidance (used for prompt draft + resolution
                                notes)
                              </span>
                              <textarea
                                value={feedbackFixNotes[rowId] || ""}
                                onChange={(e) =>
                                  setFeedbackFixNotes((prev) => ({
                                    ...prev,
                                    [rowId]: e.target.value,
                                  }))
                                }
                                rows={3}
                                className="w-full rounded border border-teal-200 px-2 py-1.5 text-xs text-gray-900"
                                placeholder="Example: For permit timelines, provide the city page link first, then list required steps in order."
                              />
                            </label>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => applyFeedbackToPromptDraft(item)}
                                disabled={
                                  feedbackPromptApplyingId === rowId ||
                                  alreadyAppliedToPromptDraft
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  feedbackPromptApplyingId === rowId ||
                                  alreadyAppliedToPromptDraft
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                                }`}
                              >
                                {feedbackPromptApplyingId === rowId
                                  ? "Applying..."
                                  : requiresPromptSave
                                    ? "Applied (Unsaved)"
                                    : alreadyAppliedToPromptDraft
                                      ? "Already Applied"
                                      : "Apply to Prompt Draft"}
                              </button>
                              <button
                                type="button"
                                onClick={() => markFeedbackFixed(item)}
                                disabled={disableMarkFixed}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  disableMarkFixed
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-teal-600 text-white hover:bg-teal-700"
                                }`}
                              >
                                {feedbackMarkingId === rowId
                                  ? "Marking..."
                                  : requiresPromptSave && !hasResolutionNotes
                                    ? "Save Prompt or Add Notes"
                                    : "Mark Fixed"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void updateHallucinationStatus(
                                    item,
                                    "triaged",
                                  )
                                }
                                disabled={hallucinationUpdatingId === rowId}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  hallucinationUpdatingId === rowId
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                                }`}
                              >
                                {hallucinationUpdatingId === rowId
                                  ? "Saving..."
                                  : "Triaged"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void updateHallucinationStatus(
                                    item,
                                    "confirmed",
                                  )
                                }
                                disabled={hallucinationUpdatingId === rowId}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  hallucinationUpdatingId === rowId
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-rose-300 text-rose-700 hover:bg-rose-50"
                                }`}
                              >
                                {hallucinationUpdatingId === rowId
                                  ? "Saving..."
                                  : "Confirm Hallucination"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void updateHallucinationStatus(
                                    item,
                                    "dismissed",
                                  )
                                }
                                disabled={hallucinationUpdatingId === rowId}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  hallucinationUpdatingId === rowId
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {hallucinationUpdatingId === rowId
                                  ? "Saving..."
                                  : "Dismiss"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void createJiraForFeedback(item)}
                                disabled={
                                  jiraIssueLoadingKey === `feedback:${rowId}`
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  jiraIssueLoadingKey === `feedback:${rowId}`
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                                }`}
                              >
                                {jiraIssueLoadingKey === `feedback:${rowId}`
                                  ? "Creating Jira..."
                                  : "Create Jira Ticket"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void createServiceNowForFeedback(item)
                                }
                                disabled={
                                  serviceNowTicketLoadingKey ===
                                  `feedback:${rowId}`
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  serviceNowTicketLoadingKey ===
                                  `feedback:${rowId}`
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                                }`}
                              >
                                {serviceNowTicketLoadingKey ===
                                `feedback:${rowId}`
                                  ? "Creating ServiceNow..."
                                  : "Create ServiceNow"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void sendTeamsForFeedback(item)}
                                disabled={
                                  teamsMessageLoadingKey === `feedback:${rowId}`
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  teamsMessageLoadingKey === `feedback:${rowId}`
                                    ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                                    : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                                }`}
                              >
                                {teamsMessageLoadingKey === `feedback:${rowId}`
                                  ? "Sending Teams..."
                                  : "Send Teams"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-teal-800">
                    Scenario Runner
                  </h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={scenarioSuite}
                      onChange={(e) => setScenarioSuite(e.target.value)}
                      className="rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="all">All Suites</option>
                      <option value="permits">Permits</option>
                      <option value="utilities">Utilities</option>
                      <option value="legal_escalation">Legal Escalation</option>
                    </select>
                    <button
                      type="button"
                      onClick={runScenarioSuite}
                      disabled={scenarioLoading}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        scenarioLoading
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {scenarioLoading ? "Running..." : "Run Suite"}
                    </button>
                  </div>
                </div>
                {scenarioError && (
                  <p className="text-sm text-red-600 mb-3">{scenarioError}</p>
                )}

                {scenarioRun && (
                  <>
                    <div className="mb-3 rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                      <p>
                        Suite:{" "}
                        <span className="font-semibold text-teal-800">
                          {scenarioRun.suite}
                        </span>
                      </p>
                      <p>
                        Pass/Fail:{" "}
                        <span className="font-semibold text-emerald-700">
                          {scenarioRun.passed}
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold text-rose-700">
                          {scenarioRun.failed}
                        </span>{" "}
                        of {scenarioRun.total}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {scenarioRun.results.map((result) => (
                        <div
                          key={result.id}
                          className="rounded-lg border border-teal-200 bg-white p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-teal-900">
                              {result.name}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${result.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                            >
                              {result.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">
                            HTTP {result.status_code} •{" "}
                            {result.latency_ms ?? "-"} ms
                          </p>
                          <p className="mt-1 text-xs text-gray-700">
                            {result.summary || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {isAnalyticsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-teal-800 mb-2">
                Training Impact
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Estimated answer-rate lift after knowledge ingestion and tuning.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border border-teal-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    Before Ingestion
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-teal-800">
                    {beforeIngestionAnswerRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    After Ingestion
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-teal-800">
                    {afterIngestionAnswerRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    Uplift
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                    +{answerRateUplift} pts
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm text-gray-700">
                    <span>Before ingestion</span>
                    <span className="font-semibold text-teal-800">
                      {beforeIngestionAnswerRate}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white border border-teal-100">
                    <div
                      className="h-2.5 rounded-full bg-teal-300"
                      style={{ width: `${beforeIngestionAnswerRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm text-gray-700">
                    <span>After ingestion</span>
                    <span className="font-semibold text-teal-800">
                      {afterIngestionAnswerRate}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white border border-teal-100">
                    <div
                      className="h-2.5 rounded-full bg-emerald-600"
                      style={{ width: `${afterIngestionAnswerRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {isAlarmsTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-teal-800 mb-2">
                Alarms & Notifications
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Configure alerts per API component and KPI threshold. API alarms
                trigger after consecutive failed checks; KPI alarms trigger when
                a metric crosses your threshold.
              </p>

              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                  <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                    Default Alert Email
                  </span>
                  <input
                    type="email"
                    value={alarmConfig.default_email}
                    onChange={(e) =>
                      setAlarmConfig((prev) => ({
                        ...prev,
                        default_email: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                  />
                </label>
                <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alarmConfig.enabled}
                    onChange={(e) =>
                      setAlarmConfig((prev) => ({
                        ...prev,
                        enabled: e.target.checked,
                      }))
                    }
                  />
                  <span>Enable alarm engine</span>
                </label>
              </div>

              <div className="rounded-xl border border-teal-200 bg-white p-4 mb-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-teal-900">
                    Add Alarm Rule
                  </h3>
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
                    {enabledAlarmCount} enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm text-gray-700 sm:col-span-2">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Component
                    </span>
                    <select
                      value={newAlarmComponent}
                      onChange={(e) => setNewAlarmComponent(e.target.value)}
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    >
                      {alarmComponentOptions.map((component) => (
                        <option key={component.id} value={component.id}>
                          {component.id} - {component.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Alert Email
                    </span>
                    <input
                      type="email"
                      value={newAlarmEmail}
                      onChange={(e) => setNewAlarmEmail(e.target.value)}
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Cooldown (minutes)
                    </span>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={newAlarmCooldownMinutes}
                      onChange={(e) =>
                        setNewAlarmCooldownMinutes(Number(e.target.value) || 60)
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>

                  {selectedAlarmIsKpi && (
                    <label className="text-sm text-gray-700">
                      <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                        KPI Timeframe
                      </span>
                      <select
                        value={newAlarmTimeframeDays}
                        onChange={(e) =>
                          setNewAlarmTimeframeDays(Number(e.target.value))
                        }
                        className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                      >
                        <option value={1}>1 day</option>
                        <option value={7}>7 days</option>
                        <option value={30}>30 days</option>
                      </select>
                    </label>
                  )}

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Threshold
                    </span>
                    <div className="flex gap-2">
                      {selectedAlarmIsKpi && (
                        <select
                          value={newAlarmComparison}
                          onChange={(e) =>
                            setNewAlarmComparison(
                              e.target.value as AlarmComparison,
                            )
                          }
                          className="w-20 rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                        >
                          {ALARM_COMPARISON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="number"
                        min={selectedAlarmIsKpi ? -999999 : 1}
                        step={selectedAlarmIsKpi ? 0.1 : 1}
                        value={newAlarmThreshold}
                        onChange={(e) =>
                          setNewAlarmThreshold(Number(e.target.value) || 0)
                        }
                        className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                      />
                    </div>
                    <span className="mt-1 block text-xs text-gray-500">
                      {selectedAlarmIsKpi
                        ? "Triggers when KPI comparison is true."
                        : "For API alarms, threshold = consecutive failed checks."}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newAlarmNotifyRecovery}
                      onChange={(e) =>
                        setNewAlarmNotifyRecovery(e.target.checked)
                      }
                    />
                    <span>Notify on recovery</span>
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addAlarmRule}
                    disabled={alarmLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      alarmLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    Add Alarm
                  </button>
                  <button
                    type="button"
                    onClick={saveAlarmConfig}
                    disabled={alarmLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      alarmLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Save Alarm Settings
                  </button>
                  <button
                    type="button"
                    onClick={sendAlarmTest}
                    disabled={alarmLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      alarmLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Send Test Email
                  </button>
                  <button
                    type="button"
                    onClick={() => loadAlarmConfig(false)}
                    disabled={alarmLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      alarmLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void createJiraForAlarm(activeDownAlarm, "alarm:summary")
                    }
                    disabled={
                      jiraIssueLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                    }
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      jiraIssueLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {jiraIssueLoadingKey === "alarm:summary"
                      ? "Creating Jira..."
                      : "Create Jira Bug"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void createServiceNowForAlarm(
                        activeDownAlarm,
                        "alarm:summary",
                      )
                    }
                    disabled={
                      serviceNowTicketLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                    }
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      serviceNowTicketLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {serviceNowTicketLoadingKey === "alarm:summary"
                      ? "Creating ServiceNow..."
                      : "Create ServiceNow"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void sendTeamsForAlarm(activeDownAlarm, "alarm:summary")
                    }
                    disabled={
                      teamsMessageLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                    }
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      teamsMessageLoadingKey === "alarm:summary" ||
                      !alarmConfig.alarms.length
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {teamsMessageLoadingKey === "alarm:summary"
                      ? "Sending Teams..."
                      : "Send Teams"}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4 text-sm text-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <p className="font-semibold text-teal-900">Current Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      alarmConfig.status?.is_down
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {alarmConfig.status?.is_down ? "DEGRADED" : "OK"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    Consecutive failures:{" "}
                    <span className="font-semibold text-teal-900">
                      {alarmConfig.status?.consecutive_failures ?? 0}
                    </span>
                  </p>
                  <p>
                    Last checked:{" "}
                    <span className="font-semibold text-teal-900">
                      {formatDateTime(alarmConfig.status?.last_checked_at)}
                    </span>
                  </p>
                  <p>
                    Last email sent:{" "}
                    <span className="font-semibold text-teal-900">
                      {formatDateTime(alarmConfig.status?.last_sent_at)}
                    </span>
                  </p>
                  <p>
                    Last error:{" "}
                    <span className="font-semibold text-teal-900">
                      {alarmConfig.status?.last_error || "-"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-teal-900">
                  Saved Alarms
                </h3>
                {!alarmConfig.alarms.length && (
                  <p className="text-sm text-gray-600">
                    No alarms configured yet.
                  </p>
                )}
                <div className="space-y-3">
                  {alarmConfig.alarms.map((rule) => {
                    const isKpi =
                      rule.kind === "kpi" || rule.component.startsWith("kpi-");
                    return (
                      <div
                        key={rule.id}
                        className="rounded-lg border border-teal-200 bg-teal-50 p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={(e) =>
                                  updateAlarmRule(rule.id, {
                                    enabled: e.target.checked,
                                  })
                                }
                              />
                              <span className="font-semibold text-teal-900">
                                {rule.name}
                              </span>
                            </label>
                            <span className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-xs font-medium text-teal-700">
                              {rule.component}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                rule.status?.is_down
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {rule.status?.is_down ? "DOWN" : "OK"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void createJiraForAlarm(
                                  rule,
                                  `alarm:${rule.id}`,
                                )
                              }
                              disabled={
                                jiraIssueLoadingKey === `alarm:${rule.id}`
                              }
                              className={`rounded border px-3 py-1 text-xs font-semibold transition ${
                                jiraIssueLoadingKey === `alarm:${rule.id}`
                                  ? "border-teal-200 bg-teal-100 text-teal-700 cursor-not-allowed"
                                  : "border-teal-300 bg-white text-teal-800 hover:bg-teal-50"
                              }`}
                            >
                              {jiraIssueLoadingKey === `alarm:${rule.id}`
                                ? "Creating Jira..."
                                : "Jira"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void createServiceNowForAlarm(
                                  rule,
                                  `alarm:${rule.id}`,
                                )
                              }
                              disabled={
                                serviceNowTicketLoadingKey ===
                                `alarm:${rule.id}`
                              }
                              className={`rounded border px-3 py-1 text-xs font-semibold transition ${
                                serviceNowTicketLoadingKey ===
                                `alarm:${rule.id}`
                                  ? "border-teal-200 bg-teal-100 text-teal-700 cursor-not-allowed"
                                  : "border-teal-300 bg-white text-teal-800 hover:bg-teal-50"
                              }`}
                            >
                              {serviceNowTicketLoadingKey === `alarm:${rule.id}`
                                ? "Creating..."
                                : "ServiceNow"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void sendTeamsForAlarm(rule, `alarm:${rule.id}`)
                              }
                              disabled={
                                teamsMessageLoadingKey === `alarm:${rule.id}`
                              }
                              className={`rounded border px-3 py-1 text-xs font-semibold transition ${
                                teamsMessageLoadingKey === `alarm:${rule.id}`
                                  ? "border-teal-200 bg-teal-100 text-teal-700 cursor-not-allowed"
                                  : "border-teal-300 bg-white text-teal-800 hover:bg-teal-50"
                              }`}
                            >
                              {teamsMessageLoadingKey === `alarm:${rule.id}`
                                ? "Sending..."
                                : "Teams"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAlarmRule(rule.id)}
                              className="rounded border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <label className="text-xs text-gray-700">
                            <span className="mb-1 block uppercase tracking-wide text-gray-600">
                              Email
                            </span>
                            <input
                              type="email"
                              value={rule.email}
                              onChange={(e) =>
                                updateAlarmRule(rule.id, {
                                  email: e.target.value,
                                })
                              }
                              className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                            />
                          </label>
                          <label className="text-xs text-gray-700">
                            <span className="mb-1 block uppercase tracking-wide text-gray-600">
                              Cooldown
                            </span>
                            <input
                              type="number"
                              min={5}
                              max={240}
                              value={rule.cooldown_minutes}
                              onChange={(e) =>
                                updateAlarmRule(rule.id, {
                                  cooldown_minutes:
                                    Number(e.target.value) || 60,
                                })
                              }
                              className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                            />
                          </label>
                          <label className="text-xs text-gray-700">
                            <span className="mb-1 block uppercase tracking-wide text-gray-600">
                              Threshold
                            </span>
                            <div className="flex gap-1">
                              {isKpi && (
                                <select
                                  value={rule.comparison}
                                  onChange={(e) =>
                                    updateAlarmRule(rule.id, {
                                      comparison: e.target
                                        .value as AlarmComparison,
                                    })
                                  }
                                  className="w-16 rounded border border-teal-200 px-1 py-1 text-sm text-gray-900"
                                >
                                  {ALARM_COMPARISON_OPTIONS.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <input
                                type="number"
                                step={isKpi ? 0.1 : 1}
                                min={isKpi ? -999999 : 1}
                                value={rule.threshold}
                                onChange={(e) =>
                                  updateAlarmRule(rule.id, {
                                    threshold: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                              />
                            </div>
                          </label>
                          <div className="text-xs text-gray-700">
                            {isKpi ? (
                              <label>
                                <span className="mb-1 block uppercase tracking-wide text-gray-600">
                                  KPI Window
                                </span>
                                <select
                                  value={rule.timeframe_days}
                                  onChange={(e) =>
                                    updateAlarmRule(rule.id, {
                                      timeframe_days: Number(e.target.value),
                                    })
                                  }
                                  className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                                >
                                  <option value={1}>1 day</option>
                                  <option value={7}>7 days</option>
                                  <option value={30}>30 days</option>
                                </select>
                              </label>
                            ) : (
                              <label className="mt-6 inline-flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={rule.notify_recovery}
                                  onChange={(e) =>
                                    updateAlarmRule(rule.id, {
                                      notify_recovery: e.target.checked,
                                    })
                                  }
                                />
                                <span>Notify recovery</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-2">
                          <p>
                            Last checked:{" "}
                            <span className="font-semibold text-teal-900">
                              {formatDateTime(rule.status?.last_checked_at)}
                            </span>
                          </p>
                          <p>
                            Last sent:{" "}
                            <span className="font-semibold text-teal-900">
                              {formatDateTime(rule.status?.last_sent_at)}
                            </span>
                          </p>
                          <p>
                            Last error:{" "}
                            <span className="font-semibold text-teal-900">
                              {rule.status?.last_error || "-"}
                            </span>
                          </p>
                          <p>
                            Last value:{" "}
                            <span className="font-semibold text-teal-900">
                              {rule.status?.last_value ?? "-"}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {alarmStatus && (
                <p className="mt-3 text-sm text-emerald-700">{alarmStatus}</p>
              )}
              {jiraIssueStatus && (
                <p className="mt-3 text-sm text-emerald-700">
                  {jiraIssueStatus}
                </p>
              )}
              {alarmError && (
                <p className="mt-3 text-sm text-red-600">
                  Alarm error: {alarmError}
                </p>
              )}
              {jiraIssueError && (
                <p className="mt-3 text-sm text-red-600">
                  Jira issue error: {jiraIssueError}
                </p>
              )}
              {serviceNowTicketStatus && (
                <p className="mt-3 text-sm text-emerald-700">
                  {serviceNowTicketStatus}
                </p>
              )}
              {serviceNowTicketError && (
                <p className="mt-3 text-sm text-red-600">
                  ServiceNow issue error: {serviceNowTicketError}
                </p>
              )}
              {teamsMessageStatus && (
                <p className="mt-3 text-sm text-emerald-700">
                  {teamsMessageStatus}
                </p>
              )}
              {teamsMessageError && (
                <p className="mt-3 text-sm text-red-600">
                  Teams error: {teamsMessageError}
                </p>
              )}
              {alarmConfig.updated_at && (
                <p className="mt-2 text-xs text-gray-600">
                  Last updated: {formatDateTime(alarmConfig.updated_at)}
                </p>
              )}
            </section>
          )}

          {isIntegrationsTab && (
            <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="mb-2 text-xl font-bold text-teal-800">
                  GitHub Integration
                </h2>
                <p className="mb-4 text-sm text-gray-700">
                  Configure repository settings for work items moved into the
                  Agent column.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Repo Owner
                    </span>
                    <input
                      type="text"
                      value={githubConfig.repo_owner}
                      onChange={(e) =>
                        setGithubConfig((prev) => ({
                          ...prev,
                          repo_owner: e.target.value,
                        }))
                      }
                      placeholder="your-org"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      Repo Name
                    </span>
                    <input
                      type="text"
                      value={githubConfig.repo_name}
                      onChange={(e) =>
                        setGithubConfig((prev) => ({
                          ...prev,
                          repo_name: e.target.value,
                        }))
                      }
                      placeholder="civiq-platform"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-600">
                      GitHub Token
                    </span>
                    <input
                      type="password"
                      value={githubTokenInput}
                      onChange={(e) => setGithubTokenInput(e.target.value)}
                      placeholder={
                        githubConfig.has_token
                          ? "Saved token exists. Enter a new one to rotate."
                          : "Paste GitHub token"
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={githubConfig.enabled}
                      onChange={(e) =>
                        setGithubConfig((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                    />
                    <span>Enable GitHub integration</span>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveGithubConfig}
                    disabled={githubLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      githubLoading
                        ? "cursor-not-allowed bg-teal-300 text-teal-800/60"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {githubLoading ? "Saving..." : "Save GitHub Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadGithubConfig(false)}
                    disabled={githubLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      githubLoading
                        ? "cursor-not-allowed bg-teal-300 text-teal-800/60"
                        : "border border-teal-300 bg-white text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Refresh
                  </button>
                </div>

                {githubStatus && (
                  <p className="mt-3 text-sm text-emerald-700">
                    {githubStatus}
                  </p>
                )}
                {githubError && (
                  <p className="mt-3 text-sm text-red-600">
                    GitHub error: {githubError}
                  </p>
                )}
                {githubConfig.updated_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Last updated: {formatDateTime(githubConfig.updated_at)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Jira Integration
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Connect Jira to create bugs for API outages and tickets for
                  weird answers from the admin workflow.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Jira Base URL
                    </span>
                    <input
                      type="text"
                      value={jiraConfig.base_url}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          base_url: e.target.value,
                        }))
                      }
                      placeholder="https://your-org.atlassian.net"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Project Key
                    </span>
                    <input
                      type="text"
                      value={jiraConfig.project_key}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          project_key: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="CIVIQ"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Jira Email
                    </span>
                    <input
                      type="email"
                      value={jiraConfig.email}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="alerts@city.gov"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      API Token
                    </span>
                    <input
                      type="password"
                      value={jiraApiTokenInput}
                      onChange={(e) => setJiraApiTokenInput(e.target.value)}
                      placeholder={
                        jiraConfig.has_api_token
                          ? "Saved token exists. Enter a new one to rotate."
                          : "Paste Jira API token"
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      API Down Issue Type
                    </span>
                    <input
                      type="text"
                      value={jiraConfig.issue_type_api_down}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          issue_type_api_down: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Weird Answer Issue Type
                    </span>
                    <input
                      type="text"
                      value={jiraConfig.issue_type_weird_answer}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          issue_type_weird_answer: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jiraConfig.enabled}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                    />
                    <span>Enable Jira integration</span>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jiraConfig.auto_create_api_down}
                      onChange={(e) =>
                        setJiraConfig((prev) => ({
                          ...prev,
                          auto_create_api_down: e.target.checked,
                        }))
                      }
                    />
                    <span>Auto-create bug when API alarm goes down</span>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveJiraConfig}
                    disabled={jiraLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      jiraLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {jiraLoading ? "Saving..." : "Save Jira Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={testJiraConnection}
                    disabled={jiraLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      jiraLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {jiraLoading ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadJiraConfig(false)}
                    disabled={jiraLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      jiraLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Refresh
                  </button>
                </div>

                {jiraStatus && (
                  <p className="mt-3 text-sm text-emerald-700">{jiraStatus}</p>
                )}
                {jiraError && (
                  <p className="mt-3 text-sm text-red-600">
                    Jira error: {jiraError}
                  </p>
                )}
                {jiraConfig.updated_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Last updated: {formatDateTime(jiraConfig.updated_at)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Jira Ticket Actions
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Open tickets directly from current alarms and unresolved
                  feedback.
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      API outage bug
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {activeDownAlarm
                        ? `${activeDownAlarm.name} (${activeDownAlarm.component}) is currently down.`
                        : "No active down alarm. This will use the first enabled alarm rule."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void createJiraForAlarm(
                          activeDownAlarm,
                          "alarm:summary",
                        )
                      }
                      disabled={jiraIssueLoadingKey === "alarm:summary"}
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        jiraIssueLoadingKey === "alarm:summary"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {jiraIssueLoadingKey === "alarm:summary"
                        ? "Creating..."
                        : "Create API Bug"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      Weird answer ticket
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {firstOpenFeedback
                        ? `Uses latest open feedback: ${firstOpenFeedback.feedbackType} (${formatDateTime(firstOpenFeedback.createdAt || firstOpenFeedback.eventDate)}).`
                        : "No open feedback queue item found. Refresh Feedback Queue on Controls tab first."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!firstOpenFeedback) return;
                        void createJiraForFeedback(
                          firstOpenFeedback,
                          "feedback:integration",
                        );
                      }}
                      disabled={
                        !firstOpenFeedback ||
                        jiraIssueLoadingKey === "feedback:integration"
                      }
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        !firstOpenFeedback ||
                        jiraIssueLoadingKey === "feedback:integration"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {!firstOpenFeedback
                        ? "No Open Feedback"
                        : jiraIssueLoadingKey === "feedback:integration"
                          ? "Creating..."
                          : "Create Answer Ticket"}
                    </button>
                  </div>
                </div>

                {jiraIssueStatus && (
                  <p className="mt-4 text-sm text-emerald-700">
                    {jiraIssueStatus}
                  </p>
                )}
                {jiraIssueError && (
                  <p className="mt-4 text-sm text-red-600">
                    Jira issue error: {jiraIssueError}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  ServiceNow Integration
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Connect ServiceNow to create incidents for outages and answer
                  quality issues.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      ServiceNow Base URL
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.base_url}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          base_url: e.target.value,
                        }))
                      }
                      placeholder="https://your-instance.service-now.com"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Username
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.username}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder="integration.user"
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Password
                    </span>
                    <input
                      type="password"
                      value={serviceNowPasswordInput}
                      onChange={(e) =>
                        setServiceNowPasswordInput(e.target.value)
                      }
                      placeholder={
                        serviceNowConfig.has_password
                          ? "Saved password exists. Enter a new one to rotate."
                          : "Paste ServiceNow password"
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Assignment Group (sys_id or name)
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.assignment_group}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          assignment_group: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Business Service
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.business_service}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          business_service: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Impact
                    </span>
                    <select
                      value={serviceNowConfig.impact}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          impact: (e.target.value as "1" | "2" | "3") || "2",
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    >
                      <option value="1">1 - High</option>
                      <option value="2">2 - Medium</option>
                      <option value="3">3 - Low</option>
                    </select>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Urgency
                    </span>
                    <select
                      value={serviceNowConfig.urgency}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          urgency: (e.target.value as "1" | "2" | "3") || "2",
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    >
                      <option value="1">1 - High</option>
                      <option value="2">2 - Medium</option>
                      <option value="3">3 - Low</option>
                    </select>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      API Down Category
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.category_api_down}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          category_api_down: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Weird Answer Category
                    </span>
                    <input
                      type="text"
                      value={serviceNowConfig.category_weird_answer}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          category_weird_answer: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={serviceNowConfig.enabled}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                    />
                    <span>Enable ServiceNow integration</span>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={serviceNowConfig.auto_create_api_down}
                      onChange={(e) =>
                        setServiceNowConfig((prev) => ({
                          ...prev,
                          auto_create_api_down: e.target.checked,
                        }))
                      }
                    />
                    <span>Auto-create incident when API alarm goes down</span>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveServiceNowConfig}
                    disabled={serviceNowLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      serviceNowLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {serviceNowLoading
                      ? "Saving..."
                      : "Save ServiceNow Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={testServiceNowConnection}
                    disabled={serviceNowLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      serviceNowLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {serviceNowLoading ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadServiceNowConfig(false)}
                    disabled={serviceNowLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      serviceNowLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Refresh
                  </button>
                </div>

                {serviceNowStatus && (
                  <p className="mt-3 text-sm text-emerald-700">
                    {serviceNowStatus}
                  </p>
                )}
                {serviceNowError && (
                  <p className="mt-3 text-sm text-red-600">
                    ServiceNow error: {serviceNowError}
                  </p>
                )}
                {serviceNowConfig.updated_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Last updated: {formatDateTime(serviceNowConfig.updated_at)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  ServiceNow Ticket Actions
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Open incidents directly from current alarms and unresolved
                  feedback.
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      API outage incident
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {activeDownAlarm
                        ? `${activeDownAlarm.name} (${activeDownAlarm.component}) is currently down.`
                        : "No active down alarm. This will use the first enabled alarm rule."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void createServiceNowForAlarm(
                          activeDownAlarm,
                          "alarm:integration",
                        )
                      }
                      disabled={
                        serviceNowTicketLoadingKey === "alarm:integration"
                      }
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        serviceNowTicketLoadingKey === "alarm:integration"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {serviceNowTicketLoadingKey === "alarm:integration"
                        ? "Creating..."
                        : "Create API Incident"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      Weird answer incident
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {firstOpenFeedback
                        ? `Uses latest open feedback: ${firstOpenFeedback.feedbackType} (${formatDateTime(firstOpenFeedback.createdAt || firstOpenFeedback.eventDate)}).`
                        : "No open feedback queue item found. Refresh Feedback Queue on Controls tab first."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!firstOpenFeedback) return;
                        void createServiceNowForFeedback(
                          firstOpenFeedback,
                          "feedback:integration",
                        );
                      }}
                      disabled={
                        !firstOpenFeedback ||
                        serviceNowTicketLoadingKey === "feedback:integration"
                      }
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        !firstOpenFeedback ||
                        serviceNowTicketLoadingKey === "feedback:integration"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {!firstOpenFeedback
                        ? "No Open Feedback"
                        : serviceNowTicketLoadingKey === "feedback:integration"
                          ? "Creating..."
                          : "Create Answer Incident"}
                    </button>
                  </div>
                </div>

                {serviceNowTicketStatus && (
                  <p className="mt-4 text-sm text-emerald-700">
                    {serviceNowTicketStatus}
                  </p>
                )}
                {serviceNowTicketError && (
                  <p className="mt-4 text-sm text-red-600">
                    ServiceNow issue error: {serviceNowTicketError}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Microsoft Teams Integration
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Send alert notifications to a Teams channel via incoming
                  webhook.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 sm:col-span-2">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Teams Webhook URL
                    </span>
                    <input
                      type="password"
                      value={teamsWebhookInput}
                      onChange={(e) => setTeamsWebhookInput(e.target.value)}
                      placeholder={
                        teamsConfig.has_webhook
                          ? "Saved webhook exists. Enter a new one to rotate."
                          : "Paste Teams incoming webhook URL"
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Message Prefix
                    </span>
                    <input
                      type="text"
                      value={teamsConfig.message_prefix}
                      onChange={(e) =>
                        setTeamsConfig((prev) => ({
                          ...prev,
                          message_prefix: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Channel Label
                    </span>
                    <input
                      type="text"
                      value={teamsConfig.channel_label}
                      onChange={(e) =>
                        setTeamsConfig((prev) => ({
                          ...prev,
                          channel_label: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={teamsConfig.enabled}
                      onChange={(e) =>
                        setTeamsConfig((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                    />
                    <span>Enable Teams integration</span>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={teamsConfig.auto_notify_api_down}
                      onChange={(e) =>
                        setTeamsConfig((prev) => ({
                          ...prev,
                          auto_notify_api_down: e.target.checked,
                        }))
                      }
                    />
                    <span>Auto-notify on API alarm down</span>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveTeamsConfig}
                    disabled={teamsLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      teamsLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {teamsLoading ? "Saving..." : "Save Teams Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={testTeamsConnection}
                    disabled={teamsLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      teamsLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    {teamsLoading ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadTeamsConfig(false)}
                    disabled={teamsLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      teamsLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Refresh
                  </button>
                </div>

                {teamsStatus && (
                  <p className="mt-3 text-sm text-emerald-700">{teamsStatus}</p>
                )}
                {teamsError && (
                  <p className="mt-3 text-sm text-red-600">
                    Teams error: {teamsError}
                  </p>
                )}
                {teamsConfig.updated_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Last updated: {formatDateTime(teamsConfig.updated_at)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Teams Alert Actions
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Send Teams notifications for outages and answer-quality
                  issues.
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      API outage alert
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {activeDownAlarm
                        ? `${activeDownAlarm.name} (${activeDownAlarm.component}) is currently down.`
                        : "No active down alarm. This will use the first enabled alarm rule."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void sendTeamsForAlarm(
                          activeDownAlarm,
                          "alarm:integration",
                        )
                      }
                      disabled={teamsMessageLoadingKey === "alarm:integration"}
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        teamsMessageLoadingKey === "alarm:integration"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {teamsMessageLoadingKey === "alarm:integration"
                        ? "Sending..."
                        : "Send API Alert"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-white p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      Weird answer alert
                    </p>
                    <p className="mt-1 text-xs text-gray-700">
                      {firstOpenFeedback
                        ? `Uses latest open feedback: ${firstOpenFeedback.feedbackType} (${formatDateTime(firstOpenFeedback.createdAt || firstOpenFeedback.eventDate)}).`
                        : "No open feedback queue item found. Refresh Feedback Queue on Controls tab first."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!firstOpenFeedback) return;
                        void sendTeamsForFeedback(
                          firstOpenFeedback,
                          "feedback:integration",
                        );
                      }}
                      disabled={
                        !firstOpenFeedback ||
                        teamsMessageLoadingKey === "feedback:integration"
                      }
                      className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        !firstOpenFeedback ||
                        teamsMessageLoadingKey === "feedback:integration"
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {!firstOpenFeedback
                        ? "No Open Feedback"
                        : teamsMessageLoadingKey === "feedback:integration"
                          ? "Sending..."
                          : "Send Answer Alert"}
                    </button>
                  </div>
                </div>

                {teamsMessageStatus && (
                  <p className="mt-4 text-sm text-emerald-700">
                    {teamsMessageStatus}
                  </p>
                )}
                {teamsMessageError && (
                  <p className="mt-4 text-sm text-red-600">
                    Teams error: {teamsMessageError}
                  </p>
                )}
              </div>
            </section>
          )}

          {isControlsTab && (
            <section className="mb-8 grid grid-cols-1 gap-6 items-stretch admin-grid-config lg:grid-cols-2">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                <h2 className="text-xl font-bold text-teal-800 mb-2">
                  Export & Reporting
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Generate a PDF report now and auto-send weekly or monthly by
                  email.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Email
                    </span>
                    <input
                      type="email"
                      value={reportingConfig.email}
                      onChange={(e) =>
                        setReportingConfig((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    />
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Frequency
                    </span>
                    <select
                      value={reportingConfig.frequency}
                      onChange={(e) =>
                        setReportingConfig((prev) => ({
                          ...prev,
                          frequency:
                            e.target.value === "monthly" ? "monthly" : "weekly",
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700">
                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                      Window (days)
                    </span>
                    <select
                      value={reportingConfig.days}
                      onChange={(e) =>
                        setReportingConfig((prev) => ({
                          ...prev,
                          days: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded border border-teal-200 px-2 py-1 text-sm text-gray-900"
                    >
                      <option value={7}>7</option>
                      <option value={30}>30</option>
                      <option value={60}>60</option>
                      <option value={90}>90</option>
                    </select>
                  </label>
                  <label className="rounded-lg border border-teal-200 bg-white p-3 text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reportingConfig.enabled}
                      onChange={(e) =>
                        setReportingConfig((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                    />
                    <span>Enable scheduled reporting</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 admin-button-row">
                  <button
                    type="button"
                    onClick={saveReportingConfig}
                    disabled={reportingLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      reportingLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    Save Report Settings
                  </button>
                  <button
                    type="button"
                    onClick={sendReportNow}
                    disabled={reportingLoading}
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      reportingLoading
                        ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                        : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    Send PDF Report Now
                  </button>
                </div>

                {reportingStatus && (
                  <p className="mt-3 text-sm text-emerald-700">
                    {reportingStatus}
                  </p>
                )}
                {reportingError && (
                  <p className="mt-3 text-sm text-red-600">
                    Reporting error: {reportingError}
                  </p>
                )}
                {reportingConfig.updated_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Last updated: {formatDateTime(reportingConfig.updated_at)}
                  </p>
                )}
              </div>

              {isControlsTab && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                  <h2 className="text-xl font-bold text-teal-800 mb-2">
                    Prompt Config
                  </h2>
                  <p className="text-sm text-gray-700 mb-4">
                    Tune system prompt behavior, concise mode, and tone rules
                    for the chat router.
                  </p>
                  {promptHasUnsavedChanges && (
                    <p className="mb-3 text-xs text-amber-700">
                      Unsaved draft changes detected. Save Prompt Config to
                      apply them to live chat.
                    </p>
                  )}

                  <div className="space-y-4">
                    <label className="block text-sm text-gray-700">
                      <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                        System Prompt Override
                      </span>
                      <textarea
                        value={promptConfig.system_prompt}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length > SYSTEM_PROMPT_MAX) {
                            setPromptConfigError(
                              `system_prompt max is ${SYSTEM_PROMPT_MAX} characters.`,
                            );
                            return;
                          }
                          setPromptConfigError("");
                          setPromptConfig((prev) => ({
                            ...prev,
                            system_prompt: value,
                          }));
                        }}
                        rows={6}
                        className="w-full rounded border border-teal-200 px-3 py-2 text-sm text-gray-900"
                        placeholder="Optional: prepend custom system instructions"
                      />
                      <span className="mt-1 block text-xs text-gray-600">
                        {promptConfig.system_prompt.length}/{SYSTEM_PROMPT_MAX}
                      </span>
                    </label>

                    <label className="block text-sm text-gray-700">
                      <span className="block text-xs uppercase tracking-wide text-gray-600 mb-1">
                        Tone Rules
                      </span>
                      <textarea
                        value={promptConfig.tone_rules}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length > TONE_RULES_MAX) {
                            setPromptConfigError(
                              `tone_rules max is ${TONE_RULES_MAX} characters.`,
                            );
                            return;
                          }
                          setPromptConfigError("");
                          setPromptConfig((prev) => ({
                            ...prev,
                            tone_rules: value,
                          }));
                        }}
                        rows={4}
                        className="w-full rounded border border-teal-200 px-3 py-2 text-sm text-gray-900"
                        placeholder="Optional: additional tone constraints"
                      />
                      <span
                        className={`mt-1 block text-xs ${promptConfig.tone_rules.length > TONE_RULES_MAX - 150 ? "text-amber-700" : "text-gray-600"}`}
                      >
                        {promptConfig.tone_rules.length}/{TONE_RULES_MAX}
                      </span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={promptConfig.concise_mode}
                        onChange={(e) =>
                          setPromptConfig((prev) => ({
                            ...prev,
                            concise_mode: e.target.checked,
                          }))
                        }
                      />
                      <span>Concise mode (short default answers)</span>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 admin-button-row">
                    <button
                      type="button"
                      onClick={savePromptConfig}
                      disabled={promptConfigLoading || !promptHasUnsavedChanges}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        promptConfigLoading || !promptHasUnsavedChanges
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      Save Prompt Config
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPromptConfig(false)}
                      disabled={promptConfigLoading}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        promptConfigLoading
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                      }`}
                    >
                      Refresh Prompt Config
                    </button>
                  </div>

                  {promptConfigStatus && (
                    <p className="mt-3 text-sm text-emerald-700">
                      {promptConfigStatus}
                    </p>
                  )}
                  {promptConfigError && (
                    <p className="mt-3 text-sm text-red-600">
                      Prompt config error: {promptConfigError}
                    </p>
                  )}
                  {promptConfig.updatedAt && (
                    <p className="mt-2 text-xs text-gray-600">
                      Last updated: {formatDateTime(promptConfig.updatedAt)}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {isKnowledgeTab && (
            <section className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-teal-800">
                    Knowledge Uploads
                  </h2>
                  <p className="text-sm text-gray-700">
                    Upload files to{" "}
                    <code className="font-semibold">
                      {uploads?.prefix || "uploads/"}
                    </code>{" "}
                    in the knowledge bucket. New uploads are indexed
                    automatically. Supported: PDF, DOCX, XLSX, XLS, TXT, MD.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadUploads(false)}
                  disabled={uploadsLoading || uploadingFile}
                  className={`rounded-lg px-4 py-2 font-semibold transition ${
                    uploadsLoading || uploadingFile
                      ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {uploadsLoading ? "Refreshing..." : "Refresh Uploads"}
                </button>
              </div>

              <div
                className={`mb-4 rounded-lg border-2 border-dashed p-4 transition ${
                  isUploadDragOver
                    ? "border-teal-500 bg-teal-100/70"
                    : "border-teal-200 bg-white"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!uploadingFile) setIsUploadDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsUploadDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploadingFile) return;
                  const files = Array.from(e.dataTransfer.files || []);
                  void handleUploadFiles(files);
                }}
              >
                <label className="block text-sm text-gray-700 font-medium mb-2">
                  Upload documents (multi-file)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.xls,.txt,.md"
                  disabled={uploadingFile}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    void handleUploadFiles(files);
                    e.currentTarget.value = "";
                  }}
                  className="block w-full rounded border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Drag and drop files here, or use the picker. Max file size: 6
                  MB each.
                </p>
              </div>

              {uploadsStatus && (
                <p className="mb-3 text-sm text-emerald-700">{uploadsStatus}</p>
              )}
              {uploadsError && (
                <p className="mb-3 text-sm text-red-600">
                  Upload error: {uploadsError}
                </p>
              )}

              {!!uploadTasks.length && (
                <div className="mb-4 rounded-lg border border-teal-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-teal-800">
                    Upload Queue
                  </p>
                  <div className="space-y-2">
                    {uploadTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-teal-100 px-2 py-1.5"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {task.fileName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {task.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              task.status === "success"
                                ? "bg-emerald-100 text-emerald-800"
                                : task.status === "failed"
                                  ? "bg-rose-100 text-rose-800"
                                  : task.status === "uploading"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {task.status}
                          </span>
                          {task.status === "failed" && task.file && (
                            <button
                              type="button"
                              onClick={() => retryUploadTask(task.id)}
                              disabled={uploadingFile}
                              className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                                uploadingFile
                                  ? "bg-teal-200 text-teal-800/60 cursor-not-allowed"
                                  : "bg-teal-600 text-white hover:bg-teal-700"
                              }`}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(uploads?.items || []).length === 0 && (
                  <p className="text-sm text-gray-600">
                    No uploaded documents found.
                  </p>
                )}
                {(uploads?.items || []).map((item) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-teal-200 bg-white p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-teal-900">
                          {item.file_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.size_label} •{" "}
                          {formatDateTime(item.last_modified)}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 break-all">
                          {item.key}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteUpload(item)}
                        disabled={deletingUploadKey === item.key}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          deletingUploadKey === item.key
                            ? "bg-[#FECACA] text-[#7F1D1D]/70 cursor-not-allowed"
                            : "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm"
                        }`}
                      >
                        {deletingUploadKey === item.key
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(isControlsTab || isKnowledgeTab) && (
            <div
              className={`grid grid-cols-1 gap-6 items-stretch admin-grid-ops ${isControlsTab && isKnowledgeTab ? "lg:grid-cols-2" : ""}`}
            >
              {isControlsTab && (
                <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                  <h2 className="text-2xl font-bold text-teal-800 mb-2">
                    Registered Users
                  </h2>
                  <p className="text-gray-700 text-sm mb-4">
                    Cognito account count for this demo tenant.
                  </p>

                  <div className="flex items-center gap-3 mb-4 admin-button-row">
                    <button
                      type="button"
                      onClick={() => loadRegisteredUsers(false)}
                      disabled={usersLoading}
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        usersLoading
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {usersLoading ? "Loading..." : "Refresh User Count"}
                    </button>
                  </div>

                  {usersError && (
                    <p className="text-sm text-red-600 mb-3">
                      Failed to load users: {usersError}
                    </p>
                  )}

                  <div className="rounded-lg border border-teal-200 bg-white p-4 text-sm text-gray-700 space-y-2">
                    <p>
                      Total users:{" "}
                      <span className="font-bold text-teal-800">
                        {registeredUsers?.total_users ?? "-"}
                      </span>
                    </p>
                    <p>
                      Confirmed users:{" "}
                      <span className="font-semibold text-teal-800">
                        {registeredUsers?.confirmed_users ?? "-"}
                      </span>
                    </p>
                    <p>
                      Unconfirmed users:{" "}
                      <span className="font-semibold text-teal-800">
                        {registeredUsers?.unconfirmed_users ?? "-"}
                      </span>
                    </p>
                    <p>
                      Enabled users:{" "}
                      <span className="font-semibold text-teal-800">
                        {registeredUsers?.enabled_users ?? "-"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={`text-sm font-semibold ${assistantEnabled ? "text-emerald-700" : "text-red-700"}`}
                      >
                        Assistant status:{" "}
                        {assistantEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAssistantStatus(!assistantEnabled)}
                        disabled={assistantToggleLoading}
                        className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition ${
                          assistantEnabled
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } ${assistantToggleLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {assistantToggleLoading
                          ? "Updating..."
                          : assistantEnabled
                            ? "Disable Assistant"
                            : "Enable Assistant"}
                      </button>
                    </div>
                    {assistantToggleError && (
                      <p className="mt-2 text-sm text-red-600">
                        Assistant toggle failed: {assistantToggleError}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg border border-teal-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={`text-sm font-semibold ${proactiveNudgesEnabled ? "text-emerald-700" : "text-amber-700"}`}
                      >
                        Proactive civic messages:{" "}
                        {proactiveNudgesEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setProactiveNudgesStatus(!proactiveNudgesEnabled)
                        }
                        disabled={assistantToggleLoading}
                        className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition ${
                          proactiveNudgesEnabled
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } ${assistantToggleLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {assistantToggleLoading
                          ? "Updating..."
                          : proactiveNudgesEnabled
                            ? "Disable Civic Messages"
                            : "Enable Civic Messages"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-teal-700">
                      Controls proactive cards such as air quality alerts and
                      voter registration reminders.
                    </p>
                    {proactiveNudgesToggleError && (
                      <p className="mt-2 text-sm text-red-600">
                        Civic message toggle failed:{" "}
                        {proactiveNudgesToggleError}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {isKnowledgeTab && (
                <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8 h-full admin-row-card">
                  <h2 className="text-2xl font-bold text-teal-800 mb-4">
                    Site Extraction
                  </h2>

                  <label
                    htmlFor="startUrl"
                    className="block text-sm text-gray-700 mb-2 font-medium"
                  >
                    Start URL
                  </label>
                  <input
                    id="startUrl"
                    value={startUrl}
                    onChange={(e) => setStartUrl(e.target.value)}
                    className="w-full rounded-lg border border-teal-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-600"
                    placeholder="https://primiq.ai"
                  />

                  <div className="mt-4 rounded-lg border border-teal-200 bg-white p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-teal-900">
                        Automated crawl schedule
                      </p>
                      <button
                        type="button"
                        onClick={() => loadSiteExtractionSchedule(false)}
                        disabled={siteExtractionScheduleLoading}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          siteExtractionScheduleLoading
                            ? "bg-teal-200 text-teal-700/60 cursor-not-allowed"
                            : "bg-white border border-teal-300 text-teal-800 hover:bg-teal-100"
                        }`}
                      >
                        {siteExtractionScheduleLoading
                          ? "Loading..."
                          : "Reload"}
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={siteExtractionSchedule.enabled}
                        onChange={(e) =>
                          setSiteExtractionSchedule((prev) => ({
                            ...prev,
                            enabled: e.target.checked,
                          }))
                        }
                      />
                      Enable scheduled crawl trigger
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Frequency
                        <select
                          value={siteExtractionSchedule.frequency}
                          onChange={(e) =>
                            setSiteExtractionSchedule((prev) => ({
                              ...prev,
                              frequency: e.target
                                .value as SiteExtractionFrequency,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-teal-600"
                        >
                          <option value="manual">Manual only</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </label>

                      {siteExtractionSchedule.frequency === "weekly" ? (
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Weekly Day
                          <select
                            value={siteExtractionSchedule.weekly_day}
                            onChange={(e) =>
                              setSiteExtractionSchedule((prev) => ({
                                ...prev,
                                weekly_day: e.target
                                  .value as SiteExtractionScheduleResponse["weekly_day"],
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-teal-600"
                          >
                            {SITE_EXTRACTION_WEEKDAY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : siteExtractionSchedule.frequency === "monthly" ? (
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Monthly Day
                          <input
                            type="number"
                            min={1}
                            max={28}
                            value={siteExtractionSchedule.monthly_day}
                            onChange={(e) =>
                              setSiteExtractionSchedule((prev) => ({
                                ...prev,
                                monthly_day: Math.max(
                                  1,
                                  Math.min(28, Number(e.target.value) || 1),
                                ),
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-teal-600"
                          />
                        </label>
                      ) : (
                        <div className="text-xs text-gray-600 sm:col-span-2 flex items-end">
                          {siteExtractionSchedule.frequency === "daily"
                            ? "Runs daily at scheduled EventBridge time."
                            : "Scheduled runs are disabled in manual mode."}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-600">
                      EventBridge invokes this scheduler once per day (10:00
                      UTC). Weekly and monthly modes run on matching days only.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={saveSiteExtractionSchedule}
                        disabled={
                          siteExtractionScheduleLoading || !startUrl.trim()
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          siteExtractionScheduleLoading || !startUrl.trim()
                            ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                            : "bg-teal-600 text-white hover:bg-teal-700"
                        }`}
                      >
                        {siteExtractionScheduleLoading
                          ? "Saving..."
                          : "Save Schedule"}
                      </button>
                      {siteExtractionSchedule.updated_at && (
                        <span className="text-xs text-gray-600">
                          Updated:{" "}
                          {formatDateTime(siteExtractionSchedule.updated_at)}
                        </span>
                      )}
                    </div>
                    {siteExtractionScheduleError && (
                      <p className="text-sm text-red-600">
                        {siteExtractionScheduleError}
                      </p>
                    )}
                    {siteExtractionScheduleStatus && (
                      <p className="text-sm text-emerald-700">
                        {siteExtractionScheduleStatus}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 admin-button-row">
                    <button
                      type="button"
                      disabled={running || !startUrl.trim()}
                      onClick={runSiteExtraction}
                      className={`rounded-lg px-5 py-3 font-semibold transition ${
                        running || !startUrl.trim()
                          ? "bg-teal-300 text-teal-800/60 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {running ? "Running..." : "Run Site Extraction"}
                    </button>

                    <button
                      type="button"
                      onClick={() => fetchExtractionStatus(false)}
                      className="rounded-lg px-4 py-3 font-semibold bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 transition"
                    >
                      Refresh Status
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-gray-700">{statusMessage}</p>

                  <div className="mt-6 rounded-lg border border-teal-200 bg-white p-4 text-xs text-gray-700 space-y-1">
                    <p>
                      Kickoff request ID: {kickoffResult?.request_id || "-"}
                    </p>
                    <p>
                      Kickoff status code: {kickoffResult?.status_code ?? "-"}
                    </p>
                    <p>
                      Requested run ID:{" "}
                      {activeRunId || kickoffResult?.run_id || "-"}
                    </p>
                    <p>
                      Schedule mode:{" "}
                      {siteExtractionSchedule.enabled
                        ? siteExtractionSchedule.frequency
                        : "disabled"}
                    </p>
                    {siteExtractionSchedule.frequency === "weekly" && (
                      <p>
                        Weekly day:{" "}
                        {SITE_EXTRACTION_WEEKDAY_OPTIONS.find(
                          (option) =>
                            option.value === siteExtractionSchedule.weekly_day,
                        )?.label || siteExtractionSchedule.weekly_day}
                      </p>
                    )}
                    {siteExtractionSchedule.frequency === "monthly" && (
                      <p>Monthly day: {siteExtractionSchedule.monthly_day}</p>
                    )}
                    <p>Latest run ID: {extractionStatus?.run_id || "-"}</p>
                    <p>Latest run status: {extractionStatus?.status || "-"}</p>
                    <p>
                      Started at: {formatDateTime(extractionStatus?.started_at)}
                    </p>
                    <p>
                      Updated at: {formatDateTime(extractionStatus?.updated_at)}
                    </p>
                    <p>
                      Pages processed:{" "}
                      {extractionStatus?.pages_processed ?? "-"}
                    </p>
                    <p>
                      Run bundle: {extractionStatus?.run_bundle_s3_key || "-"}
                    </p>
                    <p>
                      Run JSONL: {extractionStatus?.run_jsonl_s3_key || "-"}
                    </p>
                    {extractionStatus?.error && (
                      <p className="text-red-600">
                        Error: {extractionStatus.error}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
