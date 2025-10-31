import { useState, useEffect, useRef } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/registry/ui/sheet";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
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

  const [manufacturerName, setManufacturerName] = useState("");
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [draftModels, setDraftModels] = useState<string[]>([]);
  const [focusDraftIndex, setFocusDraftIndex] = useState<number | null>(null);
  const draftInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (manufacturer) {
      setManufacturerName(manufacturer.name);
      setModels([...manufacturer.models]);
      setDraftModels([]);
    }
  }, [manufacturer]);

  useEffect(() => {
    if (focusDraftIndex !== null && draftInputRefs.current[focusDraftIndex]) {
      draftInputRefs.current[focusDraftIndex]?.focus();
      setFocusDraftIndex(null);
    }
  }, [focusDraftIndex, draftModels]);

  if (!manufacturer) return null;

  const handleSave = () => {
    if (!manufacturerName.trim()) {
      toast.error("Manufacturer name cannot be empty");
      return;
    }

    // Update manufacturer name
    editManufacturer(manufacturer.id, manufacturerName.trim());

    // Update existing models
    models.forEach((model) => {
      const originalModel = manufacturer.models.find((m) => m.id === model.id);
      if (originalModel && originalModel.name !== model.name.trim()) {
        editModel(manufacturer.id, model.id, model.name.trim());
      }
    });

    toast.success("Manufacturer updated");
    onOpenChange(false);
  };

  const handleAddDraftModel = () => {
    const newIndex = draftModels.length;
    setDraftModels([...draftModels, ""]);
    setFocusDraftIndex(newIndex);
  };

  const handleDraftModelChange = (index: number, value: string) => {
    const newDrafts = [...draftModels];
    newDrafts[index] = value;
    setDraftModels(newDrafts);
  };

  const handleDraftModelKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const draftValue = draftModels[index].trim();
      if (draftValue) {
        // Save the model immediately
        addModel(manufacturer.id, draftValue);
        toast.success("Model added");
        // Remove this draft and add a new blank one
        const newDrafts = draftModels.filter((_, i) => i !== index);
        setDraftModels([...newDrafts, ""]);
        setFocusDraftIndex(newDrafts.length);
      } else {
        // Just add a new blank field
        handleAddDraftModel();
      }
    }
  };

  const handleDraftModelBlur = (index: number) => {
    const draftValue = draftModels[index].trim();
    if (draftValue) {
      // Save the model on blur
      addModel(manufacturer.id, draftValue);
      toast.success("Model added");
      // Remove this draft
      setDraftModels(draftModels.filter((_, i) => i !== index));
    }
  };

  const handleRemoveDraft = (index: number) => {
    setDraftModels(draftModels.filter((_, i) => i !== index));
  };

  const handleDeleteModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    if (confirm(`Delete ${model.name}? This action cannot be undone.`)) {
      deleteModel(manufacturer.id, modelId);
      setModels(models.filter((m) => m.id !== modelId));
      toast.success("Model deleted");
    }
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

  const handleModelNameChange = (modelId: string, name: string) => {
    setModels(models.map((m) => (m.id === modelId ? { ...m, name } : m)));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Manufacturer</SheetTitle>
          <SheetDescription>
            Modify manufacturer details and manage models
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col space-y-6 mt-4 flex-1">
          <div className="overflow-y-auto space-y-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="manufacturer-name">Manufacturer Name *</Label>
              <Input
                id="manufacturer-name"
                placeholder="e.g., Siemens"
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Models</Label>
              <div className="space-y-2">
                {models.map((model) => (
                  <div key={model.id} className="flex gap-2">
                    <Input
                      placeholder="Model name"
                      value={model.name}
                      onChange={(e) =>
                        handleModelNameChange(model.id, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {draftModels.map((draft, index) => (
                  <div key={`draft-${index}`} className="flex gap-2">
                    <Input
                      ref={(el) => {
                        draftInputRefs.current[index] = el;
                      }}
                      placeholder="New model name"
                      value={draft}
                      onChange={(e) =>
                        handleDraftModelChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleDraftModelKeyDown(index, e)}
                      onBlur={() => handleDraftModelBlur(index)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveDraft(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDraftModel}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleDeleteManufacturer}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Manufacturer
              </Button>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
