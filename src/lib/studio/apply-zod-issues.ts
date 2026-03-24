import type { FieldPath, UseFormSetError, FieldValues } from "react-hook-form";
import type { ZodIssue } from "zod";

export function applyZodIssues<T extends FieldValues>(issues: ZodIssue[], setError: UseFormSetError<T>) {
  for (const issue of issues) {
    const name = (issue.path.length ? issue.path.join(".") : "root") as FieldPath<T>;
    setError(name, { message: issue.message });
  }
}
