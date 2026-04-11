import { addDays, subDays, format, setHours, setMinutes } from "date-fns";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** Two-letter-style initials for the header avatar chip (derived from name). */
  avatar: string;
  plan: string;
}

/** Full display name for headers and greetings. */
export function userDisplayName(u: Pick<UserProfile, "firstName" | "lastName" | "email">): string {
  const full = `${u.firstName.trim()} ${u.lastName.trim()}`.trim();
  return full || u.email;
}

export function userInitials(u: Pick<UserProfile, "firstName" | "lastName" | "email">): string {
  const fi = u.firstName.trim().charAt(0);
  const li = u.lastName.trim().charAt(0);
  if (fi && li) return (fi + li).toUpperCase().slice(0, 2);
  if (fi) return fi.toUpperCase();
  const e = u.email.trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return e.charAt(0).toUpperCase() || "?";
}

export interface PersonaSettings {
  name: string;
  bio: string;
  /** Preset from Avatar Setup (create flow); drives default tone, tags, and audience. */
  avatarArchetype?: string;
  tonePlayful: number;
  toneBold: number;
  toneWitty: number;
  styleTags: string[];
  audience: string;
  postingFrequency: string;
  preferredTimes: string[];
  modelStatus: number;
  promptTemplates: PromptTemplate[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
}

/** Captured when finishing Create Avatar → Avatar (onboarding flow). */
export interface CreatorSetupSnapshot {
  photoCount: number;
  questionnaireAnswers: Record<number, string | string[] | number>;
  voiceCloningEnabled: boolean;
}

export const emptyCreatorSetup = (): CreatorSetupSnapshot => ({
  photoCount: 0,
  questionnaireAnswers: {},
  voiceCloningEnabled: false,
});

export interface ConsentRecord {
  likenessConsent: boolean;
  automatedPostingConsent: boolean;
  platformTerms: boolean;
  signatureName: string;
  timestamp: string;
}

export interface InstagramConnection {
  connected: boolean;
  username: string;
  token: string;
  permissions: string[];
  connectedAt: string;
}

/** Gmail or Microsoft Outlook linked for sending job applications from the user's inbox. */
export interface LinkedEmailAccount {
  connected: boolean;
  provider: "gmail" | "outlook";
  /** Address used as the From line when sending application emails */
  email: string;
  connectedAt: string;
}

export const emptyLinkedEmail = (provider: "gmail" | "outlook"): LinkedEmailAccount => ({
  connected: false,
  provider,
  email: "",
  connectedAt: "",
});

export const mockLinkedGmail: LinkedEmailAccount = {
  connected: true,
  provider: "gmail",
  email: "career.user@gmail.com",
  connectedAt: "2025-03-20T08:15:00Z",
};

export const mockLinkedOutlook: LinkedEmailAccount = {
  connected: true,
  provider: "outlook",
  email: "amir.hassan@outlook.com",
  connectedAt: "2025-03-18T14:22:00Z",
};

export interface CalendarEntry {
  id: string;
  date: string;
  type: "image" | "video";
  theme: string;
  caption: string;
  status: "planned" | "generated" | "scheduled" | "posted" | "failed";
  hashtags: string[];
  thumbnail?: string;
}

export interface GeneratedAsset {
  id: string;
  type: "image" | "video";
  theme: string;
  caption: string;
  mood: string;
  hashtags: string[];
  provider: string;
  createdAt: string;
  status: "generating" | "ready" | "approved" | "queued";
  thumbnail?: string;
  /** User prompt used for generation */
  prompt?: string;
  /** Location set at generation time */
  location?: string;
}

export interface QueueItem {
  id: string;
  assetId: string;
  caption: string;
  scheduledTime: string;
  platform: string;
  status: "queued" | "posting" | "posted" | "failed";
  type: "image" | "video";
  theme: string;
  errorReason?: string;
}

export const mockUser: UserProfile = {
  firstName: "CZ",
  lastName: "Wong",
  email: "alex@example.com",
  avatar: "CW",
  plan: "Pro",
};

export const mockPersona: PersonaSettings = {
  name: "Lex Digital",
  bio: "Tech enthusiast & digital nomad sharing AI insights, travel moments, and creative experiments ✨🤖",
  avatarArchetype: "AI Futurist",
  tonePlayful: 65,
  toneBold: 45,
  toneWitty: 80,
  styleTags: ["tech", "AI", "travel", "lifestyle", "photography"],
  audience: "18-35 tech-savvy millennials & Gen Z",
  postingFrequency: "Daily",
  preferredTimes: ["9:00 AM", "12:30 PM", "6:00 PM"],
  modelStatus: 87,
  promptTemplates: [
    { id: "1", name: "Tech Review", template: "Create a {format} showcasing {product} with a {tone} review style. Include {hashtags}.", category: "Reviews" },
    { id: "2", name: "Travel Moment", template: "Generate a {format} of me at {location}, capturing a {mood} atmosphere. Style: {style}.", category: "Travel" },
    { id: "3", name: "AI Insight", template: "Create a {format} explaining {topic} in AI, using {visual_style} visuals. Tone: {tone}.", category: "Education" },
    { id: "4", name: "Lifestyle", template: "Generate a {format} showing a day-in-the-life scene: {activity}. Aesthetic: {aesthetic}.", category: "Lifestyle" },
  ],
};

export const emptyPersona: PersonaSettings = {
  name: "",
  bio: "",
  avatarArchetype: "",
  tonePlayful: 50,
  toneBold: 50,
  toneWitty: 50,
  styleTags: [],
  audience: "",
  postingFrequency: "Daily",
  preferredTimes: [],
  modelStatus: 0,
  promptTemplates: [],
};

export const mockConsent: ConsentRecord = {
  likenessConsent: true,
  automatedPostingConsent: true,
  platformTerms: true,
  signatureName: "CZ Wong",
  timestamp: "2024-12-15T10:30:00Z",
};

export const mockInstagram: InstagramConnection = {
  connected: true,
  username: "@lex.digital",
  token: "IGQ•••••••••••••••••••VhZ",
  permissions: [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_comments",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ],
  connectedAt: "2024-12-15T10:35:00Z",
};

const themes = ["Tech Review", "Travel Moment", "AI Insight", "Morning Routine", "Behind the Scenes", "Product Showcase", "City Exploration", "Creative Process", "Fitness Journey", "Food & Culture"];
const captions = [
  "The future is here and it's running on silicon dreams 🤖✨ #AI #TechLife",
  "Lost in the streets of Tokyo — where tradition meets innovation 🏯 #Travel",
  "Breaking down neural networks in 60 seconds. Who's ready? 🧠 #AIEducation",
  "Morning rituals that keep the creativity flowing ☕ #Productivity",
  "Here's how the magic happens behind the scenes 🎬 #BTS",
  "This gadget just changed my workflow completely 📱 #TechReview",
  "Every corner tells a story in this city 🌆 #CityVibes",
  "From concept to creation — the art of AI-generated content 🎨 #Creative",
  "New day, new gains, new perspectives 💪 #GrowthMindset",
  "Flavors of Southeast Asia hit different when you're solo 🍜 #FoodTravel",
];

const today = new Date();

export const mockCalendarEntries: CalendarEntry[] = Array.from({ length: 28 }, (_, i) => {
  const date = addDays(today, i - 5);
  const themeIdx = i % themes.length;
  const statuses: CalendarEntry["status"][] = i < 3 ? ["posted"] : i < 5 ? ["scheduled"] : i < 10 ? ["generated"] : ["planned"];
  return {
    id: `cal-${i}`,
    date: format(setMinutes(setHours(date, [9, 12, 18][i % 3]), 0), "yyyy-MM-dd'T'HH:mm:ss"),
    type: i % 3 === 0 ? "video" : "image",
    theme: themes[themeIdx],
    caption: captions[themeIdx],
    status: statuses[0],
    hashtags: ["#AI", "#Content", "#" + themes[themeIdx].replace(/\s/g, "")],
  };
});

export const mockAssets: GeneratedAsset[] = Array.from({ length: 12 }, (_, i) => ({
  id: `asset-${i}`,
  type: i % 4 === 0 ? "video" : "image",
  theme: themes[i % themes.length],
  caption: captions[i % captions.length],
  mood: ["Energetic", "Calm", "Mysterious", "Playful", "Professional"][i % 5],
  hashtags: ["#AI", "#Content", "#Creator"],
  provider: ["Kling", "Seedance", "TBD"][i % 3],
  createdAt: format(subDays(today, i), "yyyy-MM-dd'T'HH:mm:ss"),
  status: (["ready", "approved", "queued", "ready"] as const)[i % 4],
}));

export const mockQueue: QueueItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `queue-${i}`,
  assetId: `asset-${i}`,
  caption: captions[i % captions.length],
  scheduledTime: format(setMinutes(setHours(addDays(today, i), [9, 12, 18][i % 3]), 0), "yyyy-MM-dd'T'HH:mm:ss"),
  platform: "Instagram",
  status: "queued" as const,
  type: i % 3 === 0 ? "video" as const : "image" as const,
  theme: themes[i % themes.length],
}));

