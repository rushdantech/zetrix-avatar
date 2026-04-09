/**
 * Mock workspace tree and file bodies for ZetrixClaw. Edits persist to localStorage (browser prototype).
 */

export const WORKSPACE_DISPLAY_ROOT = "root/.openclaw/workspace";

const STORAGE_KEY = "zetrix-avatar:zetrixclawWorkspaceFiles";

export type WorkspaceTreeFile = {
  type: "file";
  id: string;
  title: string;
  description?: string;
  /** Optional banner under title when this file is open */
  infoBanner?: string;
};

export type WorkspaceTreeFolder = {
  type: "folder";
  id: string;
  label: string;
  children: (WorkspaceTreeFile | WorkspaceTreeFolder)[];
};

export function countWorkspaceFiles(nodes: (WorkspaceTreeFile | WorkspaceTreeFolder)[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "file") n += 1;
    else n += countWorkspaceFiles(node.children);
  }
  return n;
}

/** Sidebar launcher segment → default file to open + folders to expand */
export const SIDEBAR_FOCUS_MAP: Record<
  string,
  { fileId: string; expandFolderIds: string[] }
> = {
  memory: { fileId: "memory/USER.md", expandFolderIds: ["memory"] },
  prompts: { fileId: "prompts/structured_brief.md", expandFolderIds: ["prompts"] },
  skills: { fileId: "skills/market-research.md", expandFolderIds: ["skills"] },
  "agents-md": { fileId: "AGENTS.md", expandFolderIds: ["workspace-root"] },
  docs: { fileId: "docs/README.md", expandFolderIds: ["docs"] },
  briefs: { fileId: "briefs/execution-notes.md", expandFolderIds: ["briefs"] },
  scripts: { fileId: "scripts/preflight.sh", expandFolderIds: ["scripts"] },
  configs: { fileId: "configs/gateway.env", expandFolderIds: ["configs"] },
};

export const DEFAULT_WORKSPACE_TREE: (WorkspaceTreeFile | WorkspaceTreeFolder)[] = [
  {
    type: "folder",
    id: "memory",
    label: "memory",
    children: [
      {
        type: "file",
        id: "memory/USER.md",
        title: "USER.md",
        description: "Long-term memory summary for the current collaborator",
      },
      {
        type: "file",
        id: "memory/memory_consolidation.env",
        title: "memory_consolidation.env",
        description: "Memory retention / consolidation settings",
      },
      {
        type: "file",
        id: "memory/session_scratch.md",
        title: "session_scratch.md",
        description: "Short-lived session notes (cleared on restart)",
      },
    ],
  },
  {
    type: "folder",
    id: "prompts",
    label: "prompts",
    children: [
      {
        type: "file",
        id: "prompts/structured_brief.md",
        title: "structured_brief.md",
        description: "Default brief format used before execution",
      },
      {
        type: "file",
        id: "prompts/snippets.md",
        title: "snippets.md",
        description: "Reusable prompt fragments",
      },
    ],
  },
  {
    type: "folder",
    id: "state",
    label: "state",
    children: [
      {
        type: "file",
        id: "state/runtime_state.json",
        title: "runtime_state.json",
        description: "Runtime lifecycle, queue, and gateway state",
        infoBanner:
          "Runtime state is read by the agent during execution. Save to apply mock changes in this prototype.",
      },
    ],
  },
  {
    type: "folder",
    id: "skills",
    label: "skills",
    children: [
      {
        type: "file",
        id: "skills/market-research.md",
        title: "market-research.md",
        description: "Reusable task skill for scanning / analysis",
      },
      {
        type: "file",
        id: "skills/find-skills.md",
        title: "find-skills.md",
        description: "Helper for selecting reusable skills before execution",
      },
      {
        type: "file",
        id: "skills/README.md",
        title: "README.md",
        description: "Index of registered skills",
      },
    ],
  },
  {
    type: "folder",
    id: "workspace-root",
    label: "workspace root",
    children: [
      {
        type: "file",
        id: "AGENTS.md",
        title: "AGENTS.md",
        description: "Agent identity and default runtime instructions",
      },
      {
        type: "file",
        id: "BOOTSTRAP.md",
        title: "BOOTSTRAP.md",
        description: "First-run notes and startup sequence",
      },
    ],
  },
  {
    type: "folder",
    id: "docs",
    label: "docs",
    children: [
      {
        type: "file",
        id: "docs/README.md",
        title: "README.md",
        description: "Workspace documentation index",
      },
    ],
  },
  {
    type: "folder",
    id: "briefs",
    label: "briefs",
    children: [
      {
        type: "file",
        id: "briefs/execution-notes.md",
        title: "execution-notes.md",
        description: "Saved execution briefs and outcomes",
      },
    ],
  },
  {
    type: "folder",
    id: "scripts",
    label: "scripts",
    children: [
      {
        type: "file",
        id: "scripts/preflight.sh",
        title: "preflight.sh",
        description: "Pre-execution checks",
        infoBanner:
          "Terminal requested. The agent is ready to open its execution environment.",
      },
    ],
  },
  {
    type: "folder",
    id: "configs",
    label: "configs",
    children: [
      {
        type: "file",
        id: "configs/gateway.env",
        title: "gateway.env",
        description: "Gateway and routing configuration",
      },
    ],
  },
];

