export const ZID_ACTION_SCOPES = [
  "sign-document",
  "submit-government-form",
  "authorize-payment",
  "authorize-transaction",
  "issue-credential",
] as const;

export const STATUS_CLASSES: Record<string, string> = {
  active: "bg-success/10 text-success",
  verified: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  bound: "bg-success/10 text-success",
  published: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  draft: "bg-warning/10 text-warning",
  awaiting_binding: "bg-warning/10 text-warning",
  suspended: "bg-warning/10 text-warning",
  high: "bg-warning/10 text-warning",
  revoked: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  critical: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  unbound: "bg-muted text-muted-foreground",
  not_credentialed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  na: "bg-muted text-muted-foreground",
  /** Studio card: persona vs AI agent (not workflow status). */
  avatar: "bg-primary/10 text-primary",
  agent: "bg-info/10 text-info",
};
