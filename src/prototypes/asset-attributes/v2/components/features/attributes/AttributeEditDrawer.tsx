import { useState, useRef } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/registry/ui/responsive-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import {
  AttributeForm,
  type AttributeFormData,
  formDataToAttribute,
  attributeToFormData,
  type AttributeFormContext,
} from "./AttributeForm";
import { useAttributeStore } from "../../../lib/store";
import type { Attribute, GlobalAttribute } from "../../../types";
import { toast } from "sonner";

interface AttributeEditDrawerProps {
  attributeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AttributeFormContext;
  categoryId?: string; // Required when context is "category"
}

export function AttributeEditDrawer({
  attributeId,
  open,
  onOpenChange,
  context,
  categoryId,
}: AttributeEditDrawerProps) {
  const {
    predefinedCategoryAttributes,
    customCategoryAttributes,
    globalAttributes,
    editAttribute,
    editGlobalAttribute,
    deleteAttribute,
    deleteGlobalAttribute,
    currentCategoryId,
  } = useAttributeStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef<{ submit: () => void }>(null);
  
  // When delete dialog opens, temporarily close the parent modal
  // When delete dialog closes, restore the parent modal if it should be open
  // But if we're deleting, keep parent modal closed
  const parentModalOpen = open && !isDeleteDialogOpen && !isDeleting;

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
        ? (globalAttributes.find((a: GlobalAttribute) => a.id === attributeId) as
            | GlobalAttribute
            | undefined)
        : null;

  const isSystemAttribute =
    context === "category"
      ? (attribute as Attribute)?.isSystem ?? false
      : (attribute as GlobalAttribute)?.isRequired ?? false;

  // Convert attribute to form data
  const initialData =
    attribute && context
      ? attributeToFormData(attribute, context)
      : undefined;

  const handleSave = () => {
    const success = formRef.current?.submit();
    if (!success) {
      toast.error("Please fill in all required fields");
    }
  };

  const handleSubmit = (formData: AttributeFormData) => {
    if (!attributeId) return;

    if (context === "category") {
      const catId = categoryId || currentCategoryId;
      if (!catId) {
        toast.error("Category ID is required");
        return;
      }
      const updates = formDataToAttribute(formData) as Partial<Attribute>;
      editAttribute(attributeId, catId, updates);
      toast.success(`Updated "${formData.label.trim()}"`);
    } else {
      const updates = formDataToAttribute(formData) as Partial<GlobalAttribute>;
      editGlobalAttribute(attributeId, updates);
      toast.success(`Updated "${formData.label.trim()}"`);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!attributeId || !attribute) return;

    // Save label before deletion
    const attributeLabel = attribute.label;

    // Mark as deleting to prevent parent modal from reopening
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);
    
    // Then close parent modal and delete - use setTimeout to ensure delete dialog closes first
    setTimeout(() => {
      if (context === "category") {
        const catId = categoryId || currentCategoryId;
        if (!catId) {
          toast.error("Category ID is required");
          setIsDeleting(false);
          return;
        }
        deleteAttribute(attributeId, catId);
        toast.success(`Deleted "${attributeLabel}"`);
      } else {
        deleteGlobalAttribute(attributeId);
        toast.success(`Deleted "${attributeLabel}"`);
      }
      setIsDeleting(false);
      onOpenChange(false);
    }, 0);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Early return - don't render modal if no data available or if it's a system attribute
  if (!attribute || isSystemAttribute) return null;

  const title =
    context === "category" ? attribute.label : attribute.label;

  return (
    <>
      <ResponsiveModal open={parentModalOpen} onOpenChange={onOpenChange}>
        <ResponsiveModalContent className="flex flex-col">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <AttributeForm
            ref={formRef}
            mode="edit"
            context={context}
            initialData={initialData}
            onSubmit={handleSubmit}
          />

          <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive bg-destructive/10 hover:text-destructive hover:bg-destructive/20"
            >
              Delete
            </Button>
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="z-[100]" overlayClassName="z-[100]">
          <DialogHeader>
            <DialogTitle>Delete {attribute.label}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attribute? This will remove
              the attribute and any associated data. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                // Parent modal will be restored via useEffect
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

