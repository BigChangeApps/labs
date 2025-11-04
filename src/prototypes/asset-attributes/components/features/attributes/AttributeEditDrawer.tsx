import { useState, useRef } from "react";
import { Trash2, MoreVertical } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { Button } from "@/registry/ui/button";
import {
  AttributeForm,
  type AttributeFormData,
  formDataToAttribute,
  attributeToFormData,
  type AttributeFormContext,
} from "./AttributeForm";
import { useAttributeStore } from "../../../lib/store";
import type { Attribute, CoreAttribute } from "../../../types";
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
    coreAttributes,
    editAttribute,
    editCoreAttribute,
    deleteAttribute,
    deleteCoreAttribute,
    currentCategoryId,
  } = useAttributeStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const formRef = useRef<{ submit: () => void }>(null);

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
      const updates = formDataToAttribute(formData) as Partial<CoreAttribute>;
      editCoreAttribute(attributeId, updates);
      toast.success(`Updated "${formData.label.trim()}"`);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!attributeId) return;

    if (context === "category") {
      const catId = categoryId || currentCategoryId;
      if (!catId) {
        toast.error("Category ID is required");
        return;
      }
      deleteAttribute(attributeId, catId);
      toast.success(`Deleted "${attribute?.label}"`);
    } else {
      deleteCoreAttribute(attributeId);
      toast.success(`Deleted "${attribute?.label}"`);
    }

    setIsDeleteDialogOpen(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!attribute) return null;

  // Don't allow editing system/required attributes
  if (isSystemAttribute) {
    return null; // Should use AttributeViewDrawer instead
  }

  const title =
    context === "category" ? attribute.label : attribute.label;

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={onOpenChange}>
        <ResponsiveModalContent className="flex flex-col w-full max-w-2xl">
          <ResponsiveModalHeader>
            <div className="flex items-center justify-between">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-0">
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </ResponsiveModalHeader>

          <AttributeForm
            ref={formRef}
            mode="edit"
            context={context}
            initialData={initialData}
            onSubmit={handleSubmit}
          />

          <div className="space-y-4">
            <ResponsiveModalFooter className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
            </ResponsiveModalFooter>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
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
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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

