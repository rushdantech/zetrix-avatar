import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  MoreHorizontal,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ZETRIXCLAW_USER_AGENT_ID,
  loadZetrixClawAgentInstance,
} from "@/lib/studio/zetrixclaw-agent-instance";
import {
  DEFAULT_WORKSPACE_TREE,
  SIDEBAR_FOCUS_MAP,
  WORKSPACE_DISPLAY_ROOT,
  collectFileIds,
  countWorkspaceFiles,
  findFileMeta,
  getFileContent,
  loadWorkspaceOverrides,
  persistWorkspaceOverrides,
  type WorkspaceTreeFile,
  type WorkspaceTreeFolder,
} from "@/lib/studio/zetrixclaw-workspace-mock";

function collectFolderIds(nodes: (WorkspaceTreeFile | WorkspaceTreeFolder)[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      ids.push(node.id);
      ids.push(...collectFolderIds(node.children));
    }
  }
  return ids;
}

function TreeFolder({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  onSelectFile,
}: {
  node: WorkspaceTreeFolder;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  selectedId: string | null;
  onSelectFile: (id: string) => void;
}) {
  const isOpen = expanded.has(node.id);
  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => toggle(node.id)}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground hover:bg-muted/80",
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <Folder className="h-3.5 w-3.5 shrink-0 text-amber-600/90" />
        <span className="truncate">{node.label}</span>
      </button>
      {isOpen && (
        <div className="border-l border-border/60 ml-4 pl-1">
          {node.children.map(child =>
            child.type === "folder" ? (
              <TreeFolder
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                toggle={toggle}
                selectedId={selectedId}
                onSelectFile={onSelectFile}
              />
            ) : (
              <TreeFileRow
                key={child.id}
                file={child}
                depth={depth + 1}
                selected={selectedId === child.id}
                onSelect={() => onSelectFile(child.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function TreeFileRow({
  file,
  depth,
  selected,
  onSelect,
}: {
  file: WorkspaceTreeFile;
  depth: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        selected ? "bg-primary/12 text-primary" : "text-foreground hover:bg-muted/70",
      )}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{file.title}</span>
        {file.description && (
          <span className="block text-[11px] leading-snug text-muted-foreground">{file.description}</span>
        )}
      </span>
    </button>
  );
}

/** Legacy `/workspace/:segment` → unified workspace with focus */
export function ZetrixClawWorkspaceLegacyNavigate() {
  const { agentId, segment } = useParams<{ agentId: string; segment: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/studio/agents/${agentId}/workspace?focus=${encodeURIComponent(segment ?? "")}`, {
      replace: true,
    });
  }, [agentId, segment, navigate]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Opening workspace…
    </div>
  );
}

export default function ZetrixClawWorkspacePage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const instance = loadZetrixClawAgentInstance();

  const allFileIds = useMemo(() => collectFileIds(DEFAULT_WORKSPACE_TREE), []);
  const fileCount = useMemo(() => countWorkspaceFiles(DEFAULT_WORKSPACE_TREE), []);
  const focusParam = searchParams.get("focus");
  const fileParamKey = searchParams.get("file");

  const [overrides, setOverrides] = useState<Record<string, string>>(loadWorkspaceOverrides);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(() => "AGENTS.md");
  const [editorValue, setEditorValue] = useState(() =>
    getFileContent("AGENTS.md", loadWorkspaceOverrides()),
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(collectFolderIds(DEFAULT_WORKSPACE_TREE)),
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const runtimePath = `/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/runtime`;

  useEffect(() => {
    if (agentId !== ZETRIXCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  const isDirty = useMemo(() => {
    if (!selectedFileId) return false;
    return editorValue !== getFileContent(selectedFileId, overrides);
  }, [selectedFileId, editorValue, overrides]);

  useEffect(() => {
    const o = loadWorkspaceOverrides();
    setOverrides(o);
    const fileParam = fileParamKey;
    const focus = focusParam;
    let nextId = "AGENTS.md";
    const expand: string[] = [];
    if (fileParam && allFileIds.includes(fileParam)) {
      nextId = fileParam;
    } else if (focus && SIDEBAR_FOCUS_MAP[focus]) {
      const m = SIDEBAR_FOCUS_MAP[focus];
      nextId = m.fileId;
      expand.push(...m.expandFolderIds);
    }
    setSelectedFileId(nextId);
    if (expand.length) {
      setExpandedFolders(prev => new Set([...prev, ...expand]));
    }
    const meta = findFileMeta(DEFAULT_WORKSPACE_TREE, nextId);
    setInfoBanner(meta?.infoBanner ?? null);
    setEditorValue(getFileContent(nextId, o));
    setSaveStatus("idle");
  }, [focusParam, fileParamKey, allFileIds]);

  const selectFile = useCallback(
    (id: string) => {
      if (isDirty) {
        const ok = window.confirm("You have unsaved changes. Discard them and open this file?");
        if (!ok) return;
      }
      const o = loadWorkspaceOverrides();
      setOverrides(o);
      setSelectedFileId(id);
      const meta = findFileMeta(DEFAULT_WORKSPACE_TREE, id);
      setInfoBanner(meta?.infoBanner ?? null);
      setEditorValue(getFileContent(id, o));
      setSaveStatus("idle");
      setSearchParams(prev => {
        const n = new URLSearchParams(prev);
        n.set("file", id);
        n.delete("focus");
        return n;
      });
    },
    [isDirty, setSearchParams],
  );

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const saveFile = useCallback(() => {
    if (!selectedFileId) return;
    const next = { ...overrides, [selectedFileId]: editorValue };
    setOverrides(next);
    persistWorkspaceOverrides(next);
    setSaveStatus("saved");
    toast.success("File saved", {
      description: "Stored for this browser session (prototype).",
    });
    window.setTimeout(() => setSaveStatus("idle"), 2500);
  }, [selectedFileId, editorValue, overrides]);

  const refreshFile = useCallback(() => {
    if (!selectedFileId) return;
    if (isDirty) {
      const ok = window.confirm("Discard unsaved changes and reload from last saved?");
      if (!ok) return;
    }
    const o = loadWorkspaceOverrides();
    setOverrides(o);
    setEditorValue(getFileContent(selectedFileId, o));
    toast.message("File reloaded");
  }, [selectedFileId, isDirty]);

  const refreshWorkspace = useCallback(() => {
    const o = loadWorkspaceOverrides();
    setOverrides(o);
    if (selectedFileId) {
      setEditorValue(getFileContent(selectedFileId, o));
    }
    toast.message("Workspace index reloaded from this browser.");
  }, [selectedFileId]);

  const displayPath = selectedFileId ? `${WORKSPACE_DISPLAY_ROOT}/${selectedFileId}` : "";
  const title = selectedFileId ? selectedFileId.split("/").pop() ?? selectedFileId : "";

  if (!instance || agentId !== ZETRIXCLAW_USER_AGENT_ID) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-0 lg:min-h-[calc(100dvh-5rem)]">
      {/* Page header */}
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/studio/agents" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Workspace</h1>
            <p className="text-sm text-muted-foreground">
              ZetrixClaw · files, memory, skills, briefs, and scripts
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={refreshWorkspace}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link to={runtimePath}>Back to Chat</Link>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-0 border border-border bg-card lg:flex-row lg:rounded-lg lg:overflow-hidden">
        {/* Navigator */}
        <aside className="flex w-full flex-col border-b border-border bg-muted/25 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-border/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
            <p className="text-xs text-muted-foreground">{fileCount} files</p>
          </div>
          <ScrollArea className="h-[min(40vh,320px)] lg:h-[min(calc(100dvh-16rem),560px)]">
            <nav className="space-y-0.5 p-2">
              {DEFAULT_WORKSPACE_TREE.map(node =>
                node.type === "folder" ? (
                  <TreeFolder
                    key={node.id}
                    node={node}
                    depth={0}
                    expanded={expandedFolders}
                    toggle={toggleFolder}
                    selectedId={selectedFileId}
                    onSelectFile={selectFile}
                  />
                ) : (
                  <TreeFileRow
                    key={node.id}
                    file={node}
                    depth={0}
                    selected={selectedFileId === node.id}
                    onSelect={() => selectFile(node.id)}
                  />
                ),
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Editor */}
        <main className="flex min-h-[50vh] flex-1 flex-col bg-background">
          {selectedFileId ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{displayPath}</p>
                  <h2 className="mt-1 text-lg font-semibold">{title}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Reload file" onClick={refreshFile}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={saveFile} disabled={!isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="More" onClick={() => toast.message("More actions (mock)")}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {infoBanner && (
                <div className="mx-4 mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                  {infoBanner}
                </div>
              )}

              {saveStatus === "saved" && (
                <div className="mx-4 mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
                  Saved successfully. Workspace state updated for this prototype.
                </div>
              )}

              <div className="min-h-0 flex-1 px-4 py-3">
                <Textarea
                  value={editorValue}
                  onChange={e => setEditorValue(e.target.value)}
                  className="min-h-[min(50vh,420px)] resize-y border-border bg-card font-sans text-sm leading-relaxed shadow-sm"
                  spellCheck={false}
                />
              </div>

              <footer className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Editable workspace file · changes stay in this browser prototype until replaced.
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={runtimePath}>Return to Chat</Link>
                  </Button>
                  <Button size="sm" onClick={saveFile} disabled={!isDirty}>
                    Save File
                  </Button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Select a file from the workspace tree.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
