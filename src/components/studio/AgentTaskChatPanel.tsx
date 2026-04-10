import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Bot, Building2, Cpu, ExternalLink, Lock, Menu, MessageCircle, Pencil, Paperclip, Send, User } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { JOB_AGENT_AVATAR_ID } from "@/lib/studio/marketplace-listing";
import {
  JOB_AGENT_SETUP_INITIAL_LOCKS,
  JOB_AGENT_SETUP_MESSAGES,
} from "@/data/studio/job-agent-setup-mock";
import {
  getJobAppV2StepDelayMs,
  isJobAppV2TriggerMessage,
  type JobAppV2ChatMessage,
  JOB_APP_V2_FIRST_RESPONSE_DELAY_MS,
  JOB_APP_V2_SCRIPT_MESSAGES,
  JOB_APP_V2_WELCOME_MESSAGE,
  JOB_APPLICATION_AGENT_V2_ID,
} from "@/data/studio/job-application-agent-v2-chat-mock";
import type { LockedAgentTaskBrief, StudioEntityEnterprise } from "@/types/studio";

export type { LockedAgentTaskBrief };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  timeLabel?: string;
  lockable?: boolean;
  locked?: boolean;
  /** Mock: Lock in shown greyed (already used). */
  lockButtonDisabled?: boolean;
  richFormat?: boolean;
  deployment?: boolean;
  /** Job Application Agent v2 demo: recruiter org lanes vs system. */
  lane?: "myeg" | "sime_darby" | "maybank" | "system";
};

function mapJobAgentSetupToMessages(): ChatMessage[] {
  return JOB_AGENT_SETUP_MESSAGES.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    timeLabel: m.timeLabel,
    lockable: m.lockable,
    locked: m.locked,
    lockButtonDisabled: m.lockButtonDisabled,
    richFormat: Boolean(m.richFormat || m.deployment),
    deployment: m.deployment,
  }));
}

function jobAppV2RowToChat(m: JobAppV2ChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date().toISOString(),
    timeLabel: m.timeLabel === "—" ? "—" : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    richFormat: m.richFormat,
    ...(m.lane ? { lane: m.lane } : {}),
  };
}

function welcomeMessage(agent: StudioEntityEnterprise): ChatMessage {
  const ts = new Date().toISOString();
  return {
    id: "welcome",
    role: "assistant",
    content: `You’re connected to **${agent.name}**. Describe tasks, constraints, and deadlines — I’ll reply with a structured brief. When it looks right, tap **Lock in** to commit it for execution.`,
    timestamp: ts,
    richFormat: true,
  };
}

function buildAssistantReply(agent: StudioEntityEnterprise, userText: string): string {
  const s = agent.enterpriseSetup;
  const objective = userText.trim() || "(empty — add details)";
  return `**${agent.name}** · ${s.agentType}\n\n**Interpreted objective:** ${objective.slice(0, 500)}${objective.length > 500 ? "…" : ""}\n\n**Plan:** ${s.capabilities.slice(0, 3).join(", ") || "General capabilities"} → validate → execute → report.\n**Ops window:** ${s.operatingHours} · **Max concurrent:** ${s.maxConcurrentTasks}\n**Escalation:** ${s.escalationEmail || "—"}\n\nIf this matches what you want, lock it in below.`;
}

function formatInline(text: string): ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((segment, i) => {
    const bold = segment.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      return (
        <strong key={i} className="font-semibold">
          {bold[1]}
        </strong>
      );
    }
    return <span key={i}>{segment}</span>;
  });
}

