// src/components/chat/ChatbotWidget.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { v4 as uuidv4 } from "uuid";
import { getValidCognitoIdToken } from "../../lib/cognitoSession";

interface Message {
  text: string;
  sender: "user" | "bot";
  citations?: Citation[];
  confidence?: ConfidenceMeta;
  feedback?: FeedbackState;
  handoff?: HandoffPayload;
  formPrefill?: FormPrefillPayload;
  lastVerified?: string;
  failureKind?: FailureKind;
  retryQuestion?: string;
  sourceWarning?: string;
}

type FailureKind = "offline" | "timeout" | "api_unavailable" | "unknown";

interface Citation {
  title: string;
  url: string;
}

type CitationSourceType = "official" | "external";

interface ConfidenceMeta {
  score: number;
  label: "high" | "medium" | "low";
  summary?: string;
}

interface HandoffPayload {
  required: boolean;
  reason?: string;
  contact_url?: string;
  phone?: string;
  service_phone?: string;
  ticket?: {
    id?: string;
    chat_id?: string;
    user_id?: string;
    page_url?: string;
    summary?: string;
    context?: string;
  };
}

interface FormPrefillPayload {
  target: string;
  fields: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  note?: string;
}

interface ProactiveNudge {
  id: string;
  title: string;
  message: string;
  severity?: "info" | "warning";
  cta_label?: string;
  prompt?: string;
}

type FeedbackState = "helpful" | "not_helpful" | "flag";
export type ChatSizePreset = "small" | "medium" | "large";

interface ChatbotWidgetProps {
  contextPrefix?: string;
  initialGreetingOverride?: string;
  disableConfigFetch?: boolean;
  disableNudges?: boolean;
  variant?: "default" | "civiq";
  hideMetaControls?: boolean;
  hideDisclosure?: boolean;
}

export interface ChatbotWidgetHandle {
  cycleLanguage: () => void;
  getLanguage: () => SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  askQuestion: (question: string) => void;
  toggleTheme: () => void;
  startNewConversation: () => void;
  applySizePreset: (preset: ChatSizePreset) => void;
  toggleHistoryPanel: () => void;
  openHistoryPanel: () => void;
  hasUnsentDraft: () => boolean;
  isGenerating: () => boolean;
}


const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");
const URL_PATTERN = /\bhttps?:\/\/[^\s<>()]+/gi;
const MARKDOWN_LINK_PATTERN = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/gi;
const MAX_COMPOSER_CHARS = 800;
const DRAFT_STORAGE_KEY = "pv_chat_draft";

type ChatTheme = "dark" | "light";
const SUPPORTED_LANGUAGES = [
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
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const CHATBOT_SUPPORTED_LANGUAGES = [...SUPPORTED_LANGUAGES];
const FEEDBACK_LABEL_MAP: Record<FeedbackState, string> = {
  helpful: "Helpful",
  not_helpful: "Not helpful",
  flag: "Flagged",
};

interface ConversationRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  language: SupportedLanguage;
  preview: string;
  pinned: boolean;
}

type HistoryTimeSection = "today" | "yesterday" | "earlier";
type ViewportMode = "desktop" | "tablet" | "mobile";

type ConversationHistoryEvent =
  | "create"
  | "resume"
  | "rename"
  | "delete"
  | "clear_all";

const CHAT_HISTORY_STORAGE_PREFIX = "pv_chat_history_v1";
const CHAT_ACTIVE_CONVERSATION_STORAGE_PREFIX = "pv_chat_active_chat_v1";
const CHAT_MESSAGES_STORAGE_PREFIX = "pv_chat_messages_v1";
const CHAT_SIDEBAR_PREFS_STORAGE_PREFIX = "pv_chat_sidebar_prefs_v2";
const DEFAULT_CONVERSATION_TITLE = "New conversation";
const CONVERSATION_TITLE_MAX = 72;
const SIDEBAR_DEFAULT_WIDTH_DESKTOP = 300;
const SIDEBAR_DEFAULT_WIDTH_TABLET = 240;
const SIDEBAR_COLLAPSED_WIDTH = 60;
const SIDEBAR_MIN_WIDTH_DESKTOP = 280;
const SIDEBAR_MAX_WIDTH_DESKTOP = 420;

