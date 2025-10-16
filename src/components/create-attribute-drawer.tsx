import { useState } from "react";
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

interface CreateAttributeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAttributeDrawer({
  open,
  onOpenChange,
}: CreateAttributeDrawerProps) {
  const { currentCategoryId, categories, addAttribute } = useAttributeStore();

  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    currentCategoryId,
  ]);

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Please enter an attribute label");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    addAttribute({
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

    toast.success(`Added to Library and applied to ${categoryNames}`);

    // Reset form
    setLabel("");
    setType("text");
    setDescription("");
    setIsRequired(false);
    setDefaultValue("");
    setSelectedCategories([currentCategoryId]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLabel("");
    setType("text");
    setDescription("");
    setIsRequired(false);
    setDefaultValue("");
    setSelectedCategories([currentCategoryId]);
    onOpenChange(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Attribute</SheetTitle>
          <SheetDescription>
            Add a new custom attribute to your library
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
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

          <div className="space-y-3">
            <Label>Applies to *</Label>
            <p className="text-xs text-muted-foreground">
              Select categories where this attribute will be available
            </p>
            <div className="space-y-2 border rounded-lg p-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {category.name}
                    {category.id === currentCategoryId && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (current)
                      </span>
                    )}
                  </Label>
                  <Switch
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Attribute</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
