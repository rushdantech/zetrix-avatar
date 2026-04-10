import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mergeStudioWithOverrides } from "@/lib/studio/merge-studio-lists";
import {
  buildAvatarClawEnterpriseEntity,
  loadAvatarClawAgentInstance,
  AVATARCLAW_USER_AGENT_ID,
} from "@/lib/studio/avatarclaw-agent-instance";
import type { StudioEntity } from "@/types/studio";

/**
 * Catalog mock + `userStudioEntities` + publish overrides + removals.
 * Use this everywhere My Avatars / Marketplace / detail need the same inventory.
 */
export function useMergedStudioEntities(): StudioEntity[] {
  const { userStudioEntities, studioEntityOverrides, removedStudioEntityIds, avatarClawStorageGeneration } = useApp();
  const removedSet = useMemo(() => new Set(removedStudioEntityIds), [removedStudioEntityIds]);
  const { data: studioCatalog } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<StudioEntity[]>((resolve) => setTimeout(() => resolve(mockStudioEntities), 200)),
  });
  // Until the deferred query resolves, `data` is undefined — use the same mock so deep links like
  // `?chat=job-application-agent-v2` resolve immediately and the chat panel is not torn down.
  const catalog = studioCatalog ?? mockStudioEntities;
  return useMemo(() => {
    const merged = mergeStudioWithOverrides(userStudioEntities, catalog, studioEntityOverrides, removedSet);
    const stored = loadAvatarClawAgentInstance();
    if (!stored || removedSet.has(AVATARCLAW_USER_AGENT_ID)) {
      return merged.filter((e) => e.id !== AVATARCLAW_USER_AGENT_ID);
    }
    const avatarClaw = buildAvatarClawEnterpriseEntity(stored);
    const withoutDup = merged.filter((e) => e.id !== AVATARCLAW_USER_AGENT_ID);
    return [avatarClaw, ...withoutDup];
  }, [userStudioEntities, catalog, studioEntityOverrides, removedSet, avatarClawStorageGeneration]);
}
