import type { StudioEntity } from "@/types/studio";

/** User-saved entities override catalog rows with the same id. */
export function mergeUserAndMockStudioEntities(user: StudioEntity[], mock: StudioEntity[]): StudioEntity[] {
  const userIds = new Set(user.map((e) => e.id));
  return [...user, ...mock.filter((m) => !userIds.has(m.id))];
}
