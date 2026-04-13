import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { AlertTriangle, CreditCard, KeyRound, Receipt, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadPersistedAccountPassword, persistAccountPassword } from "@/lib/persist/studio-session-storage";
import type { MockBillingPayment } from "@/types/billing";

function validateNewPasswordStrength(p: string): string | null {
  if (p.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(p)) return "Include an uppercase letter.";
  if (!/[a-z]/.test(p)) return "Include a lowercase letter.";
  if (!/[0-9]/.test(p)) return "Include a number.";
  return null;
}

function formatReceiptSentAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatShortDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AccountSettingsPage() {
  const { user, updateUser, hasActiveProAccess, proAccessExpiresAt, mockBillingPayments } = useApp();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [receiptDetail, setReceiptDetail] = useState<MockBillingPayment | null>(null);

  const [hasStoredPassword, setHasStoredPassword] = useState(() => loadPersistedAccountPassword() != null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, [user.firstName, user.lastName]);

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      toast.error("Please enter both first name and last name.");
      return;
    }
    updateUser({ firstName: fn, lastName: ln });
    toast.success("Profile updated.");
  };

  const savePassword = (e: FormEvent) => {
    e.preventDefault();
    const stored = loadPersistedAccountPassword();
    const cur = currentPassword;

    if (!cur.trim()) {
      toast.error("Enter your current password.");
      return;
    }

    if (stored) {
      if (cur !== stored) {
        toast.error("Current password is incorrect.");
        return;
      }
    } else {
      if (cur !== newPassword) {
        toast.error(
          "The first time you save a password on this device, enter the same new password in Current password and New password.",
        );
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    const strength = validateNewPasswordStrength(newPassword);
    if (strength) {
      toast.error(strength);
      return;
    }
    if (stored && newPassword === stored) {
      toast.error("Choose a password different from your current one.");
      return;
    }
    persistAccountPassword(newPassword);
    setHasStoredPassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-28 lg:pb-8">
      <div>
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="text-sm text-muted-foreground">
          Change your password below, then update your name if needed. Your sign-in email is read-only here.
        </p>
      </div>

      {/* Password first so it is visible without scrolling on mobile */}
      <section
        id="account-password"
        aria-labelledby="password-heading"
        className="rounded-xl border border-primary/20 bg-card p-5 shadow-card ring-1 ring-primary/10"
      >
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" aria-hidden />
          <h2 id="password-heading" className="font-semibold">
            Password
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Always enter your current password. Then set a new password that meets the rules below.
          {!hasStoredPassword && (
            <>
              {" "}
              If you have not saved a password on this device yet, use the same new password in “Current password” and “New password” to
              confirm.
            </>
          )}
        </p>
        <form onSubmit={savePassword} className="space-y-4">
          <input type="text" name="username" autoComplete="username" value={user.email} readOnly className="sr-only" tabIndex={-1} aria-hidden />
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters with upper, lower, and a number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button type="submit">{hasStoredPassword ? "Update password" : "Save password"}</Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card" aria-labelledby="billing-heading">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden />
          <h2 id="billing-heading" className="font-semibold">
            Plan & billing
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Your plan controls AvatarClaw access. Pro is billed as a mock monthly subscription (1 month per payment). No real charges.
        </p>
        <div className="mb-6 rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current plan</p>
              <p className="mt-1 text-lg font-semibold capitalize">{hasActiveProAccess ? "Pro" : "Free"}</p>
              {hasActiveProAccess && proAccessExpiresAt && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Pro access through {formatShortDate(proAccessExpiresAt)}
                </p>
              )}
            </div>
            <span
              className={
                hasActiveProAccess
                  ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              }
            >
              {hasActiveProAccess ? "Active" : "Free"}
            </span>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-semibold">Payment history</h3>
          </div>
          {mockBillingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mock payments yet. Upgrade to Pro from AvatarClaw to see history here.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Access through</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBillingPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-muted-foreground">{p.date}</td>
                      <td className="px-3 py-2.5">{p.item}</td>
                      <td className="px-3 py-2.5">{p.amountLabel}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{formatShortDate(p.periodEndIso)}</td>
                      <td className="px-3 py-2.5 font-medium text-primary">{p.status}</td>
                      <td className="px-3 py-2.5">
                        <Button type="button" variant="outline" size="sm" onClick={() => setReceiptDetail(p)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Dialog open={receiptDetail != null} onOpenChange={(o) => !o && setReceiptDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {receiptDetail && (
            <>
              <DialogHeader>
                <DialogTitle>Receipt & payment details</DialogTitle>
                <DialogDescription>Mock purchase record for this device.</DialogDescription>
              </DialogHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="font-mono text-xs">{receiptDetail.transactionId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Purchase date</dt>
                  <dd>{receiptDetail.date}</dd>
                </div>
                {receiptDetail.periodStartIso && receiptDetail.periodEndIso && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subscription period</dt>
                    <dd className="text-right">
                      {formatShortDate(receiptDetail.periodStartIso)} – {formatShortDate(receiptDetail.periodEndIso)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd>{receiptDetail.planName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Amount paid</dt>
                  <dd className="font-medium">{receiptDetail.amountLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Payment method</dt>
                  <dd>{receiptDetail.paymentMethodLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cardholder</dt>
                  <dd>{receiptDetail.cardholderName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Card</dt>
                  <dd>•••• {receiptDetail.cardLast4}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium text-primary">{receiptDetail.status}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-2">
                  <dt className="text-muted-foreground">Receipt email (mock)</dt>
                  <dd className="text-right text-xs text-muted-foreground">Sent {formatReceiptSentAt(receiptDetail.receiptEmailSentAt)}</dd>
                </div>
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card" aria-labelledby="profile-heading">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" aria-hidden />
          <h2 id="profile-heading" className="font-semibold">
            Profile
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          You signed up with your email, first name, and last name. You can update your name here; email is managed separately.
        </p>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted/50 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email is from your account registration and cannot be changed here.</p>
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </section>

      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" aria-hidden />
          <div>
            <p className="text-sm font-medium text-warning">Security notice</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use a strong, unique password. Do not reuse passwords from other accounts or share your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
