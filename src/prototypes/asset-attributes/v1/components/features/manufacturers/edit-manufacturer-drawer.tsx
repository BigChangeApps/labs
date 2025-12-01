import { useRef, useEffect, useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
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
  ManufacturerForm,
  type ManufacturerFormData,
} from "./ManufacturerForm";
import { useAttributeStore } from "../../../lib/store";
import type { Manufacturer } from "../../../types";
import { toast } from "sonner";

interface EditManufacturerDrawerProps {
  manufacturerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditManufacturerDrawer({
  manufacturerId,
  open,
  onOpenChange,
}: EditManufacturerDrawerProps) {
  const {
    manufacturers,
    editManufacturer,
    deleteManufacturer,
    addModel,
    editModel,
    deleteModel,
  } = useAttributeStore();

  const manufacturer = manufacturers.find(
    (m: Manufacturer) => m.id === manufacturerId
  );

  const formRef = useRef<{ submit: () => void }>(null);

  const [initialData, setInitialData] = useState<ManufacturerFormData | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // When delete dialog opens, temporarily close the parent modal
  // When delete dialog closes, restore the parent modal if it should be open
  // But if we're deleting, keep parent modal closed
  const parentModalOpen = open && !isDeleteDialogOpen && !isDeleting;

  // Update initialData when manufacturer changes
  useEffect(() => {
    if (manufacturer) {
      setInitialData({
        name: manufacturer.name,
        models: manufacturer.models.map((m) => m.name),
      });
    }
  }, [manufacturer]);

  if (!manufacturer || !initialData) return null;

  const handleSubmit = (formData: ManufacturerFormData) => {
    // Update manufacturer name
    editManufacturer(manufacturer.id, formData.name);

    // Update models
    const trimmedModels = formData.models;

    // Find models to delete (existed before but not in new list)
    manufacturer.models.forEach((oldModel) => {
      if (!trimmedModels.includes(oldModel.name)) {
        deleteModel(manufacturer.id, oldModel.id);
      }
    });

    // Find models to add (in new list but didn't exist before)
    trimmedModels.forEach((newModelName: string) => {
      const existed = manufacturer.models.some((m) => m.name === newModelName);
      if (!existed) {
        addModel(manufacturer.id, newModelName);
      }
    });

    // Update existing model names if changed
    manufacturer.models.forEach((oldModel) => {
      const newIndex = manufacturer.models.findIndex(
        (m) => m.id === oldModel.id
      );
      if (
        newIndex >= 0 &&
        trimmedModels[newIndex] &&
        trimmedModels[newIndex] !== oldModel.name
      ) {
        editModel(manufacturer.id, oldModel.id, trimmedModels[newIndex]);
      }
    });

    toast.success("Manufacturer updated");
    onOpenChange(false);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handleDeleteManufacturer = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // Mark as deleting to prevent parent modal from reopening
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);
    
    // Then close parent modal and delete - use setTimeout to ensure delete dialog closes first
    setTimeout(() => {
      deleteManufacturer(manufacturer.id);
      toast.success("Manufacturer deleted");
      setIsDeleting(false);
      onOpenChange(false);
    }, 0);
  };

  return (
    <>
      <ResponsiveModal open={parentModalOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="flex flex-col">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Manufacturer</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Modify manufacturer details and manage models
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ManufacturerForm
          ref={formRef}
          initialData={initialData}
          onSubmit={handleSubmit}
        />

        <ResponsiveModalFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDeleteManufacturer}
            className="text-destructive bg-destructive/10 hover:text-destructive hover:bg-destructive/20"
          >
            Delete
          </Button>
          <div className="flex flex-col-reverse sm:flex-row sm:space-x-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
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
            <DialogTitle>Delete {manufacturer.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this manufacturer? This will delete
              all models. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                // Parent modal will be restored automatically
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
