import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getValidAdminIdToken } from "../../lib/adminAuth";

const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

const SYSTEM_PROMPT_MAX = 6000;
const TONE_RULES_MAX = 2000;

type PromptConfig = {
  system_prompt: string;
  tone_rules: string;
  concise_mode: boolean;
  updatedAt?: string;
};

type GuardrailMonitor = {
  total_questions?: number;
  escalations?: number;
  refusals?: number;
  flagged_answers?: number;
  policy_trigger_reasons?: Array<{ reason: string; count: number }>;
};

type FeedbackItem = {
  eventId?: string;
  eventDate?: string;
  feedbackType?: string;
  questionText?: string;
  answerText?: string;
  pageUrl?: string;
  hallucinationStatus?: string;
  hallucinationSeverity?: string;
  hallucinationScore?: number;
  hallucinationReasons?: string[];
  hallucinationNotes?: string;
};

type FeedbackQueue = {
  items?: FeedbackItem[];
  open_count?: number;
  confirmed_count?: number;
  fixed_count?: number;
  high_count?: number;
};

type ChatAnalytics = {
  feedback?: { helpful?: number; not_helpful?: number; flag?: number };
  failures?: {
    count?: number;
    rate_percent?: number;
    by_type?: Array<{ type: string; count: number }>;
  };
  model_usage?: Array<{ model: string; count: number }>;
  citation_metrics?: {
    impressions?: number;
    clicks?: number;
    click_rate_percent?: number;
  };
};

type HallucinationStatus = "open" | "confirmed" | "fixed" | "dismissed";

type RepoChangeMetric = {
  key: string;
  label: string;
  count: number;
  color: string;
};

const REPO_CHANGE_FALLBACK: RepoChangeMetric[] = [
  { key: "features", label: "Feature work", count: 34, color: "#5B8CFF" },
  { key: "bugs", label: "Bug fixes", count: 26, color: "#7EF9FF" },
  { key: "tests", label: "Tests", count: 18, color: "#98A2C6" },
  { key: "refactors", label: "Refactors", count: 14, color: "#F5F7FF" },
  { key: "docs", label: "Docs", count: 8, color: "#2A3558" },
];

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat().format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function classifyRepoChange(text: string): keyof typeof REPO_CHANGE_KEYWORDS {
  const normalized = text.toLowerCase();
  for (const [key, keywords] of Object.entries(REPO_CHANGE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return key as keyof typeof REPO_CHANGE_KEYWORDS;
    }
  }
  return "features";
}

const REPO_CHANGE_KEYWORDS = {
  features: ["feature", "add", "build", "implement", "create", "make"],
  bugs: ["bug", "fix", "debug", "error", "failing", "broken", "issue"],
  tests: ["test", "coverage", "spec", "assert", "flaky"],
  refactors: ["refactor", "cleanup", "clean up", "simplify", "maintain"],
  docs: ["docs", "documentation", "readme", "explain", "comment"],
} as const;

