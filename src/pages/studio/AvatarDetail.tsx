import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { AVATARCLAW_USER_AGENT_ID } from "@/lib/studio/avatarclaw-agent-instance";
import { AvatarClawProfileFormCard } from "@/components/studio/avatarclaw/AvatarClawRuntimeMaintenanceSection";
import { toast } from "sonner";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import { AvatarManagementDashboard } from "@/pages/studio/AvatarManagementDashboard";
import type { RagDocumentItem, StudioEntity, StudioEntityEnterprise } from "@/types/studio";

function EnterpriseProfileTab({ entity }: { entity: StudioEntityEnterprise }) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-4 text-sm">
      <h2 className="text-sm font-semibold text-foreground">Agent profile</h2>
      <dl className="grid gap-3">
        <div>
          <dt className="text-xs text-muted-foreground">Agent name</dt>
          <dd className="mt-0.5 font-medium">{entity.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Description</dt>
          <dd className="mt-0.5 text-foreground">{entity.description}</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Digital identity and ZID credentials are managed under the <span className="font-medium text-foreground">Identity</span> tab.
      </p>
    </div>
  );
}

function EnterpriseKnowledgebaseTab({
  entity,
  onSaveKnowledgebase,
}: {
  entity: StudioEntityEnterprise;
  onSaveKnowledgebase: (docs: RagDocumentItem[]) => void;
}) {
  const kbFromEntity = entity.enterpriseSetup.knowledgebaseDocuments ?? [];
  const kbSignature = kbFromEntity.map((d) => `${d.id}:${d.name}`).join("|");
  const [kbDraft, setKbDraft] = useState<RagDocumentItem[]>(kbFromEntity);

  useEffect(() => {
    setKbDraft(kbFromEntity);
  }, [entity.id, kbSignature]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
      <p className="text-xs text-muted-foreground">
        Add documents to give this agent more context for its tasks (file metadata is stored locally).
      </p>
      <RagDocumentsUploadZone documents={kbDraft} onChange={setKbDraft} idPrefix={`agent-kb-${entity.id}`} />
      <div className="flex flex-wrap justify-end border-t border-border pt-3">
        <button
          type="button"
          onClick={() => {
            onSaveKnowledgebase(kbDraft.map((d) => ({ ...d })));
            toast.success("Knowledge base saved.");
          }}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Save className="h-4 w-4" />
          Save knowledge base
        </button>
      </div>
    </div>
  );
}

export default function AvatarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addUserStudioEntity } = useApp();
  const merged = useMergedStudioEntities();
  const entity = useMemo(() => merged.find((d) => d.id === id) as StudioEntity | undefined, [merged, id]);

  useEffect(() => {
    if (entity || !id) return;
    if (location.pathname.startsWith("/studio/agents")) {
      navigate("/studio/agents", { replace: true });
    } else if (location.pathname.startsWith("/studio/avatars")) {
      navigate("/studio/avatars", { replace: true });
    }
  }, [entity, id, location.pathname, navigate]);

  useEffect(() => {
    if (!entity) return;
    const onAgentsPath = location.pathname.startsWith("/studio/agents/");
    if (entity.type === "individual" && onAgentsPath) {
      navigate(`/studio/avatars/${entity.id}`, { replace: true });
    } else if (entity.type === "enterprise" && location.pathname.startsWith("/studio/avatars/") && location.pathname !== "/studio/avatars/create") {
      navigate(studioEntityPath(entity), { replace: true });
    }
  }, [entity, location.pathname, navigate]);

  if (!entity) return <div className="text-sm text-muted-foreground">Not found.</div>;

  if (entity.type === "individual") {
    return <AvatarManagementDashboard entity={entity} />;
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="text-2xl font-bold">{entity.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={entity.status} />
            <StatusBadge value="agent" />
            {entity.id === AVATARCLAW_USER_AGENT_ID && (
              <>
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs">Draft</span>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs">General Agent</span>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs">Long Memory</span>
              </>
            )}
          </div>
        </div>
      </div>
      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto min-h-10 flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="knowledgebase" className="text-xs sm:text-sm">
            Knowledgebase
          </TabsTrigger>
          <TabsTrigger value="identity" className="text-xs sm:text-sm">
            Identity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          {entity.id === AVATARCLAW_USER_AGENT_ID ? (
            <AvatarClawProfileFormCard />
          ) : (
            <EnterpriseProfileTab entity={entity} />
          )}
        </TabsContent>
        <TabsContent value="knowledgebase" className="mt-4">
          <EnterpriseKnowledgebaseTab
            entity={entity}
            onSaveKnowledgebase={(docs) => {
              addUserStudioEntity({
                ...entity,
                enterpriseSetup: { ...entity.enterpriseSetup, knowledgebaseDocuments: docs },
              });
            }}
          />
        </TabsContent>
        <TabsContent value="identity" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            {entity.zid_credentialed ? (
              <div className="space-y-2">
                <p className="font-medium">Credentialed</p>
                <DIDDisplay did={`did:zetrix:agent:${entity.id}`} />
                <div className="flex flex-wrap gap-1">
                  {(entity.zid_scopes || []).map((s) => (
                    <ScopeBadge key={s} scope={s} />
                  ))}
                </div>
                <button type="button" onClick={() => navigate(`/identity/agents/${entity.id}`)} className="text-primary hover:underline">
                  Manage in Digital Identity →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p>No digital identity bound yet.</p>
                {entity.enterpriseSetup.setupIdentityNow ? (
                  <p className="text-xs text-muted-foreground">Wizard requested identity setup; complete binding in ZID.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Identity was deferred during Create Agent.</p>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/identity/agents/credential/${entity.id}`)}
                  className="text-primary hover:underline"
                >
                  Set up identity →
                </button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
