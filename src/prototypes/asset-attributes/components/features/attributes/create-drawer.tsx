import { useState, useRef, useEffect } from "react";
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
import { Switch } from "@shared/components/ui/switch";
import { Kbd } from "@shared/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useAttributeStore } from "../../../lib/store";
import type { AttributeType, Category } from "../../../types";
import { toast } from "sonner";
import { X, Plus, CornerDownLeft } from "lucide-react";

interface CreateAttributeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
}

export function CreateAttributeDrawer({
  open,
  onOpenChange,
  categoryId,
}: CreateAttributeDrawerProps) {
  const { categories, addAttribute } = useAttributeStore();

  // State for Create New tab
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [isPreferred, setIsPreferred] = useState(false);
  const [units, setUnits] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([""]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(
    null
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentCategory = categories.find((c: Category) => c.id === categoryId);

  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, dropdownOptions]);

  // Handlers for dropdown options
  const handleAddOption = () => {
    const newIndex = dropdownOptions.length;
    setDropdownOptions([...dropdownOptions, ""]);
    setFocusIndex(newIndex);
  };

  const handleRemoveOption = (index: number) => {
    if (dropdownOptions.length > 1) {
      setDropdownOptions(dropdownOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...dropdownOptions];
    newOptions[index] = value;
    setDropdownOptions(newOptions);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Please enter an attribute label");
      return;
    }

    // Validate dropdown options if type is dropdown
    if (type === "dropdown") {
      const validOptions = dropdownOptions
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);

      if (validOptions.length === 0) {
        toast.error("Please enter at least one dropdown option");
        return;
      }
    }

    // Filter and clean dropdown options
    const parsedDropdownOptions =
      type === "dropdown"
        ? dropdownOptions
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0)
        : undefined;

    addAttribute(
      {
        label: label.trim(),
        type,
        description: description.trim(),
        isPreferred,
        dropdownOptions: parsedDropdownOptions,
        units: type === "number" && units.trim() ? units.trim() : undefined,
      },
      categoryId
    );

    const categoryName = currentCategory?.name || "category";
    toast.success(`Added to Library and applied to ${categoryName}`);

    // Reset form
    setLabel("");
    setType("text");
    setDescription("");
    setIsPreferred(false);
    setUnits("");
    setDropdownOptions([""]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLabel("");
    setType("text");
    setDescription("");
    setIsPreferred(false);
    setUnits("");
    setDropdownOptions([""]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Attribute</SheetTitle>
          <SheetDescription>
            Create a new attribute for this category
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col space-y-6 mt-4 flex-1">
          <div className="overflow-y-auto space-y-6 px-1">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Installation Date"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as AttributeType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "dropdown" && (
              <div className="space-y-2">
                <Label>Dropdown Options *</Label>
                <div className="space-y-2">
                  {dropdownOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOptionKeyDown(e)}
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
                      {dropdownOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {type === "number" && (
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  placeholder="e.g., kg, °C, meters, bar"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Preferred Field</Label>
                <p className="text-xs text-muted-foreground">
                  Helps track asset verification status
                </p>
              </div>
              <Switch checked={isPreferred} onCheckedChange={setIsPreferred} />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Attribute</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
