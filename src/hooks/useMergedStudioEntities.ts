import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mergeStudioWithOverrides } from "@/lib/studio/merge-studio-lists";
import {
  buildZetrixClawEnterpriseEntity,
  loadZetrixClawAgentInstance,
  ZETRIXCLAW_USER_AGENT_ID,
} from "@/lib/studio/zetrixclaw-agent-instance";
import type { StudioEntity } from "@/types/studio";

/**
 * Catalog mock + `userStudioEntities` + publish overrides + removals.
 * Use this everywhere My Avatars / Marketplace / detail need the same inventory.
 */
export function useMergedStudioEntities(): StudioEntity[] {
  const { userStudioEntities, studioEntityOverrides, removedStudioEntityIds, zetrixClawStorageGeneration } = useApp();
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
    const stored = loadZetrixClawAgentInstance();
    if (!stored || removedSet.has(ZETRIXCLAW_USER_AGENT_ID)) {
      return merged.filter((e) => e.id !== ZETRIXCLAW_USER_AGENT_ID);
    }
    const zetrix = buildZetrixClawEnterpriseEntity(stored);
    const withoutDup = merged.filter((e) => e.id !== ZETRIXCLAW_USER_AGENT_ID);
    return [zetrix, ...withoutDup];
  }, [userStudioEntities, catalog, studioEntityOverrides, removedSet, zetrixClawStorageGeneration]);
}
