import { useState, useRef, useEffect } from "react";
import { Plus, X, CornerDownLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Kbd } from "@shared/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { useAttributeStore } from "../../../lib/store";
import type { AttributeType } from "../../../types";
import { toast } from "sonner";

interface CreateCoreAttributeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const attributeTypes: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes/No" },
];

export function CreateCoreAttributeDrawer({
  open,
  onOpenChange,
}: CreateCoreAttributeDrawerProps) {
  const { addCoreAttribute } = useAttributeStore();

  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([""]);
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

    addCoreAttribute({
      label: label.trim(),
      type,
      section: "custom",
      isEnabled: true,
      isRequired: false,
      description: description.trim() || undefined,
      dropdownOptions: parsedDropdownOptions,
    });

    toast.success(`Added "${label.trim()}" to Custom Attributes`);

    // Reset form
    setLabel("");
    setType("text");
    setDescription("");
    setDropdownOptions([""]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLabel("");
    setType("text");
    setDescription("");
    setDropdownOptions([""]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Custom Attribute</SheetTitle>
          <SheetDescription>
            Add a new custom attribute to the Custom Attributes section.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Attribute Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Serial Number"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Attribute Type *</Label>
            <Select
              value={type}
              onValueChange={(value: AttributeType) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {attributeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Dropdown Options */}
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
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Add Attribute
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
