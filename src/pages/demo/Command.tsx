import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminClaims } from "../../lib/adminAuth";
import { getValidCognitoIdToken } from "../../lib/cognitoSession";
import { buildDemoLoginUrl } from "../../lib/demoAuth";
import boardLogo from "../../assets/primIQ-board-logo.svg";
import CommandSidebar, { type CommandSavedItem } from "./CommandSidebar";
import {
  DEFAULT_BACKLOG_ITEMS,
  DEFAULT_COLUMNS,
  DEFAULT_SPRINTS,
  DEFAULT_PRIORITIES,
  DEFAULT_ISSUE_TYPES,
  BUILTIN_ISSUE_TYPES,
  CUSTOM_ISSUE_TYPE_PALETTE,
  COLUMN_KEYS,
  buildIssueTypeMap,
  resolveIssueType,
  normalizeIssueTypeId,
} from "./commandData";
import type {
  ColumnKey,
  Ticket,
  TicketType,
  Attachment,
  Subtask,
  LinkedIssue,
  Priority,
  IssueTypeConfig,
  BacklogItem,
} from "./commandData";

const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

const BOARD_ID = "shared-command-board";
const MY_TEAM_STORAGE_KEY = "primiq_command_my_team";
const DEFAULT_TEAM = "Operations";
const TEAM_OPTIONS = [
  "Operations",
  "Design",
  "Product",
  "QA",
  "DevOps",
  "Sales",
  "Support",
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface Column {
  key: ColumnKey;
  label: string;
  color: string;
  headerBg: string;
  badge: string;
}

interface BoardState {
  columns: Record<ColumnKey, Ticket[]>;
  backlog: BacklogItem[];
  issueTypes: IssueTypeConfig[];
  teamMembers: TeamMember[];
  onCallUserId: string;
  onCallUpdatedAt: string;
  activeSprint: string;
}

const COLUMNS: Column[] = [
  {
    key: "todo",
    label: "To Do",
    color: "border-gray-300",
    headerBg: "bg-gray-100 text-gray-700",
    badge: "bg-gray-200 text-gray-700",
  },
  {
    key: "inprogress",
    label: "In Progress",
    color: "border-teal-300",
    headerBg: "bg-teal-50 text-teal-800",
    badge: "bg-teal-100 text-teal-800",
  },
  {
    key: "agent",
    label: "Agent",
    color: "border-indigo-300",
    headerBg: "bg-indigo-50 text-indigo-800",
    badge: "bg-indigo-100 text-indigo-800",
  },
  {
    key: "blocked",
    label: "Blocked",
    color: "border-rose-300",
    headerBg: "bg-rose-50 text-rose-800",
    badge: "bg-rose-100 text-rose-800",
  },
  {
    key: "testing",
    label: "Testing",
    color: "border-amber-300",
    headerBg: "bg-amber-50 text-amber-800",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    key: "completed",
    label: "Completed",
    color: "border-emerald-300",
    headerBg: "bg-emerald-50 text-emerald-800",
    badge: "bg-emerald-100 text-emerald-800",
  },
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ava.thompson@primiq.ai",
    name: "Ava Thompson",
    email: "ava.thompson@primiq.ai",
  },
  {
    id: "miles.carter@primiq.ai",
    name: "Miles Carter",
    email: "miles.carter@primiq.ai",
  },
  {
    id: "priya.desai@primiq.ai",
    name: "Priya Desai",
    email: "priya.desai@primiq.ai",
  },
  {
    id: "leo.martinez@primiq.ai",
    name: "Leo Martinez",
    email: "leo.martinez@primiq.ai",
  },
  {
    id: "naomi.brooks@primiq.ai",
    name: "Naomi Brooks",
    email: "naomi.brooks@primiq.ai",
  },
  {
    id: "ethan.park@primiq.ai",
    name: "Ethan Park",
    email: "ethan.park@primiq.ai",
  },
  {
    id: "sofia.kim@primiq.ai",
    name: "Sofia Kim",
    email: "sofia.kim@primiq.ai",
  },
  {
    id: "caleb.rivera@primiq.ai",
    name: "Caleb Rivera",
    email: "caleb.rivera@primiq.ai",
  },
];

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; badge: string; accent: string }
> = {
  Highest: {
    label: "Highest",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    accent: "text-rose-700",
  },
  High: {
    label: "High",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "text-amber-700",
  },
  Medium: {
    label: "Medium",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    accent: "text-sky-700",
  },
  Low: {
    label: "Low",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-700",
  },
};

const INITIAL_TICKET_NUM = 8;

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
  const columns = isDefault
    ? cloneColumns(DEFAULT_COLUMNS)
    : buildEmptyColumns();
  const backlog = isDefault
    ? cloneBacklog(DEFAULT_BACKLOG_ITEMS)
    : [];
  const teamMembers = isDefault
    ? mergeTeamMembers(DEFAULT_TEAM_MEMBERS, adminMember ? [adminMember] : [])
    : [];
  const onCallUserId = teamMembers[0]?.id || "";
  return {
    columns,
    backlog,
    issueTypes: [],
    teamMembers,
    onCallUserId,
    onCallUpdatedAt: "",
    activeSprint: DEFAULT_SPRINTS[0] || "",
  };
}

function allTickets(columns: Record<ColumnKey, Ticket[]>): Ticket[] {
  return COLUMNS.flatMap((col) => columns[col.key]);
}

