import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Save, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import {
  INDIVIDUAL_SETUP_TABS,
  IndividualAvatarSetupStepContent,
  useIndividualAvatarDraft,
} from "@/components/studio/IndividualAvatarEditPanel";
import { DIDDisplay } from "@/components/identity/DIDDisplay";
import { formatScopeLabel } from "@/lib/identity/format";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { toast } from "sonner";
import { RagDocumentsUploadZone } from "@/components/studio/RagDocumentsUploadZone";
import type { RagDocumentItem, StudioEntity, StudioEntityEnterprise, StudioEntityIndividual } from "@/types/studio";

function activeMarketplaceSubscriptions(entity: StudioEntity): number {
  return entity.marketplace_active_subscriptions ?? entity.marketplace_downloads;
}

function IndividualAvatarTabs({
  entity,
  onSave,
  onPersistIndividualEkyc,
}: {
  entity: StudioEntityIndividual;
  onSave: (next: StudioEntityIndividual) => void;
  onPersistIndividualEkyc: (next: StudioEntityIndividual) => void;
}) {
  const draft = useIndividualAvatarDraft(entity);
  const [tab, setTab] = useState<string>("Welcome");

  const handleSave = () => {
    onSave(draft.buildNextEntity());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="w-full lg:hidden">
          <Label htmlFor="avatar-profile-section" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Profile section
          </Label>
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger id="avatar-profile-section" className="w-full bg-background text-left">
              <SelectValue placeholder="Choose a section" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[min(24rem,70vh)]">
              {INDIVIDUAL_SETUP_TABS.map((t) => (
                <SelectItem key={t} value={t} className="cursor-pointer">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end lg:shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="hidden h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/40 p-1 lg:flex">
          {INDIVIDUAL_SETUP_TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="whitespace-normal px-2 py-1.5 text-left text-xs leading-tight">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {INDIVIDUAL_SETUP_TABS.map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <IndividualAvatarSetupStepContent
              tab={t}
              entity={entity}
              draft={draft}
              onPersistIndividualEkyc={onPersistIndividualEkyc}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

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

function EnterpriseMarketplaceStatisticsTab({ entity }: { entity: StudioEntityEnterprise }) {
  const n = activeMarketplaceSubscriptions(entity);
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
      <div>
        <h3 className="font-medium text-foreground">Marketplace statistics</h3>
        <p className="mt-2 text-muted-foreground">
          AI agents are not distributed as downloads. You make an agent available on the marketplace so customers or
          partner organizations can <span className="font-medium text-foreground">subscribe</span> and run it under contract,
          usage limits, and your identity controls.
        </p>
      </div>
      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="text-xs text-muted-foreground">Subscribed organizations</p>
        <p className="mt-0.5 text-2xl font-semibold text-foreground">{n}</p>
        <p className="mt-1 text-xs text-muted-foreground">Orgs with an active subscription to this agent listing.</p>
      </div>
      <Link to="/marketplace" className="inline-flex text-sm font-medium text-primary hover:underline">
        Open Marketplace →
      </Link>
    </div>
  );
}

export default function AvatarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addUserStudioEntity, setAgentMarketplacePublished } = useApp();
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

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="text-2xl font-bold">{entity.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={entity.status} />
            <StatusBadge value={entity.type === "individual" ? "avatar" : "agent"} />
            {entity.type === "individual" && (
              <button
                type="button"
                onClick={() => {
                  const published = entity.status === "published";
                  setAgentMarketplacePublished(entity.id, !published);
                  toast.success(
                    published ? `${entity.name} removed from Marketplace` : `${entity.name} is listed on Marketplace`,
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                <Send className="h-3 w-3" />
                {entity.status === "published" ? "Unpublish" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
      {entity.type === "individual" ? (
        <IndividualAvatarTabs
          entity={entity}
          onSave={(next) => {
            addUserStudioEntity(next);
            toast.success("Saved to My Avatars.");
          }}
          onPersistIndividualEkyc={(next) => {
            addUserStudioEntity(next);
          }}
        />
      ) : (
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
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">
              Marketplace Statistics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <EnterpriseProfileTab entity={entity} />
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
          <TabsContent value="marketplace" className="mt-4">
            <EnterpriseMarketplaceStatisticsTab entity={entity} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
