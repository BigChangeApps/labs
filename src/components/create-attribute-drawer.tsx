import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttributeStore } from "@/lib/store";
import type {
  AttributeType,
  Category,
  CategoryAttributeConfig,
  Attribute,
} from "@/types";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
  const {
    categories,
    attributeLibrary,
    addAttribute,
    applyAttributeToCategory,
  } = useAttributeStore();

  // State for Create New tab
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [description, setDescription] = useState("");
  const [isPreferred, setIsPreferred] = useState(false);
  const [units, setUnits] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState("");

  // State for Add from Library tab
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = categories.find((c: Category) => c.id === categoryId);

  // Get already applied attribute IDs for this category
  const appliedAttributeIds = useMemo(() => {
    if (!currentCategory) return new Set<string>();

    const systemIds = currentCategory.systemAttributes.map(
      (a: CategoryAttributeConfig) => a.attributeId
    );
    const customIds = currentCategory.customAttributes.map(
      (a: CategoryAttributeConfig) => a.attributeId
    );

    return new Set([...systemIds, ...customIds]);
  }, [currentCategory]);

  // Filter attributes - only show custom attributes not already applied
  const filteredAttributes = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return attributeLibrary.filter((attr: Attribute) => {
      // Only show custom attributes
      if (attr.isSystem) return false;

      // Don't show already applied attributes
      if (appliedAttributeIds.has(attr.id)) return false;

      // Search filter
      if (query) {
        return (
          attr.label.toLowerCase().includes(query) ||
          attr.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [attributeLibrary, appliedAttributeIds, searchQuery]);

  const handleApply = (attributeId: string) => {
    const attribute = attributeLibrary.find(
      (a: Attribute) => a.id === attributeId
    );
    if (!attribute) return;

    applyAttributeToCategory(attributeId, categoryId);
    toast.success(`Added "${attribute.label}"`);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Please enter an attribute label");
      return;
    }

    // Validate dropdown options if type is dropdown
    if (type === "dropdown" && !dropdownOptions.trim()) {
      toast.error("Please enter at least one dropdown option");
      return;
    }

    // Parse dropdown options (split by comma or newline)
    const parsedDropdownOptions =
      type === "dropdown"
        ? dropdownOptions
            .split(/[,\n]/)
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0)
        : undefined;

    addAttribute({
      label: label.trim(),
      type,
      description: description.trim(),
      isPreferred,
      appliedToCategories: [categoryId],
      dropdownOptions: parsedDropdownOptions,
      units: type === "number" && units.trim() ? units.trim() : undefined,
    });

    const categoryName = currentCategory?.name || "category";
    toast.success(`Added to Library and applied to ${categoryName}`);

    // Reset form
    setLabel("");
    setType("text");
    setDescription("");
    setIsPreferred(false);
    setUnits("");
    setDropdownOptions("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLabel("");
    setType("text");
    setDescription("");
    setIsPreferred(false);
    setUnits("");
    setDropdownOptions("");
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Attribute</SheetTitle>
          <SheetDescription>
            Add an existing attribute or create a new one
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Add from Library</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent
            value="library"
            className="flex-1 flex flex-col space-y-4 mt-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredAttributes.length > 0 ? (
                filteredAttributes.map((attr: Attribute) => (
                  <button
                    key={attr.id}
                    onClick={() => handleApply(attr.id)}
                    className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {attr.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {attr.type}
                          </Badge>
                        </div>
                        {attr.description && (
                          <p className="text-xs text-muted-foreground">
                            {attr.description}
                          </p>
                        )}
                        {attr.type === "dropdown" && attr.dropdownOptions && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {attr.dropdownOptions
                              .slice(0, 3)
                              .map((option: string) => (
                                <Badge
                                  key={option}
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  {option}
                                </Badge>
                              ))}
                            {attr.dropdownOptions.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{attr.dropdownOptions.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {searchQuery ? (
                    <>
                      <p>No attributes found matching "{searchQuery}"</p>
                      <p className="text-xs mt-1">
                        Try a different search or create a new attribute
                      </p>
                    </>
                  ) : (
                    <p>No available attributes in library</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="create"
            className="flex-1 flex flex-col space-y-6 mt-4"
          >
            <div className="overflow-y-auto space-y-6">
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

              {type === "dropdown" && (
                <div className="space-y-2">
                  <Label htmlFor="dropdownOptions">Dropdown Options *</Label>
                  <textarea
                    id="dropdownOptions"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter options (comma-separated or one per line)"
                    value={dropdownOptions}
                    onChange={(e) => setDropdownOptions(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate options with commas or line breaks
                  </p>
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
                <Switch
                  checked={isPreferred}
                  onCheckedChange={setIsPreferred}
                />
              </div>
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Attribute</Button>
            </SheetFooter>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
