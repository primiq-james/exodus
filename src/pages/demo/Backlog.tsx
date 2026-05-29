import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminClaims } from "../../lib/adminAuth";
import { getValidCognitoIdToken } from "../../lib/cognitoSession";
import { buildDemoLoginUrl } from "../../lib/demoAuth";
import {
  DEFAULT_BACKLOG_ITEMS,
  DEFAULT_COLUMNS,
  DEFAULT_SPRINTS,
  DEFAULT_PRIORITIES,
  DEFAULT_ISSUE_TYPES,
  COLUMN_KEYS,
  buildIssueTypeMap,
  resolveIssueType,
} from "./commandData";
import type {
  BacklogItem,
  Ticket,
  TicketType,
  Priority,
  IssueTypeConfig,
  ColumnKey,
} from "./commandData";

const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

const BOARD_ID = "shared-command-board";
const MY_TEAM_STORAGE_KEY = "primiq_command_my_team";
const DEFAULT_TEAM = "Operations";

// Priority badge styles are resolved dynamically from the board's configured options.

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface BoardState {
  columns: Record<ColumnKey, Ticket[]>;
  backlog: BacklogItem[];
  issueTypes: IssueTypeConfig[];
  teamMembers: TeamMember[];
  onCallUserId: string;
  onCallUpdatedAt: string;
  activeSprint: string;
  workflowLabels: Record<ColumnKey, string>;
  workflowByType: Record<string, string>;
  workflowCustomByType: Record<string, Record<ColumnKey, string>>;
  transitionRules: Record<ColumnKey, ColumnKey[]>;
  requiredFields: Record<ColumnKey, RequiredFieldKey[]>;
  priorityOptions: string[];
  departments: string[];
  routingByType: Record<string, string>;
  autoAssignRules: Record<string, string>;
  escalationRules: EscalationRules;
  archived: Ticket[];
}

type RequiredFieldKey =
  | "assignee"
  | "department"
  | "priority"
  | "dueDate"
  | "approval";

type EscalationRules = {
  enabled: boolean;
  overdueDays: number;
  priority: string;
};

const DEFAULT_WORKFLOW_LABELS: Record<ColumnKey, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  agent: "Agent",
  blocked: "Blocked",
  testing: "Testing",
  completed: "Completed",
};

const REQUIRED_FIELD_OPTIONS: RequiredFieldKey[] = [
  "assignee",
  "department",
  "priority",
  "dueDate",
  "approval",
];

const DEFAULT_REQUIRED_FIELDS: Record<ColumnKey, RequiredFieldKey[]> = {
  todo: [],
  inprogress: [],
  agent: ["assignee"],
  blocked: [],
  testing: [],
  completed: ["approval"],
};

const DEFAULT_TRANSITIONS: Record<ColumnKey, ColumnKey[]> = {
  todo: ["inprogress", "agent", "blocked"],
  inprogress: ["blocked", "testing", "completed", "agent"],
  agent: ["inprogress", "blocked", "testing", "completed"],
  blocked: ["inprogress", "completed"],
  testing: ["inprogress", "blocked", "completed"],
  completed: ["todo"],
};

const DEFAULT_ESCALATION_RULES: EscalationRules = {
  enabled: true,
  overdueDays: 0,
  priority: DEFAULT_PRIORITIES[0] || "High",
};

const DEFAULT_DEPARTMENTS = [
  "Public Works",
  "Utilities",
  "Permitting",
  "Code Enforcement",
  "Parks & Recreation",
  "IT",
  "Transportation",
];

