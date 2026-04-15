const STORAGE_KEY = "zetrix-avatar:avatarclawIntegrationsV1";
export const INTEGRATIONS_UPDATE_EVENT = "zetrix-integrations-update";

export const PLATFORM_IDS = [
  "reddit",
  "x",
  "telegram",
  "gmail",
  "google-calendar",
  "whatsapp",
  "discord",
] as const;
export type PlatformId = (typeof PLATFORM_IDS)[number];

export function isPlatformId(s: string): s is PlatformId {
  return (PLATFORM_IDS as readonly string[]).includes(s);
}

export type RedditConfig = {
  subreddits: string[];
  permissions: {
    readPosts: boolean;
    submitPosts: boolean;
    moderatePosts: boolean;
    modmail: boolean;
    privateMessages: boolean;
  };
  monitoring: "disabled" | "mentions" | "keywords" | "all";
  trackKeywords: string[];
  oauthMockAuthorized: boolean;
};

export type XConfig = {
  permissions: {
    readTweets: boolean;
    postReply: boolean;
    readLists: boolean;
    manageLists: boolean;
    readDms: boolean;
    sendDms: boolean;
  };
  autoPosting: boolean;
  monitorMentions: boolean;
  draftReviewMode: "always" | "replies_only" | "auto_send";
  oauthMockAuthorized: boolean;
};

export type TelegramConfig = {
  botToken: string;
  chatChannelId: string;
  botMode: "alerts" | "two_way" | "slash_only";
  allowedUsers: string[];
  useWebhook: boolean;
};

export type GmailConfig = {
  oauthMockAuthorized: boolean;
  permissions: {
    read: boolean;
    send: boolean;
    labels: boolean;
    modify: boolean;
  };
  monitorLabels: string[];
  autoLabelling: boolean;
  notifications: "all" | "important" | "filters" | "disabled";
};

export type GoogleCalendarConfig = {
  oauthMockAuthorized: boolean;
  permissions: {
    view: boolean;
    createEdit: boolean;
    settings: boolean;
  };
  calendarsToSync: string[];
  defaultDuration: "15" | "30" | "60" | "90";
  timezone: string;
  autoAcceptInvites: boolean;
};

export type WhatsAppConfig = {
  oauthMockAuthorized: boolean;
  businessAccountId: string;
  phoneNumberId: string;
  systemUserAccessToken: string;
  webhookVerifyToken: string;
  messagingMode: "session" | "template" | "both";
  messageTemplates: string[];
};

export type DiscordConfig = {
  oauthMockAuthorized: boolean;
  botPermissions: {
    sendMessages: boolean;
    manageMessages: boolean;
    manageRoles: boolean;
    manageChannels: boolean;
    readHistory: boolean;
    addReactions: boolean;
  };
  serverId: string;
  activeChannels: string[];
  gatewayIntents: {
    serverEvents: boolean;
    messageEvents: boolean;
    memberEvents: boolean;
    messageContent: boolean;
  };
  autoAssignRoles: boolean;
};

export type PlatformConfigMap = {
  reddit: RedditConfig;
  x: XConfig;
  telegram: TelegramConfig;
  gmail: GmailConfig;
  "google-calendar": GoogleCalendarConfig;
  whatsapp: WhatsAppConfig;
  discord: DiscordConfig;
};

