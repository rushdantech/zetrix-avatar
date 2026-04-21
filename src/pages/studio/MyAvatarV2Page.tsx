import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layers } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { userDisplayName, userInitials } from "@/lib/mock-data";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import type { StudioEntityIndividual } from "@/types/studio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AvatarDailyUpdatesSection,
  AvatarIdentityModelSection,
  AvatarIdentityVerificationSection,
  AvatarManagementStatusToolbar,
  AvatarPKMSection,
  AvatarProfileSection,
  AvatarVoiceSection,
  AvatarZIDCredentialsSection,
} from "@/components/studio/AvatarManagementSections";
import { isSocialStudioIndividual } from "@/lib/studio/social-studio-avatar";

type TabValue =
  | "profile"
  | "identity-model"
  | "voice"
  | "pkm"
  | "daily-updates"
  | "identity-verification"
  | "zid";

const TAB_OPTIONS_BASE: { value: TabValue; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "identity-model", label: "Identity model" },
  { value: "voice", label: "Voice sample" },
  { value: "pkm", label: "Personal Knowledge Model" },
  { value: "identity-verification", label: "Identity verification" },
  { value: "zid", label: "Verifiable credentials (ZID)" },
];

export default function MyAvatarV2Page() {
  const { id } = useParams();
  const { user } = useApp();
  const merged = useMergedStudioEntities();
  const [tab, setTab] = useState<TabValue>("profile");

  const entity = useMemo(() => {
    if (!id) return undefined;
    return merged.find((e) => e.id === id && e.type === "individual") as StudioEntityIndividual | undefined;
  }, [merged, id]);

  const tabOptions = useMemo(() => {
    if (!entity || !isSocialStudioIndividual(entity)) return TAB_OPTIONS_BASE;
    const i = TAB_OPTIONS_BASE.findIndex((t) => t.value === "profile");
    if (i === -1) return TAB_OPTIONS_BASE;
    const next = [...TAB_OPTIONS_BASE];
    next.splice(i + 1, 0, { value: "daily-updates", label: "Daily Updates" });
    return next;
  }, [entity]);

  useEffect(() => {
    if (!entity) return;
    if (tab === "daily-updates" && !isSocialStudioIndividual(entity)) {
      setTab("profile");
    }
  }, [entity, tab]);

  const ownerName = userDisplayName(user).trim() || "Rushdan Anuar";
  const ownerInitials = userInitials(user) || "RA";

  if (!id || !entity) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Avatar not found.</p>
        <Link to="/studio/avatars" className="text-sm font-medium text-primary hover:underline">
          Back to My Avatars
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-7rem)] w-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-inner md:min-h-[calc(100dvh-5.5rem)]",
        "-mx-4 -mt-2 max-w-[100vw] sm:-mx-4 lg:-mx-6",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
        <header className="flex items-center justify-end border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
              {ownerInitials}
            </div>
            <span className="text-sm font-medium text-slate-800">{ownerName}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Layers className="h-6 w-6 text-slate-600" aria-hidden />
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[26px]">My Avatar (Rev)</h1>
                  <Badge variant="secondary" className="text-xs font-medium">
                    Dev preview
                  </Badge>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Tabbed layout for the same data as Avatar Management. Use{" "}
                  <Link to={`/studio/avatars/${entity.id}`} className="font-medium text-slate-800 underline-offset-4 hover:underline">
                    classic profile
                  </Link>{" "}
                  or{" "}
                  <Link to="/studio/avatars" className="font-medium text-slate-800 underline-offset-4 hover:underline">
                    My Avatars
                  </Link>{" "}
                  to switch avatars.
                </p>
              </div>
            </div>

            <AvatarManagementStatusToolbar entity={entity} />

            <div className="md:hidden">
              <Label htmlFor="my-avatar-v2-section" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Section
              </Label>
              <Select value={tab} onValueChange={(v) => setTab(v as TabValue)}>
                <SelectTrigger id="my-avatar-v2-section" className="w-full bg-white">
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {tabOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-4 w-full">
              <TabsList className="mb-4 hidden h-auto w-full flex-wrap justify-start gap-1 bg-white p-1 md:flex">
                {tabOptions.map((opt) => (
                  <TabsTrigger
                    key={opt.value}
                    value={opt.value}
                    className="shrink-0 px-3 py-2 text-xs sm:text-sm"
                  >
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="profile" className="mt-0 space-y-6 focus-visible:outline-none">
                <AvatarProfileSection entity={entity} />
              </TabsContent>
              {isSocialStudioIndividual(entity) ? (
                <TabsContent value="daily-updates" className="mt-0 focus-visible:outline-none">
                  <AvatarDailyUpdatesSection entity={entity} />
                </TabsContent>
              ) : null}
              <TabsContent value="identity-model" className="mt-0 focus-visible:outline-none">
                <AvatarIdentityModelSection entity={entity} />
              </TabsContent>
              <TabsContent value="voice" className="mt-0 focus-visible:outline-none">
                <AvatarVoiceSection entity={entity} />
              </TabsContent>
              <TabsContent value="pkm" className="mt-0 focus-visible:outline-none">
                <AvatarPKMSection entity={entity} />
              </TabsContent>
              <TabsContent value="identity-verification" className="mt-0 focus-visible:outline-none">
                <AvatarIdentityVerificationSection entity={entity} />
              </TabsContent>
              <TabsContent value="zid" className="mt-0 focus-visible:outline-none">
                <AvatarZIDCredentialsSection entity={entity} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
