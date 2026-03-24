import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Send, Bot, User, MessageCircle, ChevronRight, Menu, Paperclip, X,
  Users, TrendingUp, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTypeSelector } from "@/features/job-agent/components/FileTypeSelector";
import { parseStructuredOutput } from "@/features/job-agent/utils/parseStructuredOutput";
import type {
  ApplicationConfirmData,
  AttachmentKind,
  AttestedCredentialsData,
  CoverLetterPreviewData,
  JobAttachment,
  JobCardData,
  ParsedSegment,
  PreferencesSummaryData,
  ProfileSummaryData,
  ResumePreviewData,
  ApplicationSentData,
} from "@/features/job-agent/types";
import {
  mockApplicationConfirm,
  mockApplicationSent,
  mockAttestedCredentials,
  mockCoverLetterPreview,
  mockPreferencesSummary,
  mockProfileSummary,
  mockResumePreview,
  mockStructuredJobSearchResponse,
} from "@/features/job-agent/mocks/mockData";
import { JobCard } from "@/features/job-agent/components/cards/JobCard";
import { ResumePreview } from "@/features/job-agent/components/cards/ResumePreview";
import { CoverLetterPreview } from "@/features/job-agent/components/cards/CoverLetterPreview";
import { ApplicationSent } from "@/features/job-agent/components/cards/ApplicationSent";
import { ApplicationConfirm } from "@/features/job-agent/components/cards/ApplicationConfirm";
import { ProfileSummary } from "@/features/job-agent/components/cards/ProfileSummary";
import { PreferencesSummary } from "@/features/job-agent/components/cards/PreferencesSummary";
import { AttestedCredentials } from "@/features/job-agent/components/cards/AttestedCredentials";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Array<{ id: string; name: string; kind: AttachmentKind }>;
}

interface Conversation {
  id: string;
  avatarId: string;
  avatarName: string;
  avatarBio?: string;
  isYours: boolean;
  messages: ChatMessage[];
  lastMessagePreview: string;
  lastTimestamp: string;
}

interface AvatarCard {
  id: string;
  name: string;
  bio: string;
  isYours: boolean;
  category?: string;
  isJobAgent?: boolean;
  marketplaceKind: "individual" | "enterprise";
  pricingTier: "free" | "paid";
  /** Required when pricingTier is paid (MYR / month) */
  priceMonthlyMyr?: number;
}

const JOB_AGENT_AVATAR_ID = "job-agent";

const mockResponses = [
  "Hey! Great question. I think the key to great content is authenticity.",
  "I'd love to help with that!",
  "Interesting angle, let's explore it.",
  "Great idea. Want me to draft it?",
];

const defaultWelcome = (name: string) =>
  `Hey there! I'm **${name}**, your AI companion. Ask me anything!`;

const jobAgentWelcome = `Hi! I'm your job application assistant. To get started,
you can:
📎 Upload your credentials (certificates, transcripts)
📎 Upload your resume (CV)
Or just tell me what kind of role you're looking for.`;

const enterpriseWelcome = (name: string) =>
  `Hello — I'm **${name}**, an enterprise operations agent. I can help with filings, payments, and delegated workflows under policy.`;

