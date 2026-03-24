import type { Dispatch, SetStateAction } from "react";
import { questionnaireQuestions, type QuestionnaireQuestion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type QuestionnaireAnswers = Record<number, string | string[] | number>;

export function formatQuestionnaireAnswer(
  q: QuestionnaireQuestion,
  value: string | string[] | number | undefined,
): string {
  if (value === undefined) return "—";
  if (q.type === "multi") {
    const arr = Array.isArray(value) ? value : [];
    return arr.length ? arr.join(", ") : "—";
  }
  if (q.type === "scale" && typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim() ? value : "—";
  if (typeof value === "number") return String(value);
  return "—";
}

interface QuestionnaireFieldsProps {
  answers: QuestionnaireAnswers;
  setAnswers: Dispatch<SetStateAction<QuestionnaireAnswers>>;
  scrollClassName?: string;
}

export function QuestionnaireFields({ answers, setAnswers, scrollClassName }: QuestionnaireFieldsProps) {
  return (
    <div className={cn("space-y-5 overflow-y-auto pr-2", scrollClassName ?? "max-h-[28rem]")}>
      {questionnaireQuestions.map((q) => (
        <div key={q.id} className="rounded-lg bg-secondary p-4">
          <p className="mb-1 text-sm font-medium">
            {q.id}. {q.question}
          </p>
          {q.type === "multi" && <p className="mb-2 text-xs text-muted-foreground">Select up to {q.maxSelect}</p>}

          {q.type === "single" && q.options && (
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className="accent-primary"
                    style={{ accentColor: "hsl(352, 72%, 42%)" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.type === "multi" && q.options && (
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt) => {
                const selected = (answers[q.id] as string[]) || [];
                const isChecked = selected.includes(opt);
                const atMax = selected.length >= (q.maxSelect || 99) && !isChecked;
                return (
                  <label
                    key={opt}
                    className={cn("flex cursor-pointer items-center gap-2 text-sm", atMax && "cursor-not-allowed opacity-40")}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={atMax}
                      onChange={() => {
                        setAnswers((a) => {
                          const prev = (a[q.id] as string[]) || [];
                          const next = isChecked ? prev.filter((v) => v !== opt) : [...prev, opt];
                          return { ...a, [q.id]: next };
                        });
                      }}
                      className="accent-primary"
                      style={{ accentColor: "hsl(352, 72%, 42%)" }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {q.type === "scale" && (
            <div className="mt-3">
              <input
                type="range"
                min={q.scaleRange?.[0] || 1}
                max={q.scaleRange?.[1] || 5}
                step={1}
                value={(answers[q.id] as number) || q.scaleRange?.[0] || 1}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))}
                className="w-full accent-primary"
                style={{ accentColor: "hsl(352, 72%, 42%)" }}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{q.scaleMin}</span>
                <span className="font-medium text-foreground">{(answers[q.id] as number) || q.scaleRange?.[0] || 1}</span>
                <span>{q.scaleMax}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
