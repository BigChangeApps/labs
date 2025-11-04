import { Badge } from "@/registry/ui/badge";
import { Label } from "@/registry/ui/label";
import { AttributePreferredField } from "./fields/AttributePreferredField";
import { AttributeStatusField } from "./fields/AttributeStatusField";
import type { AttributeFormContext, AttributeFormData } from "./AttributeForm";

interface AttributeViewContentProps {
  formData: AttributeFormData;
  context: AttributeFormContext;
  onPreferredChange?: (value: boolean) => void;
  onStatusChange?: (value: boolean) => void;
  isSystemAttribute?: boolean;
}

export function AttributeViewContent({
  formData,
  context,
  onPreferredChange,
  onStatusChange,
  isSystemAttribute = false,
}: AttributeViewContentProps) {
  return (
    <div className="flex-1 py-6 space-y-4">
      {/* Dropdown Options */}
      {formData.type === "dropdown" && formData.dropdownOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex flex-wrap gap-2">
            {formData.dropdownOptions.map((option) => (
              <Badge key={option} variant="secondary" className="text-sm">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Number Units */}
      {formData.type === "number" && formData.units && (
        <div className="space-y-2">
          <Label>Units</Label>
          <p className="text-sm text-muted-foreground">{formData.units}</p>
        </div>
      )}

      {/* Mark as preferred - Category attributes only, always interactive */}
      {context === "category" && (
        <AttributePreferredField
          value={formData.isPreferred}
          onChange={onPreferredChange || (() => {})}
          disabled={false}
        />
      )}
    </div>
  );
}

