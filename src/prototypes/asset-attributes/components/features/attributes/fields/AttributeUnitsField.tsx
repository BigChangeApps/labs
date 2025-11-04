import { Label } from "@/registry/ui/label";
import { Input } from "@/registry/ui/input";

interface AttributeUnitsFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AttributeUnitsField({
  value,
  onChange,
  disabled = false,
}: AttributeUnitsFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="units">
        Units <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Input
        id="units"
        placeholder="e.g., kg, °C, meters, bar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