function getViewportMode(width: number): ViewportMode {
  if (width >= 1200) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createConversationPreview(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const preview = normalized.split("\n")[0] || normalized;
  return preview.length > 90 ? `${preview.slice(0, 89).trimEnd()}…` : preview;
}

function getHistoryTimeSection(timestamp: number): HistoryTimeSection {
  const now = new Date();
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(timestamp);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (currentDay.getTime() - dateDay.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  return "earlier";
}

function sortConversationRecords(
  records: ConversationRecord[],
): ConversationRecord[] {
  return [...records].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

function getSidebarPreferenceStorageKey(identityKey: string | null): string {
  if (identityKey) {
    return `${CHAT_SIDEBAR_PREFS_STORAGE_PREFIX}_${identityKey}`;
  }
  return `${CHAT_SIDEBAR_PREFS_STORAGE_PREFIX}_guest`;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hashKey(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getAuthIdentityKey(idToken: string | null): string | null {
  if (!idToken) return null;
  const payload = parseJwtPayload(idToken);
  const sub = payload?.sub;
  const username = payload?.["cognito:username"];
  const iss = payload?.iss;
  const identityBase =
    (typeof sub === "string" && sub) ||
    (typeof username === "string" && username) ||
    idToken;
  const issuer = typeof iss === "string" && iss ? iss : "cognito";
  return hashKey(`${issuer}|${identityBase}`);
}

function getOrCreateGuestChatId(): string {
  const saved = localStorage.getItem("guestChatId");
  if (saved) return saved;
  const newId = `guest_${uuidv4().slice(0, 8)}`;
  localStorage.setItem("guestChatId", newId);
  return newId;
}

function createConversationTitle(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return DEFAULT_CONVERSATION_TITLE;
  if (normalized.length <= CONVERSATION_TITLE_MAX) return normalized;
  return `${normalized.slice(0, CONVERSATION_TITLE_MAX - 1).trimEnd()}…`;
}

function formatRelativeTimestamp(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.round(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.round(diffMs / hour)}h ago`;
  if (diffMs < day * 7) return `${Math.round(diffMs / day)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function toConversationRecordList(value: unknown): ConversationRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is ConversationRecord => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<ConversationRecord>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.createdAt === "number" &&
        typeof candidate.updatedAt === "number" &&
        typeof candidate.language === "string" &&
        (SUPPORTED_LANGUAGES as readonly string[]).includes(candidate.language)
      );
    })
    .map((item) => ({
      ...item,
      title: item.title || DEFAULT_CONVERSATION_TITLE,
      preview:
        typeof (item as Partial<ConversationRecord>).preview === "string"
          ? (item as Partial<ConversationRecord>).preview || ""
          : "",
      pinned: Boolean((item as Partial<ConversationRecord>).pinned),
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
}

function buildConversationRecord(
  id: string,
  language: SupportedLanguage,
): ConversationRecord {
  const timestamp = Date.now();
  return {
    id,
    title: DEFAULT_CONVERSATION_TITLE,
    createdAt: timestamp,
    updatedAt: timestamp,
    language,
    preview: "",
    pinned: false,
  };
}

function getConversationMessageStorageKey(
  conversationId: string,
  identityKey: string | null,
): string | null {
  if (!conversationId || conversationId.startsWith("temp_")) return null;
  if (identityKey) {
    return `${CHAT_MESSAGES_STORAGE_PREFIX}_${identityKey}_${conversationId}`;
  }
  return `${CHAT_MESSAGES_STORAGE_PREFIX}_guest_${conversationId}`;
}

function normalizeExodusNudges(
  rawNudges: unknown,
  dismissedSet: Set<string>,
): ProactiveNudge[] {
  if (!Array.isArray(rawNudges)) return [];

  const visible = rawNudges.filter((item): item is ProactiveNudge => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<ProactiveNudge>;
    if (typeof candidate.id !== "string") return false;
    if (typeof candidate.message !== "string") return false;

    const searchableText = [
      candidate.id,
      candidate.title,
      candidate.message,
      candidate.cta_label,
      candidate.prompt,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      !dismissedSet.has(candidate.id) &&
      !searchableText.includes("voter") &&
      !searchableText.includes("registration")
    );
  });

  const airQualityNudge =
    visible.find((item) => {
      const searchableText = `${item.id} ${item.title || ""} ${item.message}`.toLowerCase();
      return searchableText.includes("air quality");
    }) || visible[0];

  if (!airQualityNudge) return [];

  const workSurveyNudge: ProactiveNudge = {
    ...airQualityNudge,
    id: "work-survey-due-july-1",
    title: "Work survey due July 1",
    message:
      "Please complete the Exodus work survey by July 1 so the team has time to review responses and plan next steps.",
    severity: "warning",
    cta_label: "Ask about the survey",
    prompt:
      "What do I need to know about the Exodus work survey that is due July 1?",
  };

  return dismissedSet.has(workSurveyNudge.id) ? [] : [workSurveyNudge];
}

function trackConversationHistoryEvent(params: {
  eventType: ConversationHistoryEvent;
  chatId: string;
  title?: string;
  language?: SupportedLanguage;
}) {
  window.dispatchEvent(
    new CustomEvent("primiq:chat-history", {
      detail: {
        eventType: params.eventType,
        chatId: params.chatId,
        title: params.title,
        language: params.language,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    }),
  );
}

type StarterPromptCategory =
  | "debugging"
  | "implementation"
  | "review"
  | "tests"
  | "explanation"
  | "refactor"
  | "seasonal"
  | "crisis"
  | "trust"
  | "general";

type StarterPromptSource =
  | "contextual"
  | "seasonal"
  | "crisis"
  | "admin"
  | "personalized";

type StarterPromptExperimentVariant = "A" | "B";

interface StarterPromptSuggestion {
  id: string;
  text: string;
  category: StarterPromptCategory;
  source: StarterPromptSource;
}

interface StarterPromptSelection {
  promptId: string;
  promptText: string;
  category: StarterPromptCategory;
  selectedAt: number;
  variant: StarterPromptExperimentVariant;
}

interface StarterPromptMetricsEntry {
  selected: number;
  submitted: number;
  editedBeforeSend: number;
  lastSelectedAt: number;
  category: StarterPromptCategory;
}

type StarterPromptMetrics = Record<string, StarterPromptMetricsEntry>;

interface StarterPromptAdminConfig {
  prompts?: string[];
  promptsByLanguage?: Partial<Record<SupportedLanguage, string[]>>;
  promptsByPath?: Record<string, string[]>;
  promptsByDepartment?: Record<string, string[]>;
  crisisPrompts?: string[];
  maxSuggestions?: number;
}


const DOMAIN_BALANCED_STARTER_PROMPTS: StarterPromptSuggestion[] = [
  {
    id: "domain-debugging",
    text: "Help me debug a failing test or runtime error.",
    category: "debugging",
    source: "contextual",
  },
  {
    id: "domain-implementation",
    text: "Add a feature to my app and explain the changes.",
    category: "implementation",
    source: "contextual",
  },
  {
    id: "domain-review",
    text: "Review my code for bugs and risky edge cases.",
    category: "review",
    source: "contextual",
  },
  {
    id: "domain-tests",
    text: "Write tests for this component or function.",
    category: "tests",
    source: "contextual",
  },
  {
    id: "domain-explanation",
    text: "Explain how this code works in plain English.",
    category: "explanation",
    source: "contextual",
  },
  {
    id: "domain-refactor",
    text: "Refactor this code to make it cleaner and easier to maintain.",
    category: "refactor",
    source: "contextual",
  },
];

const STARTER_PROMPT_METRICS_STORAGE_KEY = "pv_chat_starter_prompt_metrics";
const STARTER_PROMPT_CATEGORY_HISTORY_STORAGE_KEY =
  "pv_chat_starter_prompt_recent_categories";
const STARTER_PROMPT_AB_VARIANT_STORAGE_KEY = "pv_chat_starter_prompt_variant";
const STARTER_PROMPT_ADMIN_CONFIG_STORAGE_KEY =
  "pv_chat_starter_prompts_config";

const STARTER_PROMPT_TRANSLATION_OVERRIDES: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  "Build a new feature in my app.": {
    Spanish: "Crea una nueva función en mi aplicación.",
    French: "Créez une nouvelle fonctionnalité dans mon application.",
    German: "Baue eine neue Funktion in meiner App.",
  },
  "Debug an error or failing test.": {
    Spanish: "Depura un error o una prueba fallida.",
    French: "Déboguez une erreur ou un test qui échoue.",
    German: "Debugge einen Fehler oder einen fehlschlagenden Test.",
  },
  "Review my code for bugs.": {
    Spanish: "Revisa mi código para encontrar errores.",
    French: "Passez mon code en revue pour trouver des bogues.",
    German: "Prüfe meinen Code auf Fehler.",
  },
  "Write tests for this code.": {
    Spanish: "Escribe pruebas para este código.",
    French: "Écrivez des tests pour ce code.",
    German: "Schreibe Tests für diesen Code.",
  },
  "Explain a codebase or function.": {
    Spanish: "Explica una base de código o una función.",
    French: "Expliquez une base de code ou une fonction.",
    German: "Erkläre eine Codebasis oder Funktion.",
  },
  "Refactor code without changing behavior.": {
    Spanish: "Refactoriza código sin cambiar el comportamiento.",
    French: "Refactorisez du code sans changer le comportement.",
    German: "Refaktoriere Code, ohne das Verhalten zu ändern.",
  },
  "Help me debug this error message.": {
    Spanish: "Ayúdame a depurar este mensaje de error.",
    French: "Aidez-moi à déboguer ce message d'erreur.",
    German: "Hilf mir, diese Fehlermeldung zu debuggen.",
  },
  "Help me implement this feature end to end.": {
    Spanish: "Ayúdame a implementar esta función de principio a fin.",
    French: "Aidez-moi à implémenter cette fonctionnalité de bout en bout.",
    German: "Hilf mir, diese Funktion vollständig umzusetzen.",
  },
  "Help me add a test that catches this failure.": {
    Spanish: "Ayúdame a agregar una prueba que detecte este fallo.",
    French: "Aidez-moi à ajouter un test qui détecte cet échec.",
    German: "Hilf mir, einen Test hinzuzufügen, der diesen Fehler erkennt.",
  },
  "Explain the fix and any tradeoffs before changing code.": {
    Spanish: "Explica la solución y las compensaciones antes de cambiar el código.",
    French: "Expliquez la correction et les compromis avant de modifier le code.",
    German: "Erkläre die Lösung und mögliche Kompromisse, bevor du Code änderst.",
  },
};

function normalizeLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  const candidate = (value || "").trim();
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(candidate)) {
    return candidate as SupportedLanguage;
  }
  return "English";
}

function wrapUrlsInMarkdown(segment: string): string {
  return segment.replace(URL_PATTERN, (rawUrl) => {
    let cleanUrl = rawUrl;
    let trailing = "";
    while (/[.,!?;:]$/.test(cleanUrl)) {
      trailing = cleanUrl.slice(-1) + trailing;
      cleanUrl = cleanUrl.slice(0, -1);
    }
    if (!cleanUrl) return rawUrl;
    return `[${cleanUrl}](${cleanUrl})${trailing}`;
  });
}

function linkifyPlainUrls(text: string): string {
  if (!text) return text;

  let result = "";
  let lastIndex = 0;
  const matches = text.matchAll(MARKDOWN_LINK_PATTERN);

  for (const match of matches) {
    const start = match.index ?? 0;
    const full = match[0] ?? "";
    result += wrapUrlsInMarkdown(text.slice(lastIndex, start));
    result += full;
    lastIndex = start + full.length;
  }

  result += wrapUrlsInMarkdown(text.slice(lastIndex));
  return result;
}

function FeedbackIcon({ feedback }: { feedback: FeedbackState }) {
  if (feedback === "helpful") {
    return (
      <svg
        className="pv-chat-feedback-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3 3 0 0 1 3 3.88Z" />
      </svg>
    );
  }

  if (feedback === "not_helpful") {
    return (
      <svg
        className="pv-chat-feedback-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3 3 0 0 1-3-3.88Z" />
      </svg>
    );
  }

  return (
    <svg
      className="pv-chat-feedback-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 14s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22V14" />
    </svg>
  );
}


function classifyCitationSource(citation: Citation): CitationSourceType {
  try {
    const parsed = new URL(citation.url);
    const host = parsed.hostname.toLowerCase();
    if (host.endsWith(".gov") || host.includes("cityof") || host.includes("exodus")) {
      return 'official';
    }
    return 'external';
  } catch {
    return 'external';
  }
}

function citationHostname(citation: Citation): string {
  try {
    return new URL(citation.url).hostname.replace(/^www\./, '');
  } catch {
    return 'external source';
  }
}


function normalizeLastVerified(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function formatLastVerified(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return value;
}

function normalizeStarterPromptText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function localizeStarterPromptText(
  englishText: string,
  language: SupportedLanguage,
): string {
  if (language === "English") return englishText;
  const translated =
    STARTER_PROMPT_TRANSLATION_OVERRIDES[englishText]?.[language];
  if (translated) return translated;
  return `${englishText} (${language})`;
}

function inferStarterPromptCategoryFromText(
  text: string,
): StarterPromptCategory {
  const normalized = text.toLowerCase();
  if (normalized.includes("debug") || normalized.includes("error")) {
    return "debugging";
  }
  if (
    normalized.includes("add") ||
    normalized.includes("build") ||
    normalized.includes("implement") ||
    normalized.includes("feature")
  ) {
    return "implementation";
  }
  if (normalized.includes("review") || normalized.includes("bug")) {
    return "review";
  }
  if (normalized.includes("test")) return "tests";
  if (normalized.includes("explain") || normalized.includes("how")) {
    return "explanation";
  }
  if (normalized.includes("refactor") || normalized.includes("clean")) {
    return "refactor";
  }
  if (
    normalized.includes("shelter") ||
    normalized.includes("emergency") ||
    normalized.includes("closure")
  ) {
    return "crisis";
  }
  if (
    normalized.includes("source") ||
    normalized.includes("citation") ||
    normalized.includes("link")
  ) {
    return "trust";
  }
  return "general";
}

function clampStarterPromptCount(maxSuggestions?: number): number {
  if (!Number.isFinite(maxSuggestions)) return 3;
  return Math.min(3, Math.max(3, Math.round(Number(maxSuggestions))));
}

function toStarterPromptStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => normalizeStarterPromptText(item))
    .filter(Boolean);
}

function parseStarterPromptAdminConfig(
  rawConfig: unknown,
): StarterPromptAdminConfig | null {
  if (!rawConfig) return null;

  if (Array.isArray(rawConfig)) {
    const prompts = toStarterPromptStringList(rawConfig);
    return prompts.length > 0 ? { prompts } : null;
  }

  if (typeof rawConfig !== "object") return null;
  const candidate = rawConfig as Record<string, unknown>;

  const promptsByLanguage: Partial<Record<SupportedLanguage, string[]>> = {};
  const languageMapRaw = candidate.promptsByLanguage;
  if (languageMapRaw && typeof languageMapRaw === "object") {
    for (const language of SUPPORTED_LANGUAGES) {
      const values = toStarterPromptStringList(
        (languageMapRaw as Record<string, unknown>)[language],
      );
      if (values.length > 0) {
        promptsByLanguage[language] = values;
      }
    }
  }

  const promptsByPathRaw = candidate.promptsByPath;
  const promptsByPath: Record<string, string[]> = {};
  if (promptsByPathRaw && typeof promptsByPathRaw === "object") {
    for (const [path, values] of Object.entries(
      promptsByPathRaw as Record<string, unknown>,
    )) {
      const prompts = toStarterPromptStringList(values);
      if (prompts.length > 0) {
        promptsByPath[path.toLowerCase()] = prompts;
      }
    }
  }

  const promptsByDepartmentRaw = candidate.promptsByDepartment;
  const promptsByDepartment: Record<string, string[]> = {};
  if (promptsByDepartmentRaw && typeof promptsByDepartmentRaw === "object") {
    for (const [department, values] of Object.entries(
      promptsByDepartmentRaw as Record<string, unknown>,
    )) {
      const prompts = toStarterPromptStringList(values);
      if (prompts.length > 0) {
        promptsByDepartment[department.toLowerCase()] = prompts;
      }
    }
  }

  const parsed: StarterPromptAdminConfig = {
    prompts: toStarterPromptStringList(candidate.prompts),
    promptsByLanguage,
    promptsByPath,
    promptsByDepartment,
    crisisPrompts: toStarterPromptStringList(candidate.crisisPrompts),
    maxSuggestions:
      typeof candidate.maxSuggestions === "number"
        ? candidate.maxSuggestions
        : undefined,
  };

  const hasConfig =
    (parsed.prompts?.length || 0) > 0 ||
    Object.keys(parsed.promptsByLanguage || {}).length > 0 ||
    Object.keys(parsed.promptsByPath || {}).length > 0 ||
    Object.keys(parsed.promptsByDepartment || {}).length > 0 ||
    (parsed.crisisPrompts?.length || 0) > 0 ||
    typeof parsed.maxSuggestions === "number";

  return hasConfig ? parsed : null;
}

function mergeStarterPromptAdminConfigs(
  baseConfig: StarterPromptAdminConfig | null,
  nextConfig: StarterPromptAdminConfig | null,
): StarterPromptAdminConfig | null {
  if (!baseConfig) return nextConfig;
  if (!nextConfig) return baseConfig;
  return {
    prompts: nextConfig.prompts?.length
      ? nextConfig.prompts
      : baseConfig.prompts,
    promptsByLanguage: {
      ...(baseConfig.promptsByLanguage || {}),
      ...(nextConfig.promptsByLanguage || {}),
    },
    promptsByPath: {
      ...(baseConfig.promptsByPath || {}),
      ...(nextConfig.promptsByPath || {}),
    },
    promptsByDepartment: {
      ...(baseConfig.promptsByDepartment || {}),
      ...(nextConfig.promptsByDepartment || {}),
    },
    crisisPrompts:
      nextConfig.crisisPrompts?.length && nextConfig.crisisPrompts.length > 0
        ? nextConfig.crisisPrompts
        : baseConfig.crisisPrompts,
    maxSuggestions: nextConfig.maxSuggestions ?? baseConfig.maxSuggestions,
  };
}

function readStarterPromptRuntimeConfig(): StarterPromptAdminConfig | null {
  let mergedConfig: StarterPromptAdminConfig | null = null;

  const envRaw = import.meta.env.VITE_CHATBOT_STARTER_PROMPTS_CONFIG;
  if (typeof envRaw === "string" && envRaw.trim().length > 0) {
    try {
      mergedConfig = mergeStarterPromptAdminConfigs(
        mergedConfig,
        parseStarterPromptAdminConfig(JSON.parse(envRaw)),
      );
    } catch {
      // ignore malformed env JSON
    }
  }

  const globalRaw = (
    window as Window & {
      __PV_CHAT_STARTER_PROMPTS__?: unknown;
    }
  ).__PV_CHAT_STARTER_PROMPTS__;
  mergedConfig = mergeStarterPromptAdminConfigs(
    mergedConfig,
    parseStarterPromptAdminConfig(globalRaw),
  );

  try {
    const localStorageRaw = localStorage.getItem(
      STARTER_PROMPT_ADMIN_CONFIG_STORAGE_KEY,
    );
    if (localStorageRaw) {
      mergedConfig = mergeStarterPromptAdminConfigs(
        mergedConfig,
        parseStarterPromptAdminConfig(JSON.parse(localStorageRaw)),
      );
    }
  } catch {
    // ignore local storage parsing errors
  }

  return mergedConfig;
}

function getOrCreateStarterPromptVariant(): StarterPromptExperimentVariant {
  try {
    const saved = localStorage.getItem(STARTER_PROMPT_AB_VARIANT_STORAGE_KEY);
    if (saved === "A" || saved === "B") return saved;
    const generated: StarterPromptExperimentVariant =
      Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(STARTER_PROMPT_AB_VARIANT_STORAGE_KEY, generated);
    return generated;
  } catch {
    return "A";
  }
}

function readStarterPromptMetrics(): StarterPromptMetrics {
  try {
    const raw = localStorage.getItem(STARTER_PROMPT_METRICS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as StarterPromptMetrics;
    }
  } catch {
    // ignore malformed analytics storage
  }
  return {};
}

function writeStarterPromptMetrics(metrics: StarterPromptMetrics): void {
  try {
    localStorage.setItem(
      STARTER_PROMPT_METRICS_STORAGE_KEY,
      JSON.stringify(metrics),
    );
  } catch {
    // ignore local storage write errors
  }
}

function readStarterPromptRecentCategoryWeights(): Partial<
  Record<StarterPromptCategory, number>
> {
  try {
    const raw = localStorage.getItem(
      STARTER_PROMPT_CATEGORY_HISTORY_STORAGE_KEY,
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return {};
    return parsed
      .filter((item): item is StarterPromptCategory => typeof item === "string")
      .slice(-20)
      .reduce<Partial<Record<StarterPromptCategory, number>>>(
        (acc, category) => {
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {},
      );
  } catch {
    return {};
  }
}

function storeStarterPromptRecentCategory(
  category: StarterPromptCategory,
): void {
  try {
    const raw = localStorage.getItem(
      STARTER_PROMPT_CATEGORY_HISTORY_STORAGE_KEY,
    );
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
    next.push(category);
    localStorage.setItem(
      STARTER_PROMPT_CATEGORY_HISTORY_STORAGE_KEY,
      JSON.stringify(next.slice(-20)),
    );
  } catch {
    // ignore local storage write errors
  }
}

function detectCrisisMode(pathname: string): boolean {
  const search = window.location.search.toLowerCase();
  const params = new URLSearchParams(search);
  if (params.get("crisis") === "1" || params.get("emergency") === "1") {
    return true;
  }
  if (
    pathname.includes("/emergency") ||
    pathname.includes("/alerts") ||
    pathname.includes("/incident")
  ) {
    return true;
  }
  if (localStorage.getItem("pv_crisis_mode") === "true") {
    return true;
  }
  if (
    (window as Window & { __PV_CHAT_CRISIS_MODE__?: boolean })
      .__PV_CHAT_CRISIS_MODE__ === true
  ) {
    return true;
  }
  return Boolean(
    document.querySelector(
      '[data-crisis-mode="true"], [data-emergency-banner="true"]',
    ),
  );
}

function getDepartmentContext(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const departmentIndex = segments.findIndex((segment) =>
    segment.startsWith("departments"),
  );
  if (departmentIndex === -1) return null;
  const slug = segments[departmentIndex + 1];
  if (!slug) return null;
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSeasonalStarterPrompt(month: number): StarterPromptSuggestion {
  const text =
    month >= 5 && month <= 8
      ? "Help me clean up a messy component without changing behavior."
      : month >= 9 || month <= 1
        ? "Help me fix a flaky test and explain the root cause."
        : "Help me plan the implementation steps for a new feature.";
  return {
    id: `seasonal-${month}`,
    text,
    category: "seasonal",
    source: "seasonal",
  };
}

function buildDefaultContextualStarterPrompts(
  pathname: string,
  month: number,
  departmentContext: string | null,
  crisisMode: boolean,
): StarterPromptSuggestion[] {
  if (crisisMode) {
    return [
      {
        id: "crisis-prod-error",
        text: "Help me triage a production error quickly.",
        category: "debugging",
        source: "crisis",
      },
      {
        id: "crisis-regression",
        text: "Help me find what change caused this regression.",
        category: "debugging",
        source: "crisis",
      },
      {
        id: "crisis-rollback",
        text: "Help me write a safe rollback or hotfix plan.",
        category: "implementation",
        source: "crisis",
      },
      {
        id: "crisis-tests",
        text: "Help me add a test that catches this failure.",
        category: "tests",
        source: "crisis",
      },
      {
        id: "crisis-sources",
        text: "Explain the fix and any tradeoffs before changing code.",
        category: "trust",
        source: "crisis",
      },
    ];
  }

  const seasonal = buildSeasonalStarterPrompt(month);

  if (pathname.includes("/permits")) {
    return [
      {
        id: "feature-implement",
        text: "Help me implement this feature end to end.",
        category: "implementation",
        source: "contextual",
      },
      {
        id: "feature-files",
        text: "Which files should I change for this feature?",
        category: "implementation",
        source: "contextual",
      },
      {
        id: "feature-tests",
        text: "What tests should I add for this feature?",
        category: "tests",
        source: "contextual",
      },
      {
        id: "feature-edge-cases",
        text: "What edge cases should I handle?",
        category: "review",
        source: "contextual",
      },
      seasonal,
      {
        id: "permits-sources",
        text: "Explain the implementation plan before coding.",
        category: "trust",
        source: "contextual",
      },
    ];
  }

  if (pathname.includes("/payments") || pathname.includes("/utilities")) {
    return [
      {
        id: "debug-error",
        text: "Help me debug this error message.",
        category: "debugging",
        source: "contextual",
      },
      {
        id: "debug-logs",
        text: "Help me interpret these logs.",
        category: "debugging",
        source: "contextual",
      },
      {
        id: "debug-failing-test",
        text: "Help me fix a failing test.",
        category: "tests",
        source: "contextual",
      },
      {
        id: "debug-root-cause",
        text: "Help me find the root cause before changing code.",
        category: "debugging",
        source: "contextual",
      },
      seasonal,
      {
        id: "payments-sources",
        text: "Explain the bug and the fix in plain English.",
        category: "trust",
        source: "contextual",
      },
    ];
  }

  if (pathname.includes("/report") || pathname.includes("/311")) {
    return [
      {
        id: "review-bugs",
        text: "Review this code for bugs.",
        category: "review",
        source: "contextual",
      },
      {
        id: "review-security",
        text: "Look for security or data-handling risks.",
        category: "review",
        source: "contextual",
      },
      {
        id: "review-tests",
        text: "Tell me what test coverage is missing.",
        category: "tests",
        source: "contextual",
      },
      {
        id: "review-performance",
        text: "Look for performance problems in this code.",
        category: "review",
        source: "contextual",
      },
      seasonal,
      {
        id: "report-sources",
        text: "Summarize the highest-risk issues first.",
        category: "trust",
        source: "contextual",
      },
    ];
  }

  if (pathname.includes("/departments")) {
    return [
      {
        id: "code-explain",
        text: departmentContext
          ? `Explain how the ${departmentContext} code works.`
          : "Explain how this code works.",
        category: "explanation",
        source: "contextual",
      },
      {
        id: "code-flow",
        text: "Walk me through the data flow.",
        category: "explanation",
        source: "contextual",
      },
      {
        id: "code-refactor",
        text: "How would you refactor this module?",
        category: "refactor",
        source: "contextual",
      },
      {
        id: "code-api",
        text: "Explain this API contract and its edge cases.",
        category: "explanation",
        source: "contextual",
      },
      seasonal,
      {
        id: "dept-sources",
        text: "Show me the relevant code references.",
        category: "trust",
        source: "contextual",
      },
    ];
  }

  return [
    {
      id: "home-build",
      text: "Build a new feature in my app.",
      category: "implementation",
      source: "contextual",
    },
    {
      id: "home-debug",
      text: "Debug an error or failing test.",
      category: "debugging",
      source: "contextual",
    },
    {
      id: "home-review",
      text: "Review my code for bugs.",
      category: "review",
      source: "contextual",
    },
    {
      id: "home-tests",
      text: "Write tests for this code.",
      category: "tests",
      source: "contextual",
    },
    {
      id: "home-explain",
      text: "Explain a codebase or function.",
      category: "explanation",
      source: "contextual",
    },
    {
      id: "home-sources",
      text: "Refactor code without changing behavior.",
      category: "trust",
      source: "contextual",
    },
  ];
}

function resolveAdminStarterPrompts(
  adminConfig: StarterPromptAdminConfig | null,
  pathname: string,
  language: SupportedLanguage,
  departmentContext: string | null,
  crisisMode: boolean,
): StarterPromptSuggestion[] | null {
  if (!adminConfig) return null;

  let selectedPrompts: string[] = [];

  if (crisisMode && (adminConfig.crisisPrompts?.length || 0) > 0) {
    selectedPrompts = adminConfig.crisisPrompts || [];
  }

  if (
    selectedPrompts.length === 0 &&
    departmentContext &&
    adminConfig.promptsByDepartment
  ) {
    const departmentKey = departmentContext.toLowerCase();
    selectedPrompts =
      adminConfig.promptsByDepartment[departmentKey] ||
      adminConfig.promptsByDepartment[departmentKey.replace(/\s+/g, "-")] ||
      [];
  }

  if (selectedPrompts.length === 0 && adminConfig.promptsByPath) {
    const pathMatch = Object.keys(adminConfig.promptsByPath)
      .sort((a, b) => b.length - a.length)
      .find((pathKey) => pathname.includes(pathKey));
    if (pathMatch) {
      selectedPrompts = adminConfig.promptsByPath[pathMatch] || [];
    }
  }

  if (
    selectedPrompts.length === 0 &&
    adminConfig.promptsByLanguage &&
    adminConfig.promptsByLanguage[language]
  ) {
    selectedPrompts = adminConfig.promptsByLanguage[language] || [];
  }

  if (selectedPrompts.length === 0 && adminConfig.prompts) {
    selectedPrompts = adminConfig.prompts;
  }

  if (selectedPrompts.length === 0) return null;

  return selectedPrompts.map((text, index) => ({
    id: `admin-${index}`,
    text: normalizeStarterPromptText(text),
    category: inferStarterPromptCategoryFromText(text),
    source: "admin",
  }));
}

function buildStarterPromptSuggestions(params: {
  pathname: string;
  month: number;
  language: SupportedLanguage;
  isAuthenticated: boolean;
  experimentVariant: StarterPromptExperimentVariant;
  adminConfig: StarterPromptAdminConfig | null;
  crisisMode: boolean;
  departmentContext: string | null;
}): StarterPromptSuggestion[] {
  const {
    pathname,
    month,
    language,
    isAuthenticated,
    experimentVariant,
    adminConfig,
    crisisMode,
    departmentContext,
  } = params;

  const defaultPrompts = buildDefaultContextualStarterPrompts(
    pathname,
    month,
    departmentContext,
    crisisMode,
  );
  const promptSource =
    resolveAdminStarterPrompts(
      adminConfig,
      pathname,
      language,
      departmentContext,
      crisisMode,
    ) || defaultPrompts;

  const metrics = readStarterPromptMetrics();
  const categoryWeights = isAuthenticated
    ? readStarterPromptRecentCategoryWeights()
    : {};

  const deduped = Array.from(
    new Map(
      promptSource.map((prompt) => {
        const localizedText = localizeStarterPromptText(prompt.text, language);
        const normalizedText = normalizeStarterPromptText(localizedText);
        return [
          normalizedText.toLowerCase(),
          {
            ...prompt,
            text: normalizedText,
          } satisfies StarterPromptSuggestion,
        ];
      }),
    ).values(),
  );

  const scored = deduped.map((prompt, index) => {
    const metric = metrics[prompt.id];
    const selected = metric?.selected || 0;
    const submitted = metric?.submitted || 0;
    const conversionRate = selected > 0 ? submitted / selected : 0;
    const personalizedBoost = categoryWeights[prompt.category] || 0;
    const performanceScore =
      submitted * 3 + conversionRate * 4 + selected * 1.2;
    const score =
      experimentVariant === "B"
        ? performanceScore + personalizedBoost * 0.75
        : personalizedBoost * 1.15;
    return { prompt, index, score };
  });

  const ordered =
    experimentVariant === "B"
      ? scored.sort((a, b) => b.score - a.score || a.index - b.index)
      : scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const maxSuggestions = clampStarterPromptCount(adminConfig?.maxSuggestions);
  return ordered.slice(0, maxSuggestions).map(({ prompt }) => prompt);
}

function trackStarterPromptAnalytics(params: {
  eventType: "selected" | "submitted";
  promptId: string;
  promptText: string;
  promptCategory: StarterPromptCategory;
  language: SupportedLanguage;
  pathname: string;
  variant: StarterPromptExperimentVariant;
  submittedText?: string;
  editedBeforeSend?: boolean;
}): void {
  const metrics = readStarterPromptMetrics();
  const entry: StarterPromptMetricsEntry = metrics[params.promptId] || {
    selected: 0,
    submitted: 0,
    editedBeforeSend: 0,
    lastSelectedAt: 0,
    category: params.promptCategory,
  };

  if (params.eventType === "selected") {
    entry.selected += 1;
    entry.lastSelectedAt = Date.now();
  } else {
    entry.submitted += 1;
    if (params.editedBeforeSend) {
      entry.editedBeforeSend += 1;
    }
    storeStarterPromptRecentCategory(params.promptCategory);
  }

  entry.category = params.promptCategory;
  metrics[params.promptId] = entry;
  writeStarterPromptMetrics(metrics);

  window.dispatchEvent(
    new CustomEvent("primiq:starter-prompt", {
      detail: {
        eventType: params.eventType,
        promptId: params.promptId,
        promptText: params.promptText,
        promptCategory: params.promptCategory,
        submittedText: params.submittedText,
        editedBeforeSend: params.editedBeforeSend || false,
        language: params.language,
        pathname: params.pathname,
        variant: params.variant,
        timestamp: new Date().toISOString(),
      },
    }),
  );
}

const ChatbotWidget = forwardRef<ChatbotWidgetHandle, ChatbotWidgetProps>(
  function ChatbotWidget(
    {
      contextPrefix,
      initialGreetingOverride,
      disableConfigFetch = false,
      disableNudges = false,
      variant = "default",
      hideMetaControls = false,
    }: ChatbotWidgetProps = {},
    ref,
  ) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [composerError, setComposerError] = useState<string | null>(null);
    const [refreshStarterNonce, setRefreshStarterNonce] = useState(0);
    const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [configReady, setConfigReady] = useState(false);
    const [initialGreeting, setInitialGreeting] = useState(
      "Hi! I'm an AI assistant for Exodus, powered by primIQ. How can I help today?",
    );
    const [theme, setTheme] = useState<ChatTheme>("dark");
    const [isLarge, setIsLarge] = useState(false);
    const [srStatus, setSrStatus] = useState("");
    const [nudges, setNudges] = useState<ProactiveNudge[]>([]);
    const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(
      null,
    );
    const [showJumpToBottom, setShowJumpToBottom] = useState(false);
    const [starterPrompts, setStarterPrompts] = useState<
      StarterPromptSuggestion[]
    >([]);
    const [starterDismissed, setStarterDismissed] = useState(false);
    const [starterPromptAdminConfig, setStarterPromptAdminConfig] =
      useState<StarterPromptAdminConfig | null>(null);
    const [pendingStarterPromptSelection, setPendingStarterPromptSelection] =
      useState<StarterPromptSelection | null>(null);
    const [starterPromptVariant] = useState<StarterPromptExperimentVariant>(
      () => getOrCreateStarterPromptVariant(),
    );
    const [sizePreset, setSizePreset] = useState<ChatSizePreset>(() => {
      const saved = localStorage.getItem("pv_chat_size_preset");
      if (saved === "small" || saved === "medium" || saved === "large") {
        return saved;
      }
      return "medium";
    });
    const widgetRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historyDrawerRef = useRef<HTMLDivElement>(null);
    const historyToggleButtonRef = useRef<HTMLButtonElement>(null);
    const historySearchInputRef = useRef<HTMLInputElement>(null);
    const historySettingsMenuRef = useRef<HTMLDivElement>(null);
    const sidebarDividerRef = useRef<HTMLButtonElement>(null);
    const historyItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const conversationSwitchTimeoutRef = useRef<number | null>(null);
    const activeRequestControllerRef = useRef<AbortController | null>(null);
    const isAtBottomRef = useRef(true);

    const [language, setLanguage] = useState<SupportedLanguage>(() => {
      const saved = localStorage.getItem("preferredLanguage");
      return normalizeLanguage(saved);
    });
    const [viewportMode, setViewportMode] = useState<ViewportMode>(() =>
      getViewportMode(window.innerWidth),
    );
    const [conversationHistory, setConversationHistory] = useState<
      ConversationRecord[]
    >([]);
    const [activeConversationId, setActiveConversationId] = useState<
      string | null
    >(null);
    const [isSidebarOverlayOpen, setIsSidebarOverlayOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(
      SIDEBAR_DEFAULT_WIDTH_DESKTOP,
    );
    const [historySearch, setHistorySearch] = useState("");
    const [editingConversationId, setEditingConversationId] = useState<
      string | null
    >(null);
    const [editingConversationTitle, setEditingConversationTitle] =
      useState("");
    const [historyOverflowConversationId, setHistoryOverflowConversationId] =
      useState<string | null>(null);
    const [isHistorySettingsOpen, setIsHistorySettingsOpen] = useState(false);
    const [isConversationSwitching, setIsConversationSwitching] =
      useState(false);
    const [isPrivateModeEnabled, setIsPrivateModeEnabled] = useState(false);

    const [chatId, setChatId] = useState<string>(() => {
      return getOrCreateGuestChatId();
    });
    const idToken = getValidCognitoIdToken();
    const isAuthenticated = Boolean(idToken);
    const authIdentityKey = isAuthenticated
      ? getAuthIdentityKey(idToken)
      : null;
    const historyIdentityKey = authIdentityKey || "guest";
    const historyIndexStorageKey = `${CHAT_HISTORY_STORAGE_PREFIX}_${historyIdentityKey}`;
    const activeConversationStorageKey = `${CHAT_ACTIVE_CONVERSATION_STORAGE_PREFIX}_${historyIdentityKey}`;
    const historyStorageKey = getConversationMessageStorageKey(
      chatId,
      historyIdentityKey,
    );
    const sidebarPrefsStorageKey =
      getSidebarPreferenceStorageKey(historyIdentityKey);
    const isDesktopViewport = viewportMode === "desktop";
    const isTabletViewport = viewportMode === "tablet";
    const isMobileViewport = viewportMode === "mobile";
    const showHistorySidebar = isDesktopViewport;
    const showHistoryOverlay = !isDesktopViewport;
    const showHistoryDrawerToggle = !isDesktopViewport;
    const isTemporaryConversation = chatId.startsWith("temp_");
    const effectiveSidebarWidth = isSidebarCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : clamp(
          sidebarWidth,
          SIDEBAR_MIN_WIDTH_DESKTOP,
          SIDEBAR_MAX_WIDTH_DESKTOP,
        );
    const dismissedNudgesStorageKey = "pv_chat_dismissed_nudges";
    const sizePresets: Record<
      ChatSizePreset,
      { width: number; height: number }
    > = {
      small: { width: 420, height: 520 },
      medium: { width: 480, height: 620 },
      large: { width: 620, height: 760 },
    };

    const refreshStarterPrompts = () => {
      const pathname = window.location.pathname.toLowerCase();
      const departmentContext = getDepartmentContext(pathname);
      const generated = buildStarterPromptSuggestions({
        pathname,
        month: new Date().getMonth(),
        language,
        isAuthenticated,
        experimentVariant: starterPromptVariant,
        adminConfig: null,
        crisisMode: detectCrisisMode(pathname),
        departmentContext,
      });

      const merged = Array.from(
        new Map(
          [...generated, ...DOMAIN_BALANCED_STARTER_PROMPTS].map((prompt) => [
            normalizeStarterPromptText(prompt.text).toLowerCase(),
            prompt,
          ]),
        ).values(),
      );

      const offsetBase = refreshStarterNonce % Math.max(merged.length, 1);
      const rotated = merged
        .slice(offsetBase)
        .concat(merged.slice(0, offsetBase));

      setStarterPrompts(rotated);
    };

    useEffect(() => {
      const handleResize = () => {
        setViewportMode(getViewportMode(window.innerWidth));
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      try {
        const saved = localStorage.getItem(sidebarPrefsStorageKey);
        if (!saved) {
          setIsSidebarCollapsed(false);
          setSidebarWidth(SIDEBAR_DEFAULT_WIDTH_DESKTOP);
          return;
        }
        const parsed = JSON.parse(saved) as {
          collapsed?: boolean;
          width?: number;
        };
        setIsSidebarCollapsed(Boolean(parsed?.collapsed));
        if (typeof parsed?.width === "number") {
          setSidebarWidth(
            clamp(
              parsed.width,
              SIDEBAR_MIN_WIDTH_DESKTOP,
              SIDEBAR_MAX_WIDTH_DESKTOP,
            ),
          );
        } else {
          setSidebarWidth(SIDEBAR_DEFAULT_WIDTH_DESKTOP);
        }
      } catch {
        setIsSidebarCollapsed(false);
        setSidebarWidth(SIDEBAR_DEFAULT_WIDTH_DESKTOP);
      }
    }, [sidebarPrefsStorageKey]);

    useEffect(() => {
      try {
        localStorage.setItem(
          sidebarPrefsStorageKey,
          JSON.stringify({
            collapsed: isSidebarCollapsed,
            width: sidebarWidth,
          }),
        );
      } catch {
        // ignore local storage write errors
      }
    }, [isSidebarCollapsed, sidebarPrefsStorageKey, sidebarWidth]);

    useEffect(() => {
      if (isDesktopViewport) {
        setIsSidebarOverlayOpen(false);
      } else if (isTabletViewport) {
        setIsSidebarOverlayOpen(true);
      } else {
        setIsSidebarOverlayOpen(false);
      }
    }, [isDesktopViewport, isTabletViewport]);

    useEffect(() => {
      let nextHistory: ConversationRecord[] = [];
      try {
        nextHistory = toConversationRecordList(
          JSON.parse(localStorage.getItem(historyIndexStorageKey) || "[]"),
        );
      } catch {
        nextHistory = [];
      }

      let nextConversationId: string | null = null;
      try {
        const savedId = localStorage.getItem(activeConversationStorageKey);
        if (
          savedId &&
          nextHistory.some((conversation) => conversation.id === savedId)
        ) {
          nextConversationId = savedId;
        }
      } catch {
        nextConversationId = null;
      }

      if (!nextConversationId && nextHistory.length > 0) {
        nextConversationId = nextHistory[0].id;
      }

      if (!nextConversationId) {
        nextConversationId = `chat_${uuidv4().slice(0, 8)}`;
        nextHistory = [buildConversationRecord(nextConversationId, language)];
      }

      setConversationHistory(nextHistory);
      setActiveConversationId(nextConversationId);
      setChatId(nextConversationId);
      setIsSidebarOverlayOpen(isTabletViewport);
    }, [
      activeConversationStorageKey,
      historyIndexStorageKey,
      isTabletViewport,
      language,
    ]);

    useEffect(() => {
      try {
        localStorage.setItem(
          historyIndexStorageKey,
          JSON.stringify(conversationHistory.slice(0, 100)),
        );
      } catch {
        // ignore local storage write errors
      }
    }, [conversationHistory, historyIndexStorageKey]);

    useEffect(() => {
      try {
        if (activeConversationId) {
          localStorage.setItem(
            activeConversationStorageKey,
            activeConversationId,
          );
        } else {
          localStorage.removeItem(activeConversationStorageKey);
        }
      } catch {
        // ignore local storage write errors
      }
    }, [activeConversationId, activeConversationStorageKey]);

    useEffect(() => {
      if (!chatId) return;
      if (!historyStorageKey) {
        setMessages([]);
        return;
      }
      try {
        const saved = localStorage.getItem(historyStorageKey);
        const legacySaved =
          !authIdentityKey && !saved
            ? localStorage.getItem(`pv_chat_messages_${chatId}`)
            : null;
        const payload = saved || legacySaved;
        if (!payload) {
          setMessages([]);
          return;
        }
        const parsed = JSON.parse(payload);
        if (Array.isArray(parsed)) {
          setMessages(
            parsed.filter((item) => item && typeof item.text === "string"),
          );
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    }, [authIdentityKey, chatId, historyStorageKey]);

    useEffect(() => {
      if (
        isTemporaryConversation ||
        messages.length === 0
      ) {
        return;
      }
      const firstUserMessage = messages.find((item) => item.sender === "user");
      if (!firstUserMessage?.text) return;
      touchConversationRecord(chatId, language, {
        previewText: firstUserMessage.text,
        previewIfEmptyOnly: true,
      });
      // Only backfill when message content changes for the active chat.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId, isTemporaryConversation, messages]);

    useEffect(() => {
      if (!isConversationSwitching) return;
      const timeoutId = window.setTimeout(() => {
        setIsConversationSwitching(false);
      }, 180);
      return () => window.clearTimeout(timeoutId);
    }, [chatId, isConversationSwitching, messages.length]);

    useEffect(() => {
      return () => {
        if (conversationSwitchTimeoutRef.current != null) {
          window.clearTimeout(conversationSwitchTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const savedTheme = localStorage.getItem("chatTheme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    }, []);

    useEffect(() => {
      setStarterPromptAdminConfig(readStarterPromptRuntimeConfig());
    }, []);

    useEffect(() => {
      localStorage.setItem("preferredLanguage", normalizeLanguage(language));
    }, [language]);

    const createConversationId = (temporary = false) =>
      `${temporary ? "temp" : isAuthenticated ? "chat" : "guest"}_${uuidv4().slice(0, 8)}`;

    const persistConversationRecord = (
      conversationId: string,
      conversationLanguage: SupportedLanguage,
    ) => {
      const record = buildConversationRecord(
        conversationId,
        conversationLanguage,
      );
      setConversationHistory((prev) =>
        sortConversationRecords([
          record,
          ...prev.filter((item) => item.id !== conversationId),
        ]),
      );
      setActiveConversationId(conversationId);
      trackConversationHistoryEvent({
        eventType: "create",
        chatId: conversationId,
        title: record.title,
        language: conversationLanguage,
      });
    };

    const touchConversationRecord = (
      conversationId: string,
      conversationLanguage: SupportedLanguage = language,
      options?: {
        previewText?: string;
        previewIfEmptyOnly?: boolean;
      },
    ) => {
      const previewText = options?.previewText
        ? createConversationPreview(options.previewText)
        : "";
      setConversationHistory((prev) =>
        sortConversationRecords(
          prev.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  updatedAt: Date.now(),
                  language: conversationLanguage,
                  preview:
                    previewText &&
                    (!options?.previewIfEmptyOnly || !item.preview)
                      ? previewText
                      : item.preview,
                }
              : item,
          ),
        ),
      );
    };

    const applyConversationTitleFromMessage = (
      conversationId: string,
      text: string,
    ) => {
      const nextTitle = createConversationTitle(text);
      setConversationHistory((prev) =>
        sortConversationRecords(
          prev.map((item) => {
            if (item.id !== conversationId) return item;
            return {
              ...item,
              title:
                item.title === DEFAULT_CONVERSATION_TITLE
                  ? nextTitle
                  : item.title,
              preview: item.preview || createConversationPreview(text),
              updatedAt: Date.now(),
              language,
            };
          }),
        ),
      );
    };

    const startRenameConversation = (conversationId: string) => {
      const target = conversationHistory.find(
        (conversation) => conversation.id === conversationId,
      );
      if (!target) return;
      setEditingConversationId(conversationId);
      setEditingConversationTitle(target.title);
      setHistoryOverflowConversationId(null);
    };

    const cancelRenameConversation = () => {
      setEditingConversationId(null);
      setEditingConversationTitle("");
    };

    const submitRenameConversation = (conversationId: string) => {
      const target = conversationHistory.find(
        (conversation) => conversation.id === conversationId,
      );
      if (!target) return;
      const nextTitle = createConversationTitle(editingConversationTitle);
      if (!nextTitle) {
        cancelRenameConversation();
        return;
      }
      setConversationHistory((prev) =>
        sortConversationRecords(
          prev.map((item) =>
            item.id === conversationId ? { ...item, title: nextTitle } : item,
          ),
        ),
      );
      trackConversationHistoryEvent({
        eventType: "rename",
        chatId: conversationId,
        title: nextTitle,
        language: target.language,
      });
      setSrStatus(`Conversation renamed to ${nextTitle}`);
      cancelRenameConversation();
    };

    const toggleConversationPin = (conversationId: string) => {
      setConversationHistory((prev) =>
        sortConversationRecords(
          prev.map((item) =>
            item.id === conversationId
              ? { ...item, pinned: !item.pinned }
              : item,
          ),
        ),
      );
      setHistoryOverflowConversationId(null);
    };

    const toggleHistoryPanel = () => {
      if (isDesktopViewport) {
        setIsSidebarCollapsed((prev) => !prev);
        return;
      }
      setIsSidebarOverlayOpen((prev) => !prev);
    };

    const openConversation = (conversationId: string) => {
      const target = conversationHistory.find(
        (conversation) => conversation.id === conversationId,
      );
      if (!target) return;

      if (conversationSwitchTimeoutRef.current != null) {
        window.clearTimeout(conversationSwitchTimeoutRef.current);
      }
      setIsConversationSwitching(true);
      setMessages([]);
      setMessage("");
      setChatId(conversationId);
      setActiveConversationId(conversationId);
      setLanguage(target.language);
      setActiveMessageMenu(null);
      setHistoryOverflowConversationId(null);
      setEditingConversationId(null);
      setShowJumpToBottom(false);
      if (isMobileViewport) {
        setIsSidebarOverlayOpen(false);
      }
      isAtBottomRef.current = true;
      touchConversationRecord(conversationId, target.language);
      conversationSwitchTimeoutRef.current = window.setTimeout(() => {
        setIsConversationSwitching(false);
      }, 260);
      trackConversationHistoryEvent({
        eventType: "resume",
        chatId: conversationId,
        title: target.title,
        language: target.language,
      });
      setSrStatus(`Opened conversation: ${target.title}`);
      inputRef.current?.focus();
    };

    const exportConversationRecord = (conversationId: string) => {
      const target = conversationHistory.find(
        (conversation) => conversation.id === conversationId,
      );
      if (!target) return;
      const shouldExport = window.confirm(
        `Export "${target.title}" as JSON? This file may include personal information.`,
      );
      if (!shouldExport) return;
      const messageStorageKey = getConversationMessageStorageKey(
        conversationId,
        historyIdentityKey,
      );
      const rawMessages = messageStorageKey
        ? localStorage.getItem(messageStorageKey)
        : null;
      const messagesPayload = rawMessages ? JSON.parse(rawMessages) : [];
      const blob = new Blob(
        [
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              retentionNotice:
                "Exported chat may contain sensitive data. Store and share according to your organization policy.",
              conversation: target,
              messages: Array.isArray(messagesPayload) ? messagesPayload : [],
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = target.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.href = url;
      a.download = `${safeTitle || "conversation"}-${conversationId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setHistoryOverflowConversationId(null);
      setSrStatus(`Exported conversation: ${target.title}`);
    };

    const deleteConversationRecord = (conversationId: string) => {
      const target = conversationHistory.find(
        (conversation) => conversation.id === conversationId,
      );
      if (!target) return;
      const shouldDelete = window.confirm(
        `Delete "${target.title}"? This removes the conversation from this browser's history.`,
      );
      if (!shouldDelete) return;

      const messageStorageKey = getConversationMessageStorageKey(
        conversationId,
        historyIdentityKey,
      );
      if (messageStorageKey) {
        localStorage.removeItem(messageStorageKey);
      }

      const nextHistory = conversationHistory.filter(
        (conversation) => conversation.id !== conversationId,
      );
      setConversationHistory(nextHistory);

      if (chatId === conversationId) {
        if (nextHistory.length > 0) {
          const nextConversation = nextHistory[0];
          setIsConversationSwitching(true);
          setMessages([]);
          setChatId(nextConversation.id);
          setActiveConversationId(nextConversation.id);
          setLanguage(nextConversation.language);
        } else {
          const nextChatId = createConversationId(isPrivateModeEnabled);
          if (!isPrivateModeEnabled) {
            persistConversationRecord(nextChatId, language);
          } else {
            setActiveConversationId(null);
          }
          setMessages([]);
          setChatId(nextChatId);
        }
      }

      trackConversationHistoryEvent({
        eventType: "delete",
        chatId: conversationId,
        title: target.title,
        language: target.language,
      });
      setSrStatus(`Deleted conversation: ${target.title}`);
      setHistoryOverflowConversationId(null);
    };

    const clearAllConversationRecords = () => {
      if (conversationHistory.length === 0) return;
      const shouldClear = window.confirm(
        "Clear all saved conversations? This removes all chat history from your account.",
      );
      if (!shouldClear) return;

      for (const conversation of conversationHistory) {
        const storageKey = getConversationMessageStorageKey(
          conversation.id,
          historyIdentityKey,
        );
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
      }

      setConversationHistory([]);
      const nextChatId = createConversationId(isPrivateModeEnabled);
      if (!isPrivateModeEnabled) {
        persistConversationRecord(nextChatId, language);
      } else {
        setActiveConversationId(null);
      }
      setMessages([]);
      setChatId(nextChatId);
      setIsSidebarOverlayOpen(false);
      setHistoryOverflowConversationId(null);
      trackConversationHistoryEvent({
        eventType: "clear_all",
        chatId: nextChatId,
        title: DEFAULT_CONVERSATION_TITLE,
        language,
      });
      setSrStatus("Cleared all saved conversations");
      inputRef.current?.focus();
    };

    const handleLanguageChange = (nextLanguage: SupportedLanguage) => {
      const normalized = normalizeLanguage(nextLanguage);
      if (normalized === language) return;

      const temporaryConversation = isPrivateModeEnabled;
      const newChatId = createConversationId(temporaryConversation);
      if (!temporaryConversation) {
        persistConversationRecord(newChatId, normalized);
      } else {
        setActiveConversationId(null);
      }

      setConfigReady(false);
      setNudges([]);
      setMessages([]);
      setMessage("");
      setStarterDismissed(false);
      setPendingStarterPromptSelection(null);
      setIsSidebarOverlayOpen(false);
      setChatId(newChatId);
      setLanguage(normalized);
      setSrStatus(
        `Response language set to ${normalized}. Started a new conversation.`,
      );
      inputRef.current?.focus();
    };

    const cycleLanguage = () => {
      const currentIndex = SUPPORTED_LANGUAGES.indexOf(language);
      const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
      handleLanguageChange(SUPPORTED_LANGUAGES[nextIndex]);
    };

    const toggleTheme = () => {
      setTheme((prev) => {
        const next = prev === "dark" ? "light" : "dark";
        setSrStatus(
          next === "light"
            ? "Switched to light theme"
            : "Switched to dark theme",
        );
        return next;
      });
    };

    useEffect(() => {
      localStorage.setItem("chatTheme", theme);
    }, [theme]);

    useEffect(() => {
      if (!historyStorageKey) return;
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(messages));
      } catch {
        // ignore local storage write errors
      }
    }, [historyStorageKey, messages]);

    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (disableConfigFetch) {
        setConfigReady(true);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        setConfigReady(true);
      }, 1200);

      const loadWidgetConfig = async () => {
        try {
          const currentUrl = window.location.href;
          const idToken = getValidCognitoIdToken();
          const authHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (idToken) {
            authHeaders.Authorization = `Bearer ${idToken}`;
          }
          const res = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              action: "config",
              url: currentUrl,
              chatId: chatId,
              language: language,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (
              !initialGreetingOverride &&
              data?.greeting &&
              typeof data.greeting === "string"
            ) {
              setInitialGreeting(data.greeting);
            }
            const serverPromptConfig = parseStarterPromptAdminConfig(
              data?.starter_prompts,
            );
            if (serverPromptConfig) {
              setStarterPromptAdminConfig((current) =>
                mergeStarterPromptAdminConfigs(current, serverPromptConfig),
              );
            }
            if (!disableNudges && Array.isArray(data?.nudges)) {
              const dismissedSet = new Set<string>(
                JSON.parse(
                  localStorage.getItem(dismissedNudgesStorageKey) || "[]",
                ),
              );
              setNudges(normalizeExodusNudges(data.nudges, dismissedSet));
            }
          }
        } catch {
          // Fall back to default greeting.
        } finally {
          setConfigReady(true);
        }
      };

      loadWidgetConfig();

      return () => {
        window.clearTimeout(timeoutId);
      };
    }, [
      chatId,
      disableConfigFetch,
      disableNudges,
      initialGreetingOverride,
      language,
    ]);

    useEffect(() => {
      if (initialGreetingOverride) {
        setInitialGreeting(initialGreetingOverride);
      }
    }, [initialGreetingOverride]);

    useEffect(() => {
      if (configReady && messages.length === 0) {
        setMessages([
          {
            text: initialGreeting,
            sender: "bot",
          },
        ]);
      }
    }, [configReady, initialGreeting, messages.length]);

    useEffect(() => {
      if (configReady) {
        inputRef.current?.focus();
      }
    }, [configReady]);

    useEffect(() => {
      if (!configReady) return;
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft && !message.trim()) {
          setMessage(savedDraft.slice(0, MAX_COMPOSER_CHARS));
        }
      } catch {
        // ignore storage errors
      }
      // load once when widget is ready
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configReady]);

    useEffect(() => {
      try {
        if (!message.trim()) {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } else {
          localStorage.setItem(DRAFT_STORAGE_KEY, message.slice(0, MAX_COMPOSER_CHARS));
        }
      } catch {
        // ignore storage errors
      }
    }, [message]);

    useEffect(() => {
      refreshStarterPrompts();
      // intentionally scoped to prompt-relevant state only
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      language,
      chatId,
      starterPromptAdminConfig,
      starterPromptVariant,
      isAuthenticated,
      refreshStarterNonce,
    ]);

    useEffect(() => {
      const messagesHost = messagesRef.current;
      if (!messagesHost) return;

      const handleScroll = () => {
        const distanceFromBottom =
          messagesHost.scrollHeight -
          messagesHost.scrollTop -
          messagesHost.clientHeight;
        const atBottom = distanceFromBottom <= 80;
        isAtBottomRef.current = atBottom;
        setShowJumpToBottom(!atBottom);
      };

      handleScroll();
      messagesHost.addEventListener("scroll", handleScroll);
      return () => messagesHost.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
      const messagesHost = messagesRef.current;
      if (!messagesHost) return;

      if (isAtBottomRef.current) {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      } else {
        setShowJumpToBottom(true);
      }
    }, [messages]);

    useEffect(() => {
      if (!widgetRef.current || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        setIsLarge(width >= 560 || height >= 760);
      });

      observer.observe(widgetRef.current);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const host = widgetRef.current?.closest(
        ".chat-resizable",
      ) as HTMLElement | null;
      if (!host) return;

      // Ensure absolute handle positioning works.
      const computed = window.getComputedStyle(host);
      if (computed.position === "static") {
        host.style.position = "relative";
      }

      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "pv-chat-resize-handle";
      handle.setAttribute("aria-label", "Resize chat window");
      handle.title = "Resize chat window";
      host.appendChild(handle);

      let active = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      const onPointerMove = (event: PointerEvent) => {
        if (!active) return;
        const nextWidth = startWidth + (event.clientX - startX);
        const nextHeight = startHeight + (event.clientY - startY);

        const minWidth = 320;
        const minHeight = 380;
        const maxWidth = Math.min(window.innerWidth - 24, 900);
        const maxHeight = Math.min(window.innerHeight - 24, 900);

        host.style.width = `${clamp(nextWidth, minWidth, maxWidth)}px`;
        host.style.height = `${clamp(nextHeight, minHeight, maxHeight)}px`;
      };

      const stopResize = () => {
        if (!active) return;
        active = false;
        document.body.style.userSelect = "";
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
      };

      const onPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        active = true;
        startX = event.clientX;
        startY = event.clientY;
        const rect = host.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", stopResize);
        window.addEventListener("pointercancel", stopResize);
      };

      handle.addEventListener("pointerdown", onPointerDown);

      return () => {
        stopResize();
        handle.removeEventListener("pointerdown", onPointerDown);
        handle.remove();
      };
    }, []);

    const applySizePreset = (preset: ChatSizePreset) => {
      const host = widgetRef.current?.closest(
        ".chat-resizable",
      ) as HTMLElement | null;
      if (!host) return;

      const config = sizePresets[preset];
      const maxWidth = Math.min(window.innerWidth - 24, 900);
      const maxHeight = Math.min(window.innerHeight - 24, 900);
      const width = Math.min(config.width, maxWidth);
      const height = Math.min(config.height, maxHeight);

      host.style.width = `${width}px`;
      host.style.height = `${height}px`;
      setSizePreset(preset);
      localStorage.setItem("pv_chat_size_preset", preset);
      setSrStatus(`Chat window set to ${preset} size`);
    };

    const scrollMessagesToBottom = (behavior: ScrollBehavior = "smooth") => {
      const messagesHost = messagesRef.current;
      if (!messagesHost) return;
      messagesHost.scrollTo({ top: messagesHost.scrollHeight, behavior });
      isAtBottomRef.current = true;
      setShowJumpToBottom(false);
    };

    const toggleMessageMenu = (messageIndex: number) => {
      setActiveMessageMenu((prev) =>
        prev === messageIndex ? null : messageIndex,
      );
    };

    const closeMessageMenu = () => {
      setActiveMessageMenu(null);
    };

    useEffect(() => {
      const timeout = window.setTimeout(() => applySizePreset(sizePreset), 0);
      return () => window.clearTimeout(timeout);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (activeMessageMenu === null) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (!target.closest(".pv-chat-message-menu")) {
          closeMessageMenu();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closeMessageMenu();
        }
      };

      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("keydown", handleEscape);
      return () => {
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("keydown", handleEscape);
      };
    }, [activeMessageMenu]);

    useEffect(() => {
      if (showHistorySidebar) {
        setIsSidebarOverlayOpen(false);
      }
    }, [showHistorySidebar]);

    useEffect(() => {
      if (!isSidebarOverlayOpen) return;
      const drawer = historyDrawerRef.current;
      if (!drawer) return;

      const getFocusable = () =>
        Array.from(
          drawer.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => !element.hasAttribute("disabled"));

      const focusable = getFocusable();
      focusable[0]?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsSidebarOverlayOpen(false);
          historyToggleButtonRef.current?.focus();
          return;
        }
        if (event.key !== "Tab") return;

        const items = getFocusable();
        if (items.length === 0) {
          event.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSidebarOverlayOpen]);

    useEffect(() => {
      if (!isDesktopViewport) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        const isShortcut =
          (event.metaKey || event.ctrlKey) &&
          !event.shiftKey &&
          !event.altKey &&
          event.key.toLowerCase() === "b";
        if (!isShortcut) return;
        const target = event.target;
        if (target instanceof HTMLElement) {
          const tag = target.tagName;
          if (
            target.isContentEditable ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
          ) {
            return;
          }
        }
        event.preventDefault();
        toggleHistoryPanel();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isDesktopViewport, toggleHistoryPanel]);

    useEffect(() => {
      if (
        historyOverflowConversationId === null &&
        !isHistorySettingsOpen &&
        editingConversationId === null
      ) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (
          target.closest(".pv-chat-history-overflow") ||
          target.closest(".pv-chat-history-settings") ||
          target.closest(".pv-chat-history-rename-form")
        ) {
          return;
        }
        setHistoryOverflowConversationId(null);
        setIsHistorySettingsOpen(false);
      };

      window.addEventListener("pointerdown", handlePointerDown);
      return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, [
      editingConversationId,
      historyOverflowConversationId,
      isHistorySettingsOpen,
    ]);

    const handleStarterPromptSelect = (prompt: StarterPromptSuggestion) => {
      if (isSending) return;
      setMessage(prompt.text);
      setStarterDismissed(true);
      setPendingStarterPromptSelection({
        promptId: prompt.id,
        promptText: prompt.text,
        category: prompt.category,
        selectedAt: Date.now(),
        variant: starterPromptVariant,
      });
      trackStarterPromptAnalytics({
        eventType: "selected",
        promptId: prompt.id,
        promptText: prompt.text,
        promptCategory: prompt.category,
        language,
        pathname: window.location.pathname,
        variant: starterPromptVariant,
      });
      setSrStatus("Suggested question inserted. Edit it or press send.");
      inputRef.current?.focus();
    };

    const sendRateLimitEvent = async (reason: string) => {
      const idToken = getValidCognitoIdToken();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) authHeaders.Authorization = `Bearer ${idToken}`;

      try {
        await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            action: "rate_limit",
            chatId,
            url: window.location.href,
            reason,
          }),
        });
      } catch {
        // ignore analytics errors
      }
    };

    const trackUiMetric = async (
      metric: "widget_open" | "send_success" | "send_error" | "escalation_click",
      details: Record<string, unknown> = {},
    ) => {
      const idToken = getValidCognitoIdToken();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) authHeaders.Authorization = `Bearer ${idToken}`;

      try {
        await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            action: "ui_metric",
            metric,
            chatId,
            url: window.location.href,
            ...details,
          }),
        });
      } catch {
        // ignore analytics errors
      }
    };

    const trackCitationClick = async (citation: Citation) => {
      const idToken = getValidCognitoIdToken();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) authHeaders.Authorization = `Bearer ${idToken}`;

      try {
        await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            action: "citation_click",
            chatId,
            url: window.location.href,
            citationTitle: citation.title || "",
            citationUrl: citation.url || "",
          }),
        });
      } catch {
        // ignore analytics errors
      }
    };

    const sendQuestion = async (rawText: string) => {
      if (!rawText.trim() || isSending) return;
      const cleanText = rawText.trim();
      if (cleanText.length > MAX_COMPOSER_CHARS) {
        setComposerError(
          `Please shorten your message to ${MAX_COMPOSER_CHARS} characters or fewer.`,
        );
        setSrStatus("Message exceeds maximum length");
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setMessages((prev) => [
          ...prev,
          {
            text: "You appear to be offline. Reconnect to the internet and retry your message.",
            sender: "bot",
            failureKind: "offline",
            retryQuestion: cleanText,
          },
        ]);
        setMessage(cleanText);
        setSrStatus("Offline. Message was not sent");
        void trackUiMetric("send_error", { reason: "offline" });
        return;
      }

      setComposerError(null);
      setIsSending(true);
      setSrStatus("Sending message");
      closeMessageMenu();
      setStarterDismissed(true);
      setPendingStarterPromptSelection(null);
      setLastSubmittedQuestion(cleanText);

      const outboundQuestion = contextPrefix
        ? `${contextPrefix}

User question:
${cleanText}`
        : cleanText;
      const userMsg = { text: cleanText, sender: "user" as const };
      setMessages((prev) => [...prev, userMsg]);
      setMessage((current) => (current.trim() === cleanText ? "" : current));
      if (!isTemporaryConversation) {
        if (
          !conversationHistory.some(
            (conversation) => conversation.id === chatId,
          )
        ) {
          persistConversationRecord(chatId, language);
        }
        applyConversationTitleFromMessage(chatId, cleanText);
        touchConversationRecord(chatId, language, {
          previewText: cleanText,
          previewIfEmptyOnly: true,
        });
      }

      const currentUrl = window.location.href;
      const idToken = getValidCognitoIdToken();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) {
        authHeaders.Authorization = `Bearer ${idToken}`;
      }

      const REQUEST_TIMEOUT_MS = 25000;

      try {
        activeRequestControllerRef.current?.abort();
        const controller = new AbortController();
        activeRequestControllerRef.current = controller;
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const res = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: authHeaders,
          signal: controller.signal,
          body: JSON.stringify({
            question: outboundQuestion,
            url: currentUrl,
            chatId: chatId,
            language: language,
          }),
        });
        window.clearTimeout(timeoutId);

        if (res.status === 429) {
          const errorText = await res.text();
          void sendRateLimitEvent(errorText || "http_429");
          throw new Error(errorText || "Rate limited");
        }

        if (res.status >= 500) {
          throw new Error("api_unavailable");
        }

        if (!res.ok) throw new Error(await res.text());

        const payload = await res.json();
        const {
          answer,
          citations,
          confidence,
          handoff,
          formPrefill,
          lastVerified,
          last_verified,
          verifiedAt,
          verified_at,
          sources_status,
          sourcesStatus,
          source_warning,
          sourceWarning,
        } = payload;
        const normalizedLastVerified =
          normalizeLastVerified(lastVerified) ||
          normalizeLastVerified(last_verified) ||
          normalizeLastVerified(verifiedAt) ||
          normalizeLastVerified(verified_at);
        const normalizedSourceStatus =
          typeof sources_status === "string"
            ? sources_status
            : typeof sourcesStatus === "string"
              ? sourcesStatus
              : null;
        const normalizedSourceWarning =
          typeof source_warning === "string"
            ? source_warning
            : typeof sourceWarning === "string"
              ? sourceWarning
              : null;
        const sourceWarningMessage =
          normalizedSourceStatus === "degraded" || normalizedSourceStatus === "failed"
            ? normalizedSourceWarning ||
              "Some source links are temporarily unavailable. Please verify critical details in the codebase."
            : undefined;

        setMessages((prev) => [
          ...prev,
          {
            text: answer || "No reply",
            sender: "bot",
            citations: Array.isArray(citations) ? citations : [],
            confidence:
              confidence && typeof confidence.score === "number"
                ? confidence
                : undefined,
            handoff: handoff && handoff.required ? handoff : undefined,
            formPrefill:
              formPrefill && typeof formPrefill === "object"
                ? formPrefill
                : undefined,
            lastVerified: normalizedLastVerified,
            sourceWarning: sourceWarningMessage,
            retryQuestion: cleanText,
          },
        ]);
        if (formPrefill && typeof formPrefill === "object") {
          window.dispatchEvent(
            new CustomEvent("primiq:form-prefill", { detail: formPrefill }),
          );
          setSrStatus("Assistant response received and form fields prefilled");
        } else {
          setSrStatus("Assistant response received");
        }
        void trackUiMetric("send_success", {
          hasCitations: Array.isArray(citations) && citations.length > 0,
          sourceStatus: normalizedSourceStatus || "ok",
        });
      } catch (error) {
        const aborted =
          error instanceof DOMException && error.name === "AbortError";
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        const messageText = error instanceof Error ? error.message : "";
        const timedOut = aborted && activeRequestControllerRef.current !== null;
        const apiUnavailable = messageText.includes("api_unavailable");

        const failureKind: FailureKind = offline
          ? "offline"
          : timedOut
            ? "timeout"
            : apiUnavailable
              ? "api_unavailable"
              : "unknown";

        const fallbackText =
          failureKind === "offline"
            ? "You're offline right now. Reconnect and retry."
            : failureKind === "timeout"
              ? "The request timed out before a response was returned."
              : failureKind === "api_unavailable"
                ? "The assistant service is temporarily unavailable."
                : "Sorry, something went wrong while generating a response.";

        setMessages((prev) => [
          ...prev,
          {
            text: fallbackText,
            sender: "bot",
            failureKind,
            retryQuestion: cleanText,
          },
        ]);
        setMessage(cleanText);
        setSrStatus("Message failed to send");
        void trackUiMetric("send_error", { reason: failureKind });
      } finally {
        activeRequestControllerRef.current = null;
        setIsSending(false);
      }
    };

    const handleStopGenerating = () => {
      activeRequestControllerRef.current?.abort();
      activeRequestControllerRef.current = null;
      setIsSending(false);
      setSrStatus("Stopping response generation");
    };

    const handleSendMessage = async () => {
      const cleanText = message.trim();
      if (!cleanText || isSending) return;
      const normalizedCleanText = normalizeStarterPromptText(cleanText);

      if (pendingStarterPromptSelection) {
        const editedBeforeSend =
          normalizedCleanText !==
          normalizeStarterPromptText(pendingStarterPromptSelection.promptText);
        trackStarterPromptAnalytics({
          eventType: "submitted",
          promptId: pendingStarterPromptSelection.promptId,
          promptText: pendingStarterPromptSelection.promptText,
          promptCategory: pendingStarterPromptSelection.category,
          submittedText: normalizedCleanText,
          editedBeforeSend,
          language,
          pathname: window.location.pathname,
          variant: pendingStarterPromptSelection.variant,
        });
        setPendingStarterPromptSelection(null);
      }

      await sendQuestion(cleanText);
    };

    const startNewConversation = () => {
      const temporaryConversation = isPrivateModeEnabled;
      const nextChatId = createConversationId(temporaryConversation);
      if (!temporaryConversation) {
        persistConversationRecord(nextChatId, language);
      } else {
        setActiveConversationId(null);
      }

      const greetingMessage = configReady
        ? [
            {
              text: initialGreeting,
              sender: "bot" as const,
            },
          ]
        : [];
      setMessages(greetingMessage);
      setMessage("");
      setComposerError(null);
      setLastSubmittedQuestion("");
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      setActiveMessageMenu(null);
      setShowJumpToBottom(false);
      setStarterDismissed(false);
      setPendingStarterPromptSelection(null);
      setIsSidebarOverlayOpen(isTabletViewport);
      setHistoryOverflowConversationId(null);
      setChatId(nextChatId);
      refreshStarterPrompts();
      setSrStatus("Started a new conversation");
      inputRef.current?.focus();
    };

    const askQuestion = (question: string) => {
      const cleanText = question.trim();
      if (!cleanText || isSending) return;
      setMessage("");
      setStarterDismissed(true);
      setPendingStarterPromptSelection(null);
      void sendQuestion(cleanText);
      inputRef.current?.focus();
    };

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const tag = target.tagName;
          if (
            target.isContentEditable ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
          ) {
            return;
          }
        }

        const isNewConversationShortcut =
          (event.metaKey || event.ctrlKey) &&
          !event.shiftKey &&
          !event.altKey &&
          event.key.toLowerCase() === "n";
        if (isNewConversationShortcut) {
          event.preventDefault();
          startNewConversation();
          return;
        }

        const isSearchShortcut =
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.key === "/";
        if (!isSearchShortcut) return;

        event.preventDefault();
        if (!isDesktopViewport) {
          setIsSidebarOverlayOpen(true);
        }
        requestAnimationFrame(() => {
          historySearchInputRef.current?.focus();
          historySearchInputRef.current?.select();
        });
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isDesktopViewport, startNewConversation]);

    useImperativeHandle(
      ref,
      () => ({
        cycleLanguage,
        getLanguage: () => language,
        setLanguage: handleLanguageChange,
        askQuestion,
        toggleTheme,
        startNewConversation,
        applySizePreset,
        toggleHistoryPanel,
        openHistoryPanel: () => {
          if (isDesktopViewport) {
            setIsSidebarCollapsed(false);
          } else {
            setIsSidebarOverlayOpen(true);
          }
        },
        hasUnsentDraft: () => message.trim().length > 0,
        isGenerating: () => isSending,
      }),
      [
        applySizePreset,
        askQuestion,
        cycleLanguage,
        handleLanguageChange,
        isDesktopViewport,
        isSending,
        language,
        message,
        startNewConversation,
        sendQuestion,
        toggleHistoryPanel,
        toggleTheme,
      ],
    );

    const dismissNudge = (nudgeId: string) => {
      setNudges((prev) => prev.filter((item) => item.id !== nudgeId));
      try {
        const current = JSON.parse(
          localStorage.getItem(dismissedNudgesStorageKey) || "[]",
        );
        const next = Array.from(new Set<string>([...current, nudgeId]));
        localStorage.setItem(dismissedNudgesStorageKey, JSON.stringify(next));
      } catch {
        // ignore localStorage errors
      }
    };

    const sendFeedback = async (
      messageIndex: number,
      feedback: FeedbackState,
    ) => {
      const target = messages[messageIndex];
      if (!target || target.sender !== "bot") return;
      if (target.feedback) return;

      setMessages((prev) =>
        prev.map((item, idx) =>
          idx === messageIndex ? { ...item, feedback } : item,
        ),
      );
      setSrStatus("Sending feedback");

      const idToken = getValidCognitoIdToken();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) authHeaders.Authorization = `Bearer ${idToken}`;

      try {
        await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            action: "feedback",
            feedbackType: feedback,
            chatId,
            url: window.location.href,
            answerText: target.text,
            messageText: messages[messageIndex - 1]?.text || "",
          }),
        });
        setSrStatus("Feedback submitted");
      } catch {
        setSrStatus("Feedback submission failed");
      }
    };

    const handleFeedbackSelection = async (
      messageIndex: number,
      feedback: FeedbackState,
    ) => {
      closeMessageMenu();
      await sendFeedback(messageIndex, feedback);
    };

    const copyMessageText = (messageIndex: number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(messageIndex.toString());
      setSrStatus("Message copied to clipboard");
      closeMessageMenu();
      setTimeout(() => setCopiedId(null), 2000);
    };

    const retryFailedQuestion = async (question?: string) => {
      if (!question) return;
      setMessage(question);
      await sendQuestion(question);
    };

    const handleFallbackAction = (action: "rephrase" | "contact") => {
      if (action === "rephrase") {
        setMessage("Can you help me with this request in a simpler way?");
        inputRef.current?.focus();
        setSrStatus("Draft prepared for rephrasing your request");
        return;
      }
      window.open("/demo/contact", "_blank", "noopener,noreferrer");
      void trackUiMetric("escalation_click", { source: "failure_fallback" });
      setSrStatus("Opened support contact page");
    };

    const findPreviousUserQuestion = (messageIndex: number): string | null => {
      for (let idx = messageIndex - 1; idx >= 0; idx -= 1) {
        const candidate = messages[idx];
        if (candidate?.sender === "user" && candidate.text.trim()) {
          return candidate.text.trim();
        }
      }
      return lastSubmittedQuestion.trim() || null;
    };

    const regenerateAssistantAnswer = async (messageIndex: number) => {
      if (isSending) return;
      const question = findPreviousUserQuestion(messageIndex);
      if (!question) {
        setSrStatus("No previous user question found to regenerate");
        closeMessageMenu();
        return;
      }
      closeMessageMenu();
      await sendQuestion(question);
    };

    const requestClarification = (messageIndex: number) => {
      const priorQuestion = findPreviousUserQuestion(messageIndex);
      const prefix = priorQuestion
        ? `That wasn't what I asked. Please answer this question directly: ${priorQuestion}\n\n`
        : "That wasn't what I asked. Please answer more directly.\n\n";
      setMessage(prefix);
      setComposerError(null);
      closeMessageMenu();
      inputRef.current?.focus();
      setSrStatus("Clarification template inserted");
    };

    const copyHandoffContext = (msg: Message) => {
      const ticket = msg.handoff?.ticket;
      if (!ticket) return;
      const text = [
        `Ticket ID: ${ticket.id || ""}`,
        `Summary: ${ticket.summary || ""}`,
        `Chat ID: ${ticket.chat_id || ""}`,
        `Page: ${ticket.page_url || ""}`,
        `Context: ${ticket.context || ""}`,
      ].join("\n");
      navigator.clipboard.writeText(text);
      setSrStatus("Handoff context copied");
    };

    const markdown = {
      code({ inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        const codeStr = String(children).replace(/\n$/, "");

        if (!inline && match) {
          return (
            <div className="my-3 rounded-lg overflow-hidden border border-white/20 bg-black/40">
              <div className="px-3 py-2 text-xs flex justify-between items-center bg-black/40 text-white">
                <span>{match[1]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeStr);
                    setCopiedId(codeStr.slice(0, 20));
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                  aria-label={`Copy ${match[1]} code block`}
                >
                  {copiedId === codeStr.slice(0, 20) ? "Copied!" : "Copy"}
                </button>
              </div>
              <SyntaxHighlighter
                language={match[1]}
                style={dracula}
                customStyle={{
                  margin: 0,
                  background: "transparent",
                  padding: "12px",
                }}
                wrapLongLines
                {...props}
              >
                {codeStr}
              </SyntaxHighlighter>
            </div>
          );
        }

        return (
          <code className="rounded px-1.5 py-0.5 bg-black/20" {...props}>
            {children}
          </code>
        );
      },
      a({ href, children, ...props }: any) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...props}>
            {children}
          </a>
        );
      },
    };

    const handleHistoryItemKeyDown = (
      event: { key: string; preventDefault: () => void },
      index: number,
      totalCount: number,
    ) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        historyItemRefs.current[index + 1]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        historyItemRefs.current[index - 1]?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        historyItemRefs.current[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        historyItemRefs.current[Math.max(totalCount - 1, 0)]?.focus();
      }
    };

    const hasUserMessages = messages.some((item) => item.sender === "user");
    const showStarterPrompts =
      !hasUserMessages && messages.length <= 1 && !starterDismissed;
    const visibleStarterPromptCount = isMobileViewport ? 2 : 3;
    const starterPromptPreview = starterPrompts.slice(0, visibleStarterPromptCount);
    const messageCharCount = message.length;
    const filteredConversationHistory = useMemo(() => {
      const term = historySearch.trim().toLowerCase();
      if (!term) return conversationHistory;
      return conversationHistory.filter((conversation) => {
        return (
          conversation.title.toLowerCase().includes(term) ||
          conversation.preview.toLowerCase().includes(term) ||
          conversation.language.toLowerCase().includes(term)
        );
      });
    }, [conversationHistory, historySearch]);

    const groupedConversationHistory = useMemo(() => {
      const pinned = filteredConversationHistory.filter(
        (conversation) => conversation.pinned,
      );
      const nonPinned = filteredConversationHistory.filter(
        (conversation) => !conversation.pinned,
      );
      const today = nonPinned.filter(
        (conversation) =>
          getHistoryTimeSection(conversation.updatedAt) === "today",
      );
      const yesterday = nonPinned.filter(
        (conversation) =>
          getHistoryTimeSection(conversation.updatedAt) === "yesterday",
      );
      const earlier = nonPinned.filter(
        (conversation) =>
          getHistoryTimeSection(conversation.updatedAt) === "earlier",
      );

      return [
        { key: "pinned", label: "Pinned", items: pinned },
        { key: "today", label: "Today", items: today },
        { key: "yesterday", label: "Yesterday", items: yesterday },
        { key: "earlier", label: "Earlier", items: earlier },
      ].filter((group) => group.items.length > 0);
    }, [filteredConversationHistory]);

    const renderConversationHistory = (mode: "sidebar" | "drawer") => {
      const isCollapsedSidebar = mode === "sidebar" && isSidebarCollapsed;
      if (isCollapsedSidebar) {
        return (
          <div
            className="pv-chat-history-panel is-collapsed"
            role="navigation"
            aria-label="Saved chat history"
          >
            <div className="pv-chat-history-icon-rail">
              <button
                type="button"
                className="pv-chat-history-icon-btn"
                data-tooltip="New chat"
                title="New chat"
                onClick={startNewConversation}
                disabled={isSending}
                aria-label="Start a new conversation"
              >
                +
              </button>
              <button
                type="button"
                className="pv-chat-history-icon-btn"
                data-tooltip="History"
                title="History"
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="Expand conversation history panel"
              >
                ≡
              </button>
              <button
                type="button"
                className="pv-chat-history-icon-btn"
                data-tooltip="Settings"
                title="Settings"
                onClick={() => setIsHistorySettingsOpen((prev) => !prev)}
                aria-label="Open history settings"
              >
                ⚙
              </button>
              {isHistorySettingsOpen && (
                <div
                  ref={historySettingsMenuRef}
                  className="pv-chat-history-settings pv-chat-history-settings--rail"
                  role="menu"
                >
                  <label className="pv-chat-history-private-toggle">
                    <input
                      type="checkbox"
                      checked={isPrivateModeEnabled}
                      onChange={(event) =>
                        setIsPrivateModeEnabled(event.target.checked)
                      }
                    />
                    Private mode
                  </label>
                  <button
                    type="button"
                    onClick={clearAllConversationRecords}
                    disabled={conversationHistory.length === 0}
                    className="is-danger"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div
          className={`pv-chat-history-panel ${mode === "drawer" ? "is-drawer" : ""} ${
            mode === "drawer" && isMobileViewport ? "is-mobile-drawer" : ""
          }`}
          role="navigation"
          aria-label="Saved chat history"
        >
          <div className="pv-chat-history-head">
            <div className="pv-chat-history-head-row">
              <h4>Conversations</h4>
              <button
                type="button"
                className="pv-chat-history-settings-trigger"
                onClick={() => setIsHistorySettingsOpen((prev) => !prev)}
                aria-label="Open conversation settings"
                title="Conversation settings"
              >
                ⋯
              </button>
              {isHistorySettingsOpen && (
                <div
                  ref={historySettingsMenuRef}
                  className="pv-chat-history-settings"
                  role="menu"
                >
                  <label className="pv-chat-history-private-toggle">
                    <input
                      type="checkbox"
                      checked={isPrivateModeEnabled}
                      onChange={(event) =>
                        setIsPrivateModeEnabled(event.target.checked)
                      }
                    />
                    Private mode for new chats
                  </label>
                  <button
                    type="button"
                    onClick={clearAllConversationRecords}
                    disabled={conversationHistory.length === 0}
                    className="is-danger"
                  >
                    Clear all conversations
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="pv-chat-history-new"
              onClick={startNewConversation}
              disabled={isSending}
              aria-label="Start a new conversation"
            >
              New conversation
            </button>

            <div className="pv-chat-history-search-wrap">
              <input
                ref={historySearchInputRef}
                type="search"
                className="pv-chat-history-search"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
            </div>

            <p className="pv-chat-history-shortcuts">
              Keyboard: <kbd>/</kbd> focus search • <kbd>Ctrl/Cmd + N</kbd> new conversation
            </p>

            {isTemporaryConversation && (
              <p className="pv-chat-history-temporary">
                Current chat is temporary and not saved.
              </p>
            )}
          </div>

          {filteredConversationHistory.length === 0 ? (
            <div className="pv-chat-history-empty-state">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="14" rx="3" />
                <path d="M7 9h10" />
                <path d="M7 13h6" />
              </svg>
              <p className="pv-chat-history-empty">
                No saved conversations yet.
              </p>
              <span>Start a chat, ask your first question, and your conversation title will appear here automatically.</span>
              <button
                type="button"
                className="pv-chat-history-empty-action"
                onClick={startNewConversation}
                disabled={isSending}
              >
                Start new conversation
              </button>
            </div>
          ) : (
            <ul className="pv-chat-history-list">
              {(() => {
                let listIndex = -1;
                return groupedConversationHistory.map((group) => (
                  <li key={group.key} className="pv-chat-history-group">
                    <p className="pv-chat-history-group-title">{group.label}</p>
                    <ul className="pv-chat-history-group-list">
                      {group.items.map((conversation) => {
                        const relativeTime = formatRelativeTimestamp(
                          conversation.updatedAt,
                        );
                        listIndex += 1;
                        const itemIndex = listIndex;
                        const isEditing =
                          editingConversationId === conversation.id;
                        return (
                          <li
                            key={conversation.id}
                            className="pv-chat-history-row"
                          >
                            {isEditing ? (
                              <form
                                className="pv-chat-history-rename-form"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  submitRenameConversation(conversation.id);
                                }}
                              >
                                <input
                                  autoFocus
                                  value={editingConversationTitle}
                                  onChange={(event) =>
                                    setEditingConversationTitle(
                                      event.target.value,
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Escape") {
                                      event.preventDefault();
                                      cancelRenameConversation();
                                    }
                                  }}
                                  aria-label="Conversation title"
                                />
                                <button type="submit">Save</button>
                                <button
                                  type="button"
                                  onClick={cancelRenameConversation}
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <button
                                ref={(element) => {
                                  historyItemRefs.current[itemIndex] = element;
                                }}
                                type="button"
                                className={`pv-chat-history-item ${
                                  activeConversationId === conversation.id
                                    ? "is-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  openConversation(conversation.id)
                                }
                                onKeyDown={(event) =>
                                  handleHistoryItemKeyDown(
                                    event,
                                    itemIndex,
                                    filteredConversationHistory.length,
                                  )
                                }
                                aria-current={
                                  activeConversationId === conversation.id
                                    ? "page"
                                    : undefined
                                }
                                aria-label={`Open conversation ${conversation.title}, last updated ${relativeTime}`}
                              >
                                <span className="pv-chat-history-title-row">
                                  <span className="pv-chat-history-title">
                                    {conversation.title}
                                  </span>
                                  {conversation.pinned && (
                                    <span className="pv-chat-history-pin-indicator">
                                      ★
                                    </span>
                                  )}
                                </span>
                                <span className="pv-chat-history-preview">
                                  {conversation.preview || "No preview yet"}
                                </span>
                                <span className="pv-chat-history-meta">
                                  Updated {relativeTime} •{" "}
                                  {conversation.language}
                                </span>
                              </button>
                            )}
                            {!isEditing && (
                              <div className="pv-chat-history-actions">
                                <button
                                  type="button"
                                  className="pv-chat-history-pin-btn"
                                  onClick={() =>
                                    toggleConversationPin(conversation.id)
                                  }
                                  aria-label={
                                    conversation.pinned
                                      ? `Unpin conversation ${conversation.title}`
                                      : `Pin conversation ${conversation.title}`
                                  }
                                  title={conversation.pinned ? "Unpin" : "Pin"}
                                >
                                  {conversation.pinned ? "★" : "☆"}
                                </button>
                                <div className="pv-chat-history-overflow">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHistoryOverflowConversationId(
                                        (prev) =>
                                          prev === conversation.id
                                            ? null
                                            : conversation.id,
                                      )
                                    }
                                    aria-label={`Open actions for ${conversation.title}`}
                                    title="More actions"
                                  >
                                    ⋯
                                  </button>
                                  {historyOverflowConversationId ===
                                    conversation.id && (
                                    <div role="menu">
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() =>
                                          startRenameConversation(
                                            conversation.id,
                                          )
                                        }
                                      >
                                        Rename
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() =>
                                          toggleConversationPin(conversation.id)
                                        }
                                      >
                                        {conversation.pinned ? "Unpin" : "Pin"}
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() =>
                                          exportConversationRecord(
                                            conversation.id,
                                          )
                                        }
                                      >
                                        Export
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        className="is-danger"
                                        onClick={() =>
                                          deleteConversationRecord(
                                            conversation.id,
                                          )
                                        }
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ));
              })()}
            </ul>
          )}
        </div>
      );
    };

    return (
      <div
        ref={widgetRef}
        className={`pv-chat-widget h-full flex flex-col ${
          showHistorySidebar ? "pv-chat-widget--history-open" : ""
        }`}
        style={
          {
            "--pv-history-width": `${effectiveSidebarWidth}px`,
          } as Record<string, string>
        }
        data-theme={theme}
        data-size={isLarge ? "large" : "normal"}
        data-variant={variant}
        role="region"
        aria-label="Exodus Assistant chat"
        aria-busy={isSending}
      >
        {showHistorySidebar && renderConversationHistory("sidebar")}
        {showHistorySidebar && !isSidebarCollapsed && (
          <button
            ref={sidebarDividerRef}
            type="button"
            className="pv-chat-history-divider"
            onPointerDown={(event) => {
              event.preventDefault();
              const startX = event.clientX;
              const startWidth = effectiveSidebarWidth;
              const onMove = (moveEvent: PointerEvent) => {
                const next = clamp(
                  startWidth + (moveEvent.clientX - startX),
                  SIDEBAR_MIN_WIDTH_DESKTOP,
                  SIDEBAR_MAX_WIDTH_DESKTOP,
                );
                setSidebarWidth(next);
              };
              const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onUp);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
              window.addEventListener("pointercancel", onUp);
            }}
            aria-label="Resize conversation sidebar"
            title="Drag to resize sidebar"
          />
        )}
        {showHistoryDrawerToggle && (
          <div className="pv-chat-history-toolbar">
            <button
              ref={historyToggleButtonRef}
              type="button"
              className="pv-chat-history-toolbar-btn"
              onClick={toggleHistoryPanel}
              aria-haspopup="dialog"
              aria-expanded={isSidebarOverlayOpen}
              aria-label="Open chat history"
            >
              Conversations
            </button>
            <button
              type="button"
              className="pv-chat-history-toolbar-btn"
              onClick={startNewConversation}
              disabled={isSending}
              aria-label="Start a new conversation"
            >
              New conversation
            </button>
          </div>
        )}
        <div
          ref={messagesRef}
          className="pv-chat-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
        >
          {showStarterPrompts && starterPrompts.length > 0 && (
            <div
              className="pv-chat-starters"
              aria-label="Suggested starter prompts"
            >
              <div className="pv-chat-starters-header">
                <p className="pv-chat-starters-title">
                  Try one of these quick questions, or type your own below:
                </p>
                <button
                  type="button"
                  className="pv-chat-starters-close"
                  onClick={() => {
                    setStarterDismissed(true);
                    setSrStatus("Quick questions closed");
                  }}
                  aria-label="Close quick questions"
                  title="Close quick questions"
                >
                  x
                </button>
              </div>
              <div className="pv-chat-starter-grid">
                {starterPromptPreview.map((prompt, index) => (
                  <button
                    key={`${prompt.id}-${prompt.text}`}
                    type="button"
                    className="pv-chat-starter-chip"
                    style={{ animationDelay: `${Math.min(index, 5) * 30}ms` }}
                    onClick={() => handleStarterPromptSelect(prompt)}
                    disabled={isSending}
                    aria-label={`Ask: ${prompt.text}`}
                    title={prompt.text}
                    data-starter-source={prompt.source}
                    data-starter-category={prompt.category}
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
              <div className="pv-chat-starter-toolbar">
                <button
                  type="button"
                  className="pv-chat-starter-refresh"
                  onClick={() => {
                    setRefreshStarterNonce((prev) => prev + 1);
                    setSrStatus("Starter questions refreshed");
                  }}
                  aria-label="Refresh quick questions"
                >
                  Refresh quick questions
                </button>
              </div>
            </div>
          )}

          {isConversationSwitching ? (
            <div className="pv-chat-switch-skeleton" aria-hidden="true">
              <div className="pv-chat-switch-skeleton-line short" />
              <div className="pv-chat-switch-skeleton-line long" />
              <div className="pv-chat-switch-skeleton-line medium" />
              <div className="pv-chat-switch-skeleton-line short" />
            </div>
          ) : messages.length === 0 ? (
            <div className="pv-chat-empty" aria-label="No messages yet">
              Type a message below to start.
            </div>
          ) : (
            messages.map((msg, i) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={i}
                  className={`pv-chat-row ${isBot ? "pv-chat-row--bot" : "pv-chat-row--user"}`}
                  role="article"
                  aria-label={
                    isBot
                      ? `Assistant message ${i + 1}`
                      : `Your message ${i + 1}`
                  }
                >
                  <div
                    className={`pv-chat-bubble ${isBot ? "pv-chat-bubble--bot" : "pv-chat-bubble--user"}`}
                  >
                    {isBot && msg.confidence && (
                      <div
                        className={`pv-chat-confidence pv-chat-confidence--${msg.confidence.label}`}
                        aria-label={`Confidence ${Math.round((msg.confidence.score || 0) * 100)} percent`}
                      >
                        <span>{msg.confidence.label} confidence</span>
                        <span>
                          {Math.round((msg.confidence.score || 0) * 100)}%
                        </span>
                      </div>
                    )}

                    {isBot && (
                      <div className="pv-chat-quality-cue">
                        {Array.isArray(msg.citations) && msg.citations.length > 0
                          ? "Source-backed answer"
                          : "No citation available — verify against the codebase"}
                      </div>
                    )}

                    <div className="pv-chat-markdown">
                      <ReactMarkdown components={markdown}>
                        {isBot ? linkifyPlainUrls(msg.text) : msg.text}
                      </ReactMarkdown>
                    </div>

                    {isBot &&
                      Array.isArray(msg.citations) &&
                      msg.citations.length > 0 && (
                        <div className="pv-chat-citations">
                          <div className="pv-chat-citations-title">
                            Sources
                          </div>
                          <ul
                            className="pv-chat-citations-list"
                            aria-label="Citations"
                          >
                            {msg.citations.map((citation, idx) => {
                              const sourceType = classifyCitationSource(citation);
                              const hostLabel = citationHostname(citation);
                              return (
                                <li key={`${citation.url}-${idx}`}>
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`pv-chat-citation-chip pv-chat-citation-chip--${sourceType}`}
                                    aria-label={`Open source ${citation.title || `link ${idx + 1}`}`}
                                    onClick={() => void trackCitationClick(citation)}
                                  >
                                    <span className="pv-chat-citation-chip-label">
                                      {citation.title || citation.url}
                                    </span>
                                    <span className="pv-chat-citation-chip-meta">
                                      {sourceType === "official" ? "Project source" : "External source"} • {hostLabel}
                                    </span>
                                    <span className="pv-chat-citation-chip-icon" aria-hidden="true">
                                      ↗
                                    </span>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                    {isBot && formatLastVerified(msg.lastVerified) && (
                      <div className="pv-chat-last-verified">
                        Last verified: {formatLastVerified(msg.lastVerified)}
                      </div>
                    )}

                    {isBot && msg.sourceWarning && (
                      <div className="pv-chat-source-warning" role="status" aria-live="polite">
                        {msg.sourceWarning}
                      </div>
                    )}

                    {isBot && msg.failureKind && (
                      <div className="pv-chat-failure-actions">
                        <button
                          type="button"
                          onClick={() => void retryFailedQuestion(msg.retryQuestion)}
                          disabled={isSending || !msg.retryQuestion}
                        >
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFallbackAction("rephrase")}
                          disabled={isSending}
                        >
                          Rephrase request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFallbackAction("contact")}
                        >
                          Contact support
                        </button>
                      </div>
                    )}

                    {isBot && msg.handoff?.required && (
                      <div
                        className="pv-chat-handoff"
                        role="group"
                        aria-label="Human handoff options"
                      >
                        <div className="pv-chat-handoff-title">
                          Human Handoff Ready
                        </div>
                        <p className="pv-chat-handoff-text">
                          {msg.handoff.reason ||
                            "A specialist should review this."}
                        </p>
                        {msg.handoff.ticket?.id && (
                          <p className="pv-chat-handoff-ticket">
                            Ticket: {msg.handoff.ticket.id}
                          </p>
                        )}
                        <div className="pv-chat-handoff-actions">
                          <a
                            href={msg.handoff.contact_url || "/contact"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Contact Form
                          </a>
                          {msg.handoff.service_phone && (
                            <a
                              href={`tel:${msg.handoff.service_phone.replace(/[^0-9]/g, "")}`}
                            >
                              Call support
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => copyHandoffContext(msg)}
                          >
                            Copy Context
                          </button>
                        </div>
                      </div>
                    )}

                    {isBot && (
                      <div className="pv-chat-message-menu">
                        <button
                          type="button"
                          className={`pv-chat-message-menu-trigger ${
                            activeMessageMenu === i ? "is-open" : ""
                          }`}
                          onClick={() => toggleMessageMenu(i)}
                          aria-haspopup="menu"
                          aria-expanded={activeMessageMenu === i}
                          aria-label={`Open actions for assistant message ${i + 1}`}
                          title="Message actions"
                        >
                          <svg
                            className="pv-chat-feedback-icon pv-chat-feedback-icon--fill"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle cx="6" cy="12" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="18" cy="12" r="1.8" />
                          </svg>
                        </button>

                        {activeMessageMenu === i && (
                          <div
                            className="pv-chat-message-menu-panel"
                            role="menu"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => copyMessageText(i, msg.text)}
                              aria-label="Copy assistant response"
                            >
                              {copiedId === i.toString() ? "Copied answer" : "Copy answer"}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => void regenerateAssistantAnswer(i)}
                              aria-label="Regenerate assistant response"
                              disabled={isSending}
                            >
                              Regenerate
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => requestClarification(i)}
                              aria-label="Not what I asked"
                              disabled={isSending}
                            >
                              Not what I asked
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() =>
                                handleFeedbackSelection(i, "helpful")
                              }
                              aria-label="Mark answer as helpful"
                              disabled={!!msg.feedback}
                            >
                              <FeedbackIcon feedback="helpful" />
                              Helpful
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() =>
                                handleFeedbackSelection(i, "not_helpful")
                              }
                              aria-label="Mark answer as not helpful"
                              disabled={!!msg.feedback}
                            >
                              <FeedbackIcon feedback="not_helpful" />
                              Not Helpful
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleFeedbackSelection(i, "flag")}
                              aria-label="Flag answer"
                              disabled={!!msg.feedback}
                            >
                              <FeedbackIcon feedback="flag" />
                              Report issue
                            </button>
                            {msg.feedback && (
                              <p className="pv-chat-message-menu-status">
                                Selected: {FEEDBACK_LABEL_MAP[msg.feedback]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div
              className="pv-chat-row pv-chat-row--bot"
              role="status"
              aria-live="polite"
              aria-label="Assistant is thinking"
            >
              <div className="pv-chat-bubble pv-chat-bubble--bot">
                <div className="pv-chat-thinking">Thinking...</div>
              </div>
            </div>
          )}

          {showJumpToBottom && (
            <button
              type="button"
              className="pv-chat-jump-bottom"
              onClick={() => scrollMessagesToBottom("smooth")}
              aria-label="Jump to latest message"
            >
              Jump to latest
            </button>
          )}

          <div ref={endRef} />
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {srStatus}
        </div>

        <div className="pv-chat-controls">
          {!disableNudges && nudges.length > 0 && (
            <div className="pv-chat-nudges" aria-label="Proactive coding alerts">
              {nudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className={`pv-chat-nudge pv-chat-nudge--${nudge.severity || "info"}`}
                >
                  <div className="pv-chat-nudge-head">
                    <p className="pv-chat-nudge-title">{nudge.title}</p>
                    <button
                      type="button"
                      className="pv-chat-nudge-dismiss"
                      onClick={() => dismissNudge(nudge.id)}
                      aria-label={`Dismiss ${nudge.title}`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="pv-chat-nudge-message">{nudge.message}</p>
                  <button
                    type="button"
                    className="pv-chat-nudge-cta"
                    onClick={() => sendQuestion(nudge.prompt || nudge.message)}
                    disabled={isSending}
                  >
                    {nudge.cta_label || "Ask"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!hideMetaControls && (
            <div className="pv-chat-meta-row">
              <div
                className="pv-chat-size-presets"
                role="group"
                aria-label="Chat window size presets"
              >
                <button
                  type="button"
                  onClick={() => applySizePreset("small")}
                  className={sizePreset === "small" ? "is-active" : ""}
                >
                  Small
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset("medium")}
                  className={sizePreset === "medium" ? "is-active" : ""}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset("large")}
                  className={sizePreset === "large" ? "is-active" : ""}
                >
                  Large
                </button>
              </div>

              <label className="pv-chat-label" htmlFor="chat-language-select">
                Response Language:
              </label>
              <select
                id="chat-language-select"
                value={language}
                onChange={(e) =>
                  handleLanguageChange(normalizeLanguage(e.target.value))
                }
                className="pv-chat-select"
                aria-label="Response language"
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
                <option value="Vietnamese">Tiếng Việt</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Mandarin Chinese">中文（普通话）</option>
                <option value="Cantonese Chinese">中文（粵語）</option>
                <option value="Arabic">العربية</option>
                <option value="Korean">한국어</option>
              </select>
              <button
                type="button"
                onClick={toggleTheme}
                className="pv-chat-theme-toggle"
                aria-label={
                  theme === "dark"
                    ? "Switch chat to light theme"
                    : "Switch chat to dark theme"
                }
              >
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </button>
              <button
                type="button"
                onClick={startNewConversation}
                className="pv-chat-theme-toggle"
                disabled={isSending}
                aria-label="Start a new conversation"
              >
                New Conversation
              </button>
            </div>
          )}

          <div className="pv-chat-composer-meta" aria-live="polite">
            <span>Enter to send • Shift+Enter for new line</span>
            <span className={messageCharCount > MAX_COMPOSER_CHARS ? "is-over" : ""}>
              {messageCharCount}/{MAX_COMPOSER_CHARS}
            </span>
          </div>
          {composerError && <p className="pv-chat-composer-error">{composerError}</p>}

          <div className="pv-chat-input-row">
            <label htmlFor="pv-chat-input" className="sr-only">
              Message input
            </label>
            <textarea
              id="pv-chat-input"
              ref={inputRef}
              value={message}
              onChange={(e) => {
                const nextValue = e.target.value;
                setMessage(nextValue);
                if (nextValue.length > MAX_COMPOSER_CHARS) {
                  setComposerError(
                    `Please shorten your message to ${MAX_COMPOSER_CHARS} characters or fewer.`,
                  );
                } else {
                  setComposerError(null);
                }
                if (nextValue.length > 0) {
                  setStarterDismissed(true);
                }
              }}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              disabled={isSending}
              className="pv-chat-input pv-chat-input--multiline"
              aria-label="Type your message"
              rows={2}
            />
            {isSending ? (
              <button
                onClick={handleStopGenerating}
                className="pv-chat-send pv-chat-send--stop"
                aria-label="Stop generating response"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim() || messageCharCount > MAX_COMPOSER_CHARS}
                className="pv-chat-send"
                aria-label={isSending ? "Sending message" : "Send message"}
              >
                Send
              </button>
            )}
          </div>
        </div>

        {showHistoryOverlay && (
          <div
            className={`pv-chat-history-drawer-backdrop ${
              isSidebarOverlayOpen ? "is-open" : ""
            }`}
            onClick={() => {
              setIsSidebarOverlayOpen(false);
              historyToggleButtonRef.current?.focus();
            }}
            aria-hidden={!isSidebarOverlayOpen}
          >
            <div
              ref={historyDrawerRef}
              className={`pv-chat-history-drawer ${
                isMobileViewport ? "is-mobile" : "is-tablet"
              }`}
              style={
                isTabletViewport
                  ? { width: `${SIDEBAR_DEFAULT_WIDTH_TABLET}px` }
                  : undefined
              }
              role="dialog"
              aria-modal="true"
              aria-label="Saved chat history"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pv-chat-history-drawer-head">
                <h4>Conversation history</h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOverlayOpen(false);
                    historyToggleButtonRef.current?.focus();
                  }}
                  aria-label="Close conversation history"
                >
                  Close
                </button>
              </div>
              {renderConversationHistory("drawer")}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default ChatbotWidget;
