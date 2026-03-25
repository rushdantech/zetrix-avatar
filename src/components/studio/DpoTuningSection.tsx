import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CheckCircle2, Loader2, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface DpoQuestion {
  id: string;
  text: string;
  answer?: string;
}

export const MOCK_DPO_QUESTIONS: Omit<DpoQuestion, "answer">[] = [
  {
    id: "q1",
    text: "When someone disagrees with you in a comment, how do you prefer your avatar to respond? (e.g. stay neutral, lean into debate, deflect with humor)",
  },
  {
    id: "q2",
    text: "Describe the kind of humor your avatar should use. Give one example of a joke or tone you'd want vs. one you'd avoid.",
  },
  {
    id: "q3",
    text: "What topics should your avatar never comment on or endorse, even if asked?",
  },
  {
    id: "q4",
    text: "How formal or casual should the voice be on a scale from 'professional only' to 'best friend slang'? Describe in one sentence.",
  },
  {
    id: "q5",
    text: "If a brand wants your avatar to promote a product, what boundaries should it respect? (e.g. no paid health claims, no politics)",
  },
  {
    id: "q6",
    text: "Write a sample reply your avatar might send to a follower asking: 'How do you stay so consistent with content?'",
  },
];

export function DpoTuningSection({
  entityId,
  avatarName,
  dpoAnswers,
  setDpoAnswers,
}: {
  entityId: string;
  avatarName: string;
  dpoAnswers: Record<string, string>;
  setDpoAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState("");
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    sessionStartedRef.current = false;
    setIsGenerating(false);
    setInput("");
  }, [entityId]);

  const merged = useMemo(
    () => MOCK_DPO_QUESTIONS.map((q) => ({ ...q, answer: dpoAnswers[q.id] })),
    [dpoAnswers],
  );
  const allAnswered = useMemo(
    () => MOCK_DPO_QUESTIONS.every((q) => (dpoAnswers[q.id] || "").trim() !== ""),
    [dpoAnswers],
  );
  const hasAnyAnswer = useMemo(
    () => MOCK_DPO_QUESTIONS.some((q) => (dpoAnswers[q.id] || "").trim() !== ""),
    [dpoAnswers],
  );
  const currentIndex = useMemo(() => {
    if (allAnswered) return MOCK_DPO_QUESTIONS.length - 1;
    const i = MOCK_DPO_QUESTIONS.findIndex((q) => !(dpoAnswers[q.id] || "").trim());
    return i < 0 ? 0 : i;
  }, [dpoAnswers, allAnswered]);

  const inSession = sessionStartedRef.current || hasAnyAnswer || allAnswered;

  const startDpoQuestionnaire = () => {
    sessionStartedRef.current = true;
    setIsGenerating(true);
    setInput("");
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("DPO questionnaire ready. Answer each question for this avatar.");
    }, 1000);
  };

  const submitDpoAnswer = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const q = MOCK_DPO_QUESTIONS[currentIndex];
    if (!q) return;
    setDpoAnswers((prev) => {
      const next = { ...prev, [q.id]: trimmed };
      const complete = MOCK_DPO_QUESTIONS.every((x) => (next[x.id] || "").trim() !== "");
      if (complete) {
        queueMicrotask(() => toast.success("DPO answers saved for this avatar. Use Save changes to persist."));
      }
      return next;
    });
    setInput("");
  };

  const resetDpo = () => {
    sessionStartedRef.current = false;
    setDpoAnswers({});
    setInput("");
    setIsGenerating(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Direct Policy Optimization (DPO)</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Preference questions for <span className="font-medium text-foreground">{avatarName}</span>. Answers tune response
        behavior. Use <span className="font-medium text-foreground">Save changes</span> above to store this avatar.
      </p>

      {isGenerating && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Generating questions based on this avatar…
        </div>
      )}

      {!inSession && !isGenerating && (
        <button
          type="button"
          onClick={startDpoQuestionnaire}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Bot className="h-4 w-4" /> Generate questionnaire
        </button>
      )}

      {inSession && !isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {allAnswered ? "All questions answered" : `Question ${currentIndex + 1} of ${MOCK_DPO_QUESTIONS.length}`}
            </span>
            <button type="button" onClick={resetDpo} className="text-xs text-muted-foreground hover:text-foreground">
              Start over
            </button>
          </div>
          <div className="flex h-[280px] flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3 pr-2">
                {merged.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <div className={cn("max-w-[85%] rounded-xl px-4 py-2.5 text-sm", "gradient-primary text-primary-foreground")}>
                      <div className="mb-1 flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 opacity-90" />
                        <span className="text-xs font-medium opacity-90">Question {i + 1}</span>
                      </div>
                      <p className="text-[13px]">{q.text}</p>
                    </div>
                    {q.answer != null && q.answer !== "" && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-xl bg-secondary px-4 py-2.5 text-sm">
                          <div className="mb-1 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Your answer</span>
                          </div>
                          <p className="text-[13px]">{q.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {!allAnswered && (
              <div className="border-t border-border bg-background/50 p-3">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitDpoAnswer();
                      }
                    }}
                    placeholder="Type your answer…"
                    rows={2}
                    className="min-h-[2.5rem] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={submitDpoAnswer}
                    disabled={!input.trim()}
                    className="flex items-center gap-1.5 self-end rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:enabled:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Submit
                  </button>
                </div>
              </div>
            )}
          </div>
          {allAnswered && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              All DPO responses captured. Click Save changes to keep this avatar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
