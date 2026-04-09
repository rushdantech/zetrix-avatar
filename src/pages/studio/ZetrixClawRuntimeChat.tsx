import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  ChevronRight,
  FileText,
  FolderOpen,
  History,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Plus,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import {
  ZetrixClawRuntimeMaintenanceSection,
  type MaintenanceBanner,
} from "@/components/studio/zetrixclaw/ZetrixClawRuntimeMaintenanceSection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ZETRIXCLAW_USER_AGENT_ID,
  loadZetrixClawAgentInstance,
} from "@/lib/studio/zetrixclaw-agent-instance";
import {
  ZC_INTRO_TEMPLATE,
  createIntroMessage,
  deriveTitleFromGoal,
  formatSessionListTime,
  loadPersistedRuntimeSessions,
  persistRuntimeSessions,
  previewFromMessages,
  type ZcChatMessage,
  type ZcRuntimeSession,
} from "@/lib/studio/zetrixclaw-runtime-sessions";

const WORKSPACE_ENTRIES: {
  segment: string;
  label: string;
  description: string;
}[] = [
  { segment: "memory", label: "memory/", description: "Long-term memory and consolidation" },
  { segment: "prompts", label: "prompts/", description: "Runtime prompts and brief scaffolds" },
  { segment: "skills", label: "skills/", description: "Reusable task skills and adapters" },
  { segment: "agents-md", label: "AGENTS.md", description: "Core workspace instructions and identity" },
  { segment: "docs", label: "docs/", description: "Reference documentation" },
  { segment: "scripts", label: "scripts/", description: "Runnable scripts and tooling" },
  { segment: "briefs", label: "briefs/", description: "Saved execution briefs" },
  { segment: "configs", label: "configs/", description: "Configuration and environment" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ZetrixClawRuntimeChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { zetrixClawStorageGeneration } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [maintenanceBanner, setMaintenanceBanner] = useState<MaintenanceBanner | null>(null);

  const instance = loadZetrixClawAgentInstance();
  const displayName = useMemo(
    () => loadZetrixClawAgentInstance()?.name?.trim() || "MyClaw",
    [zetrixClawStorageGeneration],
  );
  const subtitle = "General operations copilot";
  const basePath = `/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}`;

  const introWithName = useMemo(
    () => ZC_INTRO_TEMPLATE.replace(/MyClaw/g, displayName),
    [displayName],
  );

  const [sessions, setSessions] = useState<ZcRuntimeSession[]>(() => {
    const name = loadZetrixClawAgentInstance()?.name?.trim() || "MyClaw";
    const intro = ZC_INTRO_TEMPLATE.replace(/MyClaw/g, name);
    return loadPersistedRuntimeSessions(intro).sessions;
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const name = loadZetrixClawAgentInstance()?.name?.trim() || "MyClaw";
    const intro = ZC_INTRO_TEMPLATE.replace(/MyClaw/g, name);
    return loadPersistedRuntimeSessions(intro).activeId;
  });

  const messages: ZcChatMessage[] = useMemo(
    () => sessions.find(s => s.id === activeSessionId)?.messages ?? [],
    [sessions, activeSessionId],
  );

  useEffect(() => {
    persistRuntimeSessions(sessions, activeSessionId);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (sessions.length === 0) return;
    if (!sessions.some(s => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (agentId !== ZETRIXCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  useEffect(() => {
    const root = document.getElementById("zc-runtime-chat-scroll");
    const vp = root?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, sidebarOpen, historyPanelOpen, activeSessionId]);

  const appendAgentReplyToSession = useCallback(
    (sessionId: string, userGoal: string) => {
      const id = uid();
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [
              ...s.messages,
              {
                id,
                kind: "agent_plan" as const,
                brief: `Objective: ${userGoal.slice(0, 120)}${userGoal.length > 120 ? "…" : ""}`,
                plan:
                  "• Ingest request and workspace pointers\n• Resolve applicable skills from skills/\n• Draft execution steps with file/script awareness",
                status: "Ready for confirmation",
                skills: instance?.skillPackIds?.length
                  ? instance.skillPackIds.join(", ")
                  : "core-runtime (mock)",
                readiness:
                  "Structured plan generated. Workspace files (scripts, configs, briefs) can be referenced on execution lock.",
                nextSteps: "Tap Lock In to commit, or send follow-up with constraints or attachments.",
              },
            ],
          };
        }),
      );
    },
    [instance?.skillPackIds],
  );

  const createNewConversation = useCallback(() => {
    const id = `session-${uid()}`;
    const intro = createIntroMessage(introWithName);
    setSessions(prev => [
      { id, title: "New conversation", updatedAt: new Date().toISOString(), messages: [intro] },
      ...prev,
    ]);
    setActiveSessionId(id);
    setComposer("");
    setHistoryPanelOpen(false);
    toast.success("Started a new conversation.");
  }, [introWithName]);

  const sendMessage = useCallback(() => {
    const text = composer.trim();
    if (!text) return;
    const sid = activeSessionId;
    setComposer("");
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sid) return s;
        const hadUser = s.messages.some(m => m.kind === "user_task");
        const userMsg: ZcChatMessage = {
          id: uid(),
          kind: "user_task",
          goal: text,
          constraints: "None",
          deadline: "Not specified",
          notes: "Follow-up from chat runtime",
        };
        let title = s.title;
        if (!hadUser) {
          title = deriveTitleFromGoal(text);
        }
        return {
          ...s,
          title,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, userMsg],
        };
      }),
    );
    window.setTimeout(() => appendAgentReplyToSession(sid, text), 400);
  }, [composer, activeSessionId, appendAgentReplyToSession]);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setHistoryPanelOpen(false);
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [sessions],
  );

  const lockIn = useCallback((msgId: string) => {
    toast.success("Locked in for execution (mock)", { description: `Message ${msgId}` });
  }, []);

  if (!instance || agentId !== ZETRIXCLAW_USER_AGENT_ID) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative -m-4 flex h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-none border border-border bg-background lg:-m-6",
        "lg:h-[calc(100dvh-5rem)]"
      )}
    >
      {/* Session header — fixed strip; only message list scrolls */}
      <header className="relative z-30 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 backdrop-blur-sm md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/studio/agents" aria-label="Back to agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold md:text-base">{displayName}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            aria-label="New conversation"
            onClick={createNewConversation}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 text-muted-foreground", historyPanelOpen && "bg-muted text-foreground")}
            aria-label="Conversation history"
            onClick={() => setHistoryPanelOpen(v => !v)}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            aria-label={sidebarOpen ? "Close workspace panel" : "Open workspace panel"}
            onClick={() => setSidebarOpen(v => !v)}
          >
            {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" asChild>
            <Link to="/studio/agents" aria-label="Exit">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {maintenanceBanner && (
        <div
          className={cn(
            "relative z-20 shrink-0 border-b px-3 py-2 text-center text-xs sm:text-sm",
            maintenanceBanner.variant === "info" && "border-border bg-muted/60 text-foreground",
            maintenanceBanner.variant === "success" &&
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
            maintenanceBanner.variant === "warning" && "border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100",
            maintenanceBanner.variant === "destructive" &&
              "border-destructive/35 bg-destructive/10 text-destructive",
          )}
        >
          {maintenanceBanner.message}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* Chat canvas — scrollable middle; composer fixed below */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ScrollArea id="zc-runtime-chat-scroll" className="min-h-0 flex-1">
            <div className="space-y-4 p-4 pb-6 md:p-6">
              {messages.map(msg => {
                if (msg.kind === "intro") {
                  const t = msg.text.replace(/\bMyClaw\b/g, displayName);
                  return (
                    <div
                      key={msg.id}
                      className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground"
                    >
                      {t}
                    </div>
                  );
                }
                if (msg.kind === "user_task") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[min(100%,32rem)] rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm shadow-sm">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary/80">
                          Request
                        </p>
                        <dl className="space-y-1.5 text-left">
                          <div>
                            <dt className="text-[10px] font-medium uppercase text-muted-foreground">Goal</dt>
                            <dd>{msg.goal}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-medium uppercase text-muted-foreground">
                              Constraints
                            </dt>
                            <dd>{msg.constraints}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-medium uppercase text-muted-foreground">Deadline</dt>
                            <dd>{msg.deadline}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-medium uppercase text-muted-foreground">Notes</dt>
                            <dd className="text-muted-foreground">{msg.notes}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className="flex justify-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="max-w-[min(100%,36rem)] flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Execution response
                      </p>
                      <p className="mb-4 text-muted-foreground">{msg.readiness}</p>
                      <div className="space-y-3 rounded-lg bg-muted/50 p-3 font-mono text-xs">
                        <div>
                          <span className="font-sans text-[10px] font-semibold uppercase text-muted-foreground">
                            Brief
                          </span>
                          <p className="mt-1 whitespace-pre-wrap font-sans text-sm">{msg.brief}</p>
                        </div>
                        <Separator />
                        <div>
                          <span className="font-sans text-[10px] font-semibold uppercase text-muted-foreground">
                            Plan
                          </span>
                          <p className="mt-1 whitespace-pre-wrap font-sans text-sm">{msg.plan}</p>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap items-center gap-2 font-sans text-sm">
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Status</span>
                          <Badge variant="secondary">{msg.status}</Badge>
                        </div>
                        <Separator />
                        <div>
                          <span className="font-sans text-[10px] font-semibold uppercase text-muted-foreground">
                            Matched skills
                          </span>
                          <p className="mt-1 font-sans text-sm">{msg.skills}</p>
                        </div>
                        <Separator />
                        <div>
                          <span className="font-sans text-[10px] font-semibold uppercase text-muted-foreground">
                            Next steps
                          </span>
                          <p className="mt-1 font-sans text-sm">{msg.nextSteps}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => lockIn(msg.id)}>
                          Lock In
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.message("Revise (mock)")}>
                          Revise
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Composer — fixed footer */}
          <div className="relative z-20 shrink-0 border-t border-border bg-card p-3 md:p-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-inner">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                aria-label="Attach file"
                onClick={() => toast.message("Attachments, scripts, and briefs (mock)")}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                value={composer}
                onChange={e => setComposer(e.target.value)}
                placeholder={`Message ${displayName}…`}
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0"
                rows={1}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button type="button" size="icon" className="shrink-0" onClick={sendMessage} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground">
              Plain text, file-linked tasks, and follow-up execution instructions. Workspace context applies on lock.
            </p>
          </div>
        </div>

        {/* Collapsible right sidebar */}
        <aside
          className={cn(
            "absolute inset-y-0 right-0 z-20 flex min-h-0 w-[min(100%,20rem)] flex-col border-l border-border bg-card shadow-xl transition-transform duration-200 ease-out md:relative md:shadow-none",
            sidebarOpen ? "translate-x-0" : "translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-0"
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border p-3">
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{displayName}</p>
              <p className="text-xs text-muted-foreground">ZetrixClaw Agent</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-3">
              <section>
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bot info
                </h2>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between gap-2 py-1">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="flex justify-between gap-2 py-1">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">ZetrixClaw</span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Distinct from Dify-based agents; workspace-backed runtime.
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-emerald-600/90 hover:bg-emerald-600">Running</Badge>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <FolderOpen className="h-3 w-3" />
                  Workspace
                </h2>
                <p className="mb-2 text-xs text-muted-foreground">
                  Open the full workspace to browse, edit, and save files. Shortcuts below jump to a folder or file.
                </p>
                <Link
                  to={`${basePath}/workspace`}
                  className="mb-3 flex items-center justify-center rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  Open full workspace
                </Link>
                <ul className="space-y-1">
                  {WORKSPACE_ENTRIES.map(entry => (
                    <li key={entry.segment}>
                      <Link
                        to={`${basePath}/workspace?focus=${encodeURIComponent(entry.segment)}`}
                        className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium leading-tight">{entry.label}</span>
                          <span className="block text-[11px] text-muted-foreground">{entry.description}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <ZetrixClawRuntimeMaintenanceSection
                onCloseSidebar={() => setSidebarOpen(false)}
                onBanner={setMaintenanceBanner}
              />
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Conversation history — right slide-in */}
      {historyPanelOpen && (
        <button
          type="button"
          aria-label="Close conversation history"
          className="fixed inset-0 z-[45] bg-background/60 backdrop-blur-[1px]"
          onClick={() => setHistoryPanelOpen(false)}
        />
      )}
      {historyPanelOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col border-l border-border bg-card shadow-xl">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-3">
            <h2 className="text-sm font-semibold">Conversation History</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setHistoryPanelOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="shrink-0 border-b border-border p-3">
            <Button className="w-full gradient-primary text-primary-foreground shadow-glow" onClick={createNewConversation}>
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 p-3">
              {sortedSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
                  <p>No previous conversations yet.</p>
                  <p className="mt-2 text-xs">Start a new conversation to begin.</p>
                </div>
              ) : (
                sortedSessions.map(s => {
                  const active = s.id === activeSessionId;
                  const preview = previewFromMessages(s.messages);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSession(s.id)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-primary/40 bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:bg-muted/60",
                      )}
                    >
                      <p className="font-medium leading-snug text-foreground">{s.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatSessionListTime(s.updatedAt)}</p>
                      {preview ? (
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{preview}</p>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* Mobile overlay when workspace sidebar open */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close workspace panel"
          className="fixed inset-0 z-10 bg-background/60 backdrop-blur-[1px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
