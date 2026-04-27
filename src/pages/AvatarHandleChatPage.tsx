import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { avatarPublicHandle } from "@/lib/studio/avatar-handle";
import { Button } from "@/components/ui/button";
import { userDisplayName } from "@/lib/mock-data";
import { useApp } from "@/contexts/AppContext";
import { AvatarWhatsAppContact } from "@/components/avatar/AvatarWhatsAppContact";
import { digitsForWhatsAppLink } from "@/lib/studio/whatsapp-contact";
const DUMMY_EMAIL = "user@email.com";
const DUMMY_PASSWORD = "password123";

export default function AvatarHandleChatPage() {
  const { handle = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const merged = useMergedStudioEntities();
  const [email, setEmail] = useState(DUMMY_EMAIL);
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

  const avatar = useMemo(() => {
    const target = handle.trim().toLowerCase();
    return merged.find((e) => e.type === "individual" && avatarPublicHandle(e) === target);
  }, [merged, handle]);

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
    if (!avatar) return;
    setPassword("");
    toast.success("Logged in. Opening chat...");
    navigate(`/marketplace/chat?open=${encodeURIComponent(avatar.id)}&source=handle`, { replace: true });
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
  const publisher = userDisplayName(user).trim() || "Zetrix Publisher";
  const hasWhatsApp = Boolean(avatar.whatsappNumber && digitsForWhatsAppLink(avatar.whatsappNumber));

  return (
    <div className="mx-auto mt-14 w-full max-w-2xl px-4 pb-10">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{avatar.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">/{avatarHandle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Login required
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Photo</p>
            {avatar.image ? (
              <img
                src={avatar.image}
                alt={`${avatar.name} profile`}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-900 text-xl font-semibold text-white">
                {avatar.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
            <p className="text-foreground">{avatar.name || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="text-foreground">{avatar.description || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Publisher</p>
            <p className="text-foreground">{publisher}</p>
          </div>
        </div>

        {hasWhatsApp ? (
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">WhatsApp</h2>
            <AvatarWhatsAppContact raw={avatar.whatsappNumber} className="max-w-full" />
          </div>
        ) : null}

        <div className="mt-6 border-t border-border pt-5">
          {!showLoginForm ? (
            <Button type="button" className="w-full" onClick={() => setShowLoginForm(true)}>
              Login to Chat
            </Button>
          ) : (
            <form className="space-y-3" onSubmit={onLogin}>
              <p className="text-xs text-muted-foreground">
                Demo login: <span className="font-medium text-foreground">{DUMMY_EMAIL}</span> /{" "}
                <span className="font-medium text-foreground">{DUMMY_PASSWORD}</span>
              </p>
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
                Login to Chat
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

