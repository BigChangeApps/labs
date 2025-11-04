import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/registry/ui/responsive-modal";
import { Button } from "@/registry/ui/button";
import { Alert, AlertDescription } from "@/registry/ui/alert";
import {
  attributeToFormData,
  type AttributeFormContext,
} from "./AttributeForm";
import { AttributeViewContent } from "./AttributeViewContent";
import { useAttributeStore } from "../../../lib/store";
import type { Attribute, CoreAttribute } from "../../../types";
import { toast } from "sonner";

interface AttributeViewDrawerProps {
  attributeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AttributeFormContext;
  categoryId?: string; // Required when context is "category"
}

export function AttributeViewDrawer({
  attributeId,
  open,
  onOpenChange,
  context,
  categoryId,
}: AttributeViewDrawerProps) {
  const {
    predefinedCategoryAttributes,
    customCategoryAttributes,
    coreAttributes,
    togglePreferred,
    toggleCoreAttribute,
  } = useAttributeStore();

  const [isPreferred, setIsPreferred] = useState(false);

  // Load attribute based on context
  const attribute =
    context === "category"
      ? attributeId && categoryId
        ? (() => {
            // Check predefined attributes first
            const predefinedAttrs = predefinedCategoryAttributes[categoryId] || [];
            const predefinedAttr = predefinedAttrs.find((a: Attribute) => a.id === attributeId);
            if (predefinedAttr) return predefinedAttr;

            // Check custom attributes
            const customAttrs = customCategoryAttributes[categoryId] || [];
            return customAttrs.find((a: Attribute) => a.id === attributeId);
          })()
        : null
      : attributeId
        ? (coreAttributes.find((a: CoreAttribute) => a.id === attributeId) as
            | CoreAttribute
            | undefined)
        : null;

  const isSystemAttribute =
    context === "category"
      ? (attribute as Attribute)?.isSystem ?? false
      : (attribute as CoreAttribute)?.isRequired ?? false;

  // Update local state when attribute changes
  useEffect(() => {
    if (attribute) {
      if (context === "category") {
        setIsPreferred((attribute as Attribute).isPreferred);
      }
    }
  }, [attribute, context]);

  const handleFeedbackClick = () => {
    toast.info(`Feedback for "${attribute?.label}"`);
  };

  const handlePreferredToggle = (value: boolean) => {
    if (context === "category" && attributeId && categoryId) {
      togglePreferred(attributeId, categoryId);
      setIsPreferred(value);
    }
  };

  // Convert attribute to form data and sync with local state
  const baseFormData =
    attribute && context ? attributeToFormData(attribute, context) : undefined;

  // Early return - don't render modal if no data available
  if (!attribute || !baseFormData) return null;

  const title = attribute.label;
  const description =
    context === "core" && (attribute as CoreAttribute).detailedDescription
      ? (attribute as CoreAttribute).detailedDescription
      : attribute.description || "This is a system attribute.";

  // Update form data with current toggle states
  const formData: typeof baseFormData = {
    ...baseFormData,
    isPreferred: context === "category" ? isPreferred : baseFormData.isPreferred,
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="flex flex-col">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-sm text-muted-foreground">
            {description}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <AttributeViewContent
          formData={formData}
          context={context}
          onPreferredChange={handlePreferredToggle}
          isSystemAttribute={isSystemAttribute}
        />

        <div className="space-y-4">
          {context === "core" && (
            <Alert className="bg-muted/50 border-muted">
              <div className="space-y-3">
                <AlertDescription className="text-sm text-muted-foreground">
                  {isSystemAttribute
                    ? "This is a system attribute and cannot be modified."
                    : "This is a predefined attribute."}
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFeedbackClick}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Make a suggestion
                </Button>
              </div>
            </Alert>
          )}

          {context === "category" && isSystemAttribute && (
            <Alert className="bg-muted/50 border-muted">
              <div className="space-y-3">
                <AlertDescription className="text-sm text-muted-foreground">
                  This is a BigChange attribute. Help us improve it by submitting feedback.
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFeedbackClick}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Make a suggestion
                </Button>
              </div>
            </Alert>
          )}

          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </ResponsiveModalFooter>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