function getNextTicketNumber(columns: Record<ColumnKey, Ticket[]>): number {
  let max = INITIAL_TICKET_NUM - 1;
  for (const ticket of allTickets(columns)) {
    const match = ticket.id.match(/PV-(\d+)/);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return max + 1;
}

type FieldEntry = { key: string; value: string };
type AttachmentEntry = { name: string; url: string };
type LinkEntry = { label: string; url: string };
type SubtaskEntry = { title: string; done: boolean };

function toFieldEntries(fields?: Record<string, string>): FieldEntry[] {
  if (!fields) return [];
  return Object.entries(fields).map(([key, value]) => ({ key, value }));
}

function toFieldRecord(entries: FieldEntry[]): Record<string, string> | undefined {
  const record: Record<string, string> = {};
  for (const entry of entries) {
    const key = entry.key.trim();
    const value = entry.value.trim();
    if (!key || !value) continue;
    record[key] = value;
  }
  return Object.keys(record).length ? record : undefined;
}

function toAttachmentEntries(items?: Attachment[]): AttachmentEntry[] {
  if (!items) return [];
  return items.map((item) => ({ name: item.name || "", url: item.url || "" }));
}

function toAttachmentList(entries: AttachmentEntry[]): Attachment[] | undefined {
  const cleaned: Attachment[] = [];
  for (const entry of entries) {
    const url = entry.url.trim();
    const name = entry.name.trim() || url;
    if (!url) continue;
    cleaned.push({ name, url });
  }
  return cleaned.length ? cleaned : undefined;
}

function toLinkEntries(items?: LinkedIssue[]): LinkEntry[] {
  if (!items) return [];
  return items.map((item) => ({
    label: item.label || "",
    url: item.url || "",
  }));
}

function toLinkList(entries: LinkEntry[]): LinkedIssue[] | undefined {
  const cleaned: LinkedIssue[] = [];
  for (const entry of entries) {
    const url = entry.url.trim();
    const label = entry.label.trim() || url;
    if (!label) continue;
    cleaned.push({ label, url: url || undefined });
  }
  return cleaned.length ? cleaned : undefined;
}

function toSubtaskEntries(items?: Subtask[]): SubtaskEntry[] {
  if (!items) return [];
  return items.map((item) => ({
    title: item.title || "",
    done: Boolean(item.done),
  }));
}

function toSubtaskList(entries: SubtaskEntry[]): Subtask[] | undefined {
  const cleaned: Subtask[] = [];
  for (const entry of entries) {
    const title = entry.title.trim();
    if (!title) continue;
    cleaned.push({ title, done: Boolean(entry.done) });
  }
  return cleaned.length ? cleaned : undefined;
}

function parseLabels(input: string): string[] | undefined {
  const parts = input
    .split(/[,\n]/g)
    .map((part) => part.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(parts));
  return unique.length ? unique : undefined;
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@([\\w.-]+)/g) || [];
  return Array.from(new Set(matches.map((m) => m.slice(1))));
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

function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  const s = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.badge}`}
    >
      {s.label}
    </span>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  columnKey: ColumnKey;
  epicTitle?: string;
  childStoryCount: number;
  isCreatingGitHubIssue: boolean;
  sprintOptions: string[];
  issueTypeMap: Record<string, IssueTypeConfig>;
  onSprintChange: (ticketId: string, sprintId: string) => void;
  onMove: (ticketId: string, from: ColumnKey, to: ColumnKey) => void;
  onDragStart: (e: React.DragEvent, ticketId: string, from: ColumnKey) => void;
  onContextMenu: (
    e: React.MouseEvent,
    ticketId: string,
    columnKey: ColumnKey,
  ) => void;
  onSelect: (ticketId: string, columnKey: ColumnKey) => void;
}

function TicketCard({
  ticket,
  columnKey,
  epicTitle,
  childStoryCount,
  isCreatingGitHubIssue,
  sprintOptions,
  issueTypeMap,
  onSprintChange,
  onMove,
  onDragStart,
  onContextMenu,
  onSelect,
}: TicketCardProps) {
  const colIdx = COLUMNS.findIndex((c) => c.key === columnKey);
  const canMoveLeft = colIdx > 0;
  const canMoveRight = colIdx < COLUMNS.length - 1;
  const prevCol = canMoveLeft ? COLUMNS[colIdx - 1] : null;
  const nextCol = canMoveRight ? COLUMNS[colIdx + 1] : null;
  const subtaskTotal = ticket.subtasks?.length || 0;
  const subtaskDone = ticket.subtasks?.filter((item) => item.done).length || 0;
  const labelChips = ticket.labels || [];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id, columnKey)}
      onContextMenu={(e) => onContextMenu(e, ticket.id, columnKey)}
      className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <TypeBadge type={ticket.type} issueTypeMap={issueTypeMap} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <div className="flex items-center gap-1">
          <span className="shrink-0 text-[11px] font-mono text-gray-400">
            {ticket.id}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onContextMenu(e, ticket.id, columnKey); }}
            className="rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Ticket options"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        className="mt-1 w-full text-left text-sm font-semibold leading-snug text-gray-800 hover:text-teal-700 cursor-pointer"
        onClick={() => onSelect(ticket.id, columnKey)}
      >
        {ticket.title}
      </button>

      {ticket.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-gray-500">
          {ticket.description}
        </p>
      )}

      <div className="mt-2 space-y-1 text-[11px] text-gray-500">
        {ticket.type === "story" && epicTitle && (
          <p>
            Epic:{" "}
            <span className="font-semibold text-violet-700">{epicTitle}</span>
          </p>
        )}
        {ticket.type === "epic" && childStoryCount > 0 && (
          <p>
            Linked stories:{" "}
            <span className="font-semibold">{childStoryCount}</span>
          </p>
        )}
        {ticket.sprintId && (
          <p>
            Sprint:{" "}
            <span className="font-semibold text-sky-700">
              {ticket.sprintId}
            </span>
          </p>
        )}
        {ticket.comments && ticket.comments.length > 0 && (
          <p>
            Comments:{" "}
            <span className="font-semibold">{ticket.comments.length}</span>
          </p>
        )}
        {subtaskTotal > 0 && (
          <p>
            Subtasks:{" "}
            <span className="font-semibold">
              {subtaskDone}/{subtaskTotal}
            </span>
          </p>
        )}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <p>
            Attachments:{" "}
            <span className="font-semibold">{ticket.attachments.length}</span>
          </p>
        )}
        {ticket.links && ticket.links.length > 0 && (
          <p>
            Links: <span className="font-semibold">{ticket.links.length}</span>
          </p>
        )}
        <p className="truncate">
          {ticket.assignee || "Unassigned"}
          {ticket.assigneeEmail ? ` (${ticket.assigneeEmail})` : ""}
        </p>
      </div>

      {labelChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {labelChips.slice(0, 3).map((label, idx) => (
            <span
              key={`${label}-${idx}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
            >
              {label}
            </span>
          ))}
          {labelChips.length > 3 && (
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500">
              +{labelChips.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-2">
        <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Sprint
        </label>
        <select
          value={ticket.sprintId || ""}
          onChange={(e) => onSprintChange(ticket.id, e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 focus:border-teal-400 focus:outline-none"
        >
          <option value="">No sprint</option>
          {sprintOptions.map((sprint) => (
            <option key={sprint} value={sprint}>
              {sprint}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {ticket.githubIssueNumber ? (
          <a
            href={ticket.githubIssueUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-indigo-700 hover:underline"
          >
            GH-{ticket.githubIssueNumber}
          </a>
        ) : (
          <span className="text-[11px] text-gray-400">
            {isCreatingGitHubIssue
              ? "Creating GitHub issue..."
              : "No GitHub issue"}
          </span>
        )}
      </div>

      {ticket.skipGitHub && (
        <p className="mt-1 text-[11px] italic text-gray-400">
          GitHub issue skipped
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {canMoveLeft && prevCol && (
          <button
            type="button"
            onClick={() => onMove(ticket.id, columnKey, prevCol.key)}
            className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-200"
          >
            {"<-"} {prevCol.label}
          </button>
        )}
        {canMoveRight && nextCol && (
          <button
            type="button"
            onClick={() => onMove(ticket.id, columnKey, nextCol.key)}
            className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            {nextCol.label} {"->"}
          </button>
        )}
      </div>
    </div>
  );
}

interface TicketDetailModalProps {
  ticket: Ticket;
  epicTitle?: string;
  issueTypeMap: Record<string, IssueTypeConfig>;
  columnKey: ColumnKey;
  onClose: () => void;
  onEdit: () => void;
  onAddComment: (ticketId: string, text: string) => void;
  onCreateGitHubIssue: (ticket: Ticket) => void;
}

function TicketDetailModal({
  ticket,
  epicTitle,
  issueTypeMap,
  columnKey,
  onClose,
  onEdit,
  onAddComment,
  onCreateGitHubIssue,
}: TicketDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const comments = ticket.comments || [];
  const canCreateGitHubIssue =
    columnKey === "agent" && !ticket.githubIssueNumber && !ticket.skipGitHub;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-teal-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <TypeBadge type={ticket.type} issueTypeMap={issueTypeMap} />
            <PriorityBadge priority={ticket.priority} />
            <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {canCreateGitHubIssue && (
              <button
                type="button"
                onClick={() => onCreateGitHubIssue(ticket)}
                className="rounded-lg border border-teal-200 bg-white px-3 py-1 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                Create GitHub Issue
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-4 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
          {ticket.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assignee</p>
              <p className="mt-0.5 font-semibold text-gray-800">{ticket.assignee || "Unassigned"}</p>
              {ticket.assigneeEmail && <p className="text-xs text-gray-500">{ticket.assigneeEmail}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</p>
              <p className="mt-0.5 font-semibold text-gray-800">{ticket.createdAt}</p>
            </div>
            {ticket.priority && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</p>
                <p className={`mt-0.5 font-semibold ${PRIORITY_STYLES[ticket.priority].accent}`}>
                  {ticket.priority}
                </p>
              </div>
            )}
            {epicTitle && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Epic</p>
                <p className="mt-0.5 font-semibold text-violet-700">{epicTitle}</p>
              </div>
            )}
            {ticket.githubIssueNumber && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">GitHub Issue</p>
                {ticket.githubIssueUrl ? (
                  <a
                    href={ticket.githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 font-semibold text-indigo-700 hover:underline"
                  >
                    GH-{ticket.githubIssueNumber}
                  </a>
                ) : (
                  <p className="mt-0.5 font-semibold text-gray-800">
                    GH-{ticket.githubIssueNumber}
                  </p>
                )}
              </div>
            )}
          </div>
          {ticket.skipGitHub && (
            <p className="text-xs italic text-gray-400">GitHub issue creation skipped for this ticket.</p>
          )}

          {(ticket.customFields && Object.keys(ticket.customFields).length > 0) && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Custom Fields</p>
              <dl className="mt-2 space-y-1">
                {Object.entries(ticket.customFields).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="text-gray-800 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(ticket.metadata && Object.keys(ticket.metadata).length > 0) && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Metadata</p>
              <dl className="mt-2 space-y-1">
                {Object.entries(ticket.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="text-gray-800 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {ticket.labels && ticket.labels.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Labels</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ticket.labels.map((label, idx) => (
                  <span
                    key={`${label}-${idx}`}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attachments</p>
              <ul className="mt-2 space-y-1">
                {ticket.attachments.map((attachment, idx) => (
                  <li key={`${attachment.url}-${idx}`} className="text-sm">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-700 hover:underline"
                    >
                      {attachment.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ticket.links && ticket.links.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Linked Issues</p>
              <ul className="mt-2 space-y-1">
                {ticket.links.map((link, idx) => (
                  <li key={`${link.label}-${idx}`} className="text-sm">
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-indigo-700 hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ticket.subtasks && ticket.subtasks.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subtasks</p>
                <span className="text-xs text-gray-400">
                  {ticket.subtasks.filter((item) => item.done).length}/
                  {ticket.subtasks.length}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {ticket.subtasks.map((task, idx) => (
                  <li key={`${task.title}-${idx}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      disabled
                      readOnly
                      className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600"
                    />
                    <span
                      className={`text-sm ${task.done ? "text-gray-400 line-through" : "text-gray-700"}`}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Comments</p>
              <span className="text-xs text-gray-400">{comments.length}</span>
            </div>
            {comments.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No comments yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{comment.author}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {comment.text.split(/(@[\\w.-]+)/g).map((part, idx) =>
                        part.startsWith("@") ? (
                          <span key={idx} className="font-semibold text-indigo-700">
                            {part}
                          </span>
                        ) : (
                          <span key={idx}>{part}</span>
                        ),
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Add Comment
              </label>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={3}
                placeholder="Type a comment and @mention teammates..."
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-teal-400 focus:outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!commentDraft.trim()) return;
                    onAddComment(ticket.id, commentDraft);
                    setCommentDraft("");
                  }}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditTicketModalProps {
  ticket: Ticket;
  teamMembers: TeamMember[];
  epicOptions: Array<{ id: string; title: string }>;
  issueTypeOptions: IssueTypeConfig[];
  issueTypeMap: Record<string, IssueTypeConfig>;
  onClose: () => void;
  onSave: (
    ticketId: string,
    ticket: Omit<
      Ticket,
      "id" | "createdAt" | "githubIssueNumber" | "githubIssueUrl"
    >,
  ) => void;
}

function EditTicketModal({
  ticket,
  teamMembers,
  epicOptions,
  issueTypeOptions,
  issueTypeMap,
  onClose,
  onSave,
}: EditTicketModalProps) {
  const [type, setType] = useState<TicketType>(ticket.type);
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description || "");
  const [epicId, setEpicId] = useState(ticket.epicId || "");
  const [priority, setPriority] = useState<Priority>(ticket.priority || "Medium");
  const [customFields, setCustomFields] = useState<FieldEntry[]>(
    () => toFieldEntries(ticket.customFields),
  );
  const [metadataFields, setMetadataFields] = useState<FieldEntry[]>(
    () => toFieldEntries(ticket.metadata),
  );
  const [labelsInput, setLabelsInput] = useState(
    () => (ticket.labels || []).join(", "),
  );
  const [attachments, setAttachments] = useState<AttachmentEntry[]>(
    () => toAttachmentEntries(ticket.attachments),
  );
  const [links, setLinks] = useState<LinkEntry[]>(
    () => toLinkEntries(ticket.links),
  );
  const [subtasks, setSubtasks] = useState<SubtaskEntry[]>(
    () => toSubtaskEntries(ticket.subtasks),
  );
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeEmail || "");
  const [skipGitHub, setSkipGitHub] = useState(ticket.skipGitHub);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type !== "story") {
      setEpicId("");
    }
  }, [type]);

  const selectedAssignee =
    teamMembers.find((member) => member.id === assigneeId) || null;

  const isSaveDisabled = !title.trim() || (type === "story" && !epicId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaveDisabled) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    onSave(ticket.id, {
      type,
      title: cleanTitle,
      description: cleanDescription,
      assignee: selectedAssignee?.name || "",
      assigneeEmail: selectedAssignee?.email || undefined,
      epicId: type === "story" ? epicId : undefined,
      priority,
      customFields: toFieldRecord(customFields),
      metadata: toFieldRecord(metadataFields),
      labels: parseLabels(labelsInput),
      attachments: toAttachmentList(attachments),
      links: toLinkList(links),
      subtasks: toSubtaskList(subtasks),
      skipGitHub,
    });
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-teal-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4">
          <h2 className="text-xl font-bold text-teal-800">Edit Ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {issueTypeOptions.map((t) => {
                const style = resolveIssueType(t.id, issueTypeMap);
                return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    type === t.id
                      ? style.badge + " shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span aria-hidden="true">{style.icon}</span>{" "}
                  {style.label}
                </button>
              )})}
            </div>
          </div>

          <div>
            <label
              htmlFor="tb-edit-title"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="tb-edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="tb-edit-desc"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Description
            </label>
            <textarea
              id="tb-edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {type === "story" && (
            <div>
              <label
                htmlFor="tb-edit-epic"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Parent Epic <span className="text-rose-500">*</span>
              </label>
              <select
                id="tb-edit-epic"
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
              >
                <option value="">Select epic...</option>
                {epicOptions.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.id} - {epic.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="tb-edit-priority"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Priority
            </label>
            <select
              id="tb-edit-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            >
              {DEFAULT_PRIORITIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Custom Fields
              </label>
              <button
                type="button"
                onClick={() =>
                  setCustomFields((prev) => [...prev, { key: "", value: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add field
              </button>
            </div>
            {customFields.length === 0 ? (
              <p className="text-xs text-gray-500">No custom fields yet.</p>
            ) : (
              <div className="space-y-2">
                {customFields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, key: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Field name"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, value: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Value"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCustomFields((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Metadata
              </label>
              <button
                type="button"
                onClick={() =>
                  setMetadataFields((prev) => [...prev, { key: "", value: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add metadata
              </button>
            </div>
            {metadataFields.length === 0 ? (
              <p className="text-xs text-gray-500">No metadata yet.</p>
            ) : (
              <div className="space-y-2">
                {metadataFields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        setMetadataFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, key: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Metadata key"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        setMetadataFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, value: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Value"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMetadataFields((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="tb-labels"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Labels / Tags
            </label>
            <input
              id="tb-labels"
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="e.g. onboarding, api, urgent"
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Attachments
              </label>
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => [...prev, { name: "", url: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add attachment
              </button>
            </div>
            {attachments.length === 0 ? (
              <p className="text-xs text-gray-500">No attachments yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment, idx) => (
                  <div key={`${attachment.url}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={attachment.name}
                      onChange={(e) =>
                        setAttachments((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, name: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Attachment name"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={attachment.url}
                      onChange={(e) =>
                        setAttachments((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, url: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="https://..."
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Linked Issues
              </label>
              <button
                type="button"
                onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add link
              </button>
            </div>
            {links.length === 0 ? (
              <p className="text-xs text-gray-500">No linked issues yet.</p>
            ) : (
              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={`${link.label}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, label: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Ticket ID or title"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, url: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="https://... (optional)"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setLinks((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Subtasks
              </label>
              <button
                type="button"
                onClick={() =>
                  setSubtasks((prev) => [...prev, { title: "", done: false }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add subtask
              </button>
            </div>
            {subtasks.length === 0 ? (
              <p className="text-xs text-gray-500">No subtasks yet.</p>
            ) : (
              <div className="space-y-2">
                {subtasks.map((task, idx) => (
                  <div key={`${task.title}-${idx}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, done: e.target.checked } : entry,
                          ),
                        )
                      }
                      className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, title: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Subtask description"
                      className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSubtasks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="tb-edit-labels"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Labels / Tags
            </label>
            <input
              id="tb-edit-labels"
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="e.g. onboarding, api, urgent"
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Attachments
              </label>
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => [...prev, { name: "", url: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add attachment
              </button>
            </div>
            {attachments.length === 0 ? (
              <p className="text-xs text-gray-500">No attachments yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment, idx) => (
                  <div key={`${attachment.url}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={attachment.name}
                      onChange={(e) =>
                        setAttachments((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, name: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Attachment name"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={attachment.url}
                      onChange={(e) =>
                        setAttachments((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, url: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="https://..."
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Linked Issues
              </label>
              <button
                type="button"
                onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add link
              </button>
            </div>
            {links.length === 0 ? (
              <p className="text-xs text-gray-500">No linked issues yet.</p>
            ) : (
              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={`${link.label}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, label: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Ticket ID or title"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        setLinks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, url: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="https://... (optional)"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setLinks((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Subtasks
              </label>
              <button
                type="button"
                onClick={() =>
                  setSubtasks((prev) => [...prev, { title: "", done: false }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add subtask
              </button>
            </div>
            {subtasks.length === 0 ? (
              <p className="text-xs text-gray-500">No subtasks yet.</p>
            ) : (
              <div className="space-y-2">
                {subtasks.map((task, idx) => (
                  <div key={`${task.title}-${idx}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, done: e.target.checked } : entry,
                          ),
                        )
                      }
                      className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, title: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Subtask description"
                      className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSubtasks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="tb-edit-assignee"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Assign To
            </label>
            <select
              id="tb-edit-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={skipGitHub}
              onChange={(e) => setSkipGitHub(e.target.checked)}
              className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Do not create a GitHub issue for this ticket
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isSaveDisabled
                  ? "cursor-not-allowed bg-teal-300 text-teal-800/60"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NewTicketModalProps {
  onClose: () => void;
  onCreate: (
    ticket: Omit<
      Ticket,
      "id" | "createdAt" | "githubIssueNumber" | "githubIssueUrl"
    >,
  ) => void;
  teamMembers: TeamMember[];
  epicOptions: Array<{ id: string; title: string }>;
  issueTypeOptions: IssueTypeConfig[];
  issueTypeMap: Record<string, IssueTypeConfig>;
  defaultAssigneeId?: string;
}

function NewTicketModal({
  onClose,
  onCreate,
  teamMembers,
  epicOptions,
  issueTypeOptions,
  issueTypeMap,
  defaultAssigneeId,
}: NewTicketModalProps) {
  const [type, setType] = useState<TicketType>("ticket");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [epicId, setEpicId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [customFields, setCustomFields] = useState<FieldEntry[]>([]);
  const [metadataFields, setMetadataFields] = useState<FieldEntry[]>([]);
  const labelsInput = "";
  const attachments: AttachmentEntry[] = [];
  const links: LinkEntry[] = [];
  const subtasks: SubtaskEntry[] = [];
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [skipGitHub, setSkipGitHub] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!defaultAssigneeId) return;
    const member = teamMembers.find((user) => user.id === defaultAssigneeId);
    if (!member) return;
    setAssigneeId(member.id);
    setAssigneeQuery(member.name);
  }, [defaultAssigneeId, teamMembers]);

  useEffect(() => {
    if (type !== "story") {
      setEpicId("");
    }
  }, [type]);

  const filteredUsers = teamMembers.filter((user) => {
    const q = assigneeQuery.toLowerCase();
    if (!q) return false;
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const selectedAssignee =
    teamMembers.find((user) => user.id === assigneeId) || null;

  const isCreateDisabled = !title.trim() || (type === "story" && !epicId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCreateDisabled) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const fallbackAssignee = assigneeQuery.trim();

    onCreate({
      type,
      title: cleanTitle,
      description: cleanDescription,
      assignee: selectedAssignee?.name || fallbackAssignee,
      assigneeEmail: selectedAssignee?.email || undefined,
      epicId: type === "story" ? epicId : undefined,
      sprintId: sprintId || undefined,
      priority,
      customFields: toFieldRecord(customFields),
      metadata: toFieldRecord(metadataFields),
      labels: parseLabels(labelsInput),
      attachments: toAttachmentList(attachments),
      links: toLinkList(links),
      subtasks: toSubtaskList(subtasks),
      comments: [],
      skipGitHub,
    });
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-teal-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4">
          <h2 className="text-xl font-bold text-teal-800">Create Ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {issueTypeOptions.map((t) => {
                const style = resolveIssueType(t.id, issueTypeMap);
                return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    type === t.id
                      ? style.badge + " shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span aria-hidden="true">{style.icon}</span>{" "}
                  {style.label}
                </button>
              )})}
            </div>
          </div>

          <div>
            <label
              htmlFor="tb-title"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="tb-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Short summary of the work"
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="tb-desc"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Description
            </label>
            <textarea
              id="tb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what needs to be done..."
              className="w-full resize-none rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {type === "story" && (
            <div>
              <label
                htmlFor="tb-epic"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Parent Epic <span className="text-rose-500">*</span>
              </label>
              <select
                id="tb-epic"
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
              >
                <option value="">Select epic...</option>
                {epicOptions.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.id} - {epic.title}
                  </option>
                ))}
              </select>
              {epicOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Create an epic first, then attach stories to it.
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="tb-sprint"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Sprint
            </label>
            <select
              id="tb-sprint"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
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
            <label
              htmlFor="tb-priority"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Priority
            </label>
            <select
              id="tb-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
            >
              {DEFAULT_PRIORITIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Custom Fields
              </label>
              <button
                type="button"
                onClick={() =>
                  setCustomFields((prev) => [...prev, { key: "", value: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add field
              </button>
            </div>
            {customFields.length === 0 ? (
              <p className="text-xs text-gray-500">No custom fields yet.</p>
            ) : (
              <div className="space-y-2">
                {customFields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, key: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Field name"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, value: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Value"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCustomFields((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Metadata
              </label>
              <button
                type="button"
                onClick={() =>
                  setMetadataFields((prev) => [...prev, { key: "", value: "" }])
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Add metadata
              </button>
            </div>
            {metadataFields.length === 0 ? (
              <p className="text-xs text-gray-500">No metadata yet.</p>
            ) : (
              <div className="space-y-2">
                {metadataFields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="flex gap-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        setMetadataFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, key: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Metadata key"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        setMetadataFields((prev) =>
                          prev.map((entry, i) =>
                            i === idx ? { ...entry, value: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Value"
                      className="w-1/2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMetadataFields((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="tb-assignee"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Assign To
            </label>
            <input
              id="tb-assignee"
              type="text"
              value={assigneeQuery}
              onChange={(e) => {
                setAssigneeQuery(e.target.value);
                setAssigneeId("");
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Search team member..."
              className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
              autoComplete="off"
            />
            {showSuggestions && filteredUsers.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-teal-200 bg-white shadow-lg">
                {filteredUsers.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-teal-50 hover:text-teal-800"
                      onMouseDown={() => {
                        setAssigneeId(user.id);
                        setAssigneeQuery(user.name);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="block font-semibold">{user.name}</span>
                      <span className="block text-xs text-gray-500">
                        {user.email}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={skipGitHub}
              onChange={(e) => setSkipGitHub(e.target.checked)}
              className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Do not create a GitHub issue for this ticket
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreateDisabled}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isCreateDisabled
                  ? "cursor-not-allowed bg-teal-300 text-teal-800/60"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Command() {
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

  const [myTeam, setMyTeam] = useState<string>(initialTeam);
  const [columns, setColumns] =
    useState<Record<ColumnKey, Ticket[]>>(initialBoard.columns);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<{
    ticket: Ticket;
    columnKey: ColumnKey;
  } | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{
    ticket: Ticket;
    columnKey: ColumnKey;
  } | null>(null);
  const [ticketMenu, setTicketMenu] = useState<{
    x: number;
    y: number;
    ticketId: string;
    columnKey: ColumnKey;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    kind: "info" | "success" | "error";
  } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [creatingGitHubIssueIds, setCreatingGitHubIssueIds] = useState<
    Record<string, boolean>
  >({});
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(
    initialBoard.backlog,
  );
  const [activeSprint, setActiveSprint] = useState(initialBoard.activeSprint);
  const [customIssueTypes, setCustomIssueTypes] = useState<IssueTypeConfig[]>(
    initialBoard.issueTypes,
  );
  const [newIssueTypeLabel, setNewIssueTypeLabel] = useState("");
  const [newIssueTypeIcon, setNewIssueTypeIcon] = useState("");

  const issueTypeOptions = useMemo(
    () => [...DEFAULT_ISSUE_TYPES, ...customIssueTypes],
    [customIssueTypes],
  );
  const issueTypeMap = useMemo(
    () => buildIssueTypeMap(customIssueTypes),
    [customIssueTypes],
  );

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    initialBoard.teamMembers,
  );

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [editingUserName, setEditingUserName] = useState("");
  const [editingUserEmail, setEditingUserEmail] = useState("");
  const [onCallUserId, setOnCallUserId] = useState<string>(
    initialBoard.onCallUserId,
  );
  const [onCallUpdatedAt, setOnCallUpdatedAt] = useState<string>(
    initialBoard.onCallUpdatedAt,
  );
  const [isBoardLoaded, setIsBoardLoaded] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  const dragRef = useRef<{ ticketId: string; from: ColumnKey } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const ticketNumRef = useRef(getNextTicketNumber(columns));

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
    if (!ticketMenu) return;
    const closeMenu = () => setTicketMenu(null);
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", onEsc);
    };
  }, [ticketMenu]);

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
        ticketNumRef.current = getNextTicketNumber(nextColumns);
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
    isBoardLoaded,
    isLoadingBoard,
    myTeam,
    onCallUpdatedAt,
    onCallUserId,
    teamMembers,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MY_TEAM_STORAGE_KEY, myTeam);
    } catch {
      // ignore
    }
  }, [myTeam]);

  const defaultAssigneeId = adminMember?.id || "";

  const epicOptions = useMemo(() => {
    return allTickets(columns)
      .filter((ticket) => ticket.type === "epic")
      .map((ticket) => ({ id: ticket.id, title: ticket.title }));
  }, [columns]);

  const epicTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ticket of allTickets(columns)) {
      if (ticket.type === "epic") {
        map[ticket.id] = ticket.title;
      }
    }
    return map;
  }, [columns]);

  const storyCountByEpicId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ticket of allTickets(columns)) {
      if (ticket.type !== "story" || !ticket.epicId) continue;
      map[ticket.epicId] = (map[ticket.epicId] || 0) + 1;
    }
    return map;
  }, [columns]);

  const onCallMember =
    teamMembers.find((member) => member.id === onCallUserId) || null;

  const ticketStats = useMemo(() => {
    const flattened = allTickets(columns);
    const highPriority = flattened.filter(
      (ticket) => ticket.priority === "Highest" || ticket.priority === "High",
    ).length;
    return {
      total: flattened.length,
      highPriority,
      blocked: columns.blocked.length,
    };
  }, [columns]);

  const savedDashboards = useMemo<CommandSavedItem[]>(
    () => [
      {
        id: "command-overview",
        name: `${myTeam || "Team"} Command Overview`,
      },
      {
        id: "sprint-focus",
        name: `Sprint ${activeSprint || "Unassigned"} Focus`,
      },
      {
        id: "backlog-funnel",
        name: `Backlog Funnel (${backlogItems.length})`,
      },
    ],
    [activeSprint, backlogItems.length, myTeam],
  );

  const savedMonitors = useMemo<CommandSavedItem[]>(
    () => [
      { id: "site-health", name: "Site Health" },
      {
        id: "high-priority-queue",
        name: `High Priority Queue (${ticketStats.highPriority})`,
      },
      {
        id: "on-call-coverage",
        name: `On-Call Coverage (${onCallMember ? "Assigned" : "Unassigned"})`,
      },
    ],
    [onCallMember, ticketStats.highPriority],
  );

  const savedAlerts = useMemo<CommandSavedItem[]>(
    () => [
      {
        id: "agent-escalations",
        name: `Agent Escalations (${ticketStats.blocked})`,
      },
      { id: "slack-notifications", name: "Slack Notifications" },
      {
        id: "daily-digest",
        name: `Daily Digest (${ticketStats.total} tracked tickets)`,
      },
    ],
    [ticketStats.blocked, ticketStats.total],
  );

  function genId() {
    return `PV-${String(ticketNumRef.current++).padStart(3, "0")}`;
  }

  function showToast(
    message: string,
    kind: "info" | "success" | "error" = "info",
    ms = 4000,
  ) {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), ms);
  }

  function addIssueType() {
    const label = newIssueTypeLabel.trim();
    if (!label) {
      showToast("Enter an issue type name.", "error");
      return;
    }
    const id = normalizeIssueTypeId(label);
    if (!id) {
      showToast("Issue type name is invalid.", "error");
      return;
    }
    if (issueTypeMap[id]) {
      showToast("That issue type already exists.", "info");
      return;
    }
    const icon = (newIssueTypeIcon.trim() || label[0] || "C")
      .slice(0, 2)
      .toUpperCase();
    const palette =
      CUSTOM_ISSUE_TYPE_PALETTE[
        customIssueTypes.length % CUSTOM_ISSUE_TYPE_PALETTE.length
      ];
    const next: IssueTypeConfig = {
      id,
      label,
      icon,
      badge: palette.badge,
      accent: palette.accent,
    };
    setCustomIssueTypes((prev) => [...prev, next]);
    setNewIssueTypeLabel("");
    setNewIssueTypeIcon("");
    showToast(`Added issue type ${label}.`, "success");
  }

  function removeIssueType(id: string) {
    setCustomIssueTypes((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTicket(ticketId: string, updater: (ticket: Ticket) => Ticket) {
    setColumns((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ColumnKey[]).forEach((key) => {
        next[key] = next[key].map((ticket) =>
          ticket.id === ticketId ? updater(ticket) : ticket,
        );
      });
      return next;
    });
  }

  function addComment(ticketId: string, text: string) {
    const author = adminMember?.name || "Board User";
    const cleanText = text.trim();
    if (!cleanText) return;
    updateTicket(ticketId, (ticket) => ({
      ...ticket,
      comments: [
        ...(ticket.comments || []),
        {
          id: `${ticketId}-c-${Date.now()}`,
          author,
          text: cleanText,
          createdAt: new Date().toISOString(),
          mentions: extractMentions(cleanText),
        },
      ],
    }));
    showToast("Comment added.", "success");
  }

  function buildIssueBody(ticket: Ticket): string {
    const customFields =
      ticket.customFields && Object.keys(ticket.customFields).length
        ? Object.entries(ticket.customFields)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n")
        : "";
    const metadata =
      ticket.metadata && Object.keys(ticket.metadata).length
        ? Object.entries(ticket.metadata)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n")
        : "";
    const labels = ticket.labels && ticket.labels.length
      ? ticket.labels.map((label) => `- ${label}`).join("\n")
      : "";
    const attachments = ticket.attachments && ticket.attachments.length
      ? ticket.attachments
          .map((attachment) => `- ${attachment.name}: ${attachment.url}`)
          .join("\n")
      : "";
    const links = ticket.links && ticket.links.length
      ? ticket.links
          .map((link) =>
            link.url ? `- ${link.label}: ${link.url}` : `- ${link.label}`,
          )
          .join("\n")
      : "";
    const subtasks = ticket.subtasks && ticket.subtasks.length
      ? ticket.subtasks
          .map((task) => `- [${task.done ? "x" : " "}] ${task.title}`)
          .join("\n")
      : "";
    const lines = [
      `Ticket ID: ${ticket.id}`,
      `Type: ${ticket.type}`,
      ticket.priority ? `Priority: ${ticket.priority}` : "",
      `Assignee: ${ticket.assignee || "Unassigned"}`,
      ticket.assigneeEmail ? `Assignee email: ${ticket.assigneeEmail}` : "",
      ticket.epicId ? `Epic: ${ticket.epicId}` : "",
      ticket.sprintId ? `Sprint: ${ticket.sprintId}` : "",
      `Created at: ${ticket.createdAt}`,
      labels ? "Labels:" : "",
      labels,
      customFields ? "Custom Fields:" : "",
      customFields,
      metadata ? "Metadata:" : "",
      metadata,
      attachments ? "Attachments:" : "",
      attachments,
      links ? "Linked Issues:" : "",
      links,
      subtasks ? "Subtasks:" : "",
      subtasks,
      "",
      "Description:",
      ticket.description || "(no description provided)",
    ].filter(Boolean);
    return lines.join("\n");
  }

  async function createGitHubIssue(ticket: Ticket) {
    if (ticket.skipGitHub) {
      showToast(`Skipping GitHub issue for ${ticket.id} by request.`, "info");
      return;
    }

    setCreatingGitHubIssueIds((prev) => ({ ...prev, [ticket.id]: true }));
    try {
      const typeLabel = BUILTIN_ISSUE_TYPES.includes(
        ticket.type as (typeof BUILTIN_ISSUE_TYPES)[number],
      )
        ? ticket.type
        : undefined;
      const token = getValidCognitoIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const labelSet = Array.from(
        new Set(
          [
            "primiq",
            "kanban",
            "agent",
            ...(typeLabel ? [typeLabel] : []),
            ...(ticket.labels || []),
          ]
            .map((label) => label.trim())
            .filter(Boolean),
        ),
      );
      const res = await fetch(`${API_BASE}/admin/github/create-issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `[${ticket.id}] ${ticket.title}`,
          body: buildIssueBody(ticket),
          labels: labelSet,
          assignee_name: ticket.assignee || undefined,
          assignee_email: ticket.assigneeEmail || undefined,
          ticket_id: ticket.id,
          epic_id: ticket.epicId || undefined,
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        issue_number?: number;
        url?: string;
        error?: string;
      };
      if (!res.ok || payload.ok === false || !payload.issue_number) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      updateTicket(ticket.id, (existing) => ({
        ...existing,
        githubIssueNumber: payload.issue_number,
        githubIssueUrl: payload.url || existing.githubIssueUrl || "#",
      }));
      showToast(
        `GitHub issue GH-${payload.issue_number} created for ${ticket.id}.`,
        "success",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast(
        `Failed to create GitHub issue for ${ticket.id}: ${message}`,
        "error",
      );
    } finally {
      setCreatingGitHubIssueIds((prev) => {
        const next = { ...prev };
        delete next[ticket.id];
        return next;
      });
    }
  }

  function moveTicket(ticketId: string, from: ColumnKey, to: ColumnKey) {
    if (from === to) return;

    const ticket = columns[from].find((t) => t.id === ticketId);
    if (!ticket) return;

    setColumns((prev) => {
      const existing = prev[from].find((t) => t.id === ticketId);
      if (!existing) return prev;
      return {
        ...prev,
        [from]: prev[from].filter((t) => t.id !== ticketId),
        [to]: [...prev[to], existing],
      };
    });

    if (to === "agent" && ticket.skipGitHub) {
      showToast(
        `GitHub issue skipped for ${ticket.id}.`,
        "info",
      );
    }

    if (to === "agent" && !ticket.githubIssueNumber && !ticket.skipGitHub) {
      window.setTimeout(() => {
        void createGitHubIssue({ ...ticket });
      }, 100);
    }
  }

  function handleDragStart(
    e: React.DragEvent,
    ticketId: string,
    from: ColumnKey,
  ) {
    dragRef.current = { ticketId, from };
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, to: ColumnKey) {
    e.preventDefault();
    if (!dragRef.current) return;
    const { ticketId, from } = dragRef.current;
    dragRef.current = null;
    setDragOverCol(null);
    moveTicket(ticketId, from, to);
  }

  function addTicket(
    data: Omit<
      Ticket,
      "id" | "createdAt" | "githubIssueNumber" | "githubIssueUrl"
    >,
  ) {
    const fallbackMember =
      (data.assigneeEmail &&
        teamMembers.find((member) => member.email === data.assigneeEmail)) ||
      null;
    const adminFallback =
      adminMember && !data.assignee
        ? { assignee: adminMember.name, assigneeEmail: adminMember.email }
        : null;

    const ticket: Ticket = {
      ...data,
      assignee:
        data.assignee || fallbackMember?.name || adminFallback?.assignee || "",
      assigneeEmail:
        data.assigneeEmail ||
        fallbackMember?.email ||
        adminFallback?.assigneeEmail ||
        undefined,
      id: genId(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setColumns((prev) => ({
      ...prev,
      todo: [ticket, ...prev.todo],
    }));
    showToast(`Ticket ${ticket.id} created.`, "success");
  }

  function openTicketMenu(
    e: React.MouseEvent,
    ticketId: string,
    columnKey: ColumnKey,
  ) {
    e.preventDefault();
    setTicketMenu({ x: e.clientX, y: e.clientY, ticketId, columnKey });
  }

  function openTicketDetail(ticketId: string, columnKey: ColumnKey) {
    const ticket = columns[columnKey].find((item) => item.id === ticketId);
    if (!ticket) return;
    setSelectedTicket({ ticket: { ...ticket }, columnKey });
  }

  function openEditTicket(ticketId: string, columnKey: ColumnKey) {
    const ticket = columns[columnKey].find((item) => item.id === ticketId);
    if (!ticket) return;
    setEditingTicket({ ticket: { ...ticket }, columnKey });
  }

  function saveEditedTicket(
    ticketId: string,
    data: Omit<
      Ticket,
      "id" | "createdAt" | "githubIssueNumber" | "githubIssueUrl"
    >,
  ) {
    updateTicket(ticketId, (existing) => ({
      ...existing,
      ...data,
      epicId: data.type === "story" ? data.epicId : undefined,
    }));
    showToast(`Ticket ${ticketId} updated.`, "success");
  }

  function deleteTicket(ticketId: string, columnKey: ColumnKey) {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: prev[columnKey].filter((ticket) => ticket.id !== ticketId),
    }));
    showToast(`Ticket ${ticketId} deleted.`, "success");
  }

  function updateSprint(ticketId: string, sprintId: string) {
    updateTicket(ticketId, (ticket) => ({
      ...ticket,
      sprintId: sprintId || undefined,
    }));
  }

  function addManualTeamMember() {
    const name = newUserName.trim();
    const email = normalizeEmail(newUserEmail);
    if (!name) {
      showToast("Enter a user name.", "error");
      return;
    }
    if (!email || !email.includes("@")) {
      showToast("Enter a valid user email.", "error");
      return;
    }
    if (teamMembers.some((member) => member.email === email)) {
      showToast("That user already exists.", "info");
      return;
    }
    const member: TeamMember = { id: email, name, email };
    setTeamMembers((prev) => [...prev, member]);
    setNewUserName("");
    setNewUserEmail("");
    showToast(`Added team user ${name}.`, "success");
  }

  function assignOnCall() {
    if (!onCallUserId) return;
    const member = teamMembers.find((user) => user.id === onCallUserId);
    if (!member) return;
    const updatedAt = new Date().toISOString();
    setOnCallUpdatedAt(updatedAt);
    showToast(`${member.name} is now on-call.`, "success");
  }

  function startEditingMember(member: TeamMember) {
    setEditingUserId(member.id);
    setEditingUserName(member.name);
    setEditingUserEmail(member.email);
  }

  function cancelEditingMember() {
    setEditingUserId("");
    setEditingUserName("");
    setEditingUserEmail("");
  }

  function saveEditedMember() {
    if (!editingUserId) return;
    const name = editingUserName.trim();
    const email = normalizeEmail(editingUserEmail);

    if (!name) {
      showToast("Enter a user name.", "error");
      return;
    }
    if (!email || !email.includes("@")) {
      showToast("Enter a valid user email.", "error");
      return;
    }

    const current = teamMembers.find((member) => member.id === editingUserId);
    if (!current) {
      cancelEditingMember();
      return;
    }

    const hasDuplicate = teamMembers.some(
      (member) => member.id !== editingUserId && member.email === email,
    );
    if (hasDuplicate) {
      showToast("That user email already exists.", "error");
      return;
    }

    const updatedMember: TeamMember = { id: email, name, email };

    setTeamMembers((prev) =>
      prev.map((member) => (member.id === editingUserId ? updatedMember : member)),
    );

    setColumns((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ColumnKey[]).forEach((key) => {
        next[key] = next[key].map((ticket) =>
          ticket.assigneeEmail === current.email
            ? { ...ticket, assignee: name, assigneeEmail: email }
            : ticket,
        );
      });
      return next;
    });

    if (onCallUserId === current.id) {
      setOnCallUserId(updatedMember.id);
    }

    cancelEditingMember();
    showToast(`Updated team user ${name}.`, "success");
  }

  function deleteMember(memberId: string) {
    const member = teamMembers.find((candidate) => candidate.id === memberId);
    if (!member) return;
    const nextMembers = teamMembers.filter(
      (candidate) => candidate.id !== memberId,
    );
    if (nextMembers.length === 0) {
      showToast("At least one user is required.", "error");
      return;
    }

    setTeamMembers(nextMembers);

    setColumns((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ColumnKey[]).forEach((key) => {
        next[key] = next[key].map((ticket) =>
          ticket.assigneeEmail === member.email
            ? { ...ticket, assignee: "Unassigned", assigneeEmail: undefined }
            : ticket,
        );
      });
      return next;
    });

    if (onCallUserId === memberId) {
      const nextOnCall = nextMembers[0]?.id || "";
      setOnCallUserId(nextOnCall);
      if (!nextOnCall) {
        setOnCallUpdatedAt("");
      }
    }

    if (editingUserId === memberId) {
      cancelEditingMember();
    }

    showToast(`Deleted team user ${member.name}.`, "success");
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
            <h1 className="text-2xl font-bold text-teal-800">Ticket Board</h1>
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
    <div
      className={`ticket-board min-h-screen relative py-16 ${isDarkMode ? "admin-dark" : "admin-light"}`}
    >
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

        .ticket-board.admin-dark {
          --admin-bg: #0B1F2A;
          --admin-card: #102A43;
          --admin-border: #1F3D57;
          --admin-text: #E6EEF5;
          --admin-text-muted: #B8CAD8;
          --admin-accent: #0EA5A4;
          --admin-accent-soft: #0F3A4A;
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
        .ticket-board .border-gray-200,
        .ticket-board .border-teal-300,
        .ticket-board .border-indigo-300 {
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

        .tb-column {
          min-width: 260px;
          flex: 1 1 260px;
        }

        .tb-drop-active {
          outline: 2px dashed var(--admin-accent);
          outline-offset: 2px;
          border-radius: 1rem;
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

      {showNewModal && (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onCreate={addTicket}
          teamMembers={teamMembers}
          epicOptions={epicOptions}
          issueTypeOptions={issueTypeOptions}
          issueTypeMap={issueTypeMap}
          defaultAssigneeId={defaultAssigneeId}
        />
      )}

      {editingTicket && (
        <EditTicketModal
          ticket={editingTicket.ticket}
          teamMembers={teamMembers}
          epicOptions={epicOptions}
          issueTypeOptions={issueTypeOptions}
          issueTypeMap={issueTypeMap}
          onClose={() => setEditingTicket(null)}
          onSave={saveEditedTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket.ticket}
          epicTitle={selectedTicket.ticket.epicId ? epicTitleById[selectedTicket.ticket.epicId] : undefined}
          issueTypeMap={issueTypeMap}
          columnKey={selectedTicket.columnKey}
          onClose={() => setSelectedTicket(null)}
          onEdit={() => {
            setEditingTicket({ ticket: selectedTicket.ticket, columnKey: selectedTicket.columnKey });
            setSelectedTicket(null);
          }}
          onAddComment={addComment}
          onCreateGitHubIssue={createGitHubIssue}
        />
      )}

      {ticketMenu && (
        <div
          className="fixed z-50 min-w-[150px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
          style={{ left: ticketMenu.x, top: ticketMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-teal-50"
            onClick={() => {
              openEditTicket(ticketMenu.ticketId, ticketMenu.columnKey);
              setTicketMenu(null);
            }}
          >
            Edit Ticket
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
            onClick={() => {
              deleteTicket(ticketMenu.ticketId, ticketMenu.columnKey);
              setTicketMenu(null);
            }}
          >
            Delete Ticket
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-[1860px] gap-4 px-4 sm:px-6">
        <CommandSidebar
          teams={TEAM_OPTIONS}
          selectedTeam={myTeam || DEFAULT_TEAM}
          onTeamChange={setMyTeam}
          savedDashboards={savedDashboards}
          savedMonitors={savedMonitors}
          savedAlerts={savedAlerts}
        />

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1450px]">
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow sm:p-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-900 px-4 py-2 shadow-sm">
                  <img
                    src={boardLogo}
                    alt="PrimIQ Board"
                    className="h-8 w-auto sm:h-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={appPath("backlog")}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Backlog ({backlogItems.length})
                </Link>
                <Link
                  to={appPath("documents")}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Documents
                </Link>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                  aria-label="Create new ticket"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  New Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setIsDarkMode((d) => !d)}
                  className="rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <div
                  title={adminMember?.email || "Signed-in user"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white"
                >
                  {adminInitials}
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Plan sprints, attach stories to epics, and move backlog work into
              delivery. Moving a ticket into
              <strong className="text-teal-800"> Agent</strong> creates a GitHub
              issue.
            </p>
            {adminMember && (
              <p className="mt-2 text-sm text-gray-500">
                Signed in admin: {adminMember.name} ({adminMember.email})
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">My Team:</span>
                <select
                  value={myTeam}
                  onChange={(e) => setMyTeam(e.target.value)}
                  className="rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-teal-600 focus:outline-none"
                >
                  {TEAM_OPTIONS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </label>
              {myTeam && (
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                  Team: {myTeam}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {issueTypeOptions.map((t) => (
              <TypeBadge key={t.id} type={t.id} issueTypeMap={issueTypeMap} />
            ))}
            <span className="ml-1 text-xs text-gray-500">
              Drag cards between columns or use arrow buttons. Right-click a ticket to edit or delete.
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6">
            {COLUMNS.map((col) => {
              const tickets = columns[col.key];
              return (
                <div
                  key={col.key}
                  className={`tb-column rounded-2xl border ${col.color} ${
                    dragOverCol === col.key ? "tb-drop-active" : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(col.key);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  <div
                    className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${col.headerBg}`}
                  >
                    <h2 className="text-sm font-extrabold uppercase tracking-wide">
                      {col.label}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.badge}`}
                    >
                      {tickets.length}
                    </span>
                  </div>

                  <div className="px-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowNewModal(true)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-teal-300 py-2 text-xs font-semibold text-teal-600 transition hover:bg-teal-50"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                      Add ticket
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 p-3">
                    {tickets.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-400">
                        No tickets
                      </p>
                    ) : (
                      tickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          columnKey={col.key}
                          epicTitle={
                            ticket.epicId
                              ? epicTitleById[ticket.epicId]
                              : undefined
                          }
                          childStoryCount={storyCountByEpicId[ticket.id] || 0}
                          isCreatingGitHubIssue={Boolean(
                            creatingGitHubIssueIds[ticket.id],
                          )}
                          sprintOptions={DEFAULT_SPRINTS}
                          issueTypeMap={issueTypeMap}
                          onSprintChange={updateSprint}
                          onMove={moveTicket}
                          onDragStart={handleDragStart}
                          onContextMenu={openTicketMenu}
                          onSelect={openTicketDetail}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-6 mt-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            <strong>Note:</strong> When a ticket is moved into the <strong>Agent</strong> column, it will be automatically processed — a GitHub issue will be created and the work will be handled by the AI agent.
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <h3 className="text-lg font-bold text-teal-800">Issue Types</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add custom issue types and keep the board aligned to your workflow.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Type Name
                  </span>
                  <input
                    type="text"
                    value={newIssueTypeLabel}
                    onChange={(e) => setNewIssueTypeLabel(e.target.value)}
                    placeholder="Risk"
                    className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Icon
                  </span>
                  <input
                    type="text"
                    value={newIssueTypeIcon}
                    onChange={(e) => setNewIssueTypeIcon(e.target.value)}
                    placeholder="R"
                    className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addIssueType}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Add Issue Type
                </button>
                <span className="text-xs text-gray-500">
                  Icons are 1-2 letters.
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {issueTypeOptions.map((type) => {
                  const isCustom = !DEFAULT_ISSUE_TYPES.some((base) => base.id === type.id);
                  return (
                    <div
                      key={type.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <TypeBadge type={type.id} issueTypeMap={issueTypeMap} />
                        {!isCustom && (
                          <span className="text-xs text-gray-400">Built-in</span>
                        )}
                      </div>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => removeIssueType(type.id)}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <h3 className="text-lg font-bold text-teal-800">
                Sprint Planning
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Track active sprint focus and attach tickets to sprint goals.
              </p>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Active Sprint
                </label>
                <select
                  value={activeSprint}
                  onChange={(e) => setActiveSprint(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                >
                  {DEFAULT_SPRINTS.map((sprint) => (
                    <option key={sprint} value={sprint}>
                      {sprint}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-gray-600">
                <div className="flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                  <span>Tickets in sprint</span>
                  <span className="font-semibold text-teal-800">
                    {
                      allTickets(columns).filter(
                        (ticket) => ticket.sprintId === activeSprint,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <span>Backlog ready</span>
                  <span className="font-semibold">{backlogItems.length}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Use the sprint dropdown on each ticket to attach work to the
                active sprint.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <h3 className="text-lg font-bold text-teal-800">
                On-Call Rotation
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Assign who is on-call for board alerts and urgent follow-up.
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="min-w-[240px] flex-1">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    On-Call User
                  </span>
                  <select
                    value={onCallUserId}
                    onChange={(e) => setOnCallUserId(e.target.value)}
                    className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  >
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={assignOnCall}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Assign On-Call
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
                {onCallMember ? (
                  <>
                    <p className="font-semibold">
                      Current on-call: {onCallMember.name}
                    </p>
                    <p className="mt-1 text-xs text-teal-700">
                      Updated:{" "}
                      {onCallUpdatedAt
                        ? new Date(onCallUpdatedAt).toLocaleString()
                        : "Not set"}
                    </p>
                  </>
                ) : (
                  <p>No on-call user selected.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <h3 className="text-lg font-bold text-teal-800">Team Members</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add manual users for assignment in demo admin mode.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Name
                  </span>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Jordan Park"
                    className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Email
                  </span>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="jordan.park@paloverde.gov"
                    className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addManualTeamMember}
                  className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Add User
                </button>
              </div>
              <ul className="mt-4 max-h-44 space-y-2 overflow-auto pr-1 text-sm text-gray-700">
                {teamMembers.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  >
                    {editingUserId === member.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingUserName}
                          onChange={(e) => setEditingUserName(e.target.value)}
                          className="w-full rounded border border-teal-300 bg-white px-2 py-1 text-sm focus:border-teal-600 focus:outline-none"
                        />
                        <input
                          type="email"
                          value={editingUserEmail}
                          onChange={(e) => setEditingUserEmail(e.target.value)}
                          className="w-full rounded border border-teal-300 bg-white px-2 py-1 text-sm focus:border-teal-600 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEditedMember}
                            className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingMember}
                            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold">{member.name}</span>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingMember(member)}
                            className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMember(member.id)}
                            className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
