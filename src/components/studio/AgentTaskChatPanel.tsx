import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Lock, Menu, MessageCircle, Paperclip, Send, User } from "lucide-react";
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
import type { StudioEntityEnterprise } from "@/types/studio";

export interface LockedAgentTaskBrief {
  id: string;
  agentId: string;
  title: string;
  summary: string;
  lockedAt: string;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  lockable?: boolean;
  locked?: boolean;
};

function welcomeMessage(agent: StudioEntityEnterprise): ChatMessage {
  const ts = new Date().toISOString();
  return {
    id: "welcome",
    role: "assistant",
    content: `You’re connected to **${agent.name}**. Describe tasks, constraints, and deadlines — I’ll reply with a structured brief. When it looks right, tap **Lock in** to commit it for execution.`,
    timestamp: ts,
  };
}

function buildAssistantReply(agent: StudioEntityEnterprise, userText: string): string {
  const s = agent.enterpriseSetup;
  const objective = userText.trim() || "(empty — add details)";
  return `**${agent.name}** · ${s.agentType}\n\n**Interpreted objective:** ${objective.slice(0, 500)}${objective.length > 500 ? "…" : ""}\n\n**Plan:** ${s.capabilities.slice(0, 3).join(", ") || "General capabilities"} → validate → execute → report.\n**Ops window:** ${s.operatingHours} · **Max concurrent:** ${s.maxConcurrentTasks}\n**Escalation:** ${s.escalationEmail || "—"}\n\nIf this matches what you want, lock it in below.`;
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

  const reset = useCallback(() => {
    setMessages([welcomeMessage(agent)]);
    setInput("");
    setTyping(false);
    setLockedBriefs([]);
    setMenuOpen(false);
  }, [agent]);

  useEffect(() => {
    reset();
  }, [agent.id, reset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim() || typing) return;
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
      };
      setMessages((m) => [...m, assistantMsg]);
      setTyping(false);
    }, 700);
  };

  const lockMessage = (msg: ChatMessage) => {
    if (!msg.lockable || msg.locked) return;
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

  const renderMessage = (msg: ChatMessage) => (
    <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
          msg.role === "assistant" ? "gradient-primary" : "bg-secondary",
        )}
      >
        {msg.role === "assistant" ? (
          <Bot className="h-4 w-4 text-primary-foreground" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[92%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm",
          msg.role === "assistant" ? "bg-secondary text-foreground" : "gradient-primary text-primary-foreground",
        )}
      >
        {renderTextContent(msg.content)}
        {msg.role === "assistant" && msg.lockable && !msg.locked && (
          <button
            type="button"
            onClick={() => lockMessage(msg)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
          >
            <Lock className="h-3.5 w-3.5" /> Lock in
          </button>
        )}
        {msg.role === "assistant" && msg.locked && (
          <p className="mt-2 text-xs font-medium text-success">Locked in</p>
        )}
        <p className="mt-1.5 text-[10px] opacity-50">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100vh-5rem)]">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2 lg:px-4 lg:py-3">
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
          <SheetContent side="left" className="flex w-full max-w-sm flex-col p-0 sm:max-w-md">
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
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4 pb-4">
            {messages.map(renderMessage)}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
            <button
              type="button"
              onClick={() => toast.info("Attachments are not available yet.")}
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
              placeholder={`Message ${agent.name}...`}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                input.trim() && !typing
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
