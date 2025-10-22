import { useState, useRef, useEffect } from "react";
import { Plus, X, CornerDownLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Kbd } from "@shared/components/ui/kbd";
import { toast } from "sonner";

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
  const [manufacturerName, setManufacturerName] = useState("");
  const [models, setModels] = useState<string[]>([""]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(
    null
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, models]);

  const handleAddModel = () => {
    const newIndex = models.length;
    setModels([...models, ""]);
    setFocusIndex(newIndex);
  };

  const handleRemoveModel = (index: number) => {
    if (models.length > 1) {
      setModels(models.filter((_, i) => i !== index));
    }
  };

  const handleModelChange = (index: number, value: string) => {
    const newModels = [...models];
    newModels[index] = value;
    setModels(newModels);
  };

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddModel();
    }
  };

  const handleSave = () => {
    if (!manufacturerName.trim()) {
      toast.error("Please enter a manufacturer name");
      return;
    }

    // Filter out empty model names
    const validModels = models
      .map((model) => model.trim())
      .filter((model) => model.length > 0);

    onSave(manufacturerName.trim(), validModels);

    // Reset form
    setManufacturerName("");
    setModels([""]);
  };

  const handleCancel = () => {
    setManufacturerName("");
    setModels([""]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Manufacturer</SheetTitle>
          <SheetDescription>
            Create a new manufacturer and optionally add models
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
              <Label>Models (Optional)</Label>
              <div className="space-y-2">
                {models.map((model, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        placeholder={`Model ${index + 1}`}
                        value={model}
                        onChange={(e) =>
                          handleModelChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleModelKeyDown(e)}
                        onFocus={() => setFocusedInputIndex(index)}
                        onBlur={() => setFocusedInputIndex(null)}
                        className="pr-12"
                      />
                      {focusedInputIndex === index && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Kbd>
                            <CornerDownLeft className="h-3 w-3" />
                          </Kbd>
                        </div>
                      )}
                    </div>
                    {models.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveModel(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddModel}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Manufacturer</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
