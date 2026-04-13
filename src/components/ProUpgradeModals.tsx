import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MockStripeHostedCheckout } from "@/components/billing/MockStripeHostedCheckout";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Normalize expiry: allow "MM/YY", "MM / YY", or "MMYY". */
function normalizeExpiry(raw: string): string {
  const compact = raw.replace(/\s+/g, "").trim();
  if (/^\d{4}$/.test(compact)) {
    return `${compact.slice(0, 2)}/${compact.slice(2)}`;
  }
  return compact;
}

function validateCheckout(input: {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}): string | null {
  if (!input.cardholderName.trim()) return "Enter the cardholder name.";
  const num = digitsOnly(input.cardNumber);
  if (num.length < 13 || num.length > 19) return "Enter a valid-looking card number (digits only).";
  const exp = normalizeExpiry(input.expiry);
  if (!/^\d{2}\/\d{2}$/.test(exp)) return "Use expiry format MM/YY.";
  const mm = parseInt(exp.slice(0, 2), 10);
  if (mm < 1 || mm > 12) return "Check the expiry month.";
  const cvvDigits = digitsOnly(input.cvv);
  if (cvvDigits.length < 3 || cvvDigits.length > 4) return "Enter a 3–4 digit CVV.";
  return null;
}

export default function ProUpgradeModals() {
  const navigate = useNavigate();
  const {
    proUpgradeModalStep,
    closeProUpgradeModal,
    goProUpgradeCheckout,
    returnToProUpgradePaywall,
    completeMockProPurchase,
  } = useApp();

  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  /** Shown outside Radix Dialog so payment success is never cleared by Dialog internals. */
  const [showPostPaymentThanks, setShowPostPaymentThanks] = useState(false);

  const ignoreCloseUntilMsRef = useRef(0);

  const open = proUpgradeModalStep != null;

  const resetCheckoutFields = () => {
    setEmail("");
    setCardholderName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (Date.now() < ignoreCloseUntilMsRef.current) {
        return;
      }
      closeProUpgradeModal();
      resetCheckoutFields();
    }
  };

  const pay = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const err = validateCheckout({ cardholderName, cardNumber, expiry, cvv });
    if (err) {
      toast.error(err);
      return;
    }
    const num = digitsOnly(cardNumber);
    const last4 = num.slice(-4);
    ignoreCloseUntilMsRef.current = Date.now() + 500;
    try {
      flushSync(() => {
        completeMockProPurchase({ cardholderName, cardLast4: last4 });
      });
    } catch (errSubmit) {
      console.error(errSubmit);
      toast.error("Something went wrong completing checkout. Please try again.");
      return;
    }
    resetCheckoutFields();
    setShowPostPaymentThanks(true);
  };

  const goCreateAvatarClaw = () => {
    setShowPostPaymentThanks(false);
    navigate("/studio/agents/create", { replace: true });
  };

  const closePostPaymentThanks = () => {
    setShowPostPaymentThanks(false);
    navigate("/dashboard", { replace: true });
  };

  const backToPaywall = () => {
    resetCheckoutFields();
    returnToProUpgradePaywall();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={
            proUpgradeModalStep === "checkout"
              ? "max-h-[95vh] w-[min(100vw-1rem,920px)] max-w-[min(100vw-1rem,920px)] gap-0 overflow-hidden border-zinc-200 p-0 sm:rounded-xl"
              : "max-h-[90vh] overflow-y-auto sm:max-w-lg"
          }
        >
          {proUpgradeModalStep === "paywall" && (
            <>
              <DialogHeader>
                <DialogTitle>Upgrade to Pro to use AvatarClaw</DialogTitle>
                <DialogDescription>
                  Create and use Avatars on Free. Upgrade to Pro to unlock AvatarClaw services.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <p className="font-semibold text-foreground">Free</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Create Avatars</li>
                    <li>Browse marketplace</li>
                    <li>Chat with avatars</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
                  <p className="font-semibold text-foreground">Pro</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Everything in Free</li>
                    <li>AvatarClaw access</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                USD 25 mock charge. Unlocks Pro on this device for the demo. Card details are collected on a Stripe-style checkout page.
              </p>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button type="button" className="w-full sm:w-full" onClick={goProUpgradeCheckout}>
                  Upgrade to Pro – USD 25
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-full" onClick={() => handleOpenChange(false)}>
                  Maybe later
                </Button>
              </DialogFooter>
            </>
          )}

          {proUpgradeModalStep === "checkout" && (
            <MockStripeHostedCheckout
              email={email}
              setEmail={setEmail}
              cardholderName={cardholderName}
              setCardholderName={setCardholderName}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiry={expiry}
              setExpiry={setExpiry}
              cvv={cvv}
              setCvv={setCvv}
              onBack={backToPaywall}
              onSubmit={pay}
            />
          )}
        </DialogContent>
      </Dialog>

      {showPostPaymentThanks && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
          role="alertdialog"
          aria-modal
          aria-labelledby="pro-thanks-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 id="pro-thanks-title" className="text-xl font-semibold tracking-tight">
              You’re now on Pro
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">AvatarClaw is now unlocked.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closePostPaymentThanks}>
                Close
              </Button>
              <Button type="button" onClick={goCreateAvatarClaw}>
                AvatarClaw
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
