import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mergeStudioWithOverrides } from "@/lib/studio/merge-studio-lists";
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
  return useMemo(
    () => mergeStudioWithOverrides(userStudioEntities, studioCatalog, studioEntityOverrides, removedSet),
    [userStudioEntities, studioCatalog, studioEntityOverrides, removedSet],
  );
}
