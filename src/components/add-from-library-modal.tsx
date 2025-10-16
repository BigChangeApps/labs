import { useState, useMemo } from "react";
import { Search, Plus, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAttributeStore } from "@/lib/store";
import { toast } from "sonner";

interface AddFromLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFromLibraryModal({
  open,
  onOpenChange,
}: AddFromLibraryModalProps) {
  const {
    currentCategoryId,
    categories,
    attributeLibrary,
    applyAttributeToCategory,
  } = useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = categories.find((c) => c.id === currentCategoryId);

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

  // Filter attributes
  const filteredAttributes = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return attributeLibrary.filter((attr) => {
      // Don't show already applied attributes
      if (appliedAttributeIds.has(attr.id)) return false;

      // Search filter
      if (
        query &&
        !attr.label.toLowerCase().includes(query) &&
        !attr.description?.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [attributeLibrary, appliedAttributeIds, searchQuery]);

  const systemAttributes = filteredAttributes.filter((a) => a.isSystem);
  const customAttributes = filteredAttributes.filter((a) => !a.isSystem);

  const handleApply = (attributeId: string) => {
    const attribute = attributeLibrary.find((a) => a.id === attributeId);
    if (!attribute) return;

    if (attribute.isSystem) {
      toast.error("Cannot apply system attributes to other categories");
      return;
    }

    applyAttributeToCategory(attributeId, currentCategoryId);
    toast.success(`${attribute.label} added to ${currentCategory?.name}`);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add from Library</DialogTitle>
          <DialogDescription>
            Search and add existing attributes to {currentCategory?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {systemAttributes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                System Attributes
              </h3>
              <div className="space-y-2">
                {systemAttributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {attr.label}
                          </span>
                          <Badge variant="muted" className="text-xs">
                            System
                          </Badge>
                        </div>
                        {attr.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {attr.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {attr.type}
                      </Badge>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-4">
                            <Button variant="ghost" size="sm" disabled>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cannot be applied to other categories</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
          )}

          {systemAttributes.length > 0 && customAttributes.length > 0 && (
            <Separator />
          )}

          {customAttributes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Custom Attributes
              </h3>
              <div className="space-y-2">
                {customAttributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {attr.label}
                          </span>
                          <Badge variant="default" className="text-xs">
                            Custom
                          </Badge>
                          {attr.appliedToCategories.length >= 3 && (
                            <Badge variant="amber" className="text-xs">
                              Shared ({attr.appliedToCategories.length})
                            </Badge>
                          )}
                        </div>
                        {attr.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {attr.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {attr.type}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApply(attr.id)}
                      className="ml-4"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAttributes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No attributes found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