export type IntegrationStore = {
  v: 1;
  platforms: Partial<{
    [K in PlatformId]: { connected: boolean; config: PlatformConfigMap[K] };
  }>;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function defaultRedditConfig(): RedditConfig {
  return {
    subreddits: [],
    permissions: {
      readPosts: true,
      submitPosts: false,
      moderatePosts: false,
      modmail: false,
      privateMessages: false,
    },
    monitoring: "disabled",
    trackKeywords: [],
    oauthMockAuthorized: false,
  };
}

export function defaultXConfig(): XConfig {
  return {
    permissions: {
      readTweets: true,
      postReply: false,
      readLists: false,
      manageLists: false,
      readDms: false,
      sendDms: false,
    },
    autoPosting: false,
    monitorMentions: true,
    draftReviewMode: "always",
    oauthMockAuthorized: false,
  };
}

export function defaultTelegramConfig(): TelegramConfig {
  return {
    botToken: "",
    chatChannelId: "",
    botMode: "alerts",
    allowedUsers: [],
    useWebhook: true,
  };
}

export function defaultGmailConfig(): GmailConfig {
  return {
    oauthMockAuthorized: false,
    permissions: {
      read: true,
      send: false,
      labels: false,
      modify: false,
    },
    monitorLabels: [],
    autoLabelling: false,
    notifications: "important",
  };
}

export function defaultGoogleCalendarConfig(): GoogleCalendarConfig {
  return {
    oauthMockAuthorized: false,
    permissions: {
      view: true,
      createEdit: false,
      settings: false,
    },
    calendarsToSync: [],
    defaultDuration: "30",
    timezone: "Asia/Kuala_Lumpur",
    autoAcceptInvites: false,
  };
}

export function generateWebhookVerifyToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function defaultWhatsAppConfig(): WhatsAppConfig {
  return {
    oauthMockAuthorized: false,
    businessAccountId: "",
    phoneNumberId: "",
    systemUserAccessToken: "",
    webhookVerifyToken: generateWebhookVerifyToken(),
    messagingMode: "session",
    messageTemplates: [],
  };
}

export function defaultDiscordConfig(): DiscordConfig {
  return {
    oauthMockAuthorized: false,
    botPermissions: {
      sendMessages: true,
      manageMessages: false,
      manageRoles: false,
      manageChannels: false,
      readHistory: true,
      addReactions: false,
    },
    serverId: "",
    activeChannels: [],
    gatewayIntents: {
      serverEvents: true,
      messageEvents: true,
      memberEvents: false,
      messageContent: false,
    },
    autoAssignRoles: false,
  };
}

export function defaultConfigForPlatform<K extends PlatformId>(id: K): PlatformConfigMap[K] {
  switch (id) {
    case "reddit":
      return defaultRedditConfig() as PlatformConfigMap[K];
    case "x":
      return defaultXConfig() as PlatformConfigMap[K];
    case "telegram":
      return defaultTelegramConfig() as PlatformConfigMap[K];
    case "gmail":
      return defaultGmailConfig() as PlatformConfigMap[K];
    case "google-calendar":
      return defaultGoogleCalendarConfig() as PlatformConfigMap[K];
    case "whatsapp":
      return defaultWhatsAppConfig() as PlatformConfigMap[K];
    case "discord":
      return defaultDiscordConfig() as PlatformConfigMap[K];
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function loadIntegrationStore(): IntegrationStore {
  const empty: IntegrationStore = { v: 1, platforms: {} };
  return safeParse<IntegrationStore>(localStorage.getItem(STORAGE_KEY), empty);
}

export function persistIntegrationStore(store: IntegrationStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(INTEGRATIONS_UPDATE_EVENT));
}

export function getPlatformEntry<K extends PlatformId>(
  id: K,
): { connected: boolean; config: PlatformConfigMap[K] } | undefined {
  const store = loadIntegrationStore();
  const e = store.platforms[id];
  if (!e) return undefined;
  return e as { connected: boolean; config: PlatformConfigMap[K] };
}

export function isPlatformConnected(id: PlatformId): boolean {
  return loadIntegrationStore().platforms[id]?.connected === true;
}

export function savePlatformConnection<K extends PlatformId>(
  id: K,
  config: PlatformConfigMap[K],
): void {
  const store = loadIntegrationStore();
  store.platforms[id] = { connected: true, config };
  persistIntegrationStore(store);
}

export function disconnectPlatform(id: PlatformId): void {
  const store = loadIntegrationStore();
  delete store.platforms[id];
  persistIntegrationStore(store);
}

export function mergeInitialConfig<K extends PlatformId>(id: K): PlatformConfigMap[K] {
  const defaults = defaultConfigForPlatform(id);
  const entry = getPlatformEntry(id);
  if (!entry?.connected || !entry.config) return defaults;
  return { ...defaults, ...entry.config } as PlatformConfigMap[K];
}
