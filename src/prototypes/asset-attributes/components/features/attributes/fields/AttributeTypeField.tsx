import { Label } from "@/registry/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import type { AttributeType } from "../../../../types";
import { attributeTypes, getAttributeIcon } from "../../../../lib/utils";

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

  const IconComponent = getAttributeIcon(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="type">Attribute Type</Label>
      <Select value={value} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger id="type">
          <SelectValue placeholder="Select type">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
              <span>{attributeTypes.find(t => t.value === value)?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {attributeTypes.map((typeOption) => {
            const Icon = getAttributeIcon(typeOption.value);
            return (
              <SelectItem key={typeOption.value} value={typeOption.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{typeOption.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

