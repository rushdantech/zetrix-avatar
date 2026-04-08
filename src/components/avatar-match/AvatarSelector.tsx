import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

type Props = {
  options: MarketplaceListingCard[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  id?: string;
};

export function AvatarSelector({ options, value, onChange, disabled, id = "avatar-match-selector" }: Props) {
  return (
    <div className="w-full max-w-md space-y-2">
      <Label htmlFor={id} className="text-xs font-medium">
        Your avatar
      </Label>
      <Select
        value={value ?? undefined}
        onValueChange={onChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger id={id} className="bg-secondary">
          <SelectValue placeholder="Select an avatar…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
