import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { AlertTriangle, KeyRound, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadPersistedAccountPassword, persistAccountPassword } from "@/lib/persist/studio-session-storage";

function validateNewPasswordStrength(p: string): string | null {
  if (p.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(p)) return "Include an uppercase letter.";
  if (!/[a-z]/.test(p)) return "Include a lowercase letter.";
  if (!/[0-9]/.test(p)) return "Include a number.";
  return null;
}

/**
 * Account / profile settings (name, email) and password change (prototype: stored in this browser only).
 */
export default function AccountSettingsPage() {
  const { user, updateUser } = useApp();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

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
    if (stored) {
      if (currentPassword !== stored) {
        toast.error("Current password is incorrect.");
        return;
      }
    } else if (currentPassword.trim()) {
      toast.error("No password is saved in this app yet. Leave “current password” empty to set one.");
      return;
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
          {hasStoredPassword
            ? "Enter your current password, then choose a new one."
            : "Set a password for this browser (demo: stored locally only). No current password is required the first time."}
        </p>
        <form onSubmit={savePassword} className="space-y-4">
          {hasStoredPassword && (
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
              />
            </div>
          )}
          {!hasStoredPassword && (
            <input type="text" name="username" autoComplete="username" value={user.email} readOnly className="sr-only" tabIndex={-1} aria-hidden />
          )}
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
          <Button type="submit">{hasStoredPassword ? "Update password" : "Set password"}</Button>
        </form>
      </section>

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
              Password changes in this prototype are stored in your browser only and are not sent to a server. Use a unique
              password if you try this demo on a shared device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