function FormattedBrief({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let paraLines: string[] = [];
  let listItems: string[] = [];

  const flushPara = () => {
    if (paraLines.length === 0) return;
    const joined = paraLines.join("\n");
    nodes.push(
      <p key={`p-${nodes.length}`} className="text-[13px] leading-relaxed">
        {formatInline(joined)}
      </p>,
    );
    paraLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed">
        {listItems.map((line, j) => (
          <li key={j}>{formatInline(line)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (t === "---") {
      flushPara();
      flushList();
      nodes.push(<hr key={`hr-${nodes.length}`} className="my-3 border-border" />);
      continue;
    }
    if (t.startsWith("- ")) {
      flushPara();
      listItems.push(t.slice(2).trim());
      continue;
    }
    if (t === "") {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    paraLines.push(line);
  }
  flushPara();
  flushList();

  return <div className="space-y-2">{nodes}</div>;
}

function renderTextContent(content: string) {
  return (
    <>
      {content.split("\n").map((line, i) => (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
          {line}
        </p>
      ))}
    </>
  );
}

/** Same-origin deep links (works for root deploy and subpath builds). */
function jobAgentAppUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${base}${p}`;
  }
  return `https://avatar-demo.zetrix.com${base}${p}`;
}

function JobAgentDeploymentSummary() {
  const rows: { cap: string; ok: string }[] = [
    { cap: "Credential intake (Zetrix Attest)", ok: "✅ Configured" },
    { cap: "Resume parsing", ok: "✅ Configured" },
    { cap: "Job preference gathering", ok: "✅ Configured" },
    { cap: "Job search (Tavily → 5 portals)", ok: "✅ Configured" },
    { cap: "Resume generation (Claude Opus)", ok: "✅ Configured" },
    { cap: "Cover letter generation", ok: "✅ Configured" },
    { cap: "Email application submission", ok: "✅ Configured" },
  ];

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-background/80 p-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[280px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60">
              <th className="px-3 py-2 font-medium">Capability</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.cap} className="border-b border-border/80 last:border-0">
                <td className="px-3 py-2 text-muted-foreground">{r.cap}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.ok}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-muted-foreground">
        <span className="font-medium text-foreground">Tools connected:</span> Tavily, Zetrix Attest, Email/SMTP, PDF Generator
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={jobAgentAppUrl("/marketplace/browse")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-medium text-success-foreground shadow-sm transition-colors hover:bg-success/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View in Marketplace
        </a>
        <a
          href={jobAgentAppUrl("/studio/agents")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Configuration
        </a>
      </div>
    </div>
  );
}

export function AgentTaskChatPanel({
  agent,
  onClose,
  onLocked,
}: {
  agent: StudioEntityEnterprise;
  onClose: () => void;
  onLocked?: (task: LockedAgentTaskBrief) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lockedBriefs, setLockedBriefs] = useState<LockedAgentTaskBrief[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const jobV2TimersRef = useRef<number[]>([]);
  const [jobV2UploadsSimulated, setJobV2UploadsSimulated] = useState(false);
  const [jobV2SequenceRunning, setJobV2SequenceRunning] = useState(false);
  const [jobV2SequenceDone, setJobV2SequenceDone] = useState(false);

  const clearJobV2Timers = useCallback(() => {
    jobV2TimersRef.current.forEach((tid) => window.clearTimeout(tid));
    jobV2TimersRef.current = [];
  }, []);

  const startJobV2Sequence = useCallback(() => {
    clearJobV2Timers();
    setJobV2SequenceRunning(true);
    setJobV2SequenceDone(false);

    const runNext = (i: number) => {
      if (i >= JOB_APP_V2_SCRIPT_MESSAGES.length) {
        setJobV2SequenceRunning(false);
        setJobV2SequenceDone(true);
        setTyping(false);
        toast.success("Demo flow complete.");
        return;
      }
      const row = JOB_APP_V2_SCRIPT_MESSAGES[i];
      const delay =
        i === 0 ? JOB_APP_V2_FIRST_RESPONSE_DELAY_MS : getJobAppV2StepDelayMs(row, i);
      setTyping(true);
      const tid = window.setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, jobAppV2RowToChat(row)]);
        runNext(i + 1);
      }, delay);
      jobV2TimersRef.current.push(tid);
    };
    runNext(0);
  }, [clearJobV2Timers]);

  const reset = useCallback(() => {
    clearJobV2Timers();
    if (agent.id === JOB_AGENT_AVATAR_ID) {
      setMessages(mapJobAgentSetupToMessages());
      setLockedBriefs([...JOB_AGENT_SETUP_INITIAL_LOCKS]);
    } else if (agent.id === JOB_APPLICATION_AGENT_V2_ID) {
      setJobV2UploadsSimulated(false);
      setJobV2SequenceRunning(false);
      setJobV2SequenceDone(false);
      setMessages([jobAppV2RowToChat(JOB_APP_V2_WELCOME_MESSAGE)]);
      setLockedBriefs([]);
    } else {
      setMessages([welcomeMessage(agent)]);
      setLockedBriefs([]);
    }
    setInput("");
    setTyping(false);
    setMenuOpen(false);
  }, [agent, clearJobV2Timers]);

  useEffect(() => {
    reset();
  }, [agent.id, reset]);

  useEffect(() => {
    return () => {
      jobV2TimersRef.current.forEach((tid) => window.clearTimeout(tid));
      jobV2TimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    if (typing) return;
    if (agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning) {
      toast.info("Please wait — the demo is running.");
      return;
    }

    if (agent.id === JOB_APPLICATION_AGENT_V2_ID) {
      const userContent = input.trim();
      setInput("");
      const ts = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: userContent,
        timestamp: ts,
      };

      if (jobV2SequenceDone) {
        setMessages((m) => [...m, userMsg]);
        setTyping(true);
        window.setTimeout(() => {
          const assistantMsg: ChatMessage = {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: buildAssistantReply(agent, userContent),
            timestamp: new Date().toISOString(),
            lockable: true,
            richFormat: true,
          };
          setMessages((m) => [...m, assistantMsg]);
          setTyping(false);
        }, 850);
        return;
      }

      if (!jobV2UploadsSimulated) {
        setMessages((m) => [...m, userMsg]);
        toast.error("Demo: tap Attach first to simulate your CV and certificates.");
        return;
      }

      if (!isJobAppV2TriggerMessage(userContent)) {
        setMessages((m) => [...m, userMsg]);
        toast.message("Send the exact request from the welcome message (use copy/paste).", { duration: 5000 });
        return;
      }

      setMessages((m) => [...m, userMsg]);
      startJobV2Sequence();
      return;
    }

    const userContent = input.trim();
    setInput("");
    const ts = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: ts,
    };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: buildAssistantReply(agent, userContent),
        timestamp: new Date().toISOString(),
        lockable: true,
        richFormat: true,
      };
      setMessages((m) => [...m, assistantMsg]);
      setTyping(false);
    }, 700);
  };

  const lockMessage = (msg: ChatMessage) => {
    if (!msg.lockable || msg.locked || msg.lockButtonDisabled) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const title = lastUser?.content.slice(0, 72) || "Task brief";
    const brief: LockedAgentTaskBrief = {
      id: `lock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      agentId: agent.id,
      title: title.length > 72 ? `${title.slice(0, 69)}…` : title,
      summary: msg.content,
      lockedAt: new Date().toISOString(),
    };
    setLockedBriefs((prev) => [brief, ...prev]);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, locked: true } : m)));
    onLocked?.(brief);
    toast.success("Task brief locked for this agent.");
  };

  const displayTime = (msg: ChatMessage) =>
    msg.timeLabel ?? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessageBody = (msg: ChatMessage) => {
    if (msg.deployment) {
      return (
        <>
          <FormattedBrief text={msg.content} />
          <JobAgentDeploymentSummary />
        </>
      );
    }
    if (msg.richFormat) {
      return <FormattedBrief text={msg.content} />;
    }
    return renderTextContent(msg.content);
  };

  const assistantAvatar = (msg: ChatMessage) => {
    if (msg.lane === "myeg") {
      return (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-info/20 text-info">
          <Building2 className="h-4 w-4" />
        </div>
      );
    }
    if (msg.lane === "sime_darby") {
      return (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
          <Building2 className="h-4 w-4" />
        </div>
      );
    }
    if (msg.lane === "maybank") {
      return (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-100">
          <Building2 className="h-4 w-4" />
        </div>
      );
    }
    if (msg.lane === "system") {
      return (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-200">
          <Cpu className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-primary">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
    );
  };

  const assistantBubbleClass = (msg: ChatMessage) => {
    if (msg.lane === "myeg") return "border border-info/30 bg-info/10 text-foreground";
    if (msg.lane === "sime_darby") return "border border-emerald-500/35 bg-emerald-500/10 text-foreground";
    if (msg.lane === "maybank") return "border border-amber-500/35 bg-amber-500/10 text-foreground";
    if (msg.lane === "system") return "border border-violet-500/30 bg-violet-500/10 text-foreground";
    return "bg-secondary text-foreground";
  };

  const recruiterLaneLabel = (lane: NonNullable<ChatMessage["lane"]>) => {
    if (lane === "myeg") return "MYEG HR Recruiter Agent";
    if (lane === "sime_darby") return "Sime Darby HR Recruiter Agent";
    if (lane === "maybank") return "Maybank HR Recruiter Agent";
    return null;
  };

  const renderMessage = (msg: ChatMessage) => (
    <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
      {msg.role === "assistant" ? (
        assistantAvatar(msg)
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[92%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm",
          msg.role === "assistant" ? assistantBubbleClass(msg) : "gradient-primary text-primary-foreground",
        )}
      >
        {msg.role === "assistant" && msg.lane === "myeg" && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-info">{recruiterLaneLabel("myeg")}</p>
        )}
        {msg.role === "assistant" && msg.lane === "sime_darby" && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
            {recruiterLaneLabel("sime_darby")}
          </p>
        )}
        {msg.role === "assistant" && msg.lane === "maybank" && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
            {recruiterLaneLabel("maybank")}
          </p>
        )}
        {msg.role === "assistant" && msg.lane === "system" && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-200">
            System
          </p>
        )}
        {msg.role === "user"
          ? msg.richFormat
            ? (
                <div className="text-primary-foreground">
                  <FormattedBrief text={msg.content} />
                </div>
              )
            : renderTextContent(msg.content)
          : renderMessageBody(msg)}
        {msg.role === "assistant" && msg.lockable && msg.lockButtonDisabled && (
          <button
            type="button"
            disabled
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground opacity-70"
          >
            <Lock className="h-3.5 w-3.5" /> Lock in
          </button>
        )}
        {msg.role === "assistant" && msg.lockable && !msg.lockButtonDisabled && !msg.locked && (
          <button
            type="button"
            onClick={() => lockMessage(msg)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-medium text-success-foreground shadow-sm transition-colors hover:bg-success/90"
          >
            <Lock className="h-3.5 w-3.5" /> Lock in
          </button>
        )}
        {msg.role === "assistant" && msg.lockable && msg.locked && (
          <p className="mt-2 text-xs font-medium text-success">Locked in</p>
        )}
        <p className="mt-1.5 text-[10px] opacity-50">{displayTime(msg)}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-12rem)] max-h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]">
      <header className="relative z-10 flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2 lg:px-4 lg:py-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="flex h-full max-h-[100dvh] min-h-0 w-full max-w-sm flex-col p-0 sm:max-w-md">
            <SheetHeader className="space-y-0 border-b border-border p-4">
              <SheetTitle className="flex items-center gap-2 text-left">
                <MessageCircle className="h-5 w-5 text-primary" />
                Task chat
              </SheetTitle>
              <p className="text-left text-sm text-muted-foreground">
                Operator-style briefs for <span className="font-medium text-foreground">{agent.name}</span>. Locked tasks
                appear below.
              </p>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-4 p-4">
                {lockedBriefs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No locked tasks yet. Send a message and lock a brief.</p>
                ) : (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Locked for execution
                    </p>
                    <ul className="space-y-2">
                      {lockedBriefs.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
                        >
                          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <p className="font-medium leading-tight">{b.title}</p>
                            <p className="text-[11px] text-muted-foreground">{new Date(b.lockedAt).toLocaleString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onClose();
                  }}
                  className="w-full rounded-lg border border-border bg-card py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Back to My Agents
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Chat is not stored after you leave this page.
                </p>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{agent.name}</h2>
            <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          Exit
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 px-4 py-3">
          <div className="space-y-4 pb-4">
            {messages.map(renderMessage)}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  {agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning ? "Processing…" : "Typing…"}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="relative z-10 flex-shrink-0 border-t border-border bg-card p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
            <button
              type="button"
              onClick={() => {
                if (agent.id === JOB_APPLICATION_AGENT_V2_ID) {
                  if (jobV2SequenceRunning || jobV2SequenceDone) {
                    toast.info("Attachments were already simulated for this session.");
                    return;
                  }
                  if (jobV2UploadsSimulated) {
                    toast.info("Attachments already simulated (CV, degree, professional certificate).");
                    return;
                  }
                  setJobV2UploadsSimulated(true);
                  toast.success("Attachments simulated: CV, degree certificate, professional certificate.");
                  return;
                }
                toast.info("Attachments are not available yet.");
              }}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              readOnly={agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning}
              placeholder={
                agent.id === JOB_APPLICATION_AGENT_V2_ID
                  ? jobV2SequenceDone
                    ? `Follow-up message (${agent.name})…`
                    : jobV2UploadsSimulated
                      ? "Paste the exact demo request from the welcome message…"
                      : "After attaching, paste the demo request…"
                  : `Message ${agent.name}...`
              }
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={
                !input.trim() ||
                typing ||
                (agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning)
              }
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                input.trim() &&
                  !typing &&
                  !(agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning)
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
