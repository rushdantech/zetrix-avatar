import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BootstrapTokenModal } from "@/components/identity/BootstrapTokenModal";
import { CredentialingWizard, type CredentialingIssuePayload } from "@/components/identity/CredentialingWizard";
import { AgentCredentialTable } from "@/components/identity/AgentCredentialTable";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mockAgentCredentials } from "@/data/identity/mock-agents";
import type { AgentCredential } from "@/types/identity";

function newBootstrapToken() {
  return `zid_bootstrap_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

export default function AgentCredentials() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefillFromUrl = useMemo(() => {
    const m = location.pathname.match(/\/identity\/agents\/credential\/([^/]+)\/?$/);
    return m?.[1];
  }, [location.pathname]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [localCredentials, setLocalCredentials] = useState<AgentCredential[]>(mockAgentCredentials);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<"issue" | "edit">("issue");
  const [wizardInitialPayload, setWizardInitialPayload] = useState<CredentialingIssuePayload | null>(null);
  const [wizardAgent, setWizardAgent] = useState<{ id: string; name: string } | null>(null);
  const [pendingIssue, setPendingIssue] = useState<CredentialingIssuePayload | null>(null);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["identity-agents"],
    queryFn: () =>
      new Promise<{ entities: typeof mockStudioEntities }>((resolve) =>
        setTimeout(() => resolve({ entities: mockStudioEntities.filter((e) => e.type === "enterprise") }), 200),
      ),
  });

  const rows = useMemo(() => {
    if (!data) return [];
    let out = data.entities.map((e) => ({
      ...e,
      credential: localCredentials.find((c) => c.agentId === e.id),
    }));
    if (search.trim()) out = out.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "credentialed") out = out.filter((r) => !!r.credential);
    if (filter === "not_credentialed") out = out.filter((r) => !r.credential);
    if (filter === "suspended") out = out.filter((r) => r.credential?.status === "suspended");
    if (filter === "revoked") out = out.filter((r) => r.credential?.status === "revoked");
    return out;
  }, [data, filter, search, localCredentials]);

  const openWizardFor = (id: string) => {
    const row = rows.find((r) => r.id === id) ?? data?.entities.find((e) => e.id === id);
    if (!row) return;
    setWizardMode("issue");
    setWizardInitialPayload(null);
    setWizardAgent({ id: row.id, name: row.name });
    setWizardOpen(true);
  };

  const openEditWizard = (agentId: string) => {
    const row = rows.find((r) => r.id === agentId) ?? data?.entities.find((e) => e.id === agentId);
    const c = localCredentials.find((x) => x.agentId === agentId);
    if (!row || !c) return;
    setWizardMode("edit");
    setWizardInitialPayload({
      scopes: [...c.scopes],
      validFrom: c.validFrom ?? new Date().toISOString(),
      validTo: c.validTo ?? new Date().toISOString(),
      usageLimit: c.usageLimit ?? null,
    });
    setWizardAgent({ id: row.id, name: row.name });
    setWizardOpen(true);
  };

  useEffect(() => {
    const q = searchParams.get("preselect");
    const id = prefillFromUrl || q;
    if (!id || !data) return;
    const ent = data.entities.find((e) => e.id === id);
    if (ent) {
      setWizardMode("issue");
      setWizardInitialPayload(null);
      setWizardAgent({ id: ent.id, name: ent.name });
      setWizardOpen(true);
      if (prefillFromUrl) {
        navigate("/identity/agents", { replace: true });
      }
    }
  }, [prefillFromUrl, searchParams, data, navigate]);

  const applyCredentialFromIssue = (agentId: string, issue: CredentialingIssuePayload) => {
    setLocalCredentials((prev) => {
      const next = prev.filter((c) => c.agentId !== agentId);
      return [
        ...next,
        {
          agentId,
          status: "active" as const,
          bindingStatus: "awaiting_binding" as const,
          scopes: issue.scopes,
          validFrom: issue.validFrom,
          validTo: issue.validTo,
          usageUsed: 0,
          usageLimit: issue.usageLimit,
        },
      ];
    });
  };

  const handleWizardIssue = (issue: CredentialingIssuePayload) => {
    if (!wizardAgent) return;
    if (wizardMode === "edit") {
      setLocalCredentials((prev) =>
        prev.map((cred) =>
          cred.agentId === wizardAgent.id
            ? {
                ...cred,
                scopes: issue.scopes,
                validFrom: issue.validFrom,
                validTo: issue.validTo,
                usageLimit: issue.usageLimit,
              }
            : cred,
        ),
      );
      toast.success("Digital credential updated.");
      setWizardAgent(null);
      setWizardInitialPayload(null);
      setWizardMode("issue");
      return;
    }
    setPendingIssue(issue);
    setBootstrapToken(newBootstrapToken());
    setCopied(false);
    setShowBootstrap(true);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Agent Credentials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Credential new agents or edit digital credentials from each row (Actions).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by agent name"
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="credentialed">Credentialed</option>
          <option value="not_credentialed">Not credentialed</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <AgentCredentialTable
        rows={rows}
        onSuspendToggle={(agentId, isSuspended) => {
          setLocalCredentials((prev) =>
            prev.map((c) =>
              c.agentId === agentId ? { ...c, status: isSuspended ? "active" : "suspended" } : c,
            ),
          );
          toast.success(isSuspended ? "Credential reactivated." : "Credential suspended.");
        }}
        onRevoke={(agentId) => setConfirmRevoke(agentId)}
        onReissueToken={(agentId) => {
          const c = localCredentials.find((x) => x.agentId === agentId);
          const name = rows.find((r) => r.id === agentId)?.name ?? agentId;
          setWizardAgent({ id: agentId, name });
          if (c) {
            setPendingIssue({
              scopes: c.scopes,
              validFrom: c.validFrom ?? new Date().toISOString(),
              validTo: c.validTo ?? new Date().toISOString(),
              usageLimit: c.usageLimit ?? null,
            });
          }
          setBootstrapToken(newBootstrapToken());
          setCopied(false);
          setShowBootstrap(true);
          toast.warning("Re-issue bootstrap token — copy the new token and rotate in your agent environment.");
        }}
        onOpenWizard={(agentId) => openWizardFor(agentId)}
        onEditCredential={(agentId) => openEditWizard(agentId)}
      />

      <CredentialingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        agentName={wizardAgent?.name ?? ""}
        onIssue={handleWizardIssue}
        initialPayload={wizardInitialPayload}
        mode={wizardMode}
      />

      <BootstrapTokenModal
        open={showBootstrap}
        token={bootstrapToken}
        copied={copied}
        onCopiedChange={setCopied}
        onClose={() => {
          setShowBootstrap(false);
          if (wizardAgent && pendingIssue) {
            const exists = localCredentials.some((c) => c.agentId === wizardAgent.id);
            if (!exists) {
              applyCredentialFromIssue(wizardAgent.id, pendingIssue);
            }
          }
          setPendingIssue(null);
          setWizardAgent(null);
          toast.success("Bootstrap token step complete.");
        }}
      />

      <AlertDialog open={!!confirmRevoke} onOpenChange={(o) => !o && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke credential?</AlertDialogTitle>
            <AlertDialogDescription>This immediately disables sensitive operations for this agent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirmRevoke) return;
                setLocalCredentials((prev) =>
                  prev.map((c) =>
                    c.agentId === confirmRevoke ? { ...c, status: "revoked", bindingStatus: "unbound" } : c,
                  ),
                );
                toast.error("Credential revoked.");
                setConfirmRevoke(null);
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
