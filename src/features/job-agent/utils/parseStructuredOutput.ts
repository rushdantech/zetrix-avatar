import type { ParsedSegment, StructuredBlockType } from "@/features/job-agent/types";

const BLOCK_REGEX = /```json:([a-z_]+)\s*([\s\S]*?)```/g;

const VALID_TYPES: StructuredBlockType[] = [
  "job_card",
  "resume_preview",
  "cover_letter_preview",
  "application_confirm",
  "application_sent",
  "profile_summary",
  "preferences_summary",
  "attested_credentials",
];

export function parseStructuredOutput(raw: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = BLOCK_REGEX.exec(raw)) !== null) {
    const [fullMatch, maybeType, jsonContent] = match;
    const start = match.index;

    if (start > lastIndex) {
      const text = raw.slice(lastIndex, start).trim();
      if (text) segments.push({ kind: "text", text });
    }

    const blockType = maybeType as StructuredBlockType;
    if (!VALID_TYPES.includes(blockType)) {
      segments.push({ kind: "text", text: fullMatch });
      lastIndex = start + fullMatch.length;
      continue;
    }

    try {
      const data = JSON.parse(jsonContent);
      segments.push({ kind: "structured", blockType, data, raw: fullMatch });
    } catch {
      // Fallback to plain text if agent returned malformed JSON.
      segments.push({ kind: "text", text: fullMatch });
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < raw.length) {
    const tail = raw.slice(lastIndex).trim();
    if (tail) segments.push({ kind: "text", text: tail });
  }

  return segments.length ? segments : [{ kind: "text", text: raw }];
}
