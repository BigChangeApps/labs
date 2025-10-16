import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface CategoryTreeSelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onSelectionChange: (categoryIds: string[]) => void;
  currentCategoryId?: string;
}

interface TreeNodeProps {
  category: Category;
  categories: Category[];
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
  level: number;
  currentCategoryId?: string;
  searchQuery: string;
}

function TreeNode({
  category,
  categories,
  selectedCategories,
  onToggle,
  level,
  currentCategoryId,
  searchQuery,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  const isCurrent = currentCategoryId === category.id;

  const childCategories = hasChildren
    ? categories.filter((c) => category.children?.includes(c.id))
    : [];

  // Filter logic - hide if doesn't match search
  const matchesSearch = searchQuery
    ? category.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const hasMatchingChildren = searchQuery
    ? childCategories.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : false;

  // Don't render if no match and no matching children
  if (!matchesSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors group hover:bg-muted",
          isCurrent && "bg-primary/5"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-background rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Checkbox
          id={`category-checkbox-${category.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(category.id)}
        />
        <Label
          htmlFor={`category-checkbox-${category.id}`}
          className="flex-1 text-sm font-normal cursor-pointer"
        >
          {category.name}
          {isCurrent && (
            <span className="text-xs text-muted-foreground ml-2">
              (current)
            </span>
          )}
        </Label>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childCategories.map((childCategory) => (
            <TreeNode
              key={childCategory.id}
              category={childCategory}
              categories={categories}
              selectedCategories={selectedCategories}
              onToggle={onToggle}
              level={level + 1}
              currentCategoryId={currentCategoryId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeSelector({
  categories,
  selectedCategories,
  onSelectionChange,
  currentCategoryId,
}: CategoryTreeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all descendant IDs recursively
  const getAllDescendants = (categoryId: string): string[] => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category?.children?.length) return [];

    const descendants = [...category.children];
    category.children.forEach((childId) => {
      descendants.push(...getAllDescendants(childId));
    });
    return descendants;
  };

  const toggleCategory = (categoryId: string) => {
    const descendants = getAllDescendants(categoryId);

    if (selectedCategories.includes(categoryId)) {
      // Unchecking: remove this category and all descendants
      onSelectionChange(
        selectedCategories.filter(
          (id) => id !== categoryId && !descendants.includes(id)
        )
      );
    } else {
      // Checking: add this category and all descendants
      const newSelections = [
        ...selectedCategories,
        categoryId,
        ...descendants.filter((id) => !selectedCategories.includes(id)),
      ];
      onSelectionChange(newSelections);
    }
  };

  const removeCategory = (categoryId: string) => {
    const descendants = getAllDescendants(categoryId);
    // Remove this category and all descendants
    onSelectionChange(
      selectedCategories.filter(
        (id) => id !== categoryId && !descendants.includes(id)
      )
    );
  };

  const selectedCategoryNames = categories
    .filter((c) => selectedCategories.includes(c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  // Get root categories (those without a parent)
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Applies to *</Label>
        <span className="text-xs text-muted-foreground">
          {selectedCategories.length} selected
        </span>
      </div>

      {/* Selected Categories as Badges */}
      {selectedCategoryNames.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
          {selectedCategoryNames.map((cat) => (
            <Badge
              key={cat.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1"
            >
              {cat.name}
              <button
                onClick={() => removeCategory(cat.id)}
                className="ml-1 rounded-sm hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Categories Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {selectedCategories.length === 0
              ? "Select Categories"
              : "Add More Categories"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b space-y-2">
            <div className="font-medium text-sm">Select Categories</div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {rootCategories.map((category) => (
              <TreeNode
                key={category.id}
                category={category}
                categories={categories}
                selectedCategories={selectedCategories}
                onToggle={toggleCategory}
                level={0}
                currentCategoryId={currentCategoryId}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        Select categories where this attribute will be available
      </p>
    </div>
  );
}
