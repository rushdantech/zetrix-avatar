import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ZID_ACTION_SCOPES } from "@/lib/identity/constants";
import { formatScopeLabel } from "@/lib/identity/format";
import { ScopeBadge } from "./ScopeBadge";
import { cn } from "@/lib/utils";

export interface CredentialingIssuePayload {
  scopes: string[];
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
}

const steps = ["Scopes", "Bounds", "Review"] as const;

export function CredentialingWizard({
  open,
  onOpenChange,
  agentName,
  onIssue,
  initialPayload = null,
  mode = "issue",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  onIssue: (payload: CredentialingIssuePayload) => void;
  /** When set (e.g. editing an existing credential), form opens with these values. */
  initialPayload?: CredentialingIssuePayload | null;
  mode?: "issue" | "edit";
}) {
  const [step, setStep] = useState(0);
  const [scopes, setScopes] = useState<string[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const inSixMo = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [validFrom, setValidFrom] = useState(today);
  const [validTo, setValidTo] = useState(inSixMo);
  const [usageLimited, setUsageLimited] = useState(true);
  const [usageLimit, setUsageLimit] = useState(100);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (initialPayload) {
      setScopes([...initialPayload.scopes]);
      setValidFrom(initialPayload.validFrom.slice(0, 10));
      setValidTo(initialPayload.validTo.slice(0, 10));
      const ul = initialPayload.usageLimit;
      setUsageLimited(ul != null);
      setUsageLimit(ul ?? 100);
    } else {
      setScopes([]);
      setValidFrom(new Date().toISOString().slice(0, 10));
      setValidTo(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      setUsageLimited(true);
      setUsageLimit(100);
    }
  }, [open, agentName, mode, initialPayload]);

  const toggleScope = (s: string) => {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const resetLocal = () => {
    setStep(0);
    setScopes([]);
    setValidFrom(new Date().toISOString().slice(0, 10));
    setValidTo(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setUsageLimited(true);
    setUsageLimit(100);
  };

  const canNextStep0 = scopes.length > 0;
  const canNextStep1 = validFrom && validTo && new Date(validFrom) < new Date(validTo);
  const canIssue = canNextStep0 && canNextStep1;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) resetLocal();
        onOpenChange(o);
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{mode === "edit" ? "Edit digital credential" : "Credential agent"}</SheetTitle>
          <SheetDescription>
            {mode === "edit" ? (
              <>
                Update scopes, validity, and usage for{" "}
                <span className="font-medium text-foreground">{agentName}</span>. Changes apply on save (demo).
              </>
            ) : (
              <>
                Issue verifiable credentials for <span className="font-medium text-foreground">{agentName}</span>.
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex gap-1">
          {steps.map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-center text-[10px] font-medium sm:text-xs",
                i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6 flex-1 space-y-4">
          {step === 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Action scopes</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Select which operations this agent may perform under your enterprise identity.
              </p>
              <div className="space-y-2">
                {ZID_ACTION_SCOPES.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <input
                      type="checkbox"
                      checked={scopes.includes(s)}
                      onChange={() => toggleScope(s)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{formatScopeLabel(s)}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s}</p>
                    </div>
                  </label>
                ))}
              </div>
              {!canNextStep0 && <p className="mt-2 text-xs text-destructive">Select at least one scope.</p>}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Valid from</Label>
                <Input type="date" className="mt-1" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div>
                <Label>Valid to</Label>
                <Input type="date" className="mt-1" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
              </div>
              {!canNextStep1 && <p className="text-xs text-destructive">End date must be after start date.</p>}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Usage limit</p>
                  <p className="text-xs text-muted-foreground">Cap credential presentations (optional unlimited).</p>
                </div>
                <Switch checked={usageLimited} onCheckedChange={setUsageLimited} />
              </div>
              {usageLimited && (
                <div>
                  <Label>Max uses</Label>
                  <Input
                    type="number"
                    min={1}
                    className="mt-1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">{mode === "edit" ? "Review & save" : "Review & issue"}</p>
              <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Scopes</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {scopes.map((s) => (
                    <ScopeBadge key={s} scope={s} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Validity</p>
                <p className="text-sm">
                  {validFrom} → {validTo}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">Usage</p>
                <p className="text-sm">{usageLimited ? `${usageLimit} max` : "Unlimited"}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Full delegation policy configuration is available in Digital Identity → Policies & Audit.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2 border-t border-border pt-4">
          {step > 0 ? (
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetLocal();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
          )}
          {step < 2 ? (
            <Button
              type="button"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={(step === 0 && !canNextStep0) || (step === 1 && !canNextStep1)}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={!canIssue}
              onClick={() => {
                onIssue({
                  scopes,
                  validFrom: new Date(validFrom).toISOString(),
                  validTo: new Date(validTo).toISOString(),
                  usageLimit: usageLimited ? usageLimit : null,
                });
                resetLocal();
                onOpenChange(false);
              }}
            >
              {mode === "edit" ? "Save changes" : "Issue credential"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
