import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAttributeStore } from "@/lib/store";
import { CreateAttributeDrawer } from "./create-attribute-drawer";
import { toast } from "sonner";

interface UnifiedAddAttributeProps {
  categoryId: string;
}

export function UnifiedAddAttribute({ categoryId }: UnifiedAddAttributeProps) {
  const { categories, attributeLibrary, applyAttributeToCategory } =
    useAttributeStore();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const currentCategory = categories.find((c) => c.id === categoryId);

  // Get already applied attribute IDs for this category
  const appliedAttributeIds = useMemo(() => {
    if (!currentCategory) return new Set<string>();

    const systemIds = currentCategory.systemAttributes.map(
      (a) => a.attributeId
    );
    const customIds = currentCategory.customAttributes.map(
      (a) => a.attributeId
    );

    return new Set([...systemIds, ...customIds]);
  }, [currentCategory]);

  // Filter attributes - only show custom attributes not already applied
  const filteredAttributes = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return attributeLibrary.filter((attr) => {
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
    const attribute = attributeLibrary.find((a) => a.id === attributeId);
    if (!attribute) return;

    applyAttributeToCategory(attributeId, categoryId);
    toast.success(`Added "${attribute.label}"`);
    setIsPopoverOpen(false);
    setSearchQuery("");
  };

  const handleCreateNew = () => {
    setIsPopoverOpen(false);
    setSearchQuery("");
    setIsCreateDrawerOpen(true);
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredAttributes.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredAttributes.map((attr) => (
                  <button
                    key={attr.id}
                    onClick={() => handleApply(attr.id)}
                    className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {attr.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize flex-shrink-0"
                          >
                            {attr.type}
                          </Badge>
                        </div>
                        {attr.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {attr.description}
                          </p>
                        )}
                        {attr.type === "dropdown" && attr.dropdownOptions && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {attr.dropdownOptions.slice(0, 3).map((option) => (
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
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {searchQuery ? (
                  <>
                    <p>No attributes found matching "{searchQuery}"</p>
                    <p className="text-xs mt-1">
                      Try a different search or create a new attribute
                    </p>
                  </>
                ) : (
                  <p>No available attributes</p>
                )}
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-muted/30">
            <button
              onClick={handleCreateNew}
              className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Create New Attribute</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateAttributeDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
      />
    </>
  );
}
