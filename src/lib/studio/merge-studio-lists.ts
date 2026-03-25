import type { StudioEntity } from "@/types/studio";

/** User-saved entities override catalog rows with the same id. */
export function mergeUserAndMockStudioEntities(user: StudioEntity[], mock: StudioEntity[]): StudioEntity[] {
  const userIds = new Set(user.map((e) => e.id));
  return [...user, ...mock.filter((m) => !userIds.has(m.id))];
}

/** Apply session patches (e.g. publish / unpublish) on top of merged studio lists. */
export function mergeStudioWithOverrides(
  user: StudioEntity[],
  mock: StudioEntity[],
  overrides: Record<string, Partial<StudioEntity>>,
  removedIds?: ReadonlySet<string>,
): StudioEntity[] {
  const mockFiltered = removedIds?.size ? mock.filter((m) => !removedIds.has(m.id)) : mock;
  const merged = mergeUserAndMockStudioEntities(user, mockFiltered);
  const withoutRemoved = removedIds?.size ? merged.filter((e) => !removedIds.has(e.id)) : merged;
  if (!Object.keys(overrides).length) return withoutRemoved;
  return withoutRemoved.map((e) => {
    const o = overrides[e.id];
    return o ? ({ ...e, ...o } as StudioEntity) : e;
  });
}
