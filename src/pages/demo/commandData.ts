export const BUILTIN_ISSUE_TYPES = [
  "epic",
  "story",
  "ticket",
  "task",
  "bug",
  "incident",
  "request",
  "permit",
  "complaint",
] as const;
export type TicketType = (typeof BUILTIN_ISSUE_TYPES)[number] | (string & {});

export const DEFAULT_PRIORITIES = ["Highest", "High", "Medium", "Low"];
export type Priority = string;

export interface IssueTypeConfig {
  id: string;
  label: string;
  icon: string;
  badge: string;
  accent: string;
}

export const DEFAULT_ISSUE_TYPES: IssueTypeConfig[] = [
  {
    id: "epic",
    label: "Epic",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    accent: "text-violet-700",
    icon: "E",
  },
  {
    id: "story",
    label: "Story",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    accent: "text-indigo-700",
    icon: "S",
  },
  {
    id: "ticket",
    label: "Ticket",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    accent: "text-sky-700",
    icon: "T",
  },
  {
    id: "task",
    label: "Task",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "text-emerald-700",
    icon: "TA",
  },
  {
    id: "bug",
    label: "Bug",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    accent: "text-rose-700",
    icon: "B",
  },
  {
    id: "incident",
    label: "Incident",
    badge: "bg-red-100 text-red-800 border-red-200",
    accent: "text-red-700",
    icon: "I",
  },
  {
    id: "request",
    label: "Request",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    accent: "text-cyan-700",
    icon: "R",
  },
  {
    id: "permit",
    label: "Permit",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "text-amber-700",
    icon: "P",
  },
  {
    id: "complaint",
    label: "Complaint",
    badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    accent: "text-fuchsia-700",
    icon: "C",
  },
];

export const CUSTOM_ISSUE_TYPE_PALETTE: Array<{
  badge: string;
  accent: string;
}> = [
  {
    badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    accent: "text-fuchsia-700",
  },
  {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "text-amber-700",
  },
  {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "text-emerald-700",
  },
  {
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    accent: "text-cyan-700",
  },
  {
    badge: "bg-pink-100 text-pink-800 border-pink-200",
    accent: "text-pink-700",
  },
];

export const FALLBACK_ISSUE_TYPE: IssueTypeConfig = {
  id: "custom",
  label: "Custom",
  badge: "bg-slate-100 text-slate-700 border-slate-200",
  accent: "text-slate-700",
  icon: "C",
};

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  mentions: string[];
}

export interface InternalNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  mentions: string[];
}

export type Visibility = "public" | "internal";

export interface LocationInfo {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface ConstituentInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  accountId?: string;
}

export interface EvidenceItem {
  name: string;
  url: string;
  capturedAt: string;
}

export type ApprovalStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";

export interface Dependency {
  id: string;
  type: "blocks" | "blocked_by";
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  field?: string;
  from?: string;
  to?: string;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Subtask {
  title: string;
  done: boolean;
}

export interface LinkedIssue {
  label: string;
  url?: string;
}

export type ColumnKey =
  | "todo"
  | "inprogress"
  | "agent"
  | "blocked"
  | "testing"
  | "completed";

export interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  assignee: string;
  assigneeEmail?: string;
  department?: string;
  dueDate?: string;
  requesterName?: string;
  requesterEmail?: string;
  visibility?: Visibility;
  location?: LocationInfo;
  constituent?: ConstituentInfo;
  evidence?: EvidenceItem[];
  internalNotes?: InternalNote[];
  watchers?: string[];
  source?: string;
  approvalRequired?: boolean;
  approvalStatus?: ApprovalStatus;
  dependencies?: Dependency[];
  parentId?: string;
  possibleDuplicateIds?: string[];
  aiDuplicateIds?: string[];
  duplicateCheckedAt?: string;
  aiSummary?: string;
  aiClassification?: string;
  aiClassificationConfidence?: number;
  aiSuggestedDepartment?: string;
  aiSuggestedPriority?: string;
  aiSuggestedResponse?: string;
  aiTriageNotes?: string;
  aiTriageAt?: string;
  serviceTemplate?: string;
  epicId?: string;
  skipGitHub: boolean;
  githubIssueNumber?: number;
  githubIssueUrl?: string;
  createdAt: string;
  sprintId?: string;
  priority?: Priority;
  customFields?: Record<string, string>;
  metadata?: Record<string, string>;
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Subtask[];
  links?: LinkedIssue[];
  labels?: string[];
  auditLog?: AuditEntry[];
}

