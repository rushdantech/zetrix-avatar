import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CalendarClock,
  Database,
  FileOutput,
  ListTree,
  ScrollText,
  Wrench,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import type { StudioEntityEnterprise } from "@/types/studio";

const tabMeta = [
  {
    value: "activity",
    label: "Activity",
    hint: "What it did and whether it worked",
    icon: ScrollText,
  },
  {
    value: "tools",
    label: "Tools",
    hint: "How it got things done",
    icon: Wrench,
  },
  {
    value: "scheduled",
    label: "Scheduled",
    hint: "Tasks it runs automatically",
    icon: CalendarClock,
  },
  {
    value: "outputs",
    label: "Outputs",
    hint: "Files and results you received",
    icon: FileOutput,
  },
  {
    value: "memory",
    label: "Memory",
    hint: "What it remembers about you",
    icon: Brain,
  },
  {
    value: "data-access",
    label: "Data access",
    hint: "What data it used or touched",
    icon: Database,
  },
] as const;

function mockLinesForAgent(agent: StudioEntityEnterprise): Record<(typeof tabMeta)[number]["value"], string[]> {
  const caps = agent.enterpriseSetup.capabilities.slice(0, 3).join(", ") || "general workflows";
  return {
    activity: [
      `${new Date().toISOString().slice(0, 10)} 09:14 — Parsed incoming task brief; status OK`,
      `${new Date().toISOString().slice(0, 10)} 09:16 — Validated inputs against policy pack v2; passed`,
      `${new Date().toISOString().slice(0, 10)} 09:22 — Submitted draft to review queue; awaiting human gate`,
    ],
    tools: [
      `MCP / capability hooks: ${caps}`,
      "Document parser (internal) — 2 calls, 0 errors",
      "HTTP connector — 1 call (Custom API or provider stub), latency ~340 ms",
    ],
    scheduled: [
      "Daily 08:00 — Digest unpaid invoices (disabled)",
      "Weekly Mon 07:30 — Compliance checklist sweep",
      "On webhook — Process partner file drops (not configured)",
    ],
    outputs: [
      "report_draft_2026Q1.pdf — generated, not sent",
      "summary_notes.md — attached to last task thread",
      "export_rows.csv — 0 rows (no production data)",
    ],
    memory: [
      `Preference: escalation → ${agent.enterpriseSetup.escalationEmail || "ops@example.com"}`,
      "Remembered: business hours constraint from Step 2",
      "No long-term vector memory stored for this agent",
    ],
    "data-access": [
      "Read: task briefs, capability config, ZID scopes (if credentialed)",
      "Write: internal audit log stream",
      "Did not access: payroll DB, customer PII stores (not connected)",
    ],
  };
}

export default function AgentLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const merged = useMergedStudioEntities();
  const entity = useMemo(() => merged.find((d) => d.id === id), [merged, id]);

  if (!entity || entity.type !== "enterprise") {
    return (
      <div className="space-y-4 pb-20 lg:pb-0">
        <p className="text-sm text-muted-foreground">Agent not found or logs are only available for AI agents.</p>
        <Link to="/studio/agents" className="text-sm font-medium text-primary hover:underline">
          ← Back to My Agents
        </Link>
      </div>
    );
  }

  const agent = entity as StudioEntityEnterprise;
  const lines = mockLinesForAgent(agent);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/studio/agents")}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            My Agents
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <ListTree className="h-8 w-8 text-primary" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold">Agent logs</h1>
              <p className="text-sm text-muted-foreground">
                <Link to={studioEntityPath(agent)} className="font-medium text-foreground hover:underline">
                  {agent.name}
                </Link>
                <span className="text-muted-foreground"> — operational history and transparency.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Use the tabs below to review what this agent did, which tools it used, what runs on a schedule, what it produced,
        what it remembers, and which data it touched.
      </p>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-4 flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
          {tabMeta.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 px-3 py-2 text-xs data-[state=active]:shadow-sm sm:text-sm"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabMeta.map(({ value, label, hint, icon: Icon }) => (
          <TabsContent key={value} value={value} className="mt-0">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{label}</h2>
                  <p className="text-sm text-muted-foreground">{hint}</p>
                </div>
              </div>
              <ul className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                {lines[value].map((line, i) => (
                  <li key={i} className="flex gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
