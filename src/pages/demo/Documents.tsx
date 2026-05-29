import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminClaims } from "../../lib/adminAuth";
import { getValidCognitoIdToken } from "../../lib/cognitoSession";
import {
  buildDemoLoginUrl,
  buildDemoLogoutUrl,
  clearDemoAuth,
} from "../../lib/demoAuth";

type FolderSummary = {
  name: string;
  path: string;
};

type FileSummary = {
  name: string;
  path: string;
  key?: string;
  size?: number;
  lastModified?: string;
  contentType?: string;
};

type SearchResult = {
  type: "file" | "folder";
  name: string;
  path: string;
};

const API_BASE = (
  import.meta.env.VITE_CHATBOT_API_BASE ||
  "https://mgq245mb03.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

const DEFAULT_DOC_CONTENT = `# New Document\n\nStart writing here.\n\n- Add bullets\n- Capture notes\n- Share decisions\n`;

function normalizePath(path: string): string {
  return String(path || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
}

function joinPath(parent: string, child: string): string {
  const p = normalizePath(parent).replace(/\/+$/, "");
  const c = normalizePath(child).replace(/^\/+/, "");
  if (!p) return c;
  if (!c) return p;
  return `${p}/${c}`;
}

function basename(path: string): string {
  const normalized = normalizePath(path);
  if (!normalized) return "";
  const parts = normalized.split("/");
  return parts[parts.length - 1] || "";
}

function ensureMarkdownFileName(name: string): string {
  const trimmed = String(name || "").trim().replace(/\//g, "-");
  if (!trimmed) return "untitled.md";
  if (trimmed.toLowerCase().endsWith(".md")) return trimmed;
  return `${trimmed}.md`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInlineMarkdown(value: string): string {
  let out = escapeHtml(value);
  out = out.replace(/`([^`]+)`/g, "<code class=\"rounded bg-blue-100 px-1 text-blue-900\">$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-700 underline">$1</a>');
  return out;
}

function renderMarkdownPreview(markdown: string): string {
  const lines = String(markdown || "").split("\n");
  const rendered = lines.map((line) => {
    if (/^###\s+/.test(line)) {
      return `<h3 class=\"mt-4 text-lg font-bold text-blue-900\">${formatInlineMarkdown(
        line.replace(/^###\s+/, ""),
      )}</h3>`;
    }
    if (/^##\s+/.test(line)) {
      return `<h2 class=\"mt-4 text-xl font-bold text-blue-900\">${formatInlineMarkdown(
        line.replace(/^##\s+/, ""),
      )}</h2>`;
    }
    if (/^#\s+/.test(line)) {
      return `<h1 class=\"mt-4 text-2xl font-extrabold text-blue-900\">${formatInlineMarkdown(
        line.replace(/^#\s+/, ""),
      )}</h1>`;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      return `<p class=\"ml-4 mt-1 text-sm text-slate-800\">• ${formatInlineMarkdown(
        line.replace(/^\s*[-*]\s+/, ""),
      )}</p>`;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      return `<p class=\"ml-4 mt-1 text-sm text-slate-800\">${formatInlineMarkdown(
        line,
      )}</p>`;
    }
    if (!line.trim()) return "<div class=\"h-3\"></div>";
    return `<p class=\"mt-1 text-sm text-slate-800\">${formatInlineMarkdown(line)}</p>`;
  });
  return rendered.join("\n");
}

function initialsFromProfile(name: string, email: string): string {
  const base = (name || "").trim();
  if (base) {
    const words = base.split(/\s+/).filter(Boolean);
    const first = words[0]?.[0] || "";
    const second = words.length > 1 ? words[1]?.[0] || "" : "";
    return `${first}${second || ""}`.toUpperCase() || "U";
  }
  const local = String(email || "").split("@")[0] || "user";
  return local.slice(0, 2).toUpperCase();
}

