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
  const { userStudioEntities, studioEntityOverrides, removedStudioEntityIds } = useApp();
  const removedSet = useMemo(() => new Set(removedStudioEntityIds), [removedStudioEntityIds]);
  const { data: studioCatalog = [] } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<StudioEntity[]>((resolve) => setTimeout(() => resolve(mockStudioEntities), 200)),
  });
  return useMemo(() => {
    const merged = mergeStudioWithOverrides(userStudioEntities, studioCatalog, studioEntityOverrides, removedSet);
    const stored = loadZetrixClawAgentInstance();
    if (!stored || removedSet.has(ZETRIXCLAW_USER_AGENT_ID)) {
      return merged.filter((e) => e.id !== ZETRIXCLAW_USER_AGENT_ID);
    }
    const zetrix = buildZetrixClawEnterpriseEntity(stored);
    const withoutDup = merged.filter((e) => e.id !== ZETRIXCLAW_USER_AGENT_ID);
    return [zetrix, ...withoutDup];
  }, [userStudioEntities, studioCatalog, studioEntityOverrides, removedSet]);
}
