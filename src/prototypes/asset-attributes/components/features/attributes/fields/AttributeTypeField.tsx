import { Label } from "@/registry/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import type { AttributeType } from "../../../../types";
import { attributeTypes } from "../../../../lib/utils";

interface AttributeTypeFieldProps {
  value: AttributeType;
  onChange: (value: AttributeType) => void;
  disabled?: boolean;
  onTypeChange?: () => void; // Called when type changes (for resetting dropdown options)
}

export function AttributeTypeField({
  value,
  onChange,
  disabled = false,
  onTypeChange,
}: AttributeTypeFieldProps) {
  const handleChange = (newValue: AttributeType) => {
    onChange(newValue);
    if (onTypeChange) {
      onTypeChange();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="type">Attribute Type *</Label>
      <Select value={value} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger id="type">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {attributeTypes.map((typeOption) => (
            <SelectItem key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