export default function Documents() {
  const location = useLocation();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    () => !!getValidCognitoIdToken(),
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFolder, setActiveFolder] = useState("");
  const [folders, setFolders] = useState<FolderSummary[]>([]);
  const [files, setFiles] = useState<FileSummary[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [docTitle, setDocTitle] = useState("untitled.md");
  const [docBody, setDocBody] = useState(DEFAULT_DOC_CONTENT);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const profile = useMemo(() => {
    const claims = getAdminClaims() as Record<string, unknown>;
    const email = String(claims.email || "").trim().toLowerCase();
    const name =
      [String(claims.given_name || ""), String(claims.family_name || "")]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(" ") ||
      String(claims.name || "").trim() ||
      String(claims.preferred_username || "").trim() ||
      email;
    return {
      email,
      name,
      initials: initialsFromProfile(name, email),
    };
  }, [isSignedIn]);

  const inDemoNamespace = location.pathname.startsWith("/demo/");
  const appPath = (slug: string) =>
    inDemoNamespace ? `/demo/${slug}` : `/${slug}`;

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

  async function apiGet(path: string): Promise<any> {
    const token = getValidCognitoIdToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { headers });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || `Request failed (${res.status})`);
    }
    return payload;
  }

  async function apiPost(path: string, body: Record<string, unknown>): Promise<any> {
    const token = getValidCognitoIdToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || `Request failed (${res.status})`);
    }
    return payload;
  }

  async function loadTree(nextFolder: string = activeFolder) {
    setIsLoadingTree(true);
    setError("");
    try {
      const prefix = normalizePath(nextFolder);
      const payload = await apiGet(
        `/admin/documents/tree?prefix=${encodeURIComponent(prefix)}`,
      );
      setFolders(payload?.data?.folders || []);
      setFiles(payload?.data?.files || []);
      setActiveFolder(prefix);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents tree.");
    } finally {
      setIsLoadingTree(false);
    }
  }

  async function loadDocument(path: string) {
    setIsLoadingDoc(true);
    setError("");
    try {
      const payload = await apiGet(
        `/admin/documents/file?key=${encodeURIComponent(normalizePath(path))}`,
      );
      const data = payload?.data || {};
      setSelectedPath(normalizePath(data.path || path));
      setDocTitle(data.name || basename(path) || "untitled.md");
      setDocBody(String(data.content || ""));
      setStatus(`Opened ${data.name || basename(path)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open document.");
    } finally {
      setIsLoadingDoc(false);
    }
  }

  async function saveDocument() {
    setIsSaving(true);
    setError("");
    setStatus("");
    try {
      const fileName = ensureMarkdownFileName(docTitle);
      const fallbackPath = joinPath(activeFolder, fileName);
      const path = selectedPath || fallbackPath;
      const payload = await apiPost("/admin/documents/file", {
        key: normalizePath(path),
        name: fileName,
        content: docBody,
        contentType: "text/markdown; charset=utf-8",
      });
      const savedPath = normalizePath(payload?.data?.path || path);
      setSelectedPath(savedPath);
      setDocTitle(basename(savedPath) || fileName);
      setStatus(`Saved ${basename(savedPath) || fileName}`);
      await loadTree(activeFolder);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save document.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createFolder() {
    const name = folderName.trim();
    if (!name) return;
    setIsCreatingFolder(true);
    setError("");
    setStatus("");
    try {
      await apiPost("/admin/documents/folder", {
        path: activeFolder,
        name,
      });
      setFolderName("");
      setStatus(`Created folder ${name}`);
      await loadTree(activeFolder);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create folder.");
    } finally {
      setIsCreatingFolder(false);
    }
  }

  async function deleteFile(path: string) {
    if (!window.confirm(`Delete ${basename(path)}?`)) return;
    setIsDeleting(true);
    setError("");
    setStatus("");
    try {
      await apiPost("/admin/documents/delete", {
        key: normalizePath(path),
      });
      if (normalizePath(selectedPath) === normalizePath(path)) {
        setSelectedPath("");
        setDocTitle("untitled.md");
        setDocBody(DEFAULT_DOC_CONTENT);
      }
      setStatus(`Deleted ${basename(path)}`);
      await loadTree(activeFolder);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete file.");
    } finally {
      setIsDeleting(false);
    }
  }

  function startNewDocument() {
    setSelectedPath("");
    setDocTitle("untitled.md");
    setDocBody(DEFAULT_DOC_CONTENT);
    setStatus("New document draft ready.");
  }

  function applyMarkdown(before: string, after: string = before) {
    const textarea = document.getElementById("documents-editor") as
      | HTMLTextAreaElement
      | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = docBody;
    const selected = current.slice(start, end);
    const next = `${current.slice(0, start)}${before}${selected}${after}${current.slice(end)}`;
    setDocBody(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
    });
  }

  useEffect(() => {
    void loadTree("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const payload = await apiGet(
          `/admin/documents/search?q=${encodeURIComponent(query)}`,
        );
        if (!cancelled) {
          setSearchResults(payload?.data?.matches || []);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-xl rounded-2xl border border-blue-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-blue-900">Documents</h1>
          <p className="mt-2 text-sm text-slate-600">Redirecting to sign-in...</p>
          <a
            href={buildDemoLoginUrl()}
            className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-blue-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to={appPath("command")}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Back to Command
            </Link>
            <h1 className="text-xl font-extrabold text-blue-900 sm:text-2xl">
              CivIQ Documents
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.assign(buildDemoLogoutUrl())}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => {
                clearDemoAuth();
                window.location.assign(buildDemoLogoutUrl());
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white shadow"
              title={profile.email || "User"}
            >
              {profile.initials}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-4 px-4 py-4 sm:px-6">
        <aside
          className={`rounded-2xl border border-blue-200 bg-white shadow transition-all ${
            isSidebarCollapsed ? "w-16" : "w-[320px]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-blue-100 px-3 py-3">
            {!isSidebarCollapsed && (
              <p className="text-sm font-bold uppercase tracking-wide text-blue-800">
                Bucket Browser
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              {isSidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className="space-y-3 p-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bucket"
                className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startNewDocument}
                  className="flex-1 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  New Doc
                </button>
                <button
                  type="button"
                  onClick={() => void loadTree(activeFolder)}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  Refresh
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="New folder"
                  className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void createFolder()}
                  disabled={isCreatingFolder || !folderName.trim()}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add
                </button>
              </div>

              <button
                type="button"
                onClick={() => void loadTree("")}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100"
              >
                / (root)
              </button>

              {searchQuery.trim() ? (
                <div className="max-h-[56vh] space-y-1 overflow-auto rounded-lg border border-blue-100 bg-blue-50 p-2">
                  {searchLoading ? (
                    <p className="px-2 py-1 text-xs text-slate-500">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="px-2 py-1 text-xs text-slate-500">No matches.</p>
                  ) : (
                    searchResults.map((entry) => (
                      <button
                        key={`${entry.type}:${entry.path}`}
                        type="button"
                        onClick={() => {
                          if (entry.type === "folder") {
                            void loadTree(entry.path);
                          } else {
                            void loadDocument(entry.path);
                          }
                        }}
                        className="w-full rounded-md border border-transparent px-2 py-1 text-left text-xs text-slate-700 hover:border-blue-200 hover:bg-white"
                      >
                        <span className="font-semibold text-blue-800">
                          {entry.type === "folder" ? "Folder" : "File"}
                        </span>{" "}
                        {entry.path}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="max-h-[56vh] space-y-2 overflow-auto rounded-lg border border-blue-100 bg-blue-50 p-2">
                  {isLoadingTree ? (
                    <p className="px-2 py-1 text-xs text-slate-500">Loading...</p>
                  ) : (
                    <>
                      {folders.map((folder) => (
                        <button
                          key={`folder:${folder.path}`}
                          type="button"
                          onClick={() => void loadTree(folder.path)}
                          className="w-full rounded-md border border-transparent px-2 py-1 text-left text-sm font-semibold text-blue-800 hover:border-blue-200 hover:bg-white"
                        >
                          📁 {folder.name || folder.path}
                        </button>
                      ))}
                      {files.map((file) => (
                        <div
                          key={`file:${file.path}`}
                          className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 hover:border-blue-200 hover:bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => void loadDocument(file.path)}
                            className="min-w-0 flex-1 text-left text-sm text-slate-800"
                          >
                            📄 {file.name || basename(file.path)}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteFile(file.path)}
                            disabled={isDeleting}
                            className="rounded border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Del
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-blue-200 bg-white p-4 shadow sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Current folder
              </p>
              <p className="text-sm text-slate-600">
                {activeFolder ? `/${activeFolder}` : "/"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startNewDocument}
                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
              >
                New Draft
              </button>
              <button
                type="button"
                onClick={() => void saveDocument()}
                disabled={isSaving}
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2">
            <button
              type="button"
              onClick={() => applyMarkdown("**")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("*")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Italic
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("# ", "")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("## ", "")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("- ", "")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Bullet
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("`", "`")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => applyMarkdown("[", "](https://)")}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              Link
            </button>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
              File name
            </label>
            <input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="document-name.md"
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                Editor
              </label>
              <textarea
                id="documents-editor"
                value={docBody}
                onChange={(e) => setDocBody(e.target.value)}
                className="h-[62vh] w-full resize-y rounded-lg border border-blue-200 bg-white p-3 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                Live preview
              </label>
              <div
                className="h-[62vh] overflow-auto rounded-lg border border-blue-200 bg-white p-4"
                dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(docBody) }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-500">
              {isLoadingDoc ? "Loading document..." : selectedPath ? `Selected: /${selectedPath}` : "Draft not saved yet"}
            </div>
            {status && <div className="font-semibold text-emerald-700">{status}</div>}
            {error && <div className="font-semibold text-rose-700">{error}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
