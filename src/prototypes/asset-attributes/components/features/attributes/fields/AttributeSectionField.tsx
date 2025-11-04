import { Label } from "@/registry/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import type { CoreAttributeSection } from "../../../../types";

interface AttributeSectionFieldProps {
  value: CoreAttributeSection;
  onChange: (value: CoreAttributeSection) => void;
  disabled?: boolean;
}

const sections: { value: CoreAttributeSection; label: string }[] = [
  { value: "asset-info", label: "Asset Information" },
  { value: "status", label: "Status" },
  { value: "contact", label: "Contact" },
  { value: "dates", label: "Dates" },
  { value: "warranty", label: "Warranty" },
  { value: "custom", label: "Custom" },
];

export function AttributeSectionField({
  value,
  onChange,
  disabled = false,
}: AttributeSectionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="section">Section</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="section">
          <SelectValue placeholder="Select section" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section.value} value={section.value}>
              {section.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

