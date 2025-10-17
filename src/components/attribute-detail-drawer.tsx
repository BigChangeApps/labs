import { useState, useEffect } from "react";
import {
  Trash2,
  X,
  Plus,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAttributeStore } from "@/lib/store";
import type { AttributeType, Attribute, Category } from "@/types";
import { toast } from "sonner";
import { CategoryTreeSelector } from "./category-tree-selector";

interface AttributeDetailDrawerProps {
  attributeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to get icon for attribute type
const getAttributeIcon = (type: AttributeType) => {
  switch (type) {
    case "text":
      return Type;
    case "number":
      return Hash;
    case "dropdown":
      return List;
    case "date":
      return Calendar;
    case "boolean":
      return CheckSquare;
    default:
      return Type;
  }
};

export function AttributeDetailDrawer({
  attributeId,
  open,
  onOpenChange,
}: AttributeDetailDrawerProps) {
  const {
    categories,
    attributeLibrary,
    editAttribute,
    deleteAttribute,
    removeAttributeFromCategory,
    currentCategoryId,
    enableParentInheritance,
  } = useAttributeStore();

  const attribute = attributeId
    ? attributeLibrary.find((a: Attribute) => a.id === attributeId)
    : null;

  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [isPreferred, setIsPreferred] = useState(false);
  const [units, setUnits] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (attribute) {
      setLabel(attribute.label);
      setType(attribute.type);
      setDescription(attribute.description || "");
      setIsPreferred(attribute.isPreferred);
      setUnits(attribute.units || "");
      setDropdownOptions(
        attribute.dropdownOptions && attribute.dropdownOptions.length > 0
          ? attribute.dropdownOptions
          : [""]
      );
      setSelectedCategories(attribute.appliedToCategories);
    }
  }, [attribute]);

  if (!attribute) return null;

  const isSystemAttribute = attribute.isSystem;
  const isShared = attribute.appliedToCategories.length > 1;
  const canDelete = attribute.appliedToCategories.length === 0;
  const IconComponent = getAttributeIcon(attribute.type);

  // Handlers for dropdown options
  const handleAddOption = () => {
    setDropdownOptions([...dropdownOptions, ""]);
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

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Please enter an attribute label");
      return;
    }

    // Only validate category selection when parent inheritance is OFF
    if (!enableParentInheritance && selectedCategories.length === 0) {
      toast.error("Please select at least one category");
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

    const updates: Partial<Attribute> = {
      label: label.trim(),
      type,
      description: description.trim(),
      isPreferred,
      dropdownOptions: parsedDropdownOptions,
      units: type === "number" && units.trim() ? units.trim() : undefined,
    };

    // Only update appliedToCategories when parent inheritance is OFF
    if (!enableParentInheritance) {
      updates.appliedToCategories = selectedCategories;
    }

    editAttribute(attributeId, updates);

    if (enableParentInheritance) {
      toast.success("Attribute updated");
    } else {
      const categoryNames = categories
        .filter((c: Category) => selectedCategories.includes(c.id))
        .map((c: Category) => c.name)
        .join(", ");

      if (isShared) {
        toast.success(
          `Changes applied to all ${attribute.appliedToCategories.length} categories`
        );
      } else {
        toast.success(`Attribute updated and applied to ${categoryNames}`);
      }
    }

    onOpenChange(false);
  };

  const handleRemoveFromCategory = () => {
    if (attributeId) {
      removeAttributeFromCategory(attributeId, currentCategoryId);
      toast.success(`Removed from current category. Still in library.`);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error("Cannot delete attribute while in use");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this attribute? This action cannot be undone."
      )
    ) {
      if (attributeId) {
        deleteAttribute(attributeId);
        toast.success("Attribute deleted from library");
        onOpenChange(false);
      }
    }
  };

  // For system attributes, show read-only view
  if (isSystemAttribute) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Attribute Details</SheetTitle>
            <SheetDescription>System attribute (read-only)</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <Alert>
              <AlertDescription className="text-xs">
                This is a system attribute and cannot be modified. If you need
                changes, please contact your administrator or suggest an update.
              </AlertDescription>
            </Alert>

            {/* Attribute Icon and Label */}
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold">{attribute.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={label} disabled />
            </div>

            {description && (
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} disabled />
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                value={type.charAt(0).toUpperCase() + type.slice(1)}
                disabled
              />
            </div>

            {type === "dropdown" && attribute.dropdownOptions && (
              <div className="space-y-2">
                <Label>Dropdown Options</Label>
                <div className="flex flex-wrap gap-1">
                  {attribute.dropdownOptions.map((option) => (
                    <Badge key={option} variant="secondary" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {type === "number" && units && (
              <div className="space-y-2">
                <Label>Units</Label>
                <Input value={units} disabled />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Preferred Field</Label>
                <p className="text-xs text-muted-foreground">
                  Helps track asset verification status
                </p>
              </div>
              <Switch checked={isPreferred} disabled />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button disabled>Suggest an Update</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // For custom attributes, show editable view
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Attribute</SheetTitle>
          <SheetDescription>Modify this custom attribute</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {enableParentInheritance ? (
            <Alert>
              <AlertDescription className="text-xs">
                Attributes are category-specific in this mode. Changes only
                affect this category.
              </AlertDescription>
            </Alert>
          ) : (
            isShared && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  This attribute is shared across{" "}
                  {attribute.appliedToCategories.length} categories. Changes
                  will apply to all of them.
                </AlertDescription>
              </Alert>
            )
          )}

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
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "dropdown" && (
            <div className="space-y-2">
              <Label>Dropdown Options *</Label>
              <div className="space-y-2">
                {dropdownOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                    />
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

          {!enableParentInheritance && (
            <CategoryTreeSelector
              categories={categories}
              selectedCategories={selectedCategories}
              onSelectionChange={setSelectedCategories}
              currentCategoryId={currentCategoryId}
            />
          )}

          <div className="pt-4 border-t space-y-2">
            {!enableParentInheritance && (
              <Button
                variant="outline"
                onClick={handleRemoveFromCategory}
                className="w-full"
              >
                Remove from Current Category
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {canDelete ? "Delete from Library" : "Cannot Delete (In Use)"}
            </Button>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
