import type { StudioEntityIndividual } from "@/types/studio";

/** Marketplace segment used for “social” avatars (Daily Updates tab, etc.). */
export function isSocialStudioIndividual(entity: StudioEntityIndividual): boolean {
  return entity.marketplaceBrowseSegment === "Social avatars";
}
