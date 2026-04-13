import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Stripe Checkout–inspired layout; client-side only (no Stripe.js or network calls). */
const stripeInput =
  "h-11 rounded-md border border-zinc-300 bg-white text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:border-[#635bff] focus-visible:ring-[#635bff]/25";

const CARD_DIGIT_MAX = 19;

/** Digits only, max {@link CARD_DIGIT_MAX}, grouped as 4-4-4-… */
function formatCardNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, CARD_DIGIT_MAX);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

/** Digits only, max 4 → `MM/YY` as the user types. */
function formatExpiryInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export type MockStripeHostedCheckoutProps = {
  email: string;
  setEmail: (v: string) => void;
  cardholderName: string;
  setCardholderName: (v: string) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  cvv: string;
  setCvv: (v: string) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
};

export function MockStripeHostedCheckout({
  email,
  setEmail,
  cardholderName,
  setCardholderName,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  onBack,
  onSubmit,
}: MockStripeHostedCheckoutProps) {
  const onCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumberInput(e.target.value));
  };

  const onExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiryInput(e.target.value));
  };

  return (
    <div className="flex min-h-0 flex-col">
      <DialogTitle className="sr-only">Secure checkout</DialogTitle>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        {/* Order summary — Stripe left rail */}
        <aside className="flex flex-col border-b border-zinc-200 bg-[#f6f9fc] p-6 lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex w-fit items-center gap-1.5 text-sm text-[#635bff] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Zetrix Avatar</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">Pro subscription</h2>
          <p className="mt-1 text-sm text-zinc-600">AvatarClaw access · mock upgrade</p>
          <div className="mt-6 space-y-3 border-t border-zinc-200/80 pt-6 text-sm">
            <div className="flex justify-between gap-4 text-zinc-600">
              <span>Pro Plan</span>
              <span className="tabular-nums text-zinc-900">$25.00</span>
            </div>
            <div className="flex justify-between gap-4 text-zinc-600">
              <span>Access</span>
              <span className="text-right text-zinc-700">Ongoing (demo)</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-zinc-200/80 pt-3 text-base font-semibold text-zinc-900">
              <span>Total due today</span>
              <span className="tabular-nums">$25.00</span>
            </div>
          </div>
          <p className="mt-auto hidden pt-8 text-xs text-zinc-500 lg:block">
            No real charge; unlocks Pro for this browser session in the demo.
          </p>
        </aside>

        {/* Payment form — Stripe right panel */}
        <div className="flex flex-col bg-white p-6 lg:p-8">
          <form onSubmit={onSubmit} className="flex flex-1 flex-col">
            <div className="space-y-6">
              <div>
                <Label htmlFor="stripe-mock-email" className="text-sm font-medium text-zinc-800">
                  Email
                </Label>
                <Input
                  id="stripe-mock-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn("mt-1.5", stripeInput)}
                />
                <p className="mt-1 text-xs text-zinc-500">Receipt sent to this address.</p>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-800">Payment method</p>
                <div
                  className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm"
                  aria-label="Card payment"
                >
                  <div className="mb-3">
                    <span className="text-sm font-medium text-zinc-800">Card</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="stripe-mock-card" className="sr-only">
                        Card number
                      </Label>
                      <Input
                        id="stripe-mock-card"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={onCardNumberChange}
                        placeholder="1234 1234 1234 1234"
                        maxLength={CARD_DIGIT_MAX + Math.floor((CARD_DIGIT_MAX - 1) / 4)}
                        className={cn(stripeInput, "font-mono tabular-nums tracking-wide")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="stripe-mock-exp" className="sr-only">
                          Expiration
                        </Label>
                        <Input
                          id="stripe-mock-exp"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={expiry}
                          onChange={onExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={cn(stripeInput, "font-mono tabular-nums")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stripe-mock-cvc" className="sr-only">
                          CVC
                        </Label>
                        <Input
                          id="stripe-mock-cvc"
                          inputMode="numeric"
                          type="password"
                          autoComplete="off"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="CVC"
                          className={stripeInput}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="stripe-mock-name" className="sr-only">
                        Name on card
                      </Label>
                      <Input
                        id="stripe-mock-name"
                        autoComplete="name"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Name on card"
                        className={stripeInput}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button
                type="submit"
                className="h-12 w-full rounded-md bg-[#635bff] text-[15px] font-semibold text-white shadow-sm hover:bg-[#5851ea]"
              >
                Pay $25.00
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Secure checkout</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
