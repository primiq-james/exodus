import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Cloud,
  Database,
  FileText,
  GitBranch,
  Globe,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Lock,
  Monitor,
  Network,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  Plug,
  Search,
  Server,
  Shield,
  Users,
  Workflow,
} from "lucide-react";

export type CommandSavedItem = {
  id: string;
  name: string;
};

type IconType = React.ComponentType<{ className?: string }>;

type SidebarLeaf = {
  kind: "item";
  key: string;
  label: string;
  icon: IconType;
  tone?: "default" | "create";
  href?: string;
  external?: boolean;
};

type SidebarGroup = {
  kind: "group";
  key: string;
  label: string;
  icon: IconType;
  children: SidebarLeaf[];
};

type SidebarNode = SidebarLeaf | SidebarGroup;

type CommandSidebarProps = {
  teams: string[];
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  savedDashboards: CommandSavedItem[];
  savedMonitors: CommandSavedItem[];
  savedAlerts: CommandSavedItem[];
};

const SIDEBAR_PIN_KEY = "primiq_command_sidebar_pinned";
const SIDEBAR_COLLAPSED_KEY = "primiq_command_sidebar_collapsed";

function slug(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initials(value: string): string {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] || "";
  const second = words.length > 1 ? words[1]?.[0] || "" : "";
  return (first + second).toUpperCase() || "TM";
}