export interface BacklogItem {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  createdAt: string;
  sprintId?: string;
  epicId?: string;
  priority?: Priority;
  department?: string;
  dueDate?: string;
  requesterName?: string;
  requesterEmail?: string;
  visibility?: Visibility;
  location?: LocationInfo;
  constituent?: ConstituentInfo;
  evidence?: EvidenceItem[];
  internalNotes?: InternalNote[];
  watchers?: string[];
  source?: string;
  approvalRequired?: boolean;
  approvalStatus?: ApprovalStatus;
  dependencies?: Dependency[];
  parentId?: string;
  possibleDuplicateIds?: string[];
  aiDuplicateIds?: string[];
  duplicateCheckedAt?: string;
  aiSummary?: string;
  aiClassification?: string;
  aiClassificationConfidence?: number;
  aiSuggestedDepartment?: string;
  aiSuggestedPriority?: string;
  aiSuggestedResponse?: string;
  aiTriageNotes?: string;
  aiTriageAt?: string;
  serviceTemplate?: string;
  customFields?: Record<string, string>;
  metadata?: Record<string, string>;
  attachments?: Attachment[];
  subtasks?: Subtask[];
  links?: LinkedIssue[];
  labels?: string[];
  auditLog?: AuditEntry[];
}

export const COLUMN_KEYS: ColumnKey[] = [
  "todo",
  "inprogress",
  "agent",
  "blocked",
  "testing",
  "completed",
];

export const COLUMNS_STORAGE_KEY = "primiq_command_columns";
export const BACKLOG_STORAGE_KEY = "primiq_command_backlog";
export const ISSUE_TYPES_STORAGE_KEY = "primiq_command_issue_types";

export const DEFAULT_SPRINTS = [
  "Sprint 1",
  "Sprint 2",
  "Sprint 3",
  "Sprint 4",
  "Sprint 5",
];

export const DEFAULT_COLUMNS: Record<ColumnKey, Ticket[]> = {
  todo: [],
  inprogress: [],
  agent: [],
  blocked: [],
  testing: [],
  completed: [],
};

export const DEFAULT_BACKLOG_ITEMS: BacklogItem[] = [];

function normalizeStoredTickets(raw: unknown): Record<ColumnKey, Ticket[]> | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const next = {} as Record<ColumnKey, Ticket[]>;
  for (const key of COLUMN_KEYS) {
    const items = candidate[key];
    if (!Array.isArray(items)) return null;
    next[key] = items.filter((item) => item && typeof item === "object") as Ticket[];
  }
  return next;
}

export function loadStoredColumns(
  fallback: Record<ColumnKey, Ticket[]>,
): Record<ColumnKey, Ticket[]> {
  try {
    const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredTickets(parsed);
    return normalized || fallback;
  } catch {
    return fallback;
  }
}

export function normalizeIssueTypeId(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function buildIssueTypeMap(
  customTypes: IssueTypeConfig[],
): Record<string, IssueTypeConfig> {
  const map: Record<string, IssueTypeConfig> = {};
  for (const t of DEFAULT_ISSUE_TYPES) {
    map[t.id] = t;
  }
  for (const t of customTypes) {
    if (!t || !t.id) continue;
    map[t.id] = t;
  }
  return map;
}

export function resolveIssueType(
  typeId: string,
  issueTypeMap: Record<string, IssueTypeConfig>,
): IssueTypeConfig {
  if (issueTypeMap[typeId]) {
    return issueTypeMap[typeId];
  }
  const label = typeId || FALLBACK_ISSUE_TYPE.label;
  return { ...FALLBACK_ISSUE_TYPE, id: typeId || "custom", label };
}

export function loadStoredIssueTypes(
  fallback: IssueTypeConfig[] = [],
): IssueTypeConfig[] {
  try {
    const raw = window.localStorage.getItem(ISSUE_TYPES_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter(
      (item): item is IssueTypeConfig =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as IssueTypeConfig).id === "string" &&
        typeof (item as IssueTypeConfig).label === "string" &&
        typeof (item as IssueTypeConfig).badge === "string" &&
        typeof (item as IssueTypeConfig).accent === "string",
    );
  } catch {
    return fallback;
  }
}

export function saveStoredIssueTypes(types: IssueTypeConfig[]): void {
  try {
    window.localStorage.setItem(
      ISSUE_TYPES_STORAGE_KEY,
      JSON.stringify(types),
    );
  } catch {
    // ignore storage failures
  }
}

export function saveStoredColumns(columns: Record<ColumnKey, Ticket[]>): void {
  try {
    window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

export function loadStoredBacklog(fallback: BacklogItem[]): BacklogItem[] {
  try {
    const raw = window.localStorage.getItem(BACKLOG_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter((item) => item && typeof item === "object") as BacklogItem[];
  } catch {
    return fallback;
  }
}

export function saveStoredBacklog(items: BacklogItem[]): void {
  try {
    window.localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors in demo mode.
  }
}
