import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Lock, Send, User } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
  lockable?: boolean;
  locked?: boolean;
};

function welcomeMessage(agent: StudioEntityEnterprise): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: `You’re connected to **${agent.name}**. Describe tasks, constraints, and deadlines — I’ll reply with a structured brief. When it looks right, tap **Lock in** to commit it for execution (demo; no real backend).`,
  };
}

function buildAssistantReply(agent: StudioEntityEnterprise, userText: string): string {
  const s = agent.enterpriseSetup;
  const objective = userText.trim() || "(empty — add details)";
  return `**${agent.name}** · ${s.agentType}\n\n**Interpreted objective:** ${objective.slice(0, 500)}${objective.length > 500 ? "…" : ""}\n\n**Plan:** ${s.capabilities.slice(0, 3).join(", ") || "General capabilities"} → validate → execute → report.\n**Ops window:** ${s.operatingHours} · **Max concurrent:** ${s.maxConcurrentTasks}\n**Escalation:** ${s.escalationEmail || "—"}\n\nIf this matches what you want, lock it in below.`;
}

export function AgentTaskChatSheet({
  open,
  onOpenChange,
  agent,
  onLocked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: StudioEntityEnterprise | null;
  onLocked?: (task: LockedAgentTaskBrief) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lockedBriefs, setLockedBriefs] = useState<LockedAgentTaskBrief[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    if (!agent) return;
    setMessages([welcomeMessage(agent)]);
    setInput("");
    setTyping(false);
    setLockedBriefs([]);
  }, [agent]);

  useEffect(() => {
    if (open && agent) reset();
  }, [open, agent?.id, reset, agent]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!agent || !input.trim() || typing) return;
    const userContent = input.trim();
    setInput("");
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userContent,
    };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: buildAssistantReply(agent, userContent),
        lockable: true,
      };
      setMessages((m) => [...m, assistantMsg]);
      setTyping(false);
    }, 700);
  };

  const lockMessage = (msg: ChatMessage) => {
    if (!agent || !msg.lockable || msg.locked) return;
    const title = messages.filter((m) => m.role === "user").pop()?.content.slice(0, 72) || "Task brief";
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
    toast.success("Task brief locked for this agent (demo).");
  };

  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg md:max-w-xl"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle className="pr-8">Task chat</SheetTitle>
          <SheetDescription>
            Chat with <span className="font-medium text-foreground">{agent.name}</span> to brief work, then lock tasks —
            OpenClaw-style operator control (mock).
          </SheetDescription>
        </SheetHeader>

        {lockedBriefs.length > 0 && (
          <div className="border-b border-border bg-secondary/40 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Locked for execution</p>
            <ul className="max-h-28 space-y-2 overflow-y-auto text-sm">
              {lockedBriefs.map((b) => (
                <li key={b.id} className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(b.lockedAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div className="space-y-4 py-4 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2.5 text-sm",
                    msg.role === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
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
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Tell the agent what to do…"
              rows={2}
              className="min-h-[2.75rem] flex-1 resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || typing}
              className="flex shrink-0 items-center gap-1.5 self-end rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Demo only — messages are not stored after you leave this page.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
