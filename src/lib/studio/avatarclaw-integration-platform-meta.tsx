import {
  CalendarDays,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  Rss,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlatformId } from "@/lib/studio/avatarclaw-integrations-storage";

export type IntegrationPlatformMeta = {
  name: string;
  description: string;
  icon: LucideIcon;
  oauthTitle: string;
  oauthButton: string;
};

export const INTEGRATION_PLATFORM_META: Record<PlatformId, IntegrationPlatformMeta> = {
  reddit: {
    name: "Reddit",
    description: "Post, monitor, and moderate subreddits from AvatarClaw.",
    icon: Rss,
    oauthTitle: "Authorize with Reddit",
    oauthButton: "Authorize with Reddit",
  },
  x: {
    name: "X (Twitter)",
    description: "Draft posts, replies, and lists on X.",
    icon: MessageSquare,
    oauthTitle: "Authorize with X",
    oauthButton: "Authorize with X",
  },
  telegram: {
    name: "Telegram",
    description: "Bots and channels for alerts and two-way chat.",
    icon: Send,
    oauthTitle: "Telegram uses a bot token",
    oauthButton: "Continue",
  },
  gmail: {
    name: "Gmail",
    description: "Read, label, and send mail with your connected account.",
    icon: Mail,
    oauthTitle: "Sign in with Google",
    oauthButton: "Sign in with Google",
  },
  "google-calendar": {
    name: "Google Calendar",
    description: "Create events, check availability, and send invites.",
    icon: CalendarDays,
    oauthTitle: "Sign in with Google",
    oauthButton: "Sign in with Google",
  },
  whatsapp: {
    name: "WhatsApp",
    description: "Business messaging and session-based workflows.",
    icon: Phone,
    oauthTitle: "Connect via Meta Business",
    oauthButton: "Connect via Meta Business",
  },
  discord: {
    name: "Discord",
    description: "Server tools, roles, and channel automation.",
    icon: MessagesSquare,
    oauthTitle: "Add Bot to Server",
    oauthButton: "Add Bot to Server",
  },
};
