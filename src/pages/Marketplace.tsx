import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import {
  DASHBOARD_PRIMARY_AVATAR_ID,
  JOB_AGENT_AVATAR_ID,
  dashboardPrimaryPersonaListingCard,
  deriveMyEnterpriseMarketplaceCards,
  deriveMyIndividualMarketplaceCards,
  isPlatformBundledStudioId,
  mergeMineThenSubscribedLists,
  ownedEntityToSidebarCard,
  subscriptionToSidebarCard,
  type MarketplaceListingCard,
} from "@/lib/studio/marketplace-listing";
import { MarketplaceAvatarListItem } from "@/components/marketplace/MarketplaceAvatarListItem";
import {
  Send, Bot, User, MessageCircle, Menu, Paperclip, X,
  Users, MessageSquare, Store, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  `Hello — I'm **${name}**, an AI agent (enterprise or personal use). I can help with filings, payments, and delegated workflows under policy.`;

export default function Marketplace() {
  const { marketplaceSubscriptions, userStudioEntities, onboardingComplete, persona } = useApp();
  const mergedStudio = useMergedStudioEntities();
  const [searchParams, setSearchParams] = useSearchParams();

  const myStudioIndividuals = useMemo(
    () => deriveMyIndividualMarketplaceCards(userStudioEntities, mergedStudio, onboardingComplete, persona),
    [userStudioEntities, mergedStudio, onboardingComplete, persona],
  );
  const myStudioEnterprises = useMemo(
    () => deriveMyEnterpriseMarketplaceCards(userStudioEntities, mergedStudio),
    [userStudioEntities, mergedStudio],
  );

  const subscribedIndividualCards = useMemo(
    () =>
      marketplaceSubscriptions
        .filter((s) => s.marketplaceKind === "individual")
        .map((s) => subscriptionToSidebarCard(s, mergedStudio)),
    [marketplaceSubscriptions, mergedStudio],
  );
  const subscribedEnterpriseCards = useMemo(
    () =>
      marketplaceSubscriptions
        .filter((s) => s.marketplaceKind === "enterprise")
        .map((s) => subscriptionToSidebarCard(s, mergedStudio)),
    [marketplaceSubscriptions, mergedStudio],
  );

  const sidebarIndividuals = useMemo(
    () => mergeMineThenSubscribedLists(myStudioIndividuals, subscribedIndividualCards),
    [myStudioIndividuals, subscribedIndividualCards],
  );
  const sidebarEnterprises = useMemo(
    () => mergeMineThenSubscribedLists(myStudioEnterprises, subscribedEnterpriseCards),
    [myStudioEnterprises, subscribedEnterpriseCards],
  );

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
  const processedOpenChatRef = useRef<string | null>(null);

  const activeConv = activeId ? conversations.find(c => c.id === activeId) : null;
  const isJobAgentConversation = activeConv?.avatarId === JOB_AGENT_AVATAR_ID;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isTyping]);

  const openChatId = searchParams.get("open");
  useEffect(() => {
    if (!openChatId) {
      processedOpenChatRef.current = null;
      return;
    }
    if (processedOpenChatRef.current === openChatId) return;
    const startCall = searchParams.get("call") === "1";
    processedOpenChatRef.current = openChatId;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("open");
        next.delete("call");
        return next;
      },
      { replace: true },
    );
    const sub = marketplaceSubscriptions.find((s) => s.avatarId === openChatId);
    const ownedByUser =
      userStudioEntities.some((e) => e.id === openChatId) ||
      isPlatformBundledStudioId(openChatId) ||
      (openChatId === DASHBOARD_PRIMARY_AVATAR_ID && onboardingComplete && Boolean(persona.name?.trim()));
    if (!sub && !ownedByUser) return;
    let card: MarketplaceListingCard | null = null;
    if (sub != null) {
      card = subscriptionToSidebarCard(sub, mergedStudio);
    } else if (openChatId === DASHBOARD_PRIMARY_AVATAR_ID && onboardingComplete && persona.name?.trim()) {
      card = dashboardPrimaryPersonaListingCard(persona);
    } else {
      const entity =
        mergedStudio.find((e) => e.id === openChatId) ?? userStudioEntities.find((e) => e.id === openChatId);
      card = entity != null ? ownedEntityToSidebarCard(entity) : null;
    }
    if (!card) return;
    setConversations((prev) => {
      const existing = prev.find((c) => c.avatarId === card.id);
      if (existing) {
        setActiveId(existing.id);
        return prev;
      }
      const welcome: ChatMessage = {
        id: `welcome-${card.id}`,
        role: "assistant",
        content: card.isJobAgent
          ? jobAgentWelcome
          : card.marketplaceKind === "enterprise"
            ? enterpriseWelcome(card.name)
            : defaultWelcome(card.name),
        timestamp: new Date().toISOString(),
      };
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        avatarId: card.id,
        avatarName: card.name,
        avatarBio: card.bio,
        isYours: card.isYours,
        messages: [welcome],
        lastMessagePreview: welcome.content.slice(0, 40) + "...",
        lastTimestamp: welcome.timestamp,
      };
      setActiveId(newConv.id);
      return [newConv, ...prev];
    });
    setPendingAttachments([]);
    setMenuOpen(false);
    if (startCall) {
      toast.info(`Connecting voice call with ${card.name}…`, { description: "Voice calls are coming soon." });
    }
  }, [openChatId, marketplaceSubscriptions, mergedStudio, userStudioEntities, onboardingComplete, persona, setSearchParams]);

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

  const startOrOpenChat = (avatar: MarketplaceListingCard) => {
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

  const handleCallActiveAvatar = () => {
    if (!activeConv) return;
    toast.info(`Voice call with ${activeConv.avatarName}…`, { description: "Voice calls are coming soon." });
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
    <div className="flex h-[calc(100dvh-12rem)] max-h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]">
      <header className="relative z-10 flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2 lg:px-4 lg:py-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild><button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Open menu"><Menu className="h-5 w-5" /></button></SheetTrigger>
          <SheetContent side="left" className="flex h-full max-h-[100dvh] min-h-0 w-full max-w-sm flex-col p-0 sm:max-w-md">
            <SheetHeader className="p-4 border-b border-border space-y-0"><SheetTitle className="text-left flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Marketplace</SheetTitle></SheetHeader>
            <ScrollArea className="min-h-0 flex-1"><div className="p-3 space-y-6">
              <section><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Conversations</h3>{conversations.length === 0 ? <p className="text-sm text-muted-foreground py-2">No conversations yet.</p> : <div className="space-y-0.5">{conversations.map(c => <button key={c.id} onClick={() => switchConversation(c)} className={cn("w-full text-left rounded-lg px-3 py-2.5 transition-colors", activeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground")}><p className="text-sm font-medium truncate">{c.avatarName}</p><p className="text-[10px] text-muted-foreground truncate mt-0.5">{c.lastMessagePreview}</p></button>)}</div>}</section>
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="mb-3 grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Avatars</TabsTrigger>
                  <TabsTrigger value="enterprise">AI Agents</TabsTrigger>
                </TabsList>
                <TabsContent value="individual" className="mt-0 space-y-4">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Your avatars
                    </h3>
                    {sidebarIndividuals.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Add an avatar from My Avatars or subscribe to others under Browse marketplace to chat here.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {sidebarIndividuals.map((avatar) => (
                          <MarketplaceAvatarListItem
                            key={avatar.id}
                            avatar={avatar}
                            subscribed
                            onSubscribe={() => {}}
                            onChat={startOrOpenChat}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                  <Link
                    to="/marketplace"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Store className="h-4 w-4" />
                    Browse avatar marketplace
                  </Link>
                </TabsContent>
                <TabsContent value="enterprise" className="mt-0 space-y-4">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Your AI agents
                    </h3>
                    {sidebarEnterprises.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Add an agent from My Agents or subscribe to others under Browse marketplace to chat here.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {sidebarEnterprises.map((avatar) => (
                          <MarketplaceAvatarListItem
                            key={avatar.id}
                            avatar={avatar}
                            subscribed
                            onSubscribe={() => {}}
                            onChat={startOrOpenChat}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                  <Link
                    to="/marketplace"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Store className="h-4 w-4" />
                    Browse agent marketplace
                  </Link>
                </TabsContent>
              </Tabs>
            </div></ScrollArea>
          </SheetContent>
        </Sheet>
        {activeConv ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{activeConv.avatarName}</h2>
              <p className="text-xs text-muted-foreground truncate">{activeConv.avatarBio}</p>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">Chat</h2>
            <p className="text-xs text-muted-foreground">Open menu to select an avatar</p>
          </div>
        )}
        {activeConv ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={handleCallActiveAvatar}
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </Button>
        ) : null}
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        {activeConv ? <>
          <ScrollArea className="min-h-0 flex-1 px-4 py-3"><div className="space-y-4 pb-4">{activeConv.messages.map(renderMessage)}{isTyping && <div className="flex gap-3"><div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg gradient-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div><div className="rounded-xl bg-secondary px-4 py-3">Typing...</div></div>}<div ref={messagesEndRef} /></div></ScrollArea>
          <div className="relative z-10 flex-shrink-0 border-t border-border bg-card p-3">
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
        </> : <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4"><MessageCircle className="h-7 w-7" /></div><h3 className="text-lg font-semibold text-foreground mb-1">Select an avatar to start</h3><p className="text-sm text-muted-foreground max-w-xs mb-6">Open the menu to pick a subscribed avatar or agent, or visit Browse marketplace to subscribe.</p><button onClick={() => setMenuOpen(true)} className="rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 flex items-center gap-2"><Menu className="h-4 w-4" /> Open menu</button></div>}
      </main>
    </div>
  );
}
