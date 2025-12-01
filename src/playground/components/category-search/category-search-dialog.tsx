import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Checkbox } from "@/registry/ui/checkbox";
import { cn } from "@/registry/lib/utils";

interface Category {
  id: string;
  name: string;
  count: number;
  alreadyAdded?: boolean;
}

interface CategorySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alreadyAddedCategories?: string[];
  onAddCategories?: (categoryIds: string[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Mock data based on the Figma design
const baseMockCategories: Category[] = [
  { id: "1", name: "Access Control Doors", count: 80, alreadyAdded: false },
  { id: "2", name: "Acoustic Doors", count: 45, alreadyAdded: false },
  { id: "3", name: "Actuators", count: 0, alreadyAdded: false },
  { id: "4", name: "Air Conditioning Units", count: 0, alreadyAdded: false },
  { id: "5", name: "Air Handling Units", count: 0, alreadyAdded: false },
  { id: "6", name: "Automatic Bollards", count: 0, alreadyAdded: false },
  { id: "7", name: "Automatic Gates", count: 0, alreadyAdded: false },
  { id: "8", name: "Bidets", count: 0, alreadyAdded: false },
  { id: "9", name: "Blast Resistant Doors", count: 0, alreadyAdded: false },
];

export function CategorySearchDialog({
  open,
  onOpenChange,
  alreadyAddedCategories = [],
  onAddCategories,
  onSelectionChange,
}: CategorySearchDialogProps) {
  // Apply "already added" state based on provided category IDs
  const mockCategories = useMemo(() => {
    return baseMockCategories.map((category) => ({
      ...category,
      alreadyAdded: alreadyAddedCategories.includes(category.id),
    }));
  }, [alreadyAddedCategories]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedCategories(new Set());
    }
  }, [open]);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedCategories));
    }
  }, [selectedCategories, onSelectionChange]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return mockCategories;
    return mockCategories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, mockCategories]);

  const handleToggleCategory = (categoryId: string, isAlreadyAdded: boolean) => {
    if (isAlreadyAdded) return; // Don't allow toggling already added items

    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleAddCategories = () => {
    const categoryIds = Array.from(selectedCategories);
    console.log("Adding categories:", categoryIds);

    // Call the callback if provided
    if (onAddCategories) {
      onAddCategories(categoryIds);
    }

    setSelectedCategories(new Set());
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedCategories(new Set());
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] p-0 gap-0 h-[570px] flex flex-col">
        {/* Header */}
        <div className="bg-[#fcfcfd] border-b border-hw-border px-5 py-3 flex items-center justify-between rounded-t-lg">
          <DialogTitle className="text-base font-bold text-hw-text">
            Add categories
          </DialogTitle>
          <button
            onClick={handleCancel}
            className="h-5 w-5 rounded-md border border-hw-border bg-white shadow-sm hover:bg-hw-surface-hover flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-hw-text" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-hw-text pointer-events-none" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 border-t border-hw-border overflow-y-auto min-h-0">
          {filteredCategories.map((category) => {
            const isSelected = selectedCategories.has(category.id);
            const isAlreadyAdded = category.alreadyAdded;

            return (
              <div
                key={category.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-hw-border transition-colors",
                  isSelected && !isAlreadyAdded && "bg-[rgba(8,109,255,0.08)]",
                  isAlreadyAdded && "bg-[rgba(26,28,46,0.05)]",
                  !isAlreadyAdded && !isSelected && "hover:bg-hw-surface-hover"
                )}
              >
                <Checkbox
                  checked={isSelected || isAlreadyAdded}
                  disabled={isAlreadyAdded}
                  onCheckedChange={() =>
                    handleToggleCategory(category.id, !!isAlreadyAdded)
                  }
                />
                <label
                  htmlFor={category.id}
                  className={cn(
                    "flex-1 text-sm font-medium text-hw-text leading-5",
                    !isAlreadyAdded && "cursor-pointer"
                  )}
                  onClick={() => handleToggleCategory(category.id, !!isAlreadyAdded)}
                >
                  {category.name} ({category.count})
                </label>
                <div className={cn(
                  "rounded-full px-1.5 py-0.5 shrink-0",
                  isAlreadyAdded ? "bg-[#f4f5fa]" : "invisible"
                )}>
                  <span className="text-xs font-medium text-hw-text-secondary">
                    Already added
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-hw-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {selectedCategories.size > 0 && (
              <span>
                {selectedCategories.size} categor{selectedCategories.size === 1 ? 'y' : 'ies'} to add
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddCategories} disabled={selectedCategories.size === 0}>
              Add categories
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
