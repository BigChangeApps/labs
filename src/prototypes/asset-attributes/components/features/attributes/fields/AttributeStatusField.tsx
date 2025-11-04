import { Label } from "@/registry/ui/label";
import { Switch } from "@/registry/ui/switch";

interface AttributeStatusFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function AttributeStatusField({
  value,
  onChange,
  disabled = false,
}: AttributeStatusFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>Status</Label>
        <p className="text-xs text-muted-foreground">
          Whether this attribute is enabled
        </p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

