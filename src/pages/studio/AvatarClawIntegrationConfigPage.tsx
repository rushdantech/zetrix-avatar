import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            providerLabel="Reddit"
            buttonLabel={state.oauthAuthorized ? "Re-authorize with Reddit" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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
            providerLabel="X"
            buttonLabel={state.oauthAuthorized ? "Re-authorize with X" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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

type TelegramPairingPhase =
  | "not_connected"
  | "waiting_pairing"
  | "pairing_code"
  | "openclaw_restarting"
  | "ready";

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
  const persisted = mergeInitialConfig("telegram");

  const [phase, setPhase] = useState<TelegramPairingPhase>(() => (isEditing ? "ready" : "not_connected"));
  const [botToken, setBotToken] = useState(persisted.botToken);
  const [pairingCode, setPairingCode] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [flowError, setFlowError] = useState("");
  const [tokenSubmitting, setTokenSubmitting] = useState(false);
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [openClawStatus, setOpenClawStatus] = useState<"pending" | "ready">("pending");
  const saveDoneRef = useRef(false);

  const stepIndex = (() => {
    switch (phase) {
      case "not_connected":
        return 0;
      case "waiting_pairing":
      case "pairing_code":
        return 1;
      case "openclaw_restarting":
        return 2;
      case "ready":
        return 3;
      default:
        return 0;
    }
  })();

  const stepLabels = ["Token", "Pairing", "OpenClaw", "Connected"];

  const persistTelegram = useCallback(() => {
    const base = mergeInitialConfig("telegram");
    savePlatformConnection("telegram", {
      ...base,
      botToken: botToken.trim(),
    });
  }, [botToken]);

  const startReconnect = () => {
    saveDoneRef.current = false;
    setFlowError("");
    setTokenError("");
    setCodeError("");
    setPairingCode("");
    setOpenClawStatus("pending");
    setPhase("not_connected");
  };

  const submitToken = () => {
    setTokenError("");
    setFlowError("");
    if (!botToken.trim()) {
      setTokenError("Bot token is required.");
      return;
    }
    setTokenSubmitting(true);
    window.setTimeout(() => {
      setTokenSubmitting(false);
      setPhase("waiting_pairing");
    }, 800);
  };

  const advanceToPairingCode = () => {
    setPhase("pairing_code");
  };

  const submitPairingCode = () => {
    setCodeError("");
    setFlowError("");
    if (!pairingCode.trim()) {
      setCodeError("Pairing code is required.");
      return;
    }
    setCodeSubmitting(true);
    setOpenClawStatus("pending");
    window.setTimeout(() => {
      setCodeSubmitting(false);
      setPhase("openclaw_restarting");
      window.setTimeout(() => {
        setOpenClawStatus("ready");
        window.setTimeout(() => {
          if (!saveDoneRef.current) {
            saveDoneRef.current = true;
            setSaving(true);
            persistTelegram();
            window.setTimeout(() => {
              setSaving(false);
              setPhase("ready");
              toast.success("Telegram is connected", {
                description: "You should receive a confirmation message in Telegram shortly (mock).",
              });
            }, 500);
          }
        }, 1400);
      }, 1600);
    }, 700);
  };

  const primaryFooter =
    phase === "ready" ? (
      <Button type="button" onClick={() => navigate(listPath)} disabled={saving}>
        Back to integrations
      </Button>
    ) : null;

  return (
    <>
      <main className="min-h-0 flex-1 space-y-6 py-6">
        <nav aria-label="Progress" className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <ol className="flex flex-wrap gap-3 sm:gap-6">
            {stepLabels.map((label, i) => {
              const active = i === stepIndex;
              const complete = i < stepIndex;
              return (
                <li key={label} className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                      complete && "border-primary bg-primary text-primary-foreground",
                      active && !complete && "border-primary bg-background text-primary",
                      !active && !complete && "border-muted-foreground/25 bg-background text-muted-foreground",
                    )}
                  >
                    {complete ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Connect Telegram</CardTitle>
            <CardDescription>Use your Telegram bot token to pair OpenClaw with Telegram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {flowError ? (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{flowError}</AlertDescription>
              </Alert>
            ) : null}

            {phase === "not_connected" ? (
              <div className="space-y-4">
                <PasswordFieldRow
                  id="tg-bot-token"
                  label="Bot Token"
                  required
                  help="Get this from @BotFather"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v..."
                  value={botToken}
                  onChange={(v) => setBotToken(v)}
                />
                {tokenError ? <p className="text-sm text-destructive">{tokenError}</p> : null}
                <Button type="button" onClick={submitToken} disabled={tokenSubmitting}>
                  {tokenSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            ) : null}

            {phase === "waiting_pairing" ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-foreground">Waiting for pairing code</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ve sent a pairing request. Please check Telegram for your pairing code.
                      </p>
                    </div>
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={advanceToPairingCode}>
                  I have my pairing code
                </Button>
              </div>
            ) : null}

            {phase === "pairing_code" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a pairing request. Please check Telegram for your pairing code.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="tg-pairing-code">Pairing Code</Label>
                  <Input
                    id="tg-pairing-code"
                    autoComplete="one-time-code"
                    placeholder="Enter the code from Telegram"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value)}
                  />
                  {codeError ? <p className="text-sm text-destructive">{codeError}</p> : null}
                </div>
                <Button type="button" onClick={submitPairingCode} disabled={codeSubmitting}>
                  {codeSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Submitting…
                    </>
                  ) : (
                    "Submit pairing code"
                  )}
                </Button>
              </div>
            ) : null}

            {phase === "openclaw_restarting" ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">
                  OpenClaw is restarting to complete the connection.
                </p>
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      openClawStatus === "pending" ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:bg-emerald-100",
                    )}
                  >
                    {openClawStatus === "pending" ? "Pending" : "Ready"}
                  </span>
                  {openClawStatus === "pending" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  )}
                </div>
              </div>
            ) : null}

            {phase === "ready" ? (
              <Alert className="border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30">
                <AlertTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Telegram is connected
                </AlertTitle>
                <AlertDescription className="text-emerald-900/90 dark:text-emerald-100/90">
                  You should receive a Telegram message confirming that the connection has been established.
                </AlertDescription>
              </Alert>
            ) : null}

            {phase === "ready" ? (
              <Button type="button" variant="outline" size="sm" onClick={startReconnect}>
                {isEditing ? "Update bot token or reconnect" : "Pair again"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </main>
      {footer(primaryFooter)}
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
            providerLabel="Google"
            buttonLabel={state.oauthAuthorized ? "Re-connect with Google" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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
            providerLabel="Google"
            buttonLabel={state.oauthAuthorized ? "Re-connect with Google" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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
            providerLabel="Meta"
            oauthStepLabels={[
              "Opening Meta Business Suite…",
              "Verifying your WhatsApp account…",
              "Confirming permissions…",
              "Finishing connection…",
            ]}
            buttonLabel={state.oauthAuthorized ? "Re-connect via Meta Business" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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
            providerLabel="Discord"
            oauthStepLabels={[
              "Opening Discord authorization…",
              "Choosing a server…",
              "Confirming bot permissions…",
              "Finishing connection…",
            ]}
            buttonLabel={state.oauthAuthorized ? "Re-add Bot to Server" : oauthMeta.oauthButton}
            authorized={state.oauthAuthorized}
            onAuthorize={() => setState(s => ({ ...s, oauthAuthorized: true }))}
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
