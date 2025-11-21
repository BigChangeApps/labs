import { useRef } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/registry/ui/responsive-modal";
import { Button } from "@/registry/ui/button";
import {
  AttributeForm,
  type AttributeFormData,
  formDataToAttribute,
  type AttributeFormContext,
} from "./AttributeForm";
import { useAttributeStore } from "../../../lib/store";
import type { GlobalAttributeSection } from "../../../types";
import { toast } from "sonner";

interface AttributeAddDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AttributeFormContext;
  categoryId?: string; // Required when context is "category"
  section?: GlobalAttributeSection | null; // Optional section for global attributes
}

export function AttributeAddDrawer({
  open,
  onOpenChange,
  context,
  categoryId,
  section,
}: AttributeAddDrawerProps) {
  const { addAttribute, addGlobalAttribute, categories } = useAttributeStore();
  const formRef = useRef<{ submit: () => void }>(null);

  const currentCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = (formData: AttributeFormData) => {
    if (context === "category") {
      if (!categoryId) {
        toast.error("Category ID is required");
        return;
      }

      const attributeData = formDataToAttribute(formData) as Parameters<
        typeof addAttribute
      >[0];
      addAttribute(attributeData, categoryId);

      const categoryName = currentCategory?.name || "category";
      toast.success(`Added to Library and applied to ${categoryName}`);
    } else {
      const globalAttributeData = formDataToAttribute(formData) as Parameters<
        typeof addGlobalAttribute
      >[0];
      addGlobalAttribute(globalAttributeData, section || undefined);

      toast.success(`Added "${formData.label.trim()}"`);
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title =
    context === "category" ? "Add Attribute" : "Add Custom Attribute";
  const description =
    context === "category"
      ? "Create a new attribute for this category"
      : "Add a new custom attribute to your global attributes.";

  const formId = "attribute-add-form";

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-6">
          <AttributeForm
            ref={formRef}
            mode="add"
            context={context}
            onSubmit={handleSubmit}
            formId={formId}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              {context === "category" ? "Save Attribute" : "Add Attribute"}
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

