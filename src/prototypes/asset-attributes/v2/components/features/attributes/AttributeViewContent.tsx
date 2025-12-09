import { Badge } from "@/registry/ui/badge";
import { Label } from "@/registry/ui/label";
import { AttributePreferredField } from "./fields/AttributePreferredField";
import { usePreferredField } from "../../../lib/use-category-add-button";
import type { AttributeFormContext, AttributeFormData } from "./AttributeForm";

interface AttributeViewContentProps {
  formData: AttributeFormData;
  context: AttributeFormContext;
  onPreferredChange?: (value: boolean) => void;
  attributeLabel?: string;
}

export function AttributeViewContent({
  formData,
  context,
  onPreferredChange,
  attributeLabel,
}: AttributeViewContentProps) {
  // System attributes that shouldn't show options (they use system-level data)
  const systemDropdownAttributes = ["Category", "Manufacturer", "Model"];
  const shouldHideOptions = attributeLabel && systemDropdownAttributes.includes(attributeLabel);

  const preferredFlagEnabled = usePreferredField();
  const hasDropdownOptions = formData.type === "dropdown" && formData.dropdownOptions.length > 0 && !shouldHideOptions;
  const hasUnits = formData.type === "number" && formData.units;
  const showPreferredField = context === "category" && preferredFlagEnabled;

  // Don't render anything if there's no content to display
  const hasContent = hasDropdownOptions || hasUnits || showPreferredField;
  if (!hasContent) return null;

  return (
    <div className="flex-1 space-y-4">
      {/* Dropdown Options */}
      {hasDropdownOptions && (
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
      {hasUnits && (
        <div className="space-y-2">
          <Label>Units</Label>
          <p className="text-sm text-muted-foreground">{formData.units}</p>
        </div>
      )}

      {/* Mark as preferred - Category attributes only, always interactive */}
      {showPreferredField && (
        <AttributePreferredField
          value={formData.isPreferred}
          onChange={onPreferredChange || (() => {})}
          disabled={false}
        />
      )}
    </div>
  );
}

