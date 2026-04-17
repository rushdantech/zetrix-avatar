import type { StudioEntityIndividual } from "@/types/studio";

const HANDLE_PATTERN = /^[a-z0-9_]{3,30}$/;

export function normalizeAvatarHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function isAvatarHandleValid(handle: string): boolean {
  return HANDLE_PATTERN.test(handle);
}

export function avatarHandleError(raw: string): string | null {
  const normalized = normalizeAvatarHandle(raw);
  if (!normalized) return "Handle is required.";
  if (!isAvatarHandleValid(normalized)) {
    return "Use 3-30 lowercase letters, numbers, or underscores.";
  }
  return null;
}

export function avatarPublicHandle(entity: StudioEntityIndividual): string {
  const candidate = normalizeAvatarHandle(entity.handle ?? "");
  if (candidate && isAvatarHandleValid(candidate)) return candidate;
  const fromName = normalizeAvatarHandle(entity.name).replace(/[^a-z0-9_]/g, "");
  if (fromName && isAvatarHandleValid(fromName)) return fromName;
  return normalizeAvatarHandle(entity.id).replace(/[^a-z0-9_]/g, "");
}