function buildRepoChangeBreakdown(items: FeedbackItem[]): RepoChangeMetric[] {
  const counts = new Map(REPO_CHANGE_FALLBACK.map((item) => [item.key, 0]));

  for (const item of items) {
    const text = `${item.questionText || ""} ${item.answerText || ""}`;
    if (!text.trim()) continue;
    const key = classifyRepoChange(text);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
  if (total === 0) return REPO_CHANGE_FALLBACK;

  return REPO_CHANGE_FALLBACK.map((item) => ({
    ...item,
    count: counts.get(item.key) || 0,
  })).filter((item) => item.count > 0);
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getValidAdminIdToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export default function ExodusAdmin() {
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    system_prompt: "",
    tone_rules: "",
    concise_mode: false,
  });
  const [savedPromptConfig, setSavedPromptConfig] =
    useState<PromptConfig>(promptConfig);
  const [promptStatus, setPromptStatus] = useState("");
  const [promptError, setPromptError] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);

  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [guardrailMonitor, setGuardrailMonitor] =
    useState<GuardrailMonitor | null>(null);
  const [guardrailDays, setGuardrailDays] = useState(30);
  const [queueStatus, setQueueStatus] = useState<HallucinationStatus>("open");
  const [hallucinationQueue, setHallucinationQueue] =
    useState<FeedbackQueue | null>(null);
  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackQueue | null>(
    null,
  );
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [qualityError, setQualityError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const promptHasChanges =
    promptConfig.system_prompt !== savedPromptConfig.system_prompt ||
    promptConfig.tone_rules !== savedPromptConfig.tone_rules ||
    promptConfig.concise_mode !== savedPromptConfig.concise_mode;

  const feedbackItems = useMemo(
    () => hallucinationQueue?.items || feedbackQueue?.items || [],
    [feedbackQueue?.items, hallucinationQueue?.items],
  );
  const repoChangeBreakdown = useMemo(
    () => buildRepoChangeBreakdown(feedbackItems),
    [feedbackItems],
  );
  const repoChangeTotal = repoChangeBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const loadPromptConfig = async () => {
    setPromptLoading(true);
    setPromptError("");
    setPromptStatus("");
    try {
      const payload = await adminFetch<PromptConfig>("/admin/prompt-config");
      const normalized = {
        system_prompt: payload.system_prompt || "",
        tone_rules: payload.tone_rules || "",
        concise_mode: Boolean(payload.concise_mode),
        updatedAt: payload.updatedAt,
      };
      setPromptConfig(normalized);
      setSavedPromptConfig(normalized);
      setPromptStatus("Prompt config loaded.");
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : "Load failed.");
    } finally {
      setPromptLoading(false);
    }
  };

  const savePromptConfig = async () => {
    setPromptLoading(true);
    setPromptError("");
    setPromptStatus("");
    try {
      if (promptConfig.system_prompt.length > SYSTEM_PROMPT_MAX) {
        throw new Error(`System prompt max is ${SYSTEM_PROMPT_MAX} characters.`);
      }
      if (promptConfig.tone_rules.length > TONE_RULES_MAX) {
        throw new Error(`Tone rules max is ${TONE_RULES_MAX} characters.`);
      }
      const payload = await adminFetch<PromptConfig>("/admin/prompt-config", {
        method: "PUT",
        body: JSON.stringify({
          system_prompt: promptConfig.system_prompt,
          tone_rules: promptConfig.tone_rules,
          concise_mode: promptConfig.concise_mode,
          expectedUpdatedAt: promptConfig.updatedAt || "",
        }),
      });
      const normalized = {
        system_prompt: payload.system_prompt || promptConfig.system_prompt,
        tone_rules: payload.tone_rules || promptConfig.tone_rules,
        concise_mode: Boolean(payload.concise_mode),
        updatedAt: payload.updatedAt,
      };
      setPromptConfig(normalized);
      setSavedPromptConfig(normalized);
      setPromptStatus("Prompt config saved.");
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setPromptLoading(false);
    }
  };

  const loadQualityData = async () => {
    setLoadingQuality(true);
    setQualityError("");
    try {
      const [analyticsPayload, guardrailsPayload, hallucinationsPayload, feedbackPayload] =
        await Promise.all([
          adminFetch<ChatAnalytics>("/admin/chat-analytics?days=30"),
          adminFetch<GuardrailMonitor>(
            `/admin/guardrail-monitor?days=${guardrailDays}`,
          ),
          adminFetch<FeedbackQueue>(
            `/admin/hallucination-queue?${new URLSearchParams({
              days: "30",
              limit: "20",
              status: queueStatus,
            }).toString()}`,
          ),
          adminFetch<FeedbackQueue>("/admin/feedback-queue?days=30&limit=20"),
        ]);

      setAnalytics(analyticsPayload);
      setGuardrailMonitor(guardrailsPayload);
      setHallucinationQueue(hallucinationsPayload);
      setFeedbackQueue(feedbackPayload);
    } catch (error) {
      setQualityError(
        error instanceof Error ? error.message : "Quality data failed to load.",
      );
    } finally {
      setLoadingQuality(false);
    }
  };

  const updateHallucination = async (
    item: FeedbackItem,
    status: HallucinationStatus,
  ) => {
    const rowId = item.eventId || item.eventDate || item.questionText || "";
    if (!rowId) return;
    setUpdatingId(rowId);
    setQualityError("");
    try {
      await adminFetch("/admin/hallucination-queue/update", {
        method: "POST",
        body: JSON.stringify({
          eventId: item.eventId,
          eventDate: item.eventDate,
          status,
          notes: notesById[rowId] || item.hallucinationNotes || "",
          severity: item.hallucinationSeverity || "medium",
          reasons: item.hallucinationReasons || [],
        }),
      });
      await loadQualityData();
    } catch (error) {
      setQualityError(
        error instanceof Error ? error.message : "Queue update failed.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  useEffect(() => {
    void loadPromptConfig();
    void loadQualityData();
    // Initial admin load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadQualityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardrailDays, queueStatus]);

  const guardrailTotal = guardrailMonitor?.total_questions || 0;
  const guardrailRate = (value: number | undefined) =>
    guardrailTotal > 0 && typeof value === "number"
      ? (value / guardrailTotal) * 100
      : null;

  return (
    <main className="min-h-screen bg-[#0B1020] text-[#F5F7FF]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#24304F] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7EF9FF]">
              Exodus Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#F5F7FF]">
              LLM Chatbot Controls
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[#98A2C6]">
              Prompt tuning, hallucination review, feedback triage, guardrails,
              and model-quality signals for the coding agent.
            </p>
          </div>
          <div className="rounded border border-[#334166] bg-[#12182B] px-3 py-2 text-xs text-[#98A2C6]">
            API: <span className="font-mono text-[#F5F7FF]">{API_BASE}</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
            <p className="text-xs uppercase tracking-wide text-[#98A2C6]">
              Open hallucinations
            </p>
            <p className="mt-2 text-3xl font-bold text-[#F5F7FF]">
              {formatNumber(hallucinationQueue?.open_count)}
            </p>
          </article>
          <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
            <p className="text-xs uppercase tracking-wide text-[#98A2C6]">
              Flagged answers
            </p>
            <p className="mt-2 text-3xl font-bold text-[#F5F7FF]">
              {formatNumber(guardrailMonitor?.flagged_answers)}
            </p>
          </article>
          <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
            <p className="text-xs uppercase tracking-wide text-[#98A2C6]">
              Fallback rate
            </p>
            <p className="mt-2 text-3xl font-bold text-[#F5F7FF]">
              {formatPercent(analytics?.failures?.rate_percent)}
            </p>
          </article>
          <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
            <p className="text-xs uppercase tracking-wide text-[#98A2C6]">
              Citation CTR
            </p>
            <p className="mt-2 text-3xl font-bold text-[#F5F7FF]">
              {formatPercent(analytics?.citation_metrics?.click_rate_percent)}
            </p>
          </article>
        </section>

        <section className="rounded border border-[#24304F] bg-[#12182B] p-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-[#F5F7FF]">
                Repo Change Breakdown
              </h2>
              <p className="mt-1 text-sm text-[#98A2C6]">
                What coding-agent requests are most common: feature work, bug
                fixes, tests, refactors, or docs.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0" aria-hidden="true">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#24304F"
                    strokeWidth="16"
                  />
                  {repoChangeBreakdown.reduce(
                    (acc, item) => {
                      const percent =
                        repoChangeTotal > 0
                          ? (item.count / repoChangeTotal) * 100
                          : 0;
                      acc.nodes.push(
                        <circle
                          key={item.key}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          pathLength={100}
                          stroke={item.color}
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={-acc.offset}
                          strokeLinecap="butt"
                          strokeWidth="16"
                          transform="rotate(-90 50 50)"
                        />,
                      );
                      acc.offset += percent;
                      return acc;
                    },
                    { offset: 0, nodes: [] as ReactNode[] },
                  ).nodes}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-[#F5F7FF]">
                    {formatNumber(repoChangeTotal)}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[#98A2C6]">
                    requests
                  </span>
                </div>
              </div>

              <ul className="grid min-w-64 gap-2">
                {repoChangeBreakdown.map((item) => {
                  const percent =
                    repoChangeTotal > 0
                      ? (item.count / repoChangeTotal) * 100
                      : 0;
                  return (
                    <li
                      key={item.key}
                      className="grid grid-cols-[16px_1fr_auto] items-center gap-3 rounded bg-[#0B1020] px-3 py-2 text-sm"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[#F5F7FF]">{item.label}</span>
                      <span className="font-semibold text-[#F5F7FF]">
                        {formatPercent(percent)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <article className="rounded border border-[#24304F] bg-[#12182B]">
            <div className="flex flex-col gap-2 border-b border-[#24304F] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#F5F7FF]">
                  Prompt Config
                </h2>
                <p className="text-sm text-[#98A2C6]">
                  Tune system behavior, answer style, and concise mode.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-[#334166] px-3 py-2 text-sm font-semibold text-[#F5F7FF] hover:bg-[#1B2440]"
                  onClick={loadPromptConfig}
                  disabled={promptLoading}
                >
                  Reload
                </button>
                <button
                  type="button"
                  className="rounded bg-[#5B8CFF] px-3 py-2 text-sm font-semibold text-[#0B1020] hover:bg-[#7EF9FF] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={savePromptConfig}
                  disabled={promptLoading || !promptHasChanges}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="grid gap-4 p-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#F5F7FF]">
                  System prompt
                </span>
                <textarea
                  className="min-h-64 rounded border border-[#334166] bg-[#0B1020] p-3 font-mono text-sm text-[#F5F7FF] outline-none focus:border-[#7EF9FF]"
                  value={promptConfig.system_prompt}
                  onChange={(event) =>
                    setPromptConfig((current) => ({
                      ...current,
                      system_prompt: event.target.value,
                    }))
                  }
                />
                <span className="text-xs text-[#98A2C6]">
                  {promptConfig.system_prompt.length}/{SYSTEM_PROMPT_MAX}
                </span>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#F5F7FF]">
                  Tone rules
                </span>
                <textarea
                  className="min-h-36 rounded border border-[#334166] bg-[#0B1020] p-3 font-mono text-sm text-[#F5F7FF] outline-none focus:border-[#7EF9FF]"
                  value={promptConfig.tone_rules}
                  onChange={(event) =>
                    setPromptConfig((current) => ({
                      ...current,
                      tone_rules: event.target.value,
                    }))
                  }
                />
                <span className="text-xs text-[#98A2C6]">
                  {promptConfig.tone_rules.length}/{TONE_RULES_MAX}
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm text-[#F5F7FF]">
                <input
                  type="checkbox"
                  checked={promptConfig.concise_mode}
                  onChange={(event) =>
                    setPromptConfig((current) => ({
                      ...current,
                      concise_mode: event.target.checked,
                    }))
                  }
                />
                Concise mode
              </label>
              {promptStatus && (
                <p className="rounded border border-[#5B8CFF] bg-[#0B1020] px-3 py-2 text-sm text-[#7EF9FF]">
                  {promptStatus}
                </p>
              )}
              {promptError && (
                <p className="rounded border border-[#5B8CFF] bg-[#0B1020] px-3 py-2 text-sm text-[#F5F7FF]">
                  {promptError}
                </p>
              )}
              {promptConfig.updatedAt && (
                <p className="text-xs text-[#98A2C6]">
                  Last updated: {formatDateTime(promptConfig.updatedAt)}
                </p>
              )}
            </div>
          </article>

          <aside className="grid content-start gap-6">
            <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#F5F7FF]">
                    Guardrails
                  </h2>
                  <p className="text-sm text-[#98A2C6]">
                    Escalations, refusals, and flagged answer triggers.
                  </p>
                </div>
                <select
                  className="rounded border border-[#334166] bg-[#0B1020] px-2 py-1 text-sm"
                  value={guardrailDays}
                  onChange={(event) => setGuardrailDays(Number(event.target.value))}
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <dl className="mt-4 grid gap-3">
                {[
                  ["Escalations", guardrailMonitor?.escalations],
                  ["Refusals", guardrailMonitor?.refusals],
                  ["Flagged answers", guardrailMonitor?.flagged_answers],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between rounded bg-[#0B1020] px-3 py-2"
                  >
                    <dt className="text-sm text-[#98A2C6]">{label}</dt>
                    <dd className="text-sm font-semibold text-[#F5F7FF]">
                      {formatNumber(value as number | undefined)}{" "}
                      <span className="text-xs text-[#98A2C6]">
                        {formatPercent(guardrailRate(value as number | undefined))}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#F5F7FF]">
                  Top trigger reasons
                </p>
                <ul className="mt-2 grid gap-2 text-sm text-[#98A2C6]">
                  {(guardrailMonitor?.policy_trigger_reasons || []).length ? (
                    guardrailMonitor?.policy_trigger_reasons?.slice(0, 5).map((item) => (
                      <li
                        key={item.reason}
                        className="flex justify-between gap-3 rounded bg-[#0B1020] px-3 py-2"
                      >
                        <span>{item.reason.replaceAll("_", " ")}</span>
                        <span className="font-semibold text-[#F5F7FF]">
                          {formatNumber(item.count)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="rounded bg-[#0B1020] px-3 py-2 text-[#98A2C6]">
                      No trigger data loaded.
                    </li>
                  )}
                </ul>
              </div>
            </article>

            <article className="rounded border border-[#24304F] bg-[#12182B] p-4">
              <h2 className="text-lg font-semibold text-[#F5F7FF]">
                Model & Feedback Signals
              </h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#F5F7FF]">
                    Model usage
                  </p>
                  <ul className="mt-2 grid gap-2 text-sm text-[#98A2C6]">
                    {(analytics?.model_usage || []).length ? (
                      analytics?.model_usage?.map((item) => (
                        <li
                          key={item.model}
                          className="flex justify-between gap-3 rounded bg-[#0B1020] px-3 py-2"
                        >
                          <span>{item.model}</span>
                          <span className="font-semibold text-[#F5F7FF]">
                            {formatNumber(item.count)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded bg-[#0B1020] px-3 py-2 text-[#98A2C6]">
                        No model usage loaded.
                      </li>
                    )}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded bg-[#0B1020] p-3">
                    <p className="text-[#98A2C6]">Helpful</p>
                    <p className="mt-1 font-semibold text-[#F5F7FF]">
                      {formatNumber(analytics?.feedback?.helpful)}
                    </p>
                  </div>
                  <div className="rounded bg-[#0B1020] p-3">
                    <p className="text-[#98A2C6]">Not helpful</p>
                    <p className="mt-1 font-semibold text-[#F5F7FF]">
                      {formatNumber(analytics?.feedback?.not_helpful)}
                    </p>
                  </div>
                  <div className="rounded bg-[#0B1020] p-3">
                    <p className="text-[#98A2C6]">Flag</p>
                    <p className="mt-1 font-semibold text-[#F5F7FF]">
                      {formatNumber(analytics?.feedback?.flag)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <section className="rounded border border-[#24304F] bg-[#12182B]">
          <div className="flex flex-col gap-3 border-b border-[#24304F] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FF]">
                Hallucination & Answer Quality Queue
              </h2>
              <p className="text-sm text-[#98A2C6]">
                Review weird answers, hallucination signals, and user feedback.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded border border-[#334166] bg-[#0B1020] px-3 py-2 text-sm"
                value={queueStatus}
                onChange={(event) =>
                  setQueueStatus(event.target.value as HallucinationStatus)
                }
              >
                <option value="open">Open</option>
                <option value="confirmed">Confirmed</option>
                <option value="fixed">Fixed</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <button
                type="button"
                className="rounded border border-[#334166] px-3 py-2 text-sm font-semibold text-[#F5F7FF] hover:bg-[#1B2440]"
                onClick={loadQualityData}
                disabled={loadingQuality}
              >
                {loadingQuality ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {qualityError && (
            <p className="m-4 rounded border border-[#5B8CFF] bg-[#0B1020] px-3 py-2 text-sm text-[#F5F7FF]">
              {qualityError}
            </p>
          )}

          <div className="grid gap-4 p-4">
            {feedbackItems.length === 0 ? (
              <div className="rounded border border-dashed border-[#334166] p-8 text-center text-[#98A2C6]">
                No answer-quality items loaded.
              </div>
            ) : (
              feedbackItems.map((item, index) => {
                const rowId =
                  item.eventId ||
                  item.eventDate ||
                  item.questionText ||
                  `quality-${index}`;
                return (
                  <article
                    key={rowId}
                    className="rounded border border-[#24304F] bg-[#0B1020] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7EF9FF]">
                          {item.feedbackType || "feedback"} •{" "}
                          {item.hallucinationStatus || "open"} •{" "}
                          {item.hallucinationSeverity || "medium"}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-[#F5F7FF]">
                          {item.questionText || "No question captured"}
                        </h3>
                        <p className="mt-1 text-xs text-[#98A2C6]">
                          {formatDateTime(item.eventDate)}
                        </p>
                      </div>
                      {typeof item.hallucinationScore === "number" && (
                        <div className="rounded bg-[#5B8CFF] px-3 py-2 text-sm font-semibold text-[#0B1020]">
                          Score {item.hallucinationScore.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#98A2C6]">
                          Answer
                        </p>
                        <p className="mt-1 whitespace-pre-wrap rounded bg-[#12182B] p-3 text-sm text-[#F5F7FF]">
                          {item.answerText || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#98A2C6]">
                          Signals
                        </p>
                        <div className="mt-1 rounded bg-[#12182B] p-3 text-sm text-[#98A2C6]">
                          {item.hallucinationReasons?.length ? (
                            <ul className="list-disc pl-5">
                              {item.hallucinationReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No reasons supplied.</p>
                          )}
                          {item.pageUrl && (
                            <a
                              className="mt-3 inline-block text-[#7EF9FF] underline"
                              href={item.pageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open source page
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <label className="mt-4 grid gap-2">
                      <span className="text-sm font-semibold text-[#F5F7FF]">
                        Resolution notes
                      </span>
                      <textarea
                        className="min-h-20 rounded border border-[#334166] bg-[#12182B] p-3 text-sm text-[#F5F7FF] outline-none focus:border-[#7EF9FF]"
                        value={notesById[rowId] ?? item.hallucinationNotes ?? ""}
                        onChange={(event) =>
                          setNotesById((current) => ({
                            ...current,
                            [rowId]: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["confirmed", "fixed", "dismissed"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            className="rounded border border-[#334166] px-3 py-2 text-sm font-semibold capitalize text-[#F5F7FF] hover:bg-[#1B2440] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => updateHallucination(item, status)}
                            disabled={updatingId === rowId}
                          >
                            {updatingId === rowId ? "Updating..." : status}
                          </button>
                        ),
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