const PRIORITY_STYLE_PALETTE = [
  {
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

function resolvePriorityStyle(
  priority: Priority | undefined,
  options: string[],
) {
  if (!priority) return null;
  const idx = options.findIndex((level) => level === priority);
  const palette =
    PRIORITY_STYLE_PALETTE[idx >= 0 ? idx : options.length - 1] ||
    PRIORITY_STYLE_PALETTE[PRIORITY_STYLE_PALETTE.length - 1];
  return {
    label: priority,
    badge: palette.badge,
  };
}

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ava.thompson@paloverde.gov",
    name: "Ava Thompson",
    email: "ava.thompson@paloverde.gov",
  },
  {
    id: "miles.carter@paloverde.gov",
    name: "Miles Carter",
    email: "miles.carter@paloverde.gov",
  },
  {
    id: "priya.desai@paloverde.gov",
    name: "Priya Desai",
    email: "priya.desai@paloverde.gov",
  },
  {
    id: "leo.martinez@paloverde.gov",
    name: "Leo Martinez",
    email: "leo.martinez@paloverde.gov",
  },
  {
    id: "naomi.reed@paloverde.gov",
    name: "Naomi Reed",
    email: "naomi.reed@paloverde.gov",
  },
  {
    id: "ethan.brooks@paloverde.gov",
    name: "Ethan Brooks",
    email: "ethan.brooks@paloverde.gov",
  },
  {
    id: "sofia.patel@paloverde.gov",
    name: "Sofia Patel",
    email: "sofia.patel@paloverde.gov",
  },
];

function normalizeEmail(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function mergeTeamMembers(...groups: TeamMember[][]): TeamMember[] {
  const merged: TeamMember[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    for (const member of group) {
      const email = normalizeEmail(member.email);
      const name = String(member.name || "").trim();
      if (!email || !name) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      merged.push({ id: email, name, email });
    }
  }
  return merged;
}

function normalizeTeamName(value: string): string {
  return String(value || "").trim();
}

function buildEmptyColumns(): Record<ColumnKey, Ticket[]> {
  return COLUMN_KEYS.reduce<Record<ColumnKey, Ticket[]>>((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<ColumnKey, Ticket[]>);
}

function cloneColumns(
  columns: Record<ColumnKey, Ticket[]>,
): Record<ColumnKey, Ticket[]> {
  return JSON.parse(JSON.stringify(columns)) as Record<ColumnKey, Ticket[]>;
}

function cloneBacklog(items: BacklogItem[]): BacklogItem[] {
  return JSON.parse(JSON.stringify(items)) as BacklogItem[];
}

function normalizeTeamMembers(raw: unknown): TeamMember[] {
  if (!Array.isArray(raw)) return [];
  const members: TeamMember[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const email = normalizeEmail((item as TeamMember).email);
    const name = String((item as TeamMember).name || "").trim();
    if (!email || !name) continue;
    members.push({ id: email, email, name });
  }
  return members;
}

function normalizeColumns(
  raw: unknown,
  fallback: Record<ColumnKey, Ticket[]>,
): Record<ColumnKey, Ticket[]> {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Record<string, unknown>;
  const next = cloneColumns(fallback);
  for (const key of COLUMN_KEYS) {
    const items = candidate[key];
    if (Array.isArray(items)) {
      next[key] = items as Ticket[];
    }
  }
  return next;
}

function normalizeIssueTypes(raw: unknown): IssueTypeConfig[] {
  if (!Array.isArray(raw)) return [];
  const builtinIds = new Set(DEFAULT_ISSUE_TYPES.map((t) => t.id));
  return raw.filter((item): item is IssueTypeConfig => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as IssueTypeConfig;
    if (!candidate.id || !candidate.label || !candidate.badge || !candidate.accent) {
      return false;
    }
    return !builtinIds.has(candidate.id);
  });
}

function normalizeWorkflowLabels(
  raw: unknown,
  fallback: Record<ColumnKey, string>,
): Record<ColumnKey, string> {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Record<string, unknown>;
  const next = { ...fallback };
  for (const key of COLUMN_KEYS) {
    const label = candidate[key];
    if (typeof label === "string" && label.trim()) {
      next[key] = label.trim();
    }
  }
  return next;
}

function normalizeWorkflowByType(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const candidate = raw as Record<string, unknown>;
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim();
    }
  }
  return next;
}

