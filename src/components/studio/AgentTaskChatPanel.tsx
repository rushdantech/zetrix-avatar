import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Building2,
  Cpu,
  ExternalLink,
  Lock,
  Menu,
  MessageCircle,
  Pencil,
  Paperclip,
  Send,
  User,
  X,
} from "lucide-react";
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
  type JobAppV2ChatMessage,
  JOB_APP_V2_FIRST_RESPONSE_DELAY_MS,
  JOB_APP_V2_SCRIPT_MESSAGES,
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
  /** Job Application Agent v2: recruiter org lanes vs system. */
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

function jobApplicationAgentV2Intro(agentName: string): ChatMessage {
  const ts = new Date().toISOString();
  return {
    id: "job-v2-intro",
    role: "assistant",
    content: `Hello — I’m **${agentName}**.

**To start your application flow:**

1. Tap **Attach** to choose documents (you can add more files or remove any before sending).
2. Optionally type a note in the message field.
3. Tap **Send** — your file names and sizes appear in the thread with any note you typed; processing begins after you submit.`,
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

function formatJobV2FileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildJobV2FileDetailsContent(files: File[]): string {
  const list = files.map((f) => {
    const name = f.name.replace(/\*/g, "");
    return `- **${name}** — ${formatJobV2FileSize(f.size)}`;
  });
  return `**Uploaded files** (${list.length})\n\n${list.join("\n")}`;
}

function newJobV2StagedFileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `f-${crypto.randomUUID()}`;
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

type JobV2StagedFile = { id: string; file: File };

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
  const agentRef = useRef(agent);
  agentRef.current = agent;

  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lockedBriefs, setLockedBriefs] = useState<LockedAgentTaskBrief[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const jobV2TimersRef = useRef<number[]>([]);
  const jobV2SessionIdRef = useRef(0);
  const jobV2FileInputRef = useRef<HTMLInputElement>(null);
  const jobV2FileInputId = useId();
  const runJobV2StepRef = useRef<(i: number) => void>(() => {});
  const [jobV2StagedFiles, setJobV2StagedFiles] = useState<JobV2StagedFile[]>([]);
  const [jobV2SequenceRunning, setJobV2SequenceRunning] = useState(false);
  const [jobV2SequenceDone, setJobV2SequenceDone] = useState(false);

  const clearJobV2Timers = useCallback(() => {
    jobV2TimersRef.current.forEach((tid) => window.clearTimeout(tid));
    jobV2TimersRef.current = [];
  }, []);

  runJobV2StepRef.current = (i: number) => {
    const sessionAtStart = jobV2SessionIdRef.current;
    if (i >= JOB_APP_V2_SCRIPT_MESSAGES.length) {
      if (jobV2SessionIdRef.current !== sessionAtStart) return;
      setJobV2SequenceRunning(false);
      setJobV2SequenceDone(true);
      setTyping(false);
      toast.success("Application flow complete.");
      return;
    }
    const row = JOB_APP_V2_SCRIPT_MESSAGES[i];
    const delay = i === 0 ? JOB_APP_V2_FIRST_RESPONSE_DELAY_MS : getJobAppV2StepDelayMs(row, i);
    setTyping(true);
    const tid = window.setTimeout(() => {
      if (jobV2SessionIdRef.current !== sessionAtStart) return;
      setTyping(false);
      setMessages((prev) => [...prev, jobAppV2RowToChat(row)]);
      runJobV2StepRef.current(i + 1);
    }, delay);
    jobV2TimersRef.current.push(tid);
  };

  const reset = useCallback(() => {
    clearJobV2Timers();
    const a = agentRef.current;
    if (a.id === JOB_AGENT_AVATAR_ID) {
      setMessages(mapJobAgentSetupToMessages());
      setLockedBriefs([...JOB_AGENT_SETUP_INITIAL_LOCKS]);
    } else if (a.id === JOB_APPLICATION_AGENT_V2_ID) {
      jobV2SessionIdRef.current += 1;
      setJobV2StagedFiles([]);
      setJobV2SequenceRunning(false);
      setJobV2SequenceDone(false);
      setMessages([jobApplicationAgentV2Intro(a.name)]);
      setLockedBriefs([]);
      if (jobV2FileInputRef.current) jobV2FileInputRef.current.value = "";
    } else {
      setMessages([welcomeMessage(a)]);
      setLockedBriefs([]);
    }
    setInput("");
    setTyping(false);
    setMenuOpen(false);
  }, [agent.id, clearJobV2Timers]);

  // Re-init chat only when switching agents. Do not depend on `reset`'s identity — if `reset` is
  // recreated on parent/merged re-renders, an effect tied to it would wipe staged files mid-session.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: agent id only
  }, [agent.id]);

  useEffect(() => {
    return () => {
      jobV2TimersRef.current.forEach((tid) => window.clearTimeout(tid));
      jobV2TimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, jobV2StagedFiles.length]);

  const send = () => {
    if (typing) return;

    if (agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning) {
      toast.info("Please wait — the application flow is running.");
      return;
    }

    if (agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceDone) {
      if (!input.trim()) return;
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

    if (agent.id === JOB_APPLICATION_AGENT_V2_ID && !jobV2SequenceDone && !jobV2SequenceRunning) {
      if (jobV2StagedFiles.length === 0) {
        toast.error("Add at least one document with the paperclip before sending.");
        return;
      }
      const files = jobV2StagedFiles.map((s) => s.file);
      const userText = input.trim();
      setInput("");
      setJobV2StagedFiles([]);
      if (jobV2FileInputRef.current) jobV2FileInputRef.current.value = "";

      const sessionAtStart = jobV2SessionIdRef.current;
      setJobV2SequenceRunning(true);

      const fileBlock = buildJobV2FileDetailsContent(files);
      const submissionContent = userText ? `${fileBlock}\n\n---\n\n${userText}` : fileBlock;
      const ts = new Date().toISOString();
      setMessages((m) => [
        ...m,
        {
          id: `u-${Date.now()}-f`,
          role: "user",
          content: submissionContent,
          timestamp: ts,
          richFormat: true,
        },
      ]);

      const tid = window.setTimeout(() => {
        if (jobV2SessionIdRef.current !== sessionAtStart) return;
        runJobV2StepRef.current(0);
      }, JOB_APP_V2_FIRST_RESPONSE_DELAY_MS);
      jobV2TimersRef.current.push(tid);
      return;
    }

    if (!input.trim()) return;

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

  const handleJobV2FileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length || agent.id !== JOB_APPLICATION_AGENT_V2_ID) {
      e.target.value = "";
      return;
    }
    if (jobV2SequenceDone || jobV2SequenceRunning) {
      e.target.value = "";
      return;
    }
    // Copy File[] before clearing the input — some browsers empty the live FileList when value is reset.
    const fileArray = Array.from(list);
    e.target.value = "";

    const added = fileArray.map((file) => ({
      id: newJobV2StagedFileId(),
      file,
    }));
    setJobV2StagedFiles((prev) => [...prev, ...added]);
    toast.message(`${fileArray.length} file${fileArray.length === 1 ? "" : "s"} added — press Send when ready.`);
  };

  const removeJobV2StagedFile = (id: string) => {
    setJobV2StagedFiles((prev) => prev.filter((x) => x.id !== id));
  };

  const jobV2ClipDisabled =
    agent.id === JOB_APPLICATION_AGENT_V2_ID && (jobV2SequenceRunning || jobV2SequenceDone);
  const jobV2SendDisabled =
    typing ||
    (agent.id === JOB_APPLICATION_AGENT_V2_ID
      ? jobV2SequenceRunning ||
        (jobV2SequenceDone ? !input.trim() : jobV2StagedFiles.length === 0)
      : !input.trim());

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
    <div
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        /* Mobile: parent is fixed between chrome — fill it; desktop: explicit viewport height */
        "h-full max-h-full",
        "lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]",
      )}
    >
      <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2 lg:px-4 lg:py-3">
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

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Native scroll: more reliable than ScrollArea inside nested flex on mobile (header + composer stay put). */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 touch-pan-y"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="space-y-4 pb-4">
            {messages.map(renderMessage)}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  {agent.id === JOB_APPLICATION_AGENT_V2_ID && jobV2SequenceRunning ? "Working…" : "Typing…"}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {agent.id === JOB_APPLICATION_AGENT_V2_ID &&
          jobV2StagedFiles.length > 0 &&
          !jobV2SequenceRunning &&
          !jobV2SequenceDone && (
            <div className="shrink-0 border-t border-border bg-card px-4 pb-2 pt-2">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-dashed border-primary/35 bg-primary/5 px-4 py-3 text-sm">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Attachments (not sent yet)</p>
                  <ul className="space-y-1.5">
                    {jobV2StagedFiles.map((s) => (
                      <li
                        key={s.id}
                        className="flex min-w-0 items-center gap-2 rounded-lg bg-background/90 px-2 py-1.5 text-[13px]"
                      >
                        <span className="min-w-0 flex-1 truncate">{s.file.name}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatJobV2FileSize(s.file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeJobV2StagedFile(s.id)}
                          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                          aria-label={`Remove ${s.file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Use the paperclip to add more. Press Send when you are ready.
                  </p>
                </div>
              </div>
            </div>
          )}
        <div className="relative z-10 shrink-0 border-t border-border bg-card p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
            {agent.id === JOB_APPLICATION_AGENT_V2_ID ? (
              <>
                <input
                  id={jobV2FileInputId}
                  ref={jobV2FileInputRef}
                  type="file"
                  multiple
                  disabled={jobV2ClipDisabled}
                  className="fixed left-0 top-0 h-px w-px opacity-0"
                  aria-label="Choose files to upload"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
                  onChange={handleJobV2FileChange}
                />
                <label
                  htmlFor={jobV2FileInputId}
                  onClick={(ev) => {
                    if (jobV2SequenceDone) {
                      ev.preventDefault();
                      toast.info("Your documents are already on file for this session.");
                      return;
                    }
                    if (jobV2SequenceRunning) ev.preventDefault();
                  }}
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground",
                    jobV2ClipDisabled && "pointer-events-none cursor-not-allowed opacity-40",
                  )}
                >
                  <Paperclip className="h-4 w-4" aria-hidden />
                </label>
              </>
            ) : (
              <button
                type="button"
                onClick={() => toast.info("Attachments are not available yet.")}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}
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
                    ? `Message ${agent.name}…`
                    : jobV2SequenceRunning
                      ? "The agent is handling your application…"
                      : jobV2StagedFiles.length > 0
                        ? "Optional note — press Send when ready…"
                        : "Attach files with the paperclip, optional note, then Send…"
                  : `Message ${agent.name}...`
              }
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={jobV2SendDisabled}
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                !jobV2SendDisabled
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
