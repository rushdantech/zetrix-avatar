import { useCallback, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FieldHelp({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>;
}

type LabelProps = { label: string; required?: boolean; help?: string; htmlFor?: string };

export function FieldLabel({ label, required, help, htmlFor }: LabelProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-1">
        <span>{label}</span>
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {help ? <FieldHelp>{help}</FieldHelp> : null}
    </div>
  );
}

export function IntegrationOAuthBanner({
  title,
  description = "Mock only — no real OAuth in this prototype.",
  buttonLabel,
  authorized,
  onAuthorize,
}: {
  title: string;
  description?: string;
  buttonLabel: string;
  authorized: boolean;
  onAuthorize: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          {authorized ? (
            <Badge className="mt-2 bg-emerald-600/90 text-white hover:bg-emerald-600">Authorized (mock)</Badge>
          ) : null}
        </div>
      </div>
      <Button type="button" variant={authorized ? "outline" : "default"} size="sm" className="shrink-0" onClick={onAuthorize}>
        {buttonLabel}
      </Button>
    </div>
  );
}

export function TextFieldRow({
  id,
  label,
  required,
  help,
  placeholder,
  value,
  onChange,
  readOnly,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} label={label} required={required} help={help} />
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        className={readOnly ? "cursor-text select-all font-mono text-sm" : undefined}
        onChange={e => !readOnly && onChange(e.target.value)}
      />
    </div>
  );
}

export function PasswordFieldRow({
  id,
  label,
  required,
  help,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} label={label} required={required} help={help} />
      <Input
        id={id}
        type="password"
        autoComplete="new-password"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export function TagInputField({
  id,
  label,
  required,
  help,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  }, [draft, onChange, value]);

  const remove = useCallback(
    (tag: string) => {
      onChange(value.filter(x => x !== tag));
    },
    [onChange, value],
  );

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} label={label} required={required} help={help} />
      <div className="flex flex-wrap gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="min-w-[12rem] flex-1"
        />
        <Button type="button" variant="secondary" onClick={add}>
          Add
        </Button>
      </div>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-0.5 font-normal">
              <span className="max-w-[220px] truncate px-1">{tag}</span>
              <button
                type="button"
                className="rounded-sm px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CheckboxListField({
  label,
  help,
  items,
}: {
  label: string;
  help?: string;
  items: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }[];
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} help={help} />
      <ul className="space-y-2.5 rounded-lg border border-border bg-muted/20 p-3">
        {items.map(item => (
          <li key={item.id} className="flex items-start gap-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={c => item.onChange(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor={item.id} className="cursor-pointer font-normal leading-snug">
              {item.label}
            </Label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToggleRow({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/20 px-3 py-3">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium leading-snug">
          {label}
        </Label>
        {help ? <FieldHelp>{help}</FieldHelp> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={v => onChange(v === true)} />
    </div>
  );
}