function normalizeWorkflowCustomByType(
  raw: unknown,
): Record<string, Record<ColumnKey, string>> {
  if (!raw || typeof raw !== "object") return {};
  const candidate = raw as Record<string, unknown>;
  const next: Record<string, Record<ColumnKey, string>> = {};
  for (const [type, labels] of Object.entries(candidate)) {
    if (!labels || typeof labels !== "object") continue;
    next[type] = normalizeWorkflowLabels(labels, DEFAULT_WORKFLOW_LABELS);
  }
  return next;
}

function normalizeTransitionRules(
  raw: unknown,
  fallback: Record<ColumnKey, ColumnKey[]>,
): Record<ColumnKey, ColumnKey[]> {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Record<string, unknown>;
  const next = { ...fallback };
  for (const key of COLUMN_KEYS) {
    const value = candidate[key];
    if (!Array.isArray(value)) continue;
    const allowed = value.filter((item) =>
      COLUMN_KEYS.includes(item as ColumnKey),
    ) as ColumnKey[];
    next[key] = allowed.length ? allowed : fallback[key];
  }
  return next;
}

function normalizeRequiredFields(
  raw: unknown,
  fallback: Record<ColumnKey, RequiredFieldKey[]>,
): Record<ColumnKey, RequiredFieldKey[]> {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Record<string, unknown>;
  const next = { ...fallback };
  const valid = new Set(REQUIRED_FIELD_OPTIONS);
  for (const key of COLUMN_KEYS) {
    const value = candidate[key];
    if (!Array.isArray(value)) continue;
    next[key] = value.filter((item) =>
      valid.has(item as RequiredFieldKey),
    ) as RequiredFieldKey[];
  }
  return next;
}

function normalizeRoutingByType(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const candidate = raw as Record<string, unknown>;
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim();
    }
  }
  return next;
}

function normalizeAutoAssignRules(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const candidate = raw as Record<string, unknown>;
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim();
    }
  }
  return next;
}

function normalizeEscalationRules(
  raw: unknown,
  fallback: EscalationRules,
): EscalationRules {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Partial<EscalationRules>;
  return {
    enabled: Boolean(candidate.enabled ?? fallback.enabled),
    overdueDays:
      typeof candidate.overdueDays === "number"
        ? candidate.overdueDays
        : fallback.overdueDays,
    priority:
      typeof candidate.priority === "string" && candidate.priority.trim()
        ? candidate.priority.trim()
        : fallback.priority,
  };
}

function normalizePriorityOptions(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return fallback;
  const next = raw
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return next.length ? next : fallback;
}

function normalizeDepartments(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return fallback;
  const next = raw
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return next.length ? next : fallback;
}

function normalizeArchived(raw: unknown): Ticket[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => item && typeof item === "object") as Ticket[];
}

function getCurrentAdminMember(): TeamMember | null {
  const claims = getAdminClaims() as Record<string, unknown>;
  const email = normalizeEmail(String(claims.email || ""));
  if (!email) return null;

  const given = String(claims.given_name || "").trim();
  const family = String(claims.family_name || "").trim();
  const nameClaim = String(claims.name || "").trim();
  const preferred = String(claims.preferred_username || "").trim();
  const localPart = email.split("@")[0] || "";
  const fallback = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const name =
    [given, family].filter(Boolean).join(" ") ||
    nameClaim ||
    preferred ||
    fallback;

  if (!name) return null;
  return { id: email, email, name };
}

