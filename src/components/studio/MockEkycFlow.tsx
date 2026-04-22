import { useCallback, useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Camera, Check, Globe, IdCard, Image as ImageIcon, Loader2, QrCode, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type { MockEkycProvider, MockEkycVerificationSnapshot } from "@/types/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { buildMydigitalWizardSnapshot, buildOnfidoWizardSnapshot } from "@/lib/studio/mock-ekyc-merge";

/** Demo deep link only; real installs may vary. */
const MYDIGITAL_ID_DEEP_LINK =
  "mydigitalid://ekyc/verify?session=demo-zetrix-avatar&source=zetrix";

function mockPreviewDataUrl(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect fill="#e2e8f0" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Phase =
  | "pick"
  | "md_consent"
  | "md_wallet_connect"
  | "md_success"
  | "of_doc"
  | "of_front"
  | "of_front_preview"
  | "of_back"
  | "of_back_preview"
  | "of_process"
  | "of_success";

type OnfidoDoc = "mykad" | "passport" | "license";

export function MockEkycFlow({
  mode,
  persistedSnapshot,
  onPersistSnapshot,
  onClearSnapshot,
  onSkipForNow,
  onAdvanceAfterEkyc,
}: {
  mode: "create" | "profile";
  persistedSnapshot: MockEkycVerificationSnapshot | null;
  onPersistSnapshot: (snapshot: MockEkycVerificationSnapshot) => void;
  onClearSnapshot?: () => void;
  /** Create wizard: skip eKYC and go to the next step. */
  onSkipForNow?: () => void;
  /** Create wizard: after success screen, persist snapshot then go to next step. */
  onAdvanceAfterEkyc?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [mdConsent, setMdConsent] = useState(false);
  const [onfidoDoc, setOnfidoDoc] = useState<OnfidoDoc | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  /** Create mode: snapshot to persist when user leaves the success screen. */
  const [pendingSuccessSnap, setPendingSuccessSnap] = useState<MockEkycVerificationSnapshot | null>(null);

  const resetFlow = useCallback(() => {
    setPhase("pick");
    setMdConsent(false);
    setOnfidoDoc(null);
    setFrontPreview(null);
    setBackPreview(null);
    setPendingSuccessSnap(null);
  }, []);

  const prevSnap = useRef(persistedSnapshot);
  useEffect(() => {
    if (prevSnap.current && !persistedSnapshot) resetFlow();
    prevSnap.current = persistedSnapshot ?? null;
  }, [persistedSnapshot, resetFlow]);

  const handleSkip = () => {
    toast.message("You can verify your identity later from Settings → Identity.", {
      description: "Use My Avatar (Rev) or Account settings when you are ready.",
    });
    onSkipForNow?.();
  };

  const finishMydigitalApprove = () => {
    if (mode === "create") {
      setPendingSuccessSnap(buildMydigitalWizardSnapshot(new Date().toISOString()));
      setPhase("md_success");
      return;
    }
    onPersistSnapshot(buildMydigitalWizardSnapshot(new Date().toISOString()));
  };

  const finishOnfidoProcessing = useCallback(() => {
    if (mode === "create") {
      setPendingSuccessSnap(buildOnfidoWizardSnapshot(new Date().toISOString()));
      setPhase("of_success");
      return;
    }
    onPersistSnapshot(buildOnfidoWizardSnapshot(new Date().toISOString()));
  }, [mode, onPersistSnapshot]);

  useEffect(() => {
    if (phase !== "of_process") return;
    const t = window.setTimeout(() => finishOnfidoProcessing(), 3000);
    return () => window.clearTimeout(t);
  }, [phase, finishOnfidoProcessing]);

  const selectProvider = (p: MockEkycProvider) => {
    if (p === "mydigital") setPhase("md_consent");
    else setPhase("of_doc");
  };

  const cancelToPick = () => {
    setPhase("pick");
    setMdConsent(false);
    setOnfidoDoc(null);
    setFrontPreview(null);
    setBackPreview(null);
  };

  if (persistedSnapshot) {
    const providerLabel = persistedSnapshot.provider === "mydigital" ? "MyDigital ID" : "Onfido";
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Identity verified</p>
              <p className="mt-1 text-sm text-emerald-800">
                via {providerLabel} · {persistedSnapshot.displayName} · {persistedSnapshot.maskedId}
              </p>
              <p className="mt-1 text-xs text-emerald-700/90">
                Verified {format(parseISO(persistedSnapshot.verifiedAt), "dd MMM yyyy, h:mm a")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50"
              onClick={() => {
                onClearSnapshot?.();
                resetFlow();
              }}
            >
              Re-verify
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const showSkip = Boolean(onSkipForNow) && phase !== "md_success" && phase !== "of_success";

  const skipLink = showSkip ? (
    <button
      type="button"
      onClick={handleSkip}
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Skip for now
    </button>
  ) : null;

  const cancelRow = phase !== "pick" && phase !== "md_success" && phase !== "of_success" && (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={cancelToPick} className="text-sm text-muted-foreground hover:text-foreground">
        ← Cancel
      </button>
      {skipLink}
    </div>
  );

  if (phase === "pick") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-1 text-xl font-bold">Choose a provider</h3>
          <p className="text-sm text-muted-foreground">Select how you want to verify. All flows below are simulated in this demo.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => selectProvider("mydigital")}
            className={cn(
              "rounded-xl border-2 border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-lg font-semibold">MyDigital ID</span>
              <Badge className="shrink-0 bg-primary text-primary-foreground">Recommended</Badge>
            </div>
            <p className="text-sm text-muted-foreground">National digital identity flow (mock).</p>
          </button>
          <button
            type="button"
            onClick={() => selectProvider("onfido")}
            className={cn(
              "rounded-xl border-2 border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-lg font-semibold">Onfido</span>
              <Badge variant="secondary" className="shrink-0">
                International
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Document check for passports and IDs (mock).</p>
          </button>
        </div>
        {mode === "create" && skipLink ? <div className="pt-2">{skipLink}</div> : null}
      </div>
    );
  }

  /* —— MyDigital ID —— */
  if (phase === "md_consent") {
    return (
      <div className="space-y-6">
        {cancelRow}
        <div>
          <h3 className="mb-1 text-xl font-bold">Consent</h3>
          <p className="text-sm text-muted-foreground">
            Your <strong>Full Name</strong>, <strong>IC Number</strong>, and <strong>Date of Birth</strong> will be shared with the
            identity provider to verify this avatar.
          </p>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4">
          <Checkbox checked={mdConsent} onCheckedChange={(v) => setMdConsent(v === true)} className="mt-1" />
          <span className="text-sm">I agree to share my identity credentials.</span>
        </label>
        <Button type="button" disabled={!mdConsent} onClick={() => setPhase("md_wallet_connect")}>
          Continue with MyDigital ID
        </Button>
      </div>
    );
  }

  if (phase === "md_wallet_connect") {
    return (
      <div className="space-y-6">
        {cancelRow}
        <div>
          <h3 className="mb-1 text-xl font-bold">Connect MyDigital ID</h3>
          <p className="text-sm text-muted-foreground">
            Open the MyDigital ID app on your phone to complete verification. This demo uses a mock deep link and QR only — no
            real API calls.
          </p>
        </div>

        <div className="md:hidden">
          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4 text-primary" aria-hidden />
              Mobile — open app
            </div>
            <p className="text-xs text-muted-foreground">
              Tap the button to try opening the MyDigital ID wallet (behaviour depends on your device).
            </p>
            <Button asChild className="w-full">
              <a href={MYDIGITAL_ID_DEEP_LINK}>Open MyDigital ID app</a>
            </Button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <QrCode className="h-4 w-4 text-primary" aria-hidden />
              Desktop — scan with app
            </div>
            <p className="text-xs text-muted-foreground">
              Scan this code with the MyDigital ID app on your phone to connect this session (mock placeholder).
            </p>
            <div
              className={cn(
                "mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-card",
              )}
            >
              <QrCode className="h-28 w-28 text-foreground/70" strokeWidth={1} aria-hidden />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            When you have finished in the app (or to skip the real app in this demo), use the button below to continue.
          </p>
          <Button type="button" onClick={finishMydigitalApprove}>
            Simulate successful verification
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "md_success") {
    const snap = pendingSuccessSnap ?? buildMydigitalWizardSnapshot(new Date().toISOString());
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <Check className="h-6 w-6 shrink-0" />
          <h3 className="text-xl font-bold">Identity verified via MyDigital ID.</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {snap.displayName} · {snap.maskedId}
        </p>
        {mode === "create" ? (
          <Button
            type="button"
            onClick={() => {
              onPersistSnapshot(snap);
              setPendingSuccessSnap(null);
              onAdvanceAfterEkyc?.();
            }}
          >
            Continue to next step
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Your avatar profile has been updated.</p>
        )}
      </div>
    );
  }

  /* —— Onfido —— */
  if (phase === "of_doc") {
    const cards: { id: OnfidoDoc; label: string; icon: typeof IdCard }[] = [
      { id: "mykad", label: "MyKad", icon: IdCard },
      { id: "passport", label: "Passport", icon: Globe },
      { id: "license", label: "Driving License", icon: IdCard },
    ];
    return (
      <div className="space-y-6">
        {cancelRow}
        <div>
          <h3 className="mb-1 text-xl font-bold">Select document type</h3>
          <p className="text-sm text-muted-foreground">Choose the ID you will upload (mock).</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setOnfidoDoc(c.id);
                setPhase("of_front");
              }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <c.icon className="h-8 w-8 text-primary" />
              <span className="font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "of_front" || phase === "of_back") {
    const isBack = phase === "of_back";
    return (
      <div className="space-y-6">
        {cancelRow}
        <div>
          <h3 className="mb-1 text-xl font-bold">{isBack ? "Upload back of ID" : "Upload front of ID"}</h3>
          <p className="text-sm text-muted-foreground">Simulated capture — no image leaves your browser in this demo.</p>
        </div>
        <div className="flex aspect-[4/3] max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40">
          <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Camera frame placeholder</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const url = mockPreviewDataUrl(isBack ? "ID back" : "ID front");
              if (isBack) {
                setBackPreview(url);
                setPhase("of_back_preview");
              } else {
                setFrontPreview(url);
                setPhase("of_front_preview");
              }
            }}
          >
            Take Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const url = mockPreviewDataUrl(isBack ? "ID back" : "ID front");
              if (isBack) {
                setBackPreview(url);
                setPhase("of_back_preview");
              } else {
                setFrontPreview(url);
                setPhase("of_front_preview");
              }
            }}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload from Gallery
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "of_front_preview") {
    return (
      <div className="space-y-6">
        {cancelRow}
        <h3 className="text-xl font-bold">Front of ID</h3>
        {frontPreview ? (
          <img src={frontPreview} alt="" className="max-h-56 rounded-lg border object-contain" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPhase("of_front")}>
            Retake
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (onfidoDoc === "passport") setPhase("of_process");
              else setPhase("of_back");
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "of_back_preview") {
    return (
      <div className="space-y-6">
        {cancelRow}
        <h3 className="text-xl font-bold">Back of ID</h3>
        {backPreview ? (
          <img src={backPreview} alt="" className="max-h-56 rounded-lg border object-contain" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPhase("of_back")}>
            Retake
          </Button>
          <Button type="button" onClick={() => setPhase("of_process")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "of_process") {
    return (
      <div className="space-y-6 py-10 text-center">
        {cancelRow}
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Verifying your document…</p>
        <p className="text-sm text-muted-foreground">Simulated processing.</p>
      </div>
    );
  }

  if (phase === "of_success") {
    const snap = pendingSuccessSnap ?? buildOnfidoWizardSnapshot(new Date().toISOString());
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <Shield className="h-6 w-6 shrink-0" />
          <h3 className="text-xl font-bold">Identity verified via Onfido.</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {snap.displayName} · {snap.maskedId}
        </p>
        {mode === "create" ? (
          <Button
            type="button"
            onClick={() => {
              onPersistSnapshot(snap);
              setPendingSuccessSnap(null);
              onAdvanceAfterEkyc?.();
            }}
          >
            Continue to next step
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Your avatar profile has been updated.</p>
        )}
      </div>
    );
  }

  return null;
}
