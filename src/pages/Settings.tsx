import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { format, parseISO } from "date-fns";
import {
  Shield, Instagram, Key, Download, AlertTriangle,
  Check, Eye, EyeOff, Trash2, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    instagram,
    consent,
    disconnectInstagram,
    connectInstagram,
    emailGmail,
    emailOutlook,
    connectGmail,
    disconnectGmail,
    connectOutlook,
    disconnectOutlook,
  } = useApp();
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Settings & Security</h1>
        <p className="text-sm text-muted-foreground">Manage your connections, tokens, and consent records.</p>
      </div>

      {/* Instagram Connection */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Instagram className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Instagram Connection</h3>
        </div>
        {instagram.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-success/5 border border-success/20 p-3">
              <Check className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Connected as {instagram.username}</p>
                <p className="text-xs text-muted-foreground">Since {format(parseISO(instagram.connectedAt), "MMM d, yyyy")}</p>
              </div>
            </div>

            {/* Token */}
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Key className="h-3 w-3" /> Access Token</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-mono">
                  {showToken ? "IGQVJWcmRrZAXpYOTJSNmVtUk9qMThGYWNfbVdyZA2s2ZAXA..." : instagram.token}
                </code>
                <button onClick={() => setShowToken(!showToken)} className="rounded-md bg-secondary p-2 hover:bg-secondary/80">
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Permissions</p>
              <div className="grid grid-cols-2 gap-1">
                {instagram.permissions.map(p => (
                  <div key={p} className="flex items-center gap-1.5 text-xs">
                    <Check className="h-3 w-3 text-success" />
                    <code className="text-muted-foreground font-mono">{p}</code>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { disconnectInstagram(); toast.success("Instagram disconnected"); }}
              className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" /> Revoke Connection
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Instagram className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">No Instagram account connected.</p>
            <button onClick={() => { connectInstagram(); toast.success("Instagram connected!"); }}
              className="rounded-lg gradient-primary px-6 py-2 text-sm font-medium text-primary-foreground">
              Connect Instagram
            </button>
          </div>
        )}
      </div>

      {/* Email — job applications */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Email for job applications</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Connect Gmail or Microsoft Outlook so the Job Application Agent can send application emails from your address. Tokens are handled securely on the server in production.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 text-sm font-bold text-red-600">M</span>
              <span className="text-sm font-semibold">Gmail</span>
            </div>
            {emailGmail.connected ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-success/5 border border-success/20 p-3">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{emailGmail.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected {format(parseISO(emailGmail.connectedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    disconnectGmail();
                    toast.success("Gmail disconnected");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectGmail();
                  toast.success("Gmail connected — applications will send from this account.");
                }}
                className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Connect Gmail
              </button>
            )}
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-sm font-bold text-blue-600">O</span>
              <span className="text-sm font-semibold">Outlook</span>
            </div>
            {emailOutlook.connected ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-success/5 border border-success/20 p-3">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{emailOutlook.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected {format(parseISO(emailOutlook.connectedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    disconnectOutlook();
                    toast.success("Outlook disconnected");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectOutlook();
                  toast.success("Outlook connected — applications will send from this account.");
                }}
                className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Connect Outlook
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Consent Records */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Consent Records</h3>
          </div>
          <button onClick={() => toast.success("Consent PDF downloaded")}
            className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
            <Download className="h-3 w-3" /> Download PDF
          </button>
        </div>

        <div className="space-y-2">
          {[
            { label: "Likeness Consent", granted: consent.likenessConsent },
            { label: "Automated Posting Consent", granted: consent.automatedPostingConsent },
            { label: "Platform Terms", granted: consent.platformTerms },
          ].map(c => (
            <div key={c.label} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <span className="text-sm">{c.label}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                c.granted ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                {c.granted ? "Granted" : "Not granted"}
              </span>
            </div>
          ))}
          {consent.signatureName && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Digital Signature</p>
              <p className="text-sm font-medium italic">{consent.signatureName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Signed: {consent.timestamp ? format(parseISO(consent.timestamp), "MMM d, yyyy 'at' h:mm a") : "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Security Notice</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your access tokens are stored securely and encrypted at rest. Never share your tokens with third parties.
              In a production environment, all tokens are managed via server-side token vaults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