function buildDefaultBoardState(
  teamName: string,
  adminMember: TeamMember | null,
): BoardState {
  const isDefault = normalizeTeamName(teamName) === DEFAULT_TEAM;
  const teamMembers = isDefault
    ? mergeTeamMembers(DEFAULT_TEAM_MEMBERS, adminMember ? [adminMember] : [])
    : [];
  return {
    columns: isDefault ? cloneColumns(DEFAULT_COLUMNS) : buildEmptyColumns(),
    backlog: isDefault ? cloneBacklog(DEFAULT_BACKLOG_ITEMS) : [],
    issueTypes: [],
    teamMembers,
    onCallUserId: teamMembers[0]?.id || "",
    onCallUpdatedAt: "",
    activeSprint: DEFAULT_SPRINTS[0] || "",
    workflowLabels: { ...DEFAULT_WORKFLOW_LABELS },
    workflowByType: {},
    workflowCustomByType: {},
    transitionRules: { ...DEFAULT_TRANSITIONS },
    requiredFields: { ...DEFAULT_REQUIRED_FIELDS },
    priorityOptions: [...DEFAULT_PRIORITIES],
    departments: [...DEFAULT_DEPARTMENTS],
    routingByType: {},
    autoAssignRules: {},
    escalationRules: { ...DEFAULT_ESCALATION_RULES },
    archived: [],
  };
}

function TypeBadge({
  type,
  issueTypeMap,
}: {
  type: TicketType;
  issueTypeMap: Record<string, IssueTypeConfig>;
}) {
  const s = resolveIssueType(type, issueTypeMap);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.badge}`}
    >
      <span aria-hidden="true">{s.icon}</span>
      {s.label}
    </span>
  );
}

function PriorityBadge({
  priority,
  options,
}: {
  priority?: Priority;
  options: string[];
}) {
  const s = resolvePriorityStyle(priority, options);
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.badge}`}
    >
      {s.label}
    </span>
  );
}

