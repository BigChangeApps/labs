import { useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/registry/ui/sheet";
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

interface AttributeAddSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AttributeFormContext;
  categoryId?: string; // Required when context is "category"
  section?: GlobalAttributeSection | null; // Optional section for global attributes
}

export function AttributeAddSidebar({
  open,
  onOpenChange,
  context,
  categoryId,
  section,
}: AttributeAddSidebarProps) {
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

  const formId = "attribute-add-sidebar-form";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add attribute</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <AttributeForm
            ref={formRef}
            mode="add"
            context={context}
            onSubmit={handleSubmit}
            formId={formId}
          />
        </div>

        <SheetFooter className="border-t pt-4 -mx-6 px-6 pb-0">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {context === "category" ? "Save attribute" : "Add attribute"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
