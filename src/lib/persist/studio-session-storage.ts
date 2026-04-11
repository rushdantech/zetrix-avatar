import type { PersonaSettings, CreatorSetupSnapshot, UserProfile } from "@/lib/mock-data";
import type { StudioEntity } from "@/types/studio";

const PREFIX = "zetrix-avatar:";
const KEY_STUDIO = `${PREFIX}userStudioEntities`;
const KEY_ONBOARDING = `${PREFIX}onboardingComplete`;
const KEY_PERSONA = `${PREFIX}persona`;
const KEY_CREATOR = `${PREFIX}creatorSetup`;
const KEY_USER = `${PREFIX}userProfile`;
/** Prototype-only local password for “change password” UI. Production must hash and verify on the server. */
const KEY_ACCOUNT_PASSWORD = `${PREFIX}accountPassword`;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadPersistedUserStudioEntities(): StudioEntity[] {
  const data = safeParse<unknown>(localStorage.getItem(KEY_STUDIO), []);
  return Array.isArray(data) ? (data as StudioEntity[]) : [];
}

export function persistUserStudioEntities(entities: StudioEntity[]): void {
  try {
    localStorage.setItem(KEY_STUDIO, JSON.stringify(entities));
  } catch {
    /* quota / private mode */
  }
}

export function loadPersistedOnboardingComplete(): boolean {
  return localStorage.getItem(KEY_ONBOARDING) === "true";
}

export function persistOnboardingComplete(v: boolean): void {
  try {
    if (v) localStorage.setItem(KEY_ONBOARDING, "true");
    else localStorage.removeItem(KEY_ONBOARDING);
  } catch {
    /* ignore */
  }
}

export function loadPersistedPersona(): PersonaSettings | null {
  const raw = localStorage.getItem(KEY_PERSONA);
  if (!raw) return null;
  const p = safeParse<Partial<PersonaSettings> | null>(raw, null);
  if (!p || typeof p !== "object") return null;
  return p as PersonaSettings;
}

export function persistPersona(persona: PersonaSettings): void {
  try {
    localStorage.setItem(KEY_PERSONA, JSON.stringify(persona));
  } catch {
    /* ignore */
  }
}

export function loadPersistedCreatorSetup(): CreatorSetupSnapshot | null {
  const raw = localStorage.getItem(KEY_CREATOR);
  if (!raw) return null;
  const c = safeParse<Partial<CreatorSetupSnapshot> | null>(raw, null);
  if (!c || typeof c !== "object") return null;
  return c as CreatorSetupSnapshot;
}

export function persistCreatorSetup(setup: CreatorSetupSnapshot): void {
  try {
    localStorage.setItem(KEY_CREATOR, JSON.stringify(setup));
  } catch {
    /* ignore */
  }
}

export function loadPersistedUser(): Partial<UserProfile> | null {
  const raw = localStorage.getItem(KEY_USER);
  if (!raw) return null;
  const p = safeParse<Partial<UserProfile> | null>(raw, null);
  if (!p || typeof p !== "object") return null;
  return p;
}

export function persistUser(user: UserProfile): void {
  try {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function loadPersistedAccountPassword(): string | null {
  const raw = localStorage.getItem(KEY_ACCOUNT_PASSWORD);
  if (raw == null || raw === "") return null;
  try {
    const p = safeParse<{ password?: string } | null>(raw, null);
    if (p && typeof p.password === "string" && p.password.length > 0) return p.password;
  } catch {
    /* ignore */
  }
  return null;
}

export function persistAccountPassword(password: string): void {
  try {
    localStorage.setItem(
      KEY_ACCOUNT_PASSWORD,
      JSON.stringify({ password, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

export function clearStudioSessionStorage(): void {
  localStorage.removeItem(KEY_STUDIO);
  localStorage.removeItem(KEY_ONBOARDING);
  localStorage.removeItem(KEY_PERSONA);
  localStorage.removeItem(KEY_CREATOR);
}
