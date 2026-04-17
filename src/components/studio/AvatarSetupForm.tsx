import { cn } from "@/lib/utils";
import { AVATAR_ARCHETYPE_LABELS } from "@/lib/studio/avatar-archetypes";

type AvatarSetupFields = {
  name: string;
  handle: string;
  bio: string;
  avatarArchetype: string;
};

export function AvatarSetupForm({
  values,
  onFieldChange,
  onSelectArchetype,
  className,
}: {
  values: AvatarSetupFields;
  onFieldChange: <K extends keyof AvatarSetupFields>(key: K, value: AvatarSetupFields[K]) => void;
  onSelectArchetype: (label: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl font-bold">Avatar Setup</h3>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Select an avatar</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AVATAR_ARCHETYPE_LABELS.map((label) => {
            const selected = values.avatarArchetype === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSelectArchetype(label)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40 hover:bg-secondary/70",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="avatar-setup-name" className="text-sm font-medium">
          Avatar Name
        </label>
        <input
          id="avatar-setup-name"
          value={values.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="Enter your avatar name"
          className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="avatar-setup-handle" className="text-sm font-medium">
          Handle
        </label>
        <div className="mt-1 flex items-center rounded-lg border border-border bg-secondary px-3 py-2 text-sm">
          <span className="mr-1 text-muted-foreground">/</span>
          <input
            id="avatar-setup-handle"
            value={values.handle}
            onChange={(e) => onFieldChange("handle", e.target.value)}
            placeholder="your_handle"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Public chat URL: /&lt;handle&gt; (lowercase letters, numbers, underscore)</p>
      </div>

      <div>
        <label htmlFor="avatar-setup-bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="avatar-setup-bio"
          value={values.bio}
          onChange={(e) => onFieldChange("bio", e.target.value)}
          placeholder="Describe your avatar's personality and style"
          rows={4}
          className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
