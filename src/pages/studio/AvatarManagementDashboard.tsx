import { useApp } from "@/contexts/AppContext";
import { userDisplayName, userInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { StudioEntityIndividual } from "@/types/studio";
import {
  AvatarIdentityModelSection,
  AvatarIdentityVerificationSection,
  AvatarManagementStatusToolbar,
  AvatarPKMSection,
  AvatarProfileSection,
  AvatarVoiceSection,
  AvatarZIDCredentialsSection,
} from "@/components/studio/AvatarManagementSections";

export function AvatarManagementDashboard({ entity }: { entity: StudioEntityIndividual }) {
  const { user } = useApp();
  const ownerName = userDisplayName(user).trim() || "Rushdan Anuar";
  const ownerInitials = userInitials(user) || "RA";

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
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[26px]">Avatar Management</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  One avatar for Marketplace Chat. View and edit this avatar&apos;s personality and content style.
                </p>
              </div>

              <AvatarManagementStatusToolbar entity={entity} />

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-6">
                  <AvatarProfileSection entity={entity} />
                  <AvatarVoiceSection entity={entity} />
                </div>
                <div className="space-y-6">
                  <AvatarIdentityModelSection entity={entity} />
                  <AvatarZIDCredentialsSection entity={entity} />
                  <AvatarPKMSection entity={entity} />
                  <AvatarIdentityVerificationSection entity={entity} />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