function useMockAvatars(personaName: string) {
  const yourIndividual: AvatarCard[] = [
    { id: "my-1", name: personaName, bio: "Tech enthusiast.", isYours: true, marketplaceKind: "individual", pricingTier: "free" },
    { id: "my-2", name: "Sidekick Sam", bio: "Casual creative buddy.", isYours: true, marketplaceKind: "individual", pricingTier: "free" },
  ];
  const yourEnterprise: AvatarCard[] = [
    {
      id: JOB_AGENT_AVATAR_ID,
      name: "Job Application Agent",
      bio: "Upload credentials/CV, search Malaysian jobs, tailor resume, and apply via email.",
      isYours: true,
      isJobAgent: true,
      marketplaceKind: "enterprise",
      pricingTier: "free",
    },
    {
      id: "ent-my-1",
      name: "Acme Tax Copilot",
      bio: "Enterprise agent for LHDN prep and compliance drafts (demo).",
      isYours: true,
      marketplaceKind: "enterprise",
      pricingTier: "paid",
      priceMonthlyMyr: 99,
    },
  ];
  const popularIndividual: AvatarCard[] = [
    { id: "pop-1", name: "Luna Creative", bio: "Visual storyteller.", isYours: false, category: "Content", marketplaceKind: "individual", pricingTier: "free" },
    { id: "pop-2", name: "Alex Mentor", bio: "Career coach.", isYours: false, category: "Lifestyle", marketplaceKind: "individual", pricingTier: "paid", priceMonthlyMyr: 29 },
    { id: "pop-3", name: "Riley Tech", bio: "Dev explainer.", isYours: false, category: "Tech", marketplaceKind: "individual", pricingTier: "free" },
  ];
  const popularEnterprise: AvatarCard[] = [
    { id: "pop-e1", name: "SSM Filing Assistant", bio: "Annual returns and company updates.", isYours: false, category: "Compliance", marketplaceKind: "enterprise", pricingTier: "paid", priceMonthlyMyr: 149 },
    { id: "pop-e2", name: "Payroll Reconciliation Bot", bio: "Vendor payments and invoice matching.", isYours: false, category: "Finance", marketplaceKind: "enterprise", pricingTier: "paid", priceMonthlyMyr: 199 },
  ];
  return { yourIndividual, yourEnterprise, popularIndividual, popularEnterprise };
}

