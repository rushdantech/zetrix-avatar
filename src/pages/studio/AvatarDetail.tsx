import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ScopeBadge } from "@/components/identity/ScopeBadge";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { DIDDisplay } from "@/components/identity/DIDDisplay";

export default function AvatarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data = [] } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<typeof mockStudioEntities>((resolve) => setTimeout(() => resolve(mockStudioEntities), 300)),
  });
  const entity = useMemo(() => data.find((d) => d.id === id), [data, id]);
  if (!entity) return <div className="text-sm text-muted-foreground">Avatar not found.</div>;

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{entity.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
            <div className="mt-2 flex gap-2">
              <StatusBadge value={entity.type === "individual" ? "published" : "active"} />
              <StatusBadge value={entity.status} />
            </div>
          </div>
          <button className="rounded-lg bg-secondary px-3 py-2 text-sm">Edit</button>
        </div>
      </div>
      {entity.type === "individual" ? (
        <Tabs defaultValue="profile">
          <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="knowledge">Knowledge</TabsTrigger><TabsTrigger value="marketplace">Marketplace</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="profile"><div className="rounded-xl border border-border bg-card p-4 text-sm">Persona details and appearance.</div></TabsContent>
          <TabsContent value="knowledge"><div className="rounded-xl border border-border bg-card p-4 text-sm">Knowledge docs and starters.</div></TabsContent>
          <TabsContent value="marketplace"><div className="rounded-xl border border-border bg-card p-4 text-sm">Downloads: {entity.marketplace_downloads}</div></TabsContent>
          <TabsContent value="analytics"><div className="rounded-xl border border-border bg-card p-4 text-sm">Mock analytics chart area.</div></TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="profile">
          <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="capabilities">Capabilities</TabsTrigger><TabsTrigger value="identity">Identity</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="profile"><div className="rounded-xl border border-border bg-card p-4 text-sm">Agent profile and operating parameters.</div></TabsContent>
          <TabsContent value="capabilities"><div className="rounded-xl border border-border bg-card p-4 text-sm">Capabilities list and tool connections.</div></TabsContent>
          <TabsContent value="identity">
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              {entity.zid_credentialed ? (
                <div className="space-y-2">
                  <p className="font-medium">Credentialed</p>
                  <DIDDisplay did={`did:zetrix:agent:${entity.id}`} />
                  <div className="flex flex-wrap gap-1">{(entity.zid_scopes || []).map((s) => <ScopeBadge key={s} scope={s} />)}</div>
                  <button onClick={() => navigate(`/identity/agents/${entity.id}`)} className="text-primary hover:underline">Manage in Digital Identity →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No digital identity.</p>
                  <button onClick={() => navigate(`/identity/agents/credential/${entity.id}`)} className="text-primary hover:underline">Set up identity →</button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="activity"><div className="rounded-xl border border-border bg-card p-4 text-sm">Recent executions and errors.</div></TabsContent>
          <TabsContent value="analytics"><div className="rounded-xl border border-border bg-card p-4 text-sm">Task and approval analytics.</div></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
