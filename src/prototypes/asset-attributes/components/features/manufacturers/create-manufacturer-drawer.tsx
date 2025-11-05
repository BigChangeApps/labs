import { useRef, useEffect, useState } from "react";
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

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="flex flex-col">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Add Manufacturer</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Create a new manufacturer and optionally add models
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ManufacturerForm
          key={key}
          ref={formRef}
          onSubmit={handleSubmit}
        />

        <ResponsiveModalFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Manufacturer</Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
