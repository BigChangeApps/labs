import { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/registry/ui/responsive-modal";
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
    if (
      confirm(
        `Delete ${manufacturer.name}? This will delete all models. This action cannot be undone.`
      )
    ) {
      deleteManufacturer(manufacturer.id);
      toast.success("Manufacturer deleted");
      onOpenChange(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
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

        <div className="pt-4 border-t px-1">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteManufacturer}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Manufacturer
          </Button>
        </div>

        <ResponsiveModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
