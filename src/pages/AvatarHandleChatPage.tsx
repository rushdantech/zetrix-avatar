import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { avatarPublicHandle } from "@/lib/studio/avatar-handle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PUBLIC_CHAT_SESSION_KEY = "zetrix-avatar:publicChatSessionEmail";
const DUMMY_EMAIL = "user@email.com";
const DUMMY_PASSWORD = "password123";

function loadPublicChatSessionEmail(): string {
  try {
    return localStorage.getItem(PUBLIC_CHAT_SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

function persistPublicChatSessionEmail(email: string): void {
  try {
    localStorage.setItem(PUBLIC_CHAT_SESSION_KEY, email);
  } catch {
    // ignore storage errors
  }
}

function clearPublicChatSession(): void {
  try {
    localStorage.removeItem(PUBLIC_CHAT_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}

export default function AvatarHandleChatPage() {
  const { handle = "" } = useParams();
  const merged = useMergedStudioEntities();
  const [email, setEmail] = useState(DUMMY_EMAIL);
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState(() => loadPublicChatSessionEmail());

  const avatar = useMemo(() => {
    const target = handle.trim().toLowerCase();
    return merged.find((e) => e.type === "individual" && avatarPublicHandle(e) === target);
  }, [merged, handle]);

  const loggedIn = sessionEmail.trim().toLowerCase() === DUMMY_EMAIL;

  function onLogin(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== DUMMY_EMAIL) {
      toast.error("Use the demo email to log in.");
      return;
    }
    if (password !== DUMMY_PASSWORD) {
      toast.error("Incorrect password.");
      return;
    }
    persistPublicChatSessionEmail(normalizedEmail);
    setSessionEmail(normalizedEmail);
    setPassword("");
    toast.success("Logged in. You can now chat on this handle page.");
  }

  if (!avatar) {
    return (
      <div className="mx-auto mt-14 max-w-xl space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="text-xl font-semibold text-foreground">Avatar not found</h1>
        <p className="text-sm text-muted-foreground">
          No avatar is mapped to <span className="font-medium text-foreground">/{handle}</span>.
        </p>
        <Link to="/studio/avatars" className="inline-block text-sm font-medium text-primary hover:underline">
          Go to My Avatars
        </Link>
      </div>
    );
  }

  const avatarHandle = avatarPublicHandle(avatar);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      <div className={cn("flex min-h-screen w-full flex-col", !loggedIn && "pointer-events-none select-none blur-sm")}>
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{avatar.name}</p>
          <p className="text-xs text-muted-foreground">/{avatarHandle}</p>
        </div>
        {loggedIn ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              clearPublicChatSession();
              setSessionEmail("");
              toast.info("Logged out from handle chat.");
            }}
          >
            Logout
          </Button>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Locked
          </div>
        )}
      </header>
        <main className="flex-1 space-y-3 overflow-y-auto bg-card px-4 py-4">
          <ChatBubble role="avatar" text={`Hi, I am ${avatar.name}. Ask me anything.`} />
          <ChatBubble role="user" text="How can you help me today?" />
          <ChatBubble
            role="avatar"
            text="I can chat in my configured style, and use my profile knowledge to respond."
          />
        </main>
        <footer className="border-t border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              value=""
              readOnly
              placeholder={`Message ${avatar.name}…`}
              className="w-full bg-transparent text-sm text-muted-foreground outline-none"
            />
            <Button size="sm" disabled>
              Send
            </Button>
          </div>
        </footer>
      </div>
      {!loggedIn ? (
        <div className="absolute inset-0 grid place-items-center bg-background/35 p-4">
          <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Login required
              </div>
              <h1 className="text-xl font-semibold text-foreground">Chat with {avatar.name}</h1>
              <p className="text-sm text-muted-foreground">
                To access <span className="font-medium text-foreground">/{avatarHandle}</span>, use the demo login:{" "}
                <span className="font-medium text-foreground">{DUMMY_EMAIL}</span> /{" "}
                <span className="font-medium text-foreground">{DUMMY_PASSWORD}</span>.
              </p>
            </div>
            <form className="space-y-3" onSubmit={onLogin}>
              <div>
                <label htmlFor="public-chat-email" className="mb-1 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="public-chat-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="public-chat-password" className="mb-1 block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="public-chat-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" className="w-full">
                Login to chat
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChatBubble({ role, text }: { role: "avatar" | "user"; text: string }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        {text}
      </div>
    </div>
  );
}