export const mockHistory: QueueItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `hist-${i}`,
  assetId: `asset-${i}`,
  caption: captions[i % captions.length],
  scheduledTime: format(setMinutes(setHours(subDays(today, i + 1), [9, 12, 18][i % 3]), 0), "yyyy-MM-dd'T'HH:mm:ss"),
  platform: "Instagram",
  status: i === 3 || i === 7 ? "failed" as const : "posted" as const,
  type: i % 3 === 0 ? "video" as const : "image" as const,
  theme: themes[i % themes.length],
  errorReason: i === 3 ? "Rate limit exceeded" : i === 7 ? "Invalid media format" : undefined,
}));

export interface QuestionnaireQuestion {
  id: number;
  question: string;
  /** Shown under the question (e.g. Personal Background). */
  category?: string;
  type: "single" | "multi" | "scale" | "text";
  options?: string[];
  maxSelect?: number;
  scaleMin?: string;
  scaleMax?: string;
  scaleRange?: [number, number];
}

/** Create Avatar / Avatar Studio — about you (free-text answers, IDs 1–15). */
export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: 1,
    question: "Where were you born and where did you grow up?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 2,
    question: "Where do you currently live?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 3,
    question: "What is your profession or field of work?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 4,
    question: "What did you study in school or university?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 5,
    question: "What is a typical day like for you?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 6,
    question: "What kind of environment do you enjoy living in (city, nature, quiet areas, etc)?",
    category: "Personal Background",
    type: "text",
  },
  {
    id: 7,
    question: "Do you have siblings? If yes, tell us about them.",
    category: "Family & Relationships",
    type: "text",
  },
  {
    id: 8,
    question: "Are you close with your family?",
    category: "Family & Relationships",
    type: "text",
  },
  {
    id: 9,
    question: "What role does family play in your life?",
    category: "Family & Relationships",
    type: "text",
  },
  {
    id: 10,
    question: "Are there people who have strongly influenced who you are today?",
    category: "Family & Relationships",
    type: "text",
  },
  {
    id: 11,
    question: "Do you prefer spending time with a small group of close friends or a large social circle?",
    category: "Family & Relationships",
    type: "text",
  },
  {
    id: 12,
    question: "What are your hobbies?",
    category: "Hobbies & Interests",
    type: "text",
  },
  {
    id: 13,
    question: "What activities do you enjoy doing in your free time?",
    category: "Hobbies & Interests",
    type: "text",
  },
  {
    id: 14,
    question: "What topics or subjects are you most interested in learning about?",
    category: "Hobbies & Interests",
    type: "text",
  },
  {
    id: 15,
    question: "What is something you could talk about for hours?",
    category: "Hobbies & Interests",
    type: "text",
  },
];
