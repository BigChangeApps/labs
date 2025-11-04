import { Label } from "@/registry/ui/label";
import { Input } from "@/registry/ui/input";

interface AttributeLabelFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AttributeLabelField({
  value,
  onChange,
  disabled = false,
}: AttributeLabelFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="label">Attribute Label *</Label>
      <Input
        id="label"
        placeholder="e.g., Purchase price"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