export default function Backlog() {
  const location = useLocation();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    () => !!getValidCognitoIdToken(),
  );
  const adminMember = useMemo(() => getCurrentAdminMember(), [isSignedIn]);
  const adminMemberId = adminMember?.id || "";
  const adminInitials = useMemo(() => {
    if (!adminMember?.name) return "U";
    const parts = adminMember.name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = parts.length > 1 ? parts[1]?.[0] || "" : "";
    return `${first}${second}`.toUpperCase() || "U";
  }, [adminMember?.name]);
  const inDemoNamespace = location.pathname.startsWith("/demo/");
  const appPath = (slug: string) =>
    inDemoNamespace ? `/demo/${slug}` : `/${slug}`;
  const initialTeam = (() => {
    try {
      return window.localStorage.getItem(MY_TEAM_STORAGE_KEY) || DEFAULT_TEAM;
    } catch {
      return DEFAULT_TEAM;
    }
  })();
  const initialBoard = buildDefaultBoardState(initialTeam, adminMember);

  const [myTeam] = useState<string>(initialTeam);
  const [columns, setColumns] = useState<Record<ColumnKey, Ticket[]>>(
    initialBoard.columns,
  );
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(
    initialBoard.backlog,
  );
  const [customIssueTypes, setCustomIssueTypes] = useState<IssueTypeConfig[]>(
    initialBoard.issueTypes,
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    initialBoard.teamMembers,
  );
  const [onCallUserId, setOnCallUserId] = useState<string>(
    initialBoard.onCallUserId,
  );
  const [onCallUpdatedAt, setOnCallUpdatedAt] = useState<string>(
    initialBoard.onCallUpdatedAt,
  );
  const [activeSprint, setActiveSprint] = useState(initialBoard.activeSprint);
  const [workflowLabels, setWorkflowLabels] = useState<Record<ColumnKey, string>>(
    initialBoard.workflowLabels,
  );
  const [workflowByType, setWorkflowByType] = useState<Record<string, string>>(
    initialBoard.workflowByType,
  );
  const [workflowCustomByType, setWorkflowCustomByType] = useState<
    Record<string, Record<ColumnKey, string>>
  >(initialBoard.workflowCustomByType);
  const [transitionRules, setTransitionRules] = useState<
    Record<ColumnKey, ColumnKey[]>
  >(initialBoard.transitionRules);
  const [requiredFields, setRequiredFields] = useState<
    Record<ColumnKey, RequiredFieldKey[]>
  >(initialBoard.requiredFields);
  const [priorityOptions, setPriorityOptions] = useState<string[]>(
    initialBoard.priorityOptions,
  );
  const [departments, setDepartments] = useState<string[]>(
    initialBoard.departments,
  );
  const [routingByType, setRoutingByType] = useState<Record<string, string>>(
    initialBoard.routingByType,
  );
  const [autoAssignRules, setAutoAssignRules] = useState<Record<string, string>>(
    initialBoard.autoAssignRules,
  );
  const [escalationRules, setEscalationRules] = useState<EscalationRules>(
    initialBoard.escalationRules,
  );
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>(
    initialBoard.archived,
  );
  const [toast, setToast] = useState<{
    message: string;
    kind: "info" | "success" | "error";
  } | null>(null);
  const [isBoardLoaded, setIsBoardLoaded] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  const issueTypeMap = useMemo(
    () => buildIssueTypeMap(customIssueTypes),
    [customIssueTypes],
  );

  const backlogCountByType = useMemo(() => {
    return backlogItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  }, [backlogItems]);

  useEffect(() => {
    const syncAuth = () => setIsSignedIn(!!getValidCognitoIdToken());
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) return;
    window.location.assign(buildDemoLoginUrl());
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const team = normalizeTeamName(myTeam);
    if (!team) return;
    let cancelled = false;

    async function loadBoard() {
      setIsLoadingBoard(true);
      setIsBoardLoaded(false);
      const token = getValidCognitoIdToken();
      if (!token) {
        setIsLoadingBoard(false);
        return;
      }
      try {
        const params = new URLSearchParams({ board: BOARD_ID, team });
        const res = await fetch(
          `${API_BASE}/admin/command?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const payload = (await res.json()) as {
          ok?: boolean;
          data?: { state?: BoardState | null };
          error?: string;
        };
        if (!res.ok) {
          throw new Error(payload.error || `Request failed (${res.status})`);
        }
        if (cancelled) return;
        const fallback = buildDefaultBoardState(team, adminMember);
        const rawState = payload.data?.state ?? null;
        const nextColumns = rawState?.columns
          ? normalizeColumns(rawState.columns, fallback.columns)
          : fallback.columns;
        const nextBacklog = Array.isArray(rawState?.backlog)
          ? (rawState?.backlog as BacklogItem[])
          : fallback.backlog;
        const nextIssueTypes = normalizeIssueTypes(rawState?.issueTypes);
        const nextTeamMembers = normalizeTeamMembers(rawState?.teamMembers);
        const resolvedTeamMembers =
          nextTeamMembers.length > 0 ? nextTeamMembers : fallback.teamMembers;
        const nextWorkflowLabels = normalizeWorkflowLabels(
          rawState?.workflowLabels,
          fallback.workflowLabels,
        );
        const nextWorkflowByType = normalizeWorkflowByType(
          rawState?.workflowByType,
        );
        const nextWorkflowCustomByType = normalizeWorkflowCustomByType(
          rawState?.workflowCustomByType,
        );
        const nextTransitionRules = normalizeTransitionRules(
          rawState?.transitionRules,
          fallback.transitionRules,
        );
        const nextRequiredFields = normalizeRequiredFields(
          rawState?.requiredFields,
          fallback.requiredFields,
        );
        const nextPriorityOptions = normalizePriorityOptions(
          rawState?.priorityOptions,
          fallback.priorityOptions,
        );
        const nextDepartments = normalizeDepartments(
          rawState?.departments,
          fallback.departments,
        );
        const nextRoutingByType = normalizeRoutingByType(rawState?.routingByType);
        const nextAutoAssignRules = normalizeAutoAssignRules(
          rawState?.autoAssignRules,
        );
        const nextEscalationRules = normalizeEscalationRules(
          rawState?.escalationRules,
          fallback.escalationRules,
        );
        const nextArchived = normalizeArchived(rawState?.archived);
        let nextOnCallUserId = normalizeEmail(
          String(rawState?.onCallUserId || ""),
        );
        if (
          !resolvedTeamMembers.some((member) => member.id === nextOnCallUserId)
        ) {
          nextOnCallUserId = resolvedTeamMembers[0]?.id || "";
        }
        setColumns(nextColumns);
        setBacklogItems(nextBacklog);
        setCustomIssueTypes(nextIssueTypes);
        setTeamMembers(resolvedTeamMembers);
        setOnCallUserId(nextOnCallUserId);
        setOnCallUpdatedAt(String(rawState?.onCallUpdatedAt || ""));
        setActiveSprint(
          String(rawState?.activeSprint || fallback.activeSprint || ""),
        );
        setWorkflowLabels(nextWorkflowLabels);
        setWorkflowByType(nextWorkflowByType);
        setWorkflowCustomByType(nextWorkflowCustomByType);
        setTransitionRules(nextTransitionRules);
        setRequiredFields(nextRequiredFields);
        setPriorityOptions(nextPriorityOptions);
        setDepartments(nextDepartments);
        setRoutingByType(nextRoutingByType);
        setAutoAssignRules(nextAutoAssignRules);
        setEscalationRules(nextEscalationRules);
        setArchivedTickets(nextArchived);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        showToast(`Failed to load board: ${message}`, "error");
        const fallback = buildDefaultBoardState(team, adminMember);
        setColumns(fallback.columns);
        setBacklogItems(fallback.backlog);
        setCustomIssueTypes(fallback.issueTypes);
        setTeamMembers(fallback.teamMembers);
        setOnCallUserId(fallback.onCallUserId);
        setOnCallUpdatedAt(fallback.onCallUpdatedAt);
        setActiveSprint(fallback.activeSprint);
        setWorkflowLabels(fallback.workflowLabels);
        setWorkflowByType(fallback.workflowByType);
        setWorkflowCustomByType(fallback.workflowCustomByType);
        setTransitionRules(fallback.transitionRules);
        setRequiredFields(fallback.requiredFields);
        setPriorityOptions(fallback.priorityOptions);
        setDepartments(fallback.departments);
        setRoutingByType(fallback.routingByType);
        setAutoAssignRules(fallback.autoAssignRules);
        setEscalationRules(fallback.escalationRules);
        setArchivedTickets(fallback.archived);
      } finally {
        if (!cancelled) {
          setIsLoadingBoard(false);
          setIsBoardLoaded(true);
        }
      }
    }

    void loadBoard();
    return () => {
      cancelled = true;
    };
  }, [adminMemberId, isSignedIn, myTeam]);

  useEffect(() => {
    if (!teamMembers.length) {
      if (onCallUserId) setOnCallUserId("");
      if (onCallUpdatedAt) setOnCallUpdatedAt("");
      return;
    }
    if (
      onCallUserId &&
      teamMembers.some((member) => member.id === onCallUserId)
    ) {
      return;
    }
    setOnCallUserId(teamMembers[0].id);
  }, [onCallUpdatedAt, onCallUserId, teamMembers]);

  useEffect(() => {
    if (!isBoardLoaded || isLoadingBoard) return;
    const team = normalizeTeamName(myTeam);
    if (!team) return;
    const token = getValidCognitoIdToken();
    if (!token) return;

    const state: BoardState = {
      columns,
      backlog: backlogItems,
      issueTypes: customIssueTypes,
      teamMembers,
      onCallUserId,
      onCallUpdatedAt,
      activeSprint,
      workflowLabels,
      workflowByType,
      workflowCustomByType,
      transitionRules,
      requiredFields,
      priorityOptions,
      departments,
      routingByType,
      autoAssignRules,
      escalationRules,
      archived: archivedTickets,
    };

    const handle = window.setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/admin/command`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            boardId: BOARD_ID,
            teamId: team,
            state,
          }),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        showToast(`Failed to save board: ${message}`, "error");
      }
    }, 800);

    return () => window.clearTimeout(handle);
  }, [
    activeSprint,
    backlogItems,
    columns,
    customIssueTypes,
    departments,
    escalationRules,
    isBoardLoaded,
    isLoadingBoard,
    myTeam,
    onCallUpdatedAt,
    onCallUserId,
    priorityOptions,
    archivedTickets,
    requiredFields,
    routingByType,
    autoAssignRules,
    teamMembers,
    transitionRules,
    workflowByType,
    workflowCustomByType,
    workflowLabels,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MY_TEAM_STORAGE_KEY, myTeam);
    } catch {
      // ignore
    }
  }, [myTeam]);

  function showToast(
    message: string,
    kind: "info" | "success" | "error" = "info",
    ms = 4000,
  ) {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), ms);
  }

  function promoteToTodo(item: BacklogItem) {
    const ticket: Ticket = {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      assignee: "",
      assigneeEmail: undefined,
      epicId: item.epicId,
      parentId: item.parentId,
      department: item.department,
      dueDate: item.dueDate,
      requesterName: item.requesterName,
      requesterEmail: item.requesterEmail,
      visibility: item.visibility,
      location: item.location,
      constituent: item.constituent,
      evidence: item.evidence,
      internalNotes: item.internalNotes,
      watchers: item.watchers,
      source: item.source,
      approvalRequired: item.approvalRequired,
      approvalStatus: item.approvalStatus,
      dependencies: item.dependencies,
      possibleDuplicateIds: item.possibleDuplicateIds,
      aiDuplicateIds: item.aiDuplicateIds,
      duplicateCheckedAt: item.duplicateCheckedAt,
      aiSummary: item.aiSummary,
      aiClassification: item.aiClassification,
      aiClassificationConfidence: item.aiClassificationConfidence,
      aiSuggestedDepartment: item.aiSuggestedDepartment,
      aiSuggestedPriority: item.aiSuggestedPriority,
      aiSuggestedResponse: item.aiSuggestedResponse,
      aiTriageNotes: item.aiTriageNotes,
      aiTriageAt: item.aiTriageAt,
      serviceTemplate: item.serviceTemplate,
      skipGitHub: false,
      createdAt: item.createdAt,
      sprintId: item.sprintId,
      priority: item.priority,
      customFields: item.customFields,
      metadata: item.metadata,
      attachments: item.attachments,
      links: item.links,
      subtasks: item.subtasks,
      labels: item.labels,
      auditLog: item.auditLog,
    };

    setColumns((prev) => ({
      ...prev,
      todo: [ticket, ...prev.todo],
    }));
    setBacklogItems((prev) => prev.filter((entry) => entry.id !== item.id));
    showToast(`Promoted ${item.id} to To Do.`, "success");
  }

  function updateBacklogSprint(itemId: string, sprintId: string) {
    setBacklogItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, sprintId: sprintId || undefined } : item,
      ),
    );
  }

  function updateBacklogPriority(itemId: string, priority: Priority) {
    setBacklogItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, priority } : item,
      ),
    );
  }

  const toastColors = {
    info: "bg-teal-600 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-2xl border border-teal-200 bg-white p-6 shadow">
            <h1 className="text-2xl font-bold text-teal-800">Backlog</h1>
            <p className="mt-2 text-sm text-gray-600">Redirecting to sign-in...</p>
            <a
              href={buildDemoLoginUrl()}
              className="mt-4 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-board min-h-screen relative py-16">
      <style>{`
        .ticket-board {
          --admin-bg: linear-gradient(135deg, #F5F3FF 0%, #F8F7FF 55%, #F1F0FF 100%);
          --admin-card: #FFFFFF;
          --admin-border: #E2DDF3;
          --admin-text: #1C1B29;
          --admin-text-muted: #5D5A72;
          --admin-accent: #6D28D9;
          --admin-accent-soft: #EDE9FE;
          font-weight: 600;
          background: var(--admin-bg) !important;
          color: var(--admin-text) !important;
        }

        .ticket-board .bg-gray-50,
        .ticket-board .bg-white {
          background-color: var(--admin-card) !important;
        }

        .ticket-board .bg-teal-50,
        .ticket-board .bg-teal-100 {
          background-color: var(--admin-accent-soft) !important;
        }

        .ticket-board .border,
        .ticket-board .border-teal-200,
        .ticket-board .border-teal-100,
        .ticket-board .border-gray-200 {
          border-color: var(--admin-border) !important;
        }

        .ticket-board .text-gray-900,
        .ticket-board .text-gray-700,
        .ticket-board .text-gray-600 {
          color: var(--admin-text) !important;
        }

        .ticket-board .text-gray-500,
        .ticket-board .text-gray-400 {
          color: var(--admin-text-muted) !important;
        }

        .ticket-board .text-teal-900,
        .ticket-board .text-teal-800,
        .ticket-board .text-teal-700,
        .ticket-board .text-indigo-700 {
          color: var(--admin-accent) !important;
        }

        .ticket-board .bg-teal-600 {
          background-color: var(--admin-accent) !important;
        }

        .ticket-board input,
        .ticket-board textarea,
        .ticket-board select {
          background: var(--admin-card) !important;
          color: var(--admin-text) !important;
          border-color: var(--admin-border) !important;
        }
      `}</style>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${toastColors[toast.kind]}`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow sm:p-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-extrabold text-teal-800 sm:text-5xl">
                PrimIQ Backlog
              </h1>
              <div className="flex items-center gap-3">
                <Link
                  to={appPath("command")}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Back to PrimIQ Board
                </Link>
                <Link
                  to={appPath("documents")}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Documents
                </Link>
                <div
                  title={adminMember?.email || "Signed-in user"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white"
                >
                  {adminInitials}
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Review backlog work items, assign upcoming sprints, and promote
              them into the active To Do column when they are ready to be
              scheduled.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <h3 className="text-lg font-bold text-teal-800">Backlog Summary</h3>
              <p className="mt-1 text-sm text-gray-500">
                {backlogItems.length} items waiting for sprint planning.
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {Object.entries(backlogCountByType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <span className="capitalize">
                      {resolveIssueType(type, issueTypeMap).label}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow lg:col-span-2">
              <h3 className="text-lg font-bold text-teal-800">Planning Notes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Use sprint assignments to line up work for upcoming releases.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DEFAULT_SPRINTS.map((sprint) => (
                  <span
                    key={sprint}
                    className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700"
                  >
                    {sprint}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {backlogItems.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow">
                No backlog items. Add new work from the board or planning notes.
              </div>
            ) : (
              backlogItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <TypeBadge type={item.type} issueTypeMap={issueTypeMap} />
                        <PriorityBadge priority={item.priority} options={priorityOptions} />
                        <span className="text-xs font-mono text-gray-400">
                          {item.id}
                        </span>
                      </div>
                      <h4 className="mt-2 text-lg font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        Created: {item.createdAt}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => promoteToTodo(item)}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        Promote to To Do
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Sprint
                      </label>
                      <select
                        value={item.sprintId || ""}
                        onChange={(e) => updateBacklogSprint(item.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                      >
                        <option value="">No sprint</option>
                        {DEFAULT_SPRINTS.map((sprint) => (
                          <option key={sprint} value={sprint}>
                            {sprint}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Priority
                      </label>
                      <select
                        value={item.priority || "Medium"}
                        onChange={(e) => updateBacklogPriority(item.id, e.target.value as Priority)}
                        className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                      >
                        {priorityOptions.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {(item.customFields && Object.keys(item.customFields).length > 0) && (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Custom Fields</p>
                      <dl className="mt-2 space-y-1">
                        {Object.entries(item.customFields).map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-3">
                            <dt className="text-gray-500">{key}</dt>
                            <dd className="font-semibold text-gray-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                  {(item.metadata && Object.keys(item.metadata).length > 0) && (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Metadata</p>
                      <dl className="mt-2 space-y-1">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-3">
                            <dt className="text-gray-500">{key}</dt>
                            <dd className="font-semibold text-gray-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
