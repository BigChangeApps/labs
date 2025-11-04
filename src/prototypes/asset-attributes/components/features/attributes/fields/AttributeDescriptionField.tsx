import { Label } from "@/registry/ui/label";
import { Input } from "@/registry/ui/input";

interface AttributeDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AttributeDescriptionField({
  value,
  onChange,
  disabled = false,
}: AttributeDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">
        Description <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Input
        id="description"
        placeholder="Optional description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

