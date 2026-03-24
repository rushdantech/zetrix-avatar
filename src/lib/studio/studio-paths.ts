import type { StudioEntity } from "@/types/studio";

export function studioEntityPath(entity: Pick<StudioEntity, "id" | "type">): string {
  return entity.type === "individual" ? `/studio/avatars/${entity.id}` : `/studio/agents/${entity.id}`;
}
