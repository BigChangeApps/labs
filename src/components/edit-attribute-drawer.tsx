import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
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
import { useAttributeStore } from "@/lib/store";
import type { AttributeType } from "@/types";
import { toast } from "sonner";
import { CategoryTreeSelector } from "./category-tree-selector";

interface EditAttributeDrawerProps {
  attributeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAttributeDrawer({
  attributeId,
  open,
  onOpenChange,
}: EditAttributeDrawerProps) {
  const {
    categories,
    attributeLibrary,
    editAttribute,
    deleteAttribute,
    removeAttributeFromCategory,
    currentCategoryId,
  } = useAttributeStore();

  const attribute = attributeLibrary.find((a) => a.id === attributeId);

  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (attribute) {
      setLabel(attribute.label);
      setType(attribute.type);
      setDescription(attribute.description || "");
      setIsRequired(attribute.isRequired);
      setDefaultValue(attribute.defaultValue?.toString() || "");
      setSelectedCategories(attribute.appliedToCategories);
    }
  }, [attribute]);

  if (!attribute) return null;

  const isShared = attribute.appliedToCategories.length > 1;
  const canDelete = attribute.appliedToCategories.length === 0;

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Please enter an attribute label");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    editAttribute(attributeId, {
      label: label.trim(),
      type,
      description: description.trim(),
      isRequired,
      defaultValue: defaultValue || undefined,
      appliedToCategories: selectedCategories,
    });

    const categoryNames = categories
      .filter((c) => selectedCategories.includes(c.id))
      .map((c) => c.name)
      .join(", ");

    if (isShared) {
      toast.success(
        `Changes applied to all ${attribute.appliedToCategories.length} categories`
      );
    } else {
      toast.success(`Attribute updated and applied to ${categoryNames}`);
    }

    onOpenChange(false);
  };

  const handleRemoveFromCategory = () => {
    removeAttributeFromCategory(attributeId, currentCategoryId);
    toast.success(`Removed from current category. Still in library.`);
    onOpenChange(false);
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
      deleteAttribute(attributeId);
      toast.success("Attribute deleted from library");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Attribute</SheetTitle>
          <SheetDescription>Modify this custom attribute</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {isShared && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                This attribute is shared across{" "}
                {attribute.appliedToCategories.length} categories. Changes will
                apply to all of them.
              </AlertDescription>
            </Alert>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Required Field</Label>
              <p className="text-xs text-muted-foreground">
                Must be filled when creating assets
              </p>
            </div>
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              type={
                type === "number" ? "number" : type === "date" ? "date" : "text"
              }
              placeholder={
                type === "boolean"
                  ? "true or false"
                  : type === "date"
                  ? "YYYY-MM-DD"
                  : "Optional default value"
              }
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
            />
          </div>

          <CategoryTreeSelector
            categories={categories}
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            currentCategoryId={currentCategoryId}
          />

          <div className="pt-4 border-t space-y-2">
            <Button
              variant="outline"
              onClick={handleRemoveFromCategory}
              className="w-full"
            >
              Remove from Current Category
            </Button>

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
