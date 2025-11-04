import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/registry/ui/sheet";
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
  const [isEnabled, setIsEnabled] = useState(true);

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
      } else {
        setIsEnabled((attribute as CoreAttribute).isEnabled);
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

  const handleStatusToggle = (value: boolean) => {
    if (context === "core" && attributeId) {
      toggleCoreAttribute(attributeId);
      setIsEnabled(value);
    }
  };

  if (!attribute) return null;

  const title = attribute.label;
  const description =
    context === "core" && (attribute as CoreAttribute).detailedDescription
      ? (attribute as CoreAttribute).detailedDescription
      : attribute.description || "This is a system attribute.";

  // Convert attribute to form data and sync with local state
  const baseFormData =
    attribute && context ? attributeToFormData(attribute, context) : undefined;

  if (!baseFormData) return null;

  // Update form data with current toggle states
  const formData: typeof baseFormData = {
    ...baseFormData,
    isPreferred: context === "category" ? isPreferred : baseFormData.isPreferred,
    isEnabled: context === "core" ? isEnabled : baseFormData.isEnabled,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {description}
          </SheetDescription>
        </SheetHeader>

        <AttributeViewContent
          formData={formData}
          context={context}
          onPreferredChange={handlePreferredToggle}
          onStatusChange={handleStatusToggle}
          isSystemAttribute={isSystemAttribute}
        />

        <div className="space-y-4">
          {isSystemAttribute && (
            <Alert className="bg-muted/50 border-muted">
              <AlertDescription className="text-sm text-muted-foreground">
                {context === "category"
                  ? "This is a BigChange attribute. Help us improve it by submitting feedback."
                  : "This is a system attribute and cannot be modified."}
              </AlertDescription>
            </Alert>
          )}

          <SheetFooter>
            {isSystemAttribute ? (
              <>
                {context === "category" && (
                  <Button variant="outline" onClick={handleFeedbackClick}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Give feedback
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