function MarketplaceAvatarListItem({
  avatar,
  subscribed,
  onSubscribe,
  onChat,
}: {
  avatar: AvatarCard;
  subscribed: boolean;
  onSubscribe: (a: AvatarCard) => void;
  onChat: (a: AvatarCard) => void;
}) {
  const enterprise = avatar.marketplaceKind === "enterprise";

  const inner = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          enterprise ? "bg-info/20 text-info" : "gradient-primary text-primary-foreground",
          avatar.isYours && enterprise && "font-bold",
          !avatar.isYours && enterprise && "font-semibold",
          !avatar.isYours && !enterprise && "bg-primary/20 text-primary font-semibold",
        )}
      >
        {avatar.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{avatar.name}</p>
        <span
          className={cn(
            "mr-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium",
            enterprise ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-purple-500/15 text-purple-700 dark:text-purple-300",
          )}
        >
          {enterprise ? "Enterprise" : "Individual"}
        </span>
        {avatar.category && (
          <span className="mr-1 inline-block rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {avatar.category}
          </span>
        )}
        <p className="line-clamp-2 text-[10px] text-muted-foreground">{avatar.bio}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </>
  );

  if (avatar.isYours) {
    return (
      <button
        type="button"
        onClick={() => onChat(avatar)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all",
          enterprise ? "hover:border-info/40 hover:bg-secondary/50" : "hover:border-primary/40 hover:bg-secondary/50",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => onChat(avatar)}
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left transition-all",
          enterprise ? "hover:bg-secondary/50" : "hover:bg-secondary/50",
        )}
      >
        {inner}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/20 px-3 py-2">
        <span className="text-[11px] font-medium">
          {avatar.pricingTier === "free" ? (
            <span className="text-success">Free</span>
          ) : (
            <span className="text-foreground">RM {avatar.priceMonthlyMyr}/mo</span>
          )}
        </span>
        {subscribed ? (
          <span className="text-[11px] font-medium text-success">Subscribed</span>
        ) : (
          <button
            type="button"
            onClick={() => onSubscribe(avatar)}
            className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
          >
            Subscribe
          </button>
        )}
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { persona, marketplaceSubscriptions, addMarketplaceSubscription } = useApp();
  const { yourIndividual, yourEnterprise, popularIndividual, popularEnterprise } = useMockAvatars(persona.name);

  const subscribedIds = useMemo(() => new Set(marketplaceSubscriptions.map((s) => s.avatarId)), [marketplaceSubscriptions]);
  const [subscribeTarget, setSubscribeTarget] = useState<AvatarCard | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<JobAttachment[]>([]);
  const [credentialStore, setCredentialStore] = useState(mockAttestedCredentials);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = activeId ? conversations.find(c => c.id === activeId) : null;
  const isJobAgentConversation = activeConv?.avatarId === JOB_AGENT_AVATAR_ID;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isTyping]);

  const pushAssistantResponse = (convId: string, response: string) => {
    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, botMsg],
      lastMessagePreview: response.slice(0, 40).replace(/\n/g, " ") + "...",
      lastTimestamp: botMsg.timestamp,
    } : c));
  };

  const startOrOpenChat = (avatar: AvatarCard) => {
    const existing = conversations.find(c => c.avatarId === avatar.id);
    if (existing) {
      setActiveId(existing.id);
      setMenuOpen(false);
      return;
    }
    const welcome: ChatMessage = {
      id: `welcome-${avatar.id}`,
      role: "assistant",
      content: avatar.isJobAgent
        ? jobAgentWelcome
        : avatar.marketplaceKind === "enterprise"
          ? enterpriseWelcome(avatar.name)
          : defaultWelcome(avatar.name),
      timestamp: new Date().toISOString(),
    };
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarBio: avatar.bio,
      isYours: avatar.isYours,
      messages: [welcome],
      lastMessagePreview: welcome.content.slice(0, 40) + "...",
      lastTimestamp: welcome.timestamp,
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setPendingAttachments([]);
    setMenuOpen(false);
  };

  const switchConversation = (conv: Conversation) => {
    setActiveId(conv.id);
    setPendingAttachments([]);
    setMenuOpen(false);
  };

  const getJobAgentResponse = (text: string) => {
    const normalized = text.toLowerCase();
    if (
      normalized.includes("existing credential") ||
      normalized.includes("my credential") ||
      normalized.includes("show credential") ||
      normalized.includes("view credential")
    ) {
      return `Here are your currently attested credentials:

\`\`\`json:attested_credentials
${JSON.stringify(credentialStore, null, 2)}
\`\`\``;
    }
    if (normalized.includes("search")) return mockStructuredJobSearchResponse;
    if (normalized.includes("apply to")) return `\`\`\`json:resume_preview
${JSON.stringify(mockResumePreview, null, 2)}
\`\`\``;
    if (normalized.includes("approved. proceed with this resume")) return `\`\`\`json:cover_letter_preview
${JSON.stringify(mockCoverLetterPreview, null, 2)}
\`\`\``;
    if (
      normalized.includes("confirm submit application") ||
      normalized.includes("yes, submit application")
    ) return `\`\`\`json:application_sent
${JSON.stringify(mockApplicationSent, null, 2)}
\`\`\``;
    if (normalized.includes("approved. proceed with this cover letter")) return `Before I send the application email, please confirm:

\`\`\`json:application_confirm
${JSON.stringify(mockApplicationConfirm, null, 2)}
\`\`\``;
    if (normalized.includes("uploaded my resume")) return `\`\`\`json:profile_summary
${JSON.stringify(mockProfileSummary, null, 2)}
\`\`\``;
    if (normalized.includes("senior backend") || normalized.includes("fintech") || normalized.includes("rm15")) return `\`\`\`json:preferences_summary
${JSON.stringify(mockPreferencesSummary, null, 2)}
\`\`\``;
    return "I can help you attest credentials, parse resume, and apply to roles. Say 'search' when ready.";
  };

  const sendMessage = (quickText?: string) => {
    const text = (quickText ?? input).trim();
    if ((!text && pendingAttachments.length === 0) || isTyping || !activeConv) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      attachments: pendingAttachments.map((attachment) => ({ id: attachment.id, name: attachment.name, kind: attachment.kind })),
    };
    const convId = activeConv.id;

    setConversations(prev => prev.map(c => c.id === activeId ? {
      ...c,
      messages: [...c.messages, userMsg],
      lastMessagePreview: text || "Attachment sent",
      lastTimestamp: userMsg.timestamp,
    } : c));
    setInput("");
    setPendingAttachments([]);
    setIsTyping(true);

    setTimeout(() => {
      if (activeConv.avatarId === JOB_AGENT_AVATAR_ID) {
        const hasCredential = userMsg.attachments?.some((a) => a.kind === "credential");
        const hasResume = userMsg.attachments?.some((a) => a.kind === "resume");
        if (hasCredential) {
          // TODO: Replace with real Zetrix Attest API call.
          setTimeout(() => {
            const latestCreds = mockAttestedCredentials;
            setCredentialStore(latestCreds);
            pushAssistantResponse(convId, `\`\`\`json:attested_credentials
${JSON.stringify(latestCreds, null, 2)}
\`\`\``);
            setIsTyping(false);
          }, 2000);
          return;
        }
        if (hasResume) {
          pushAssistantResponse(convId, `I've uploaded my resume. Please parse it and show me what you found.

\`\`\`json:profile_summary
${JSON.stringify(mockProfileSummary, null, 2)}
\`\`\``);
          setIsTyping(false);
          return;
        }
        pushAssistantResponse(convId, getJobAgentResponse(text));
        setIsTyping(false);
        return;
      }
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      pushAssistantResponse(convId, response);
      setIsTyping(false);
    }, 900);
  };

  const handleQuickActionMessage = (message: string) => sendMessage(message);

  const pickAttachments = (files: FileList | null) => {
    if (!files) return;
    const picked: JobAttachment[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      file,
      kind: isJobAgentConversation ? "credential" : "resume",
    }));
    setPendingAttachments((prev) => [...prev, ...picked]);
  };

  const renderTextContent = (content: string) => (
    <>
      {content.split("\n").map((line, i) => (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
          {line}
        </p>
      ))}
    </>
  );

  const renderStructuredSegment = (segment: ParsedSegment) => {
    if (segment.kind !== "structured") return null;
    switch (segment.blockType) {
      case "job_card":
        return <JobCard data={segment.data as JobCardData} onApply={() => handleQuickActionMessage(`Apply to the ${(segment.data as JobCardData).title} role at ${(segment.data as JobCardData).company}`)} onDetails={() => handleQuickActionMessage(`Tell me more about the ${(segment.data as JobCardData).title} role at ${(segment.data as JobCardData).company}`)} />;
      case "resume_preview":
        return <ResumePreview data={segment.data as ResumePreviewData} onApprove={() => handleQuickActionMessage("Approved. Proceed with this resume.")} onRequestChanges={(text) => handleQuickActionMessage(`Please update the resume: ${text}`)} />;
      case "cover_letter_preview":
        return <CoverLetterPreview data={segment.data as CoverLetterPreviewData} onApprove={() => handleQuickActionMessage("Approved. Proceed with this cover letter.")} onRequestChanges={(text) => handleQuickActionMessage(`Please update the cover letter: ${text}`)} />;
      case "application_sent":
        return <ApplicationSent data={segment.data as ApplicationSentData} onApplyToAnother={() => handleQuickActionMessage("Search for more jobs")} />;
      case "application_confirm":
        return (
          <ApplicationConfirm
            data={segment.data as ApplicationConfirmData}
            onConfirmSubmit={() => handleQuickActionMessage("Confirm submit application")}
            onCancelSubmit={() => handleQuickActionMessage("Not yet. I want to review before submitting")}
          />
        );
      case "profile_summary":
        return <ProfileSummary data={segment.data as ProfileSummaryData} />;
      case "preferences_summary":
        return <PreferencesSummary data={segment.data as PreferencesSummaryData} onEditPreferences={() => handleQuickActionMessage("I want to update my job preferences")} />;
      case "attested_credentials":
        return (
          <AttestedCredentials
            data={segment.data as AttestedCredentialsData}
            onShowExisting={() => handleQuickActionMessage("Show my existing credentials")}
            onEditCredential={(title, details) => {
              setCredentialStore((prev) => ({
                ...prev,
                credentials: prev.credentials.map((credential) =>
                  credential.title === title ? { ...credential, details } : credential
                ),
              }));
              handleQuickActionMessage(
                `Update my credential details for "${title}" to: ${details}`
              );
            }}
            onReplaceCredential={(title) => {
              handleQuickActionMessage(
                `I want to replace my credential "${title}". Please wait while I upload the replacement document.`
              );
            }}
          />
        );
      default:
        return null;
    }
  };

  const confirmSubscription = () => {
    if (!subscribeTarget) return;
    addMarketplaceSubscription({
      avatarId: subscribeTarget.id,
      avatarName: subscribeTarget.name,
      marketplaceKind: subscribeTarget.marketplaceKind,
      pricingTier: subscribeTarget.pricingTier,
      priceMonthlyMyr: subscribeTarget.priceMonthlyMyr,
    });
    toast.success(
      subscribeTarget.pricingTier === "free"
        ? `You're subscribed to ${subscribeTarget.name} (free).`
        : `Subscription confirmed for ${subscribeTarget.name}. No real charge in this demo.`,
    );
    setSubscribeTarget(null);
  };

  const renderMessage = (msg: ChatMessage) => (
    <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
      <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", msg.role === "assistant" ? "gradient-primary" : "bg-secondary")}>{msg.role === "assistant" ? <Bot className="h-4 w-4 text-primary-foreground" /> : <User className="h-4 w-4 text-muted-foreground" />}</div>
      <div className={cn("max-w-[92%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm", msg.role === "assistant" ? "bg-secondary text-foreground" : "gradient-primary text-primary-foreground")}>
        {msg.attachments && msg.attachments.length > 0 && <div className="mb-2 space-y-1">{msg.attachments.map((a) => <div key={a.id} className="rounded-md bg-background/50 px-2.5 py-1.5 text-xs">📎 {a.name} · {a.kind}</div>)}</div>}
        {msg.role === "assistant" && msg.content.includes("```json:") ? <div className="space-y-2">{parseStructuredOutput(msg.content).map((s, i) => <div key={`${msg.id}-${i}`}>{s.kind === "text" ? renderTextContent(s.text) : renderStructuredSegment(s)}</div>)}</div> : renderTextContent(msg.content)}
        <p className="mt-1.5 text-[10px] opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100vh-5rem)]">
      <Dialog open={subscribeTarget !== null} onOpenChange={(open) => !open && setSubscribeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm subscription</DialogTitle>
            <DialogDescription>
              You are about to subscribe to {subscribeTarget?.name} (
              {subscribeTarget?.marketplaceKind === "enterprise" ? "Enterprise agent" : "Individual avatar"}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {subscribeTarget?.pricingTier === "free" ? (
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-success">
                This listing is <strong>free</strong>. You can chat and use included features under fair use (demo).
              </p>
            ) : (
              <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-muted-foreground">
                <strong className="text-foreground">RM {subscribeTarget?.priceMonthlyMyr} / month</strong> per seat (demo — no
                payment is processed). Billing would start after any trial defined by the publisher.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSubscribeTarget(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmSubscription}>
              Confirm subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2 lg:px-4 lg:py-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild><button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Open menu"><Menu className="h-5 w-5" /></button></SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm sm:max-w-md flex flex-col p-0">
            <SheetHeader className="p-4 border-b border-border space-y-0"><SheetTitle className="text-left flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Agent Marketplace</SheetTitle></SheetHeader>
            <ScrollArea className="flex-1"><div className="p-3 space-y-6">
              <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Conversations</h3>{conversations.length === 0 ? <p className="text-sm text-muted-foreground py-2">No conversations yet.</p> : <div className="space-y-0.5">{conversations.map(c => <button key={c.id} onClick={() => switchConversation(c)} className={cn("w-full text-left rounded-lg px-3 py-2.5 transition-colors", activeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground")}><p className="text-sm font-medium truncate">{c.avatarName}</p><p className="text-[10px] text-muted-foreground truncate mt-0.5">{c.lastMessagePreview}</p></button>)}</div>}</section>
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="mb-3 grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                </TabsList>
                <TabsContent value="individual" className="mt-0 space-y-4">
                  <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Your avatars</h3><div className="space-y-1.5">{yourIndividual.map((avatar) => <MarketplaceAvatarListItem key={avatar.id} avatar={avatar} subscribed={subscribedIds.has(avatar.id)} onSubscribe={setSubscribeTarget} onChat={startOrOpenChat} />)}</div></section>
                  <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Popular</h3><div className="space-y-1.5">{popularIndividual.map((avatar) => <MarketplaceAvatarListItem key={avatar.id} avatar={avatar} subscribed={subscribedIds.has(avatar.id)} onSubscribe={setSubscribeTarget} onChat={startOrOpenChat} />)}</div></section>
                </TabsContent>
                <TabsContent value="enterprise" className="mt-0 space-y-4">
                  <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Your agents</h3><div className="space-y-1.5">{yourEnterprise.map((avatar) => <MarketplaceAvatarListItem key={avatar.id} avatar={avatar} subscribed={subscribedIds.has(avatar.id)} onSubscribe={setSubscribeTarget} onChat={startOrOpenChat} />)}</div></section>
                  <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Popular</h3><div className="space-y-1.5">{popularEnterprise.map((avatar) => <MarketplaceAvatarListItem key={avatar.id} avatar={avatar} subscribed={subscribedIds.has(avatar.id)} onSubscribe={setSubscribeTarget} onChat={startOrOpenChat} />)}</div></section>
                </TabsContent>
              </Tabs>
            </div></ScrollArea>
          </SheetContent>
        </Sheet>
        {activeConv ? <div className="flex items-center gap-3 min-w-0 flex-1"><div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg gradient-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div><div className="min-w-0"><h2 className="text-sm font-semibold truncate">{activeConv.avatarName}</h2><p className="text-xs text-muted-foreground truncate">{activeConv.avatarBio}</p></div></div> : <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-foreground">Chat</h2><p className="text-xs text-muted-foreground">Open menu to select an avatar</p></div>}
      </header>
      <main className="flex-1 flex flex-col min-h-0">
        {activeConv ? <>
          <ScrollArea className="flex-1 px-4 py-3"><div className="space-y-4 pb-4">{activeConv.messages.map(renderMessage)}{isTyping && <div className="flex gap-3"><div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div><div className="rounded-xl bg-secondary px-4 py-3">Typing...</div></div>}<div ref={messagesEndRef} /></div></ScrollArea>
          <div className="flex-shrink-0 p-3 border-t border-border">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => pickAttachments(e.target.files)} />
            {isJobAgentConversation && pendingAttachments.length === 0 && (
              <div className="mb-2">
                <button
                  onClick={() => handleQuickActionMessage("Show my existing credentials")}
                  className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium"
                >
                  View Existing Credentials
                </button>
              </div>
            )}
            {pendingAttachments.length > 0 && <div className="mb-2 space-y-2">{isJobAgentConversation && <FileTypeSelector attachments={pendingAttachments} onKindChange={(id, kind) => setPendingAttachments((prev) => prev.map((p) => (p.id === id ? { ...p, kind } : p)))} />}<div className="flex flex-wrap gap-1.5">{pendingAttachments.map((a) => <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px]">{a.name}<button onClick={() => setPendingAttachments((prev) => prev.filter((p) => p.id !== a.id))} className="text-muted-foreground"><X className="h-3 w-3" /></button></span>)}</div></div>}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
              <button onClick={() => fileInputRef.current?.click()} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground" aria-label="Attach file"><Paperclip className="h-4 w-4" /></button>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(); }} placeholder={`Message ${activeConv.avatarName}...`} className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground min-w-0" />
              <button onClick={() => sendMessage()} disabled={(!input.trim() && pendingAttachments.length === 0) || isTyping} className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all", (input.trim() || pendingAttachments.length > 0) && !isTyping ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground cursor-not-allowed")}><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </> : <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4"><MessageCircle className="h-7 w-7" /></div><h3 className="text-lg font-semibold text-foreground mb-1">Select an avatar to start</h3><p className="text-sm text-muted-foreground max-w-xs mb-6">Open the menu above to choose a conversation or pick an avatar to chat with.</p><button onClick={() => setMenuOpen(true)} className="rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 flex items-center gap-2"><Menu className="h-4 w-4" /> Open menu</button></div>}
      </main>
    </div>
  );
}
