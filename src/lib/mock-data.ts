import { addDays, subDays, format, setHours, setMinutes } from "date-fns";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: string;
}

export interface PersonaSettings {
  name: string;
  bio: string;
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

/** Captured when finishing Create Avatar → Individual (onboarding flow). */
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
  name: "Alex Rivera",
  email: "alex@example.com",
  avatar: "AR",
  plan: "Pro",
};

export const mockPersona: PersonaSettings = {
  name: "Lex Digital",
  bio: "Tech enthusiast & digital nomad sharing AI insights, travel moments, and creative experiments ✨🤖",
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
  signatureName: "Alex Rivera",
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
  type: "single" | "multi" | "scale";
  options?: string[];
  maxSelect?: number;
  scaleMin?: string;
  scaleMax?: string;
  scaleRange?: [number, number];
}

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: 1,
    question: "What emotional vibe should your avatar naturally project?",
    type: "single",
    options: ["Warm & approachable", "Confident & dominant", "Mysterious & distant", "Playful & chaotic", "Elegant & refined", "Calm & grounded", "Energetic & hype", "Intellectual & thoughtful"],
  },
  {
    id: 2,
    question: "How should your avatar typically look at the camera?",
    type: "single",
    options: ["Direct eye contact (strong presence)", "Soft gaze (gentle energy)", "Smirking / playful expression", "Serious / intense stare", "Laughing / candid", "Looking away (candid aesthetic)"],
  },
  {
    id: 3,
    question: "What best describes your avatar's fashion identity?",
    type: "single",
    options: ["Luxury / designer", "Streetwear", "Minimalist neutral", "Trendy influencer", "Sporty / fitness", "Soft romantic", "Edgy / alternative", "Tech futurist"],
  },
  {
    id: 4,
    question: "What environments should your avatar appear in most often?",
    type: "multi",
    maxSelect: 3,
    options: ["Urban city", "Beach / tropical", "Café lifestyle", "Luxury hotel", "Studio clean background", "Nature / outdoors", "Nightlife", "Home cozy setting", "Gym", "Futuristic AI world"],
  },
  {
    id: 5,
    question: "What color mood should dominate visuals?",
    type: "single",
    options: ["Warm golden tones", "Bright & vibrant", "Dark & moody", "Soft pastel", "Black & white", "High contrast dramatic", "Natural realistic"],
  },
  {
    id: 6,
    question: "How bold should the avatar's presence feel?",
    type: "scale",
    scaleMin: "Soft background energy",
    scaleMax: "Main character dominant energy",
    scaleRange: [1, 5],
  },
  {
    id: 7,
    question: "How expressive should captions be?",
    type: "single",
    options: ["Minimal & cryptic", "Short & punchy", "Conversational", "Storytelling", "Deep & reflective", "Bold & provocative"],
  },
  {
    id: 8,
    question: "What emotional impact should posts create?",
    type: "multi",
    maxSelect: 2,
    options: ["Inspire", "Attract", "Entertain", "Intimidate", "Comfort", "Motivate", "Spark curiosity"],
  },
  {
    id: 9,
    question: "How should the avatar position itself socially?",
    type: "single",
    options: ["Relatable everyday person", "Aspirational lifestyle icon", "Trend leader", "Thought leader", "Rebel / rule breaker", "Quiet observer"],
  },
  {
    id: 10,
    question: "Should this avatar feel more human or hyper-idealized?",
    type: "single",
    options: ["Very human & authentic", "Slightly polished", "Highly curated influencer", "Unreal / AI-perfect"],
  },
];
