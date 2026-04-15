import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AVATARCLAW_USER_AGENT_ID,
  loadAvatarClawAgentInstance,
} from "@/lib/studio/avatarclaw-agent-instance";
import { INTEGRATION_PLATFORM_META } from "@/lib/studio/avatarclaw-integration-platform-meta";
import {
  type DiscordConfig,
  type GmailConfig,
  type GoogleCalendarConfig,
  type PlatformId,
  type RedditConfig,
  type TelegramConfig,
  type WhatsAppConfig,
  type XConfig,
  disconnectPlatform,
  isPlatformConnected,
  isPlatformId,
  mergeInitialConfig,
  savePlatformConnection,
} from "@/lib/studio/avatarclaw-integrations-storage";
import {
  CheckboxListField,
  FieldHelp,
  IntegrationOAuthBanner,
  PasswordFieldRow,
  TagInputField,
  TextFieldRow,
  ToggleRow,
} from "@/components/studio/integrations/integration-form-primitives";

export default function AvatarClawIntegrationConfigPage() {
  const { agentId, platformId: platformIdRaw } = useParams<{ agentId: string; platformId: string }>();
  const navigate = useNavigate();
  const instance = loadAvatarClawAgentInstance();
  const listPath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/integrations`;
  const platformId = platformIdRaw && isPlatformId(platformIdRaw) ? platformIdRaw : null;

  const isEditing = platformId ? isPlatformConnected(platformId) : false;

  useEffect(() => {
    if (agentId !== AVATARCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  useEffect(() => {
    if (!platformIdRaw || !isPlatformId(platformIdRaw)) {
      navigate(listPath, { replace: true });
    }
  }, [platformIdRaw, navigate, listPath]);

  if (!instance || agentId !== AVATARCLAW_USER_AGENT_ID || !platformId) {
    return null;
  }

  const meta = INTEGRATION_PLATFORM_META[platformId];
  const Icon = meta.icon;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col lg:min-h-[calc(100dvh-5rem)]">
      <header className="shrink-0 border-b border-border pb-4">
        <div className="flex flex-wrap items-start gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/studio/agents" aria-label="Back to agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">{meta.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
              <Link
                to={listPath}
                className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                ← Back to integrations
              </Link>
            </div>
          </div>
        </div>
      </header>

      <PlatformConfigBody
        platformId={platformId}
        isEditing={isEditing}
        listPath={listPath}
        oauthMeta={meta}
      />
    </div>
  );
}

function PlatformConfigBody({
  platformId,
  isEditing,
  listPath,
  oauthMeta,
}: {
  platformId: PlatformId;
  isEditing: boolean;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)[PlatformId];
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const cancel = useCallback(() => {
    navigate(listPath);
  }, [navigate, listPath]);

  const onDisconnect = useCallback(() => {
    disconnectPlatform(platformId);
    toast.message(`${oauthMeta.name} disconnected`, { description: "Integration settings were reset." });
    navigate(listPath);
  }, [navigate, listPath, oauthMeta.name, platformId]);

  const footer = (primary: React.ReactNode) => (
    <footer className="sticky bottom-0 z-10 mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:justify-between">
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:mr-auto">
        {isEditing ? (
          <Button type="button" variant="destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : null}
      </div>
      <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
        <Button type="button" variant="outline" onClick={cancel} disabled={saving}>
          Cancel
        </Button>
        {primary}
      </div>
    </footer>
  );

  switch (platformId) {
    case "reddit":
      return (
        <RedditConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    case "x":
      return (
        <XConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    case "telegram":
      return (
        <TelegramConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          footer={footer}
        />
      );
    case "gmail":
      return (
        <GmailConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    case "google-calendar":
      return (
        <GoogleCalendarConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    case "whatsapp":
      return (
        <WhatsAppConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    case "discord":
      return (
        <DiscordConfigSection
          isEditing={isEditing}
          saving={saving}
          setSaving={setSaving}
          listPath={listPath}
          oauthMeta={oauthMeta}
          footer={footer}
        />
      );
    default: {
      const _e: never = platformId;
      return _e;
    }
  }
}

function RedditConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["reddit"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<RedditConfig>(() => mergeInitialConfig("reddit"));

  const save = () => {
    setSaving(true);
    savePlatformConnection("reddit", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Reddit connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-authorize with Reddit" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <TagInputField
            id="reddit-subs"
            label="Subreddits"
            placeholder="e.g. r/malaysia, r/crypto"
            value={state.subreddits}
            onChange={tags => setState(s => ({ ...s, subreddits: tags }))}
          />
          <CheckboxListField
            label="Permissions"
            items={[
              {
                id: "r-read",
                label: "Read posts & comments",
                checked: state.permissions.readPosts,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, readPosts: v } })),
              },
              {
                id: "r-sub",
                label: "Submit posts & comments",
                checked: state.permissions.submitPosts,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, submitPosts: v } })),
              },
              {
                id: "r-mod",
                label: "Moderate posts",
                checked: state.permissions.moderatePosts,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, moderatePosts: v } })),
              },
              {
                id: "r-mm",
                label: "Access modmail",
                checked: state.permissions.modmail,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, modmail: v } })),
              },
              {
                id: "r-pm",
                label: "Private messages",
                checked: state.permissions.privateMessages,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, privateMessages: v } })),
              },
            ]}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Monitoring</label>
            <Select
              value={state.monitoring}
              onValueChange={v =>
                setState(s => ({ ...s, monitoring: v as RedditConfig["monitoring"] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select monitoring mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="mentions">Mentions only</SelectItem>
                <SelectItem value="keywords">Keyword tracking</SelectItem>
                <SelectItem value="all">All activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state.monitoring === "keywords" ? (
            <TagInputField
              id="reddit-kw"
              label="Track Keywords"
              placeholder="e.g. zetrix, blockchain"
              value={state.trackKeywords}
              onChange={tags => setState(s => ({ ...s, trackKeywords: tags }))}
            />
          ) : null}
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function XConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["x"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<XConfig>(() => mergeInitialConfig("x"));

  const save = () => {
    setSaving(true);
    savePlatformConnection("x", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("X connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-authorize with X" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <CheckboxListField
            label="Permissions"
            items={[
              {
                id: "x-read",
                label: "Read tweets & timeline",
                checked: state.permissions.readTweets,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, readTweets: v } })),
              },
              {
                id: "x-post",
                label: "Post & reply",
                checked: state.permissions.postReply,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, postReply: v } })),
              },
              {
                id: "x-rl",
                label: "Read lists",
                checked: state.permissions.readLists,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, readLists: v } })),
              },
              {
                id: "x-ml",
                label: "Manage lists",
                checked: state.permissions.manageLists,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, manageLists: v } })),
              },
              {
                id: "x-rd",
                label: "Read DMs",
                checked: state.permissions.readDms,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, readDms: v } })),
              },
              {
                id: "x-sd",
                label: "Send DMs",
                checked: state.permissions.sendDms,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, sendDms: v } })),
              },
            ]}
          />
          <ToggleRow
            id="x-auto"
            label="Allow AvatarClaw to post without manual approval"
            checked={state.autoPosting}
            onChange={v => setState(s => ({ ...s, autoPosting: v }))}
          />
          <ToggleRow
            id="x-mon"
            label="Get alerts when your account is mentioned"
            checked={state.monitorMentions}
            onChange={v => setState(s => ({ ...s, monitorMentions: v }))}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Draft review mode</label>
            <Select
              value={state.draftReviewMode}
              onValueChange={v => setState(s => ({ ...s, draftReviewMode: v as XConfig["draftReviewMode"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always require approval</SelectItem>
                <SelectItem value="replies_only">Approve replies only</SelectItem>
                <SelectItem value="auto_send">Auto-send all</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function TelegramConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<TelegramConfig>(() => mergeInitialConfig("telegram"));

  const save = () => {
    if (!state.botToken.trim()) {
      toast.error("Bot Token is required.");
      return;
    }
    setSaving(true);
    savePlatformConnection("telegram", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Telegram connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Bot credentials</h2>
          <FieldHelp>Telegram uses a bot token from @BotFather instead of OAuth in this flow.</FieldHelp>
        </section>
        <Separator />
        <section className="space-y-6">
          <PasswordFieldRow
            id="tg-token"
            label="Bot Token"
            required
            help="Get this from @BotFather"
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v..."
            value={state.botToken}
            onChange={v => setState(s => ({ ...s, botToken: v }))}
          />
          <TextFieldRow
            id="tg-chat"
            label="Chat / Channel ID"
            placeholder="-1001234567890 or @channelname"
            value={state.chatChannelId}
            onChange={v => setState(s => ({ ...s, chatChannelId: v }))}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Bot Mode</label>
            <Select
              value={state.botMode}
              onValueChange={v => setState(s => ({ ...s, botMode: v as TelegramConfig["botMode"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alerts">Alerts only (one-way)</SelectItem>
                <SelectItem value="two_way">Two-way chat</SelectItem>
                <SelectItem value="slash_only">Slash commands only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TagInputField
            id="tg-users"
            label="Allowed Users"
            help="Leave empty for all"
            placeholder="Telegram usernames or user IDs"
            value={state.allowedUsers}
            onChange={tags => setState(s => ({ ...s, allowedUsers: tags }))}
          />
          <ToggleRow
            id="tg-wh"
            label="Use Webhook"
            help="Recommended for production"
            checked={state.useWebhook}
            onChange={v => setState(s => ({ ...s, useWebhook: v }))}
          />
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function GmailConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["gmail"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<GmailConfig>(() => mergeInitialConfig("gmail"));

  const save = () => {
    setSaving(true);
    savePlatformConnection("gmail", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Gmail connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-connect with Google" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <CheckboxListField
            label="Permissions"
            items={[
              {
                id: "gm-read",
                label: "Read emails",
                checked: state.permissions.read,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, read: v } })),
              },
              {
                id: "gm-send",
                label: "Send emails",
                checked: state.permissions.send,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, send: v } })),
              },
              {
                id: "gm-lab",
                label: "Manage labels",
                checked: state.permissions.labels,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, labels: v } })),
              },
              {
                id: "gm-mod",
                label: "Modify emails (archive, star, etc.)",
                checked: state.permissions.modify,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, modify: v } })),
              },
            ]}
          />
          <TagInputField
            id="gm-labels"
            label="Monitor Labels"
            placeholder="e.g. INBOX, IMPORTANT, custom-label"
            value={state.monitorLabels}
            onChange={tags => setState(s => ({ ...s, monitorLabels: tags }))}
          />
          <ToggleRow
            id="gm-auto"
            label="Let AvatarClaw auto-categorise incoming mail"
            checked={state.autoLabelling}
            onChange={v => setState(s => ({ ...s, autoLabelling: v }))}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Notifications</label>
            <Select
              value={state.notifications}
              onValueChange={v => setState(s => ({ ...s, notifications: v as GmailConfig["notifications"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All new mail</SelectItem>
                <SelectItem value="important">Important only</SelectItem>
                <SelectItem value="filters">Matching filters only</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function GoogleCalendarConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["google-calendar"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<GoogleCalendarConfig>(() => mergeInitialConfig("google-calendar"));

  const save = () => {
    setSaving(true);
    savePlatformConnection("google-calendar", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Google Calendar connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-connect with Google" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <CheckboxListField
            label="Permissions"
            items={[
              {
                id: "gc-v",
                label: "View calendars & events",
                checked: state.permissions.view,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, view: v } })),
              },
              {
                id: "gc-ce",
                label: "Create & edit events",
                checked: state.permissions.createEdit,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, createEdit: v } })),
              },
              {
                id: "gc-set",
                label: "Read calendar settings",
                checked: state.permissions.settings,
                onChange: v => setState(s => ({ ...s, permissions: { ...s.permissions, settings: v } })),
              },
            ]}
          />
          <TagInputField
            id="gc-cal"
            label="Calendars to Sync"
            placeholder="e.g. Work, Personal, Team"
            value={state.calendarsToSync}
            onChange={tags => setState(s => ({ ...s, calendarsToSync: tags }))}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Event Duration</label>
            <Select
              value={state.defaultDuration}
              onValueChange={v =>
                setState(s => ({ ...s, defaultDuration: v as GoogleCalendarConfig["defaultDuration"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TextFieldRow
            id="gc-tz"
            label="Timezone"
            placeholder="Asia/Kuala_Lumpur"
            value={state.timezone}
            onChange={v => setState(s => ({ ...s, timezone: v }))}
          />
          <ToggleRow
            id="gc-auto"
            label="Automatically accept invites that don't conflict"
            checked={state.autoAcceptInvites}
            onChange={v => setState(s => ({ ...s, autoAcceptInvites: v }))}
          />
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function WhatsAppConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["whatsapp"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<WhatsAppConfig>(() => mergeInitialConfig("whatsapp"));

  const save = () => {
    if (!state.businessAccountId.trim() || !state.phoneNumberId.trim() || !state.systemUserAccessToken.trim()) {
      toast.error("Business Account ID, Phone Number ID, and System User Access Token are required.");
      return;
    }
    setSaving(true);
    savePlatformConnection("whatsapp", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("WhatsApp connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  const showTemplates =
    state.messagingMode === "template" || state.messagingMode === "both";

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-connect via Meta Business" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <TextFieldRow
            id="wa-biz"
            label="Business Account ID"
            required
            help="From Meta Business Suite → WhatsApp Accounts"
            placeholder="e.g. 1234567890"
            value={state.businessAccountId}
            onChange={v => setState(s => ({ ...s, businessAccountId: v }))}
          />
          <TextFieldRow
            id="wa-phone"
            label="Phone Number ID"
            required
            placeholder="e.g. 1234567890"
            value={state.phoneNumberId}
            onChange={v => setState(s => ({ ...s, phoneNumberId: v }))}
          />
          <PasswordFieldRow
            id="wa-token"
            label="System User Access Token"
            required
            help="Permanent token from Meta Business Settings"
            placeholder="Permanent token from Meta Business Settings"
            value={state.systemUserAccessToken}
            onChange={v => setState(s => ({ ...s, systemUserAccessToken: v }))}
          />
          <TextFieldRow
            id="wa-verify"
            label="Webhook Verify Token"
            help="Use this when configuring your webhook in Meta Developer Console"
            value={state.webhookVerifyToken}
            onChange={() => {}}
            readOnly
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Messaging Mode</label>
            <Select
              value={state.messagingMode}
              onValueChange={v =>
                setState(s => ({ ...s, messagingMode: v as WhatsAppConfig["messagingMode"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">Session-based (24h window)</SelectItem>
                <SelectItem value="template">Template-based outbound</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showTemplates ? (
            <TagInputField
              id="wa-tpl"
              label="Message Templates"
              placeholder="e.g. order_update, appointment_reminder"
              value={state.messageTemplates}
              onChange={tags => setState(s => ({ ...s, messageTemplates: tags }))}
            />
          ) : null}
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}

function DiscordConfigSection({
  isEditing,
  saving,
  setSaving,
  listPath,
  oauthMeta,
  footer,
}: {
  isEditing: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  listPath: string;
  oauthMeta: (typeof INTEGRATION_PLATFORM_META)["discord"];
  footer: (primary: React.ReactNode) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<DiscordConfig>(() => mergeInitialConfig("discord"));

  const save = () => {
    setSaving(true);
    savePlatformConnection("discord", state);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Discord connected", { description: "Returning to integrations." });
      navigate(listPath);
    }, 1200);
  };

  return (
    <>
      <main className="min-h-0 flex-1 space-y-8 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
          <IntegrationOAuthBanner
            title={oauthMeta.oauthTitle}
            buttonLabel={state.oauthMockAuthorized ? "Re-add Bot to Server" : oauthMeta.oauthButton}
            authorized={state.oauthMockAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthMockAuthorized: true }))}
          />
        </section>
        <Separator />
        <section className="space-y-6">
          <CheckboxListField
            label="Bot Permissions"
            items={[
              {
                id: "d-send",
                label: "Send messages",
                checked: state.botPermissions.sendMessages,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, sendMessages: v } })),
              },
              {
                id: "d-mm",
                label: "Manage messages",
                checked: state.botPermissions.manageMessages,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, manageMessages: v } })),
              },
              {
                id: "d-mr",
                label: "Manage roles",
                checked: state.botPermissions.manageRoles,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, manageRoles: v } })),
              },
              {
                id: "d-mc",
                label: "Manage channels",
                checked: state.botPermissions.manageChannels,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, manageChannels: v } })),
              },
              {
                id: "d-hist",
                label: "Read message history",
                checked: state.botPermissions.readHistory,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, readHistory: v } })),
              },
              {
                id: "d-react",
                label: "Add reactions",
                checked: state.botPermissions.addReactions,
                onChange: v => setState(s => ({ ...s, botPermissions: { ...s.botPermissions, addReactions: v } })),
              },
            ]}
          />
          <TextFieldRow
            id="d-srv"
            label="Server ID"
            help="Enable Developer Mode in Discord — right-click server → Copy Server ID"
            placeholder="Right-click server → Copy Server ID"
            value={state.serverId}
            onChange={v => setState(s => ({ ...s, serverId: v }))}
          />
          <TagInputField
            id="d-ch"
            label="Active Channels"
            placeholder="e.g. #general, #alerts, #modlog"
            value={state.activeChannels}
            onChange={tags => setState(s => ({ ...s, activeChannels: tags }))}
          />
          <CheckboxListField
            label="Gateway Intents"
            items={[
              {
                id: "d-ge",
                label: "Server events",
                checked: state.gatewayIntents.serverEvents,
                onChange: v => setState(s => ({ ...s, gatewayIntents: { ...s.gatewayIntents, serverEvents: v } })),
              },
              {
                id: "d-me",
                label: "Message events",
                checked: state.gatewayIntents.messageEvents,
                onChange: v => setState(s => ({ ...s, gatewayIntents: { ...s.gatewayIntents, messageEvents: v } })),
              },
              {
                id: "d-mem",
                label: "Member events (privileged)",
                checked: state.gatewayIntents.memberEvents,
                onChange: v => setState(s => ({ ...s, gatewayIntents: { ...s.gatewayIntents, memberEvents: v } })),
              },
              {
                id: "d-mc2",
                label: "Message content (privileged)",
                checked: state.gatewayIntents.messageContent,
                onChange: v => setState(s => ({ ...s, gatewayIntents: { ...s.gatewayIntents, messageContent: v } })),
              },
            ]}
          />
          <ToggleRow
            id="d-ar"
            label="Automatically assign roles to new members"
            checked={state.autoAssignRoles}
            onChange={v => setState(s => ({ ...s, autoAssignRoles: v }))}
          />
        </section>
      </main>
      {footer(
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Save & Connect"
          )}
        </Button>,
      )}
    </>
  );
}