export default function CommandSidebar({
  teams,
  selectedTeam,
  onTeamChange,
  savedDashboards,
  savedMonitors,
  savedAlerts,
}: CommandSidebarProps) {
  const location = useLocation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_PIN_KEY) !== "false";
    } catch {
      return true;
    }
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isHovering, setIsHovering] = useState(false);
  const [activeKey, setActiveKey] = useState("infrastructure.lambda");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    infrastructure: true,
    dashboards: true,
    monitors: true,
    alerts: true,
    integrations: false,
    team: true,
    security: false,
  });
  const [flyout, setFlyout] = useState<{
    group: SidebarGroup;
    top: number;
  } | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_PIN_KEY, String(isPinned));
    } catch {
      // ignore
    }
  }, [isPinned]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const expanded = isPinned ? !isCollapsed : isHovering;
  const inDemoNamespace = location.pathname.startsWith("/demo/");
  const appPath = (slug: string) =>
    inDemoNamespace ? `/demo/${slug}` : `/${slug}`;
  const demoWebsiteHref = inDemoNamespace
    ? "/demo"
    : "https://demo.civiqguide.com";

  const menuTree = useMemo<SidebarNode[]>(() => {
    const dashboardItems: SidebarLeaf[] = [
      {
        kind: "item",
        key: "dashboards.create",
        label: "Create Dashboard",
        icon: LayoutDashboard,
        tone: "create",
      },
      ...savedDashboards.map((item) => ({
        kind: "item" as const,
        key: `dashboards.${slug(item.id || item.name)}`,
        label: item.name,
        icon: BarChart3,
      })),
    ];

    const monitorItems: SidebarLeaf[] = [
      {
        kind: "item",
        key: "monitors.create",
        label: "Create Monitor",
        icon: Monitor,
        tone: "create",
      },
      ...savedMonitors.map((item) => ({
        kind: "item" as const,
        key: `monitors.${slug(item.id || item.name)}`,
        label: item.name,
        icon: Monitor,
      })),
    ];

    const alertItems: SidebarLeaf[] = [
      {
        kind: "item",
        key: "alerts.create",
        label: "Create Alert",
        icon: Bell,
        tone: "create",
      },
      ...savedAlerts.map((item) => ({
        kind: "item" as const,
        key: `alerts.${slug(item.id || item.name)}`,
        label: item.name,
        icon: Bell,
      })),
    ];

    return [
      {
        kind: "group",
        key: "infrastructure",
        label: "Infrastructure",
        icon: Cloud,
        children: [
          { kind: "item", key: "infrastructure.lambda", label: "Lambda", icon: Server },
          { kind: "item", key: "infrastructure.api-gateway", label: "API Gateway", icon: Network },
          { kind: "item", key: "infrastructure.dynamodb", label: "DynamoDB", icon: Database },
          { kind: "item", key: "infrastructure.s3", label: "S3", icon: HardDrive },
          { kind: "item", key: "infrastructure.cloudfront", label: "CloudFront", icon: Globe },
          { kind: "item", key: "infrastructure.cognito", label: "Cognito", icon: KeyRound },
          { kind: "item", key: "infrastructure.step-functions", label: "Step Functions", icon: Workflow },
          { kind: "item", key: "infrastructure.eventbridge", label: "EventBridge", icon: GitBranch },
          { kind: "item", key: "infrastructure.cloudwatch", label: "CloudWatch", icon: Monitor },
          { kind: "item", key: "infrastructure.site-health", label: "Site Health", icon: Globe },
          { kind: "item", key: "infrastructure.opensearch", label: "OpenSearch", icon: Search },
        ],
      },
      {
        kind: "group",
        key: "dashboards",
        label: "Dashboards",
        icon: LayoutDashboard,
        children: dashboardItems,
      },
      { kind: "item", key: "logs", label: "Logs", icon: FileText },
      {
        kind: "group",
        key: "monitors",
        label: "Monitors",
        icon: Monitor,
        children: monitorItems,
      },
      {
        kind: "group",
        key: "alerts",
        label: "Alerts",
        icon: Bell,
        children: alertItems,
      },
      {
        kind: "group",
        key: "integrations",
        label: "Integrations",
        icon: Plug,
        children: [
          { kind: "item", key: "integrations.create", label: "Add Integration", icon: Plug, tone: "create" },
          { kind: "item", key: "integrations.aws", label: "AWS", icon: Cloud },
          { kind: "item", key: "integrations.slack", label: "Slack", icon: Plug },
          { kind: "item", key: "integrations.pagerduty", label: "PagerDuty", icon: Bell },
          { kind: "item", key: "integrations.jira", label: "Jira", icon: Plug },
          { kind: "item", key: "integrations.github", label: "GitHub", icon: GitBranch },
          { kind: "item", key: "integrations.confluence", label: "Confluence", icon: FileText },
          { kind: "item", key: "integrations.email", label: "Email", icon: FileText },
          { kind: "item", key: "integrations.webhooks", label: "Webhooks", icon: Network },
        ],
      },
      {
        kind: "group",
        key: "team",
        label: "Team",
        icon: Users,
        children: [
          { kind: "item", key: "team.boards", label: "Boards", icon: LayoutDashboard },
          { kind: "item", key: "team.members", label: "Members", icon: Users },
          { kind: "item", key: "team.roles", label: "Roles", icon: KeyRound },
          { kind: "item", key: "team.settings", label: "Settings", icon: Server },
        ],
      },
      {
        kind: "group",
        key: "useful-links",
        label: "Useful Links",
        icon: ExternalLink,
        children: [
          {
            kind: "item",
            key: "useful-links.ticket-board",
            label: "Ticket Board",
            icon: LayoutDashboard,
            href: appPath("command"),
          },
          {
            kind: "item",
            key: "useful-links.demo-website",
            label: "Demo Website",
            icon: Globe,
            href: demoWebsiteHref,
            external: !inDemoNamespace,
          },
          {
            kind: "item",
            key: "useful-links.aws",
            label: "AWS Console",
            icon: Cloud,
            href: "https://console.aws.amazon.com/",
            external: true,
          },
          {
            kind: "item",
            key: "useful-links.command-docs",
            label: "Command Docs",
            icon: FileText,
            href: appPath("documents"),
          },
        ],
      },
      {
        kind: "group",
        key: "security",
        label: "Security",
        icon: Shield,
        children: [
          { kind: "item", key: "security.access", label: "Access", icon: Lock },
          { kind: "item", key: "security.audit-log", label: "Audit Log", icon: FileText },
          { kind: "item", key: "security.api-keys", label: "API Keys", icon: KeyRound },
          { kind: "item", key: "security.sso", label: "SSO / SAML", icon: Shield },
          { kind: "item", key: "security.policies", label: "Policies", icon: Lock },
        ],
      },
    ];
  }, [
    appPath,
    demoWebsiteHref,
    inDemoNamespace,
    savedAlerts,
    savedDashboards,
    savedMonitors,
  ]);

  function handleGroupClick(group: SidebarGroup, event: MouseEvent<HTMLButtonElement>) {
    if (!expanded) {
      const hostRect = hostRef.current?.getBoundingClientRect();
      const rowRect = event.currentTarget.getBoundingClientRect();
      const top = hostRect ? Math.max(12, rowRect.top - hostRect.top - 8) : 64;
      setFlyout((prev) => (prev?.group.key === group.key ? null : { group, top }));
      return;
    }
    setFlyout(null);
    setOpenGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
  }

  function handleLeafClick(key: string) {
    setActiveKey(key);
    setFlyout(null);
  }

  function isGroupActive(group: SidebarGroup): boolean {
    return group.children.some((child) => child.key === activeKey);
  }

  function renderLeaf(entry: SidebarLeaf, nested = false) {
    const Icon = entry.icon;
    const active = activeKey === entry.key;
    const className = `group relative flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition ${
      nested ? "ml-2" : ""
    } ${
      active
        ? "border-l-[#2B9CFF] bg-[#0F355C] font-semibold text-[#EAF4FF]"
        : "border-l-transparent text-[#C9DAEE] hover:bg-[#0D2D4E] hover:text-[#F4FAFF]"
    } ${entry.tone === "create" ? "text-[#8FD0FF]" : ""}`;

    if (entry.href) {
      if (entry.external) {
        return (
          <a
            key={entry.key}
            href={entry.href}
            target="_blank"
            rel="noreferrer"
            title={!expanded ? entry.label : undefined}
            onClick={() => handleLeafClick(entry.key)}
            className={className}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {expanded && <span className="truncate">{entry.label}</span>}
          </a>
        );
      }
      return (
        <Link
          key={entry.key}
          to={entry.href}
          title={!expanded ? entry.label : undefined}
          onClick={() => handleLeafClick(entry.key)}
          className={className}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {expanded && <span className="truncate">{entry.label}</span>}
        </Link>
      );
    }

    return (
      <button
        key={entry.key}
        type="button"
        onClick={() => handleLeafClick(entry.key)}
        title={!expanded ? entry.label : undefined}
        className={className}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {expanded && <span className="truncate">{entry.label}</span>}
      </button>
    );
  }

  return (
    <div
      ref={hostRef}
      data-sidebar-shell
      onMouseEnter={() => {
        if (!isPinned) setIsHovering(true);
      }}
      onMouseLeave={() => {
        if (!isPinned) setIsHovering(false);
        if (!expanded) setFlyout(null);
      }}
      className={`sticky top-6 z-20 h-[calc(100vh-3rem)] shrink-0 rounded-2xl border border-[#1A3E65] bg-[#071B33] shadow-xl transition-all duration-200 ${
        expanded ? "w-[260px]" : "w-[72px]"
      }`}
    >
      <style>{`
        .cmd-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #2b4a72 transparent;
        }
        .cmd-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .cmd-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #2b4a72;
          border-radius: 999px;
        }
      `}</style>

      <div className="sticky top-0 z-10 border-b border-[#1A3E65] bg-[#071B33] px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !isPinned;
              setIsPinned(next);
              if (next) {
                setIsCollapsed(false);
              }
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#295178] bg-[#0B2947] text-[#DCEBFA] hover:bg-[#12375D]"
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </button>
          {isPinned && (
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#295178] bg-[#0B2947] text-[#DCEBFA] hover:bg-[#12375D]"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="mt-3">
          {expanded ? (
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8FB7DF]">
                Team
              </span>
              <select
                value={selectedTeam}
                onChange={(e) => onTeamChange(e.target.value)}
                className="w-full rounded-lg border border-[#2B4A72] bg-[#0B2947] px-3 py-2 text-sm text-[#EAF4FF] focus:border-[#2B9CFF] focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <button
              type="button"
              title={`Team: ${selectedTeam}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0F355C] text-xs font-bold text-[#EAF4FF]"
            >
              {initials(selectedTeam)}
            </button>
          )}
        </div>
      </div>

      <nav className="cmd-sidebar-scroll min-h-0 space-y-1 overflow-y-auto px-2 py-3">
        {menuTree.map((node) => {
          const Icon = node.icon;
          if (node.kind === "item") {
            return renderLeaf(node);
          }
          const open = !!openGroups[node.key];
          const groupActive = isGroupActive(node);
          return (
            <div key={node.key} className="space-y-1">
              <button
                type="button"
                title={!expanded ? node.label : undefined}
                onClick={(event) => handleGroupClick(node, event)}
                className={`group relative flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition ${
                  groupActive
                    ? "border-l-[#2B9CFF] bg-[#0F355C] font-semibold text-[#EAF4FF]"
                    : "border-l-transparent text-[#C9DAEE] hover:bg-[#0D2D4E] hover:text-[#F4FAFF]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {expanded && (
                  <>
                    <span className="truncate">{node.label}</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </button>

              {expanded && (
                <div
                  className={`grid transition-all duration-200 ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 border-l border-[#1A3E65] pl-2">
                      {node.children.map((child) => renderLeaf(child, true))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!expanded && flyout && (
        <div
          className="absolute left-[76px] z-30 w-[260px] rounded-xl border border-[#2A4F79] bg-[#08203B] p-2 shadow-2xl"
          style={{ top: flyout.top }}
        >
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[#8FB7DF]">
            {flyout.group.label}
          </div>
          <div className="space-y-1">
            {flyout.group.children.map((entry) => renderLeaf(entry))}
          </div>
        </div>
      )}
    </div>
  );
}
