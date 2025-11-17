import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { useAttributeStore } from "../../../lib/store";
import type { Category } from "../../../types";

interface CategoryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

export function CategoryAddDialog({
  open,
  onOpenChange,
  parentId: initialParentId,
}: CategoryAddDialogProps) {
  const { categories, addCategory } = useAttributeStore();
  const [categoryName, setCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    initialParentId
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Get all parent categories (categories without a parent) and sort alphabetically
  const parentCategories = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get selected category name for display
  const selectedCategory = parentCategories.find(
    (c) => c.id === selectedParentId
  );
  const displayValue = selectedCategory
    ? selectedCategory.name
    : "Select an asset category group";

  const handleSubmit = () => {
    if (!categoryName.trim() || !selectedParentId) return;

    addCategory(categoryName.trim(), selectedParentId);
    setCategoryName("");
    setSelectedParentId(initialParentId);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCategoryName("");
    setSelectedParentId(initialParentId);
    setPopoverOpen(false);
    onOpenChange(false);
  };

  const handleSelectParent = (value: string) => {
    setSelectedParentId(value);
    setPopoverOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new category and assign it to an existing asset category group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-category">Assign asset category group</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="parent-category"
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {displayValue}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search asset category group..." />
                  <CommandList>
                    <CommandEmpty>No asset category group found.</CommandEmpty>
                    <CommandGroup>
                      {parentCategories.map((category: Category) => (
                        <CommandItem
                          key={category.id}
                          value={category.id}
                          onSelect={() => handleSelectParent(category.id)}
                        >
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || !selectedParentId}
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

