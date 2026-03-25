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
): StudioEntity[] {
  const merged = mergeUserAndMockStudioEntities(user, mock);
  if (!Object.keys(overrides).length) return merged;
  return merged.map((e) => {
    const o = overrides[e.id];
    return o ? ({ ...e, ...o } as StudioEntity) : e;
  });
}