export const DEFAULT_FILE_CONTENT: Record<string, string> = {
  "memory/USER.md": `# User memory

## Collaborator
- Preferences: concise structured replies; execution-first tone.
- Recent context: ZetrixClaw runtime session; workspace files are editable in-browser.

## Consolidation
Facts below are mock placeholders for long-term memory.
`,

  "memory/memory_consolidation.env": `# Memory retention (mock)
RETENTION_DAYS=90
CONSOLIDATE_ON_IDLE=true
MAX_CHUNK_TOKENS=4000
`,

  "memory/session_scratch.md": `# Session scratch
- Last topic: workspace navigation
`,

  "prompts/structured_brief.md": `---
title: Structured brief
---

## Objective
(One line)

## Constraints
- 

## Deadline
- 

## Workspace pointers
- Link relevant files under memory/, skills/, or configs/

## Acceptance
- 
`,

  "prompts/snippets.md": `# Snippets
- "Summarize the plan before execution."
- "List matched skills and risks."
`,

  "state/runtime_state.json": `{
  "lifecycle": "idle",
  "queue_depth": 0,
  "gateway": "mock",
  "last_sync": null,
  "notes": "Edit to simulate runtime state in the prototype."
}
`,

  "skills/market-research.md": `# Skill: market-research

## Purpose
Scan sources and return structured findings with citations when available.

## Inputs
- Topic, scope, time window

## Outputs
- Bullet summary, risks, next actions
`,

  "skills/find-skills.md": `# Skill: find-skills

## Purpose
Match user intent to registered skills under skills/ before locking execution.

## Rules
- Prefer smallest skill set that covers the task
- Note dependencies on workspace files
`,

  "skills/README.md": `# Skills index (mock)
- market-research.md
- find-skills.md
`,

  "AGENTS.md": `# AGENTS.md — workspace identity

## Role
You are a ZetrixClaw general-purpose operations copilot with access to this workspace.

## Runtime rules
- Prefer structured briefs before execution.
- Reference memory/, prompts/, and skills/ when tasks involve files or configuration.
- Honor user constraints and deadlines from chat.

## Style
- Clear, operational language; avoid filler.

## Execution behavior
- Draft plans with matched skills; confirm with the user before locked runs when policy requires.

## Operating guidance
- Treat this workspace as the source of truth for reusable context in this browser prototype.
`,

  "BOOTSTRAP.md": `# Bootstrap

## First run
1. Verify AGENTS.md and prompts/structured_brief.md
2. Load state/runtime_state.json (mock)
3. Open runtime chat and brief a task

## Startup sequence (mock)
- Workspace loaded → agent ready → chat session active
`,

  "docs/README.md": `# Docs
- Link internal references and runbooks here (mock).
`,

  "briefs/execution-notes.md": `# Execution notes
_No locked runs yet — mock workspace._
`,

  "scripts/preflight.sh": `#!/usr/bin/env bash
set -euo pipefail
echo "preflight: OK (mock)"
# Add checks before execution lock
`,

  "configs/gateway.env": `# Gateway (mock)
GATEWAY_MODE=dev
ROUTING_POLICY=default
`,
};

export function loadWorkspaceOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    if (p && typeof p === "object") {
      for (const [k, v] of Object.entries(p)) {
        if (typeof v === "string") out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function persistWorkspaceOverrides(overrides: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}

/** Clears all edited workspace file bodies (prototype localStorage). */
export function clearWorkspaceOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getFileContent(
  fileId: string,
  overrides: Record<string, string>,
): string {
  if (Object.prototype.hasOwnProperty.call(overrides, fileId)) {
    return overrides[fileId];
  }
  return DEFAULT_FILE_CONTENT[fileId] ?? "";
}

/** Collect every file id from tree */
export function collectFileIds(nodes: (WorkspaceTreeFile | WorkspaceTreeFolder)[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "file") ids.push(node.id);
    else ids.push(...collectFileIds(node.children));
  }
  return ids;
}

/** Find file meta by id */
export function findFileMeta(
  nodes: (WorkspaceTreeFile | WorkspaceTreeFolder)[],
  fileId: string,
): WorkspaceTreeFile | null {
  for (const node of nodes) {
    if (node.type === "file" && node.id === fileId) return node;
    if (node.type === "folder") {
      const f = findFileMeta(node.children, fileId);
      if (f) return f;
    }
  }
  return null;
}
