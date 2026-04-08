/** Preset avatars shown on Avatar Setup (create + edit). Selecting one fills tone, tags, and audience for the rest of the app. */
export const AVATAR_ARCHETYPE_LABELS = [
  "Confident Trendsetter",
  "Soft Romantic",
  "Playful & Flirty",
  "Mysterious Minimalist",
  "Motivational Leader",
  "Luxury Lifestyle Icon",
  "Relatable Everyday",
  "Edgy Rebel",
  "Thought Leader",
  "AI Futurist",
  "Wholesome & Comforting",
  "Viral Entertainer",
] as const;

export type AvatarArchetypeLabel = (typeof AVATAR_ARCHETYPE_LABELS)[number];

export type ArchetypePreset = {
  tonePlayful: number;
  toneBold: number;
  toneWitty: number;
  styleTags: string[];
  audience: string;
};

const PRESETS: Record<AvatarArchetypeLabel, ArchetypePreset> = {
  "Confident Trendsetter": {
    tonePlayful: 58,
    toneBold: 84,
    toneWitty: 64,
    styleTags: ["fashion", "lifestyle"],
    audience: "Style-forward, trend-aware followers",
  },
  "Soft Romantic": {
    tonePlayful: 72,
    toneBold: 38,
    toneWitty: 52,
    styleTags: ["lifestyle", "art"],
    audience: "Readers who love warmth, aesthetics, and emotional connection",
  },
  "Playful & Flirty": {
    tonePlayful: 88,
    toneBold: 62,
    toneWitty: 78,
    styleTags: ["memes", "lifestyle"],
    audience: "Fun, lighthearted social audiences",
  },
  "Mysterious Minimalist": {
    tonePlayful: 42,
    toneBold: 55,
    toneWitty: 48,
    styleTags: ["art", "photography"],
    audience: "Design-minded, understated taste",
  },
  "Motivational Leader": {
    tonePlayful: 48,
    toneBold: 78,
    toneWitty: 58,
    styleTags: ["fitness", "lifestyle"],
    audience: "People seeking growth, discipline, and inspiration",
  },
  "Luxury Lifestyle Icon": {
    tonePlayful: 52,
    toneBold: 72,
    toneWitty: 60,
    styleTags: ["fashion", "travel", "lifestyle"],
    audience: "Premium lifestyle and aspirational content fans",
  },
  "Relatable Everyday": {
    tonePlayful: 70,
    toneBold: 44,
    toneWitty: 56,
    styleTags: ["lifestyle", "food"],
    audience: "Broad, everyday authentic connection",
  },
  "Edgy Rebel": {
    tonePlayful: 68,
    toneBold: 88,
    toneWitty: 72,
    styleTags: ["music", "art", "gaming"],
    audience: "Alternative culture and bold self-expression",
  },
  "Thought Leader": {
    tonePlayful: 40,
    toneBold: 68,
    toneWitty: 55,
    styleTags: ["tech", "AI"],
    audience: "Professionals and curious learners",
  },
  "AI Futurist": {
    tonePlayful: 55,
    toneBold: 70,
    toneWitty: 82,
    styleTags: ["AI", "tech"],
    audience: "Tech early adopters and innovation enthusiasts",
  },
  "Wholesome & Comforting": {
    tonePlayful: 75,
    toneBold: 35,
    toneWitty: 50,
    styleTags: ["lifestyle", "food"],
    audience: "People who value kindness, calm, and community",
  },
  "Viral Entertainer": {
    tonePlayful: 90,
    toneBold: 76,
    toneWitty: 85,
    styleTags: ["memes", "music", "gaming"],
    audience: "High-energy feeds and shareable moments",
  },
};

export function presetForArchetype(label: string): ArchetypePreset {
  if (label in PRESETS) return { ...PRESETS[label as AvatarArchetypeLabel] };
  return {
    tonePlayful: 50,
    toneBold: 50,
    toneWitty: 50,
    styleTags: [],
    audience: "",
  };
}
