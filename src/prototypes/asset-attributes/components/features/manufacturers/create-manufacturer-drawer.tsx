import { useRef, useEffect, useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/registry/ui/responsive-modal";
import { Button } from "@/registry/ui/button";
import {
  ManufacturerForm,
  type ManufacturerFormData,
} from "./ManufacturerForm";

interface CreateManufacturerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (manufacturerName: string, models: string[]) => void;
}

export function CreateManufacturerDrawer({
  open,
  onOpenChange,
  onSave,
}: CreateManufacturerDrawerProps) {
  const formRef = useRef<{ submit: () => void }>(null);
  const [key, setKey] = useState(0);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setKey((prev) => prev + 1);
    }
  }, [open]);

  const handleSubmit = (formData: ManufacturerFormData) => {
    onSave(formData.name, formData.models);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const formId = "manufacturer-add-form";

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Add Manufacturer</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Create a new manufacturer and optionally add models
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-6">
          <ManufacturerForm
            key={key}
            ref={formRef}
            onSubmit={handleSubmit}
            formId={formId}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>Save Manufacturer</Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
