import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAttributeStore } from "@/lib/store";

interface CategoryTreeProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  rootCategoryId?: string;
}

interface TreeNodeProps {
  category: Category;
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  level: number;
}

function TreeNode({
  category,
  categories,
  onCategorySelect,
  level,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { enableParentInheritance } = useAttributeStore();
  const hasChildren = category.children && category.children.length > 0;

  const childCategories = hasChildren
    ? categories.filter((c) => category.children?.includes(c.id))
    : [];

  const getAttributeCount = (cat: Category): number => {
    const systemCount =
      cat.systemAttributes?.filter((a) => a.isEnabled).length || 0;
    const customCount =
      cat.customAttributes?.filter((a) => a.isEnabled).length || 0;
    return systemCount + customCount;
  };

  const attributeCount = getAttributeCount(category);

  // Only show badge if:
  // - Parent inheritance is enabled, OR
  // - Category has no children (is a leaf node)
  const shouldShowBadge = enableParentInheritance || !hasChildren;

  // Determine if category is clickable:
  // - Always clickable if inheritance is enabled
  // - Only clickable if it's a leaf node (no children) when inheritance is disabled
  const isClickable = enableParentInheritance || !hasChildren;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-3 px-2 rounded-md transition-colors group",
          isClickable
            ? "cursor-pointer hover:bg-muted text-foreground"
            : "text-muted-foreground text-sm"
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={() => isClickable && onCategorySelect(category.id)}
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
        <span
          className={cn(
            "flex-1 text-sm text-primary",
            level === 0 ? "font-bold" : "font-medium"
          )}
        >
          {category.name}
        </span>
        {shouldShowBadge && attributeCount > 0 && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {attributeCount}
          </Badge>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0">
          {childCategories.map((childCategory, index) => (
            <div key={childCategory.id}>
              <TreeNode
                category={childCategory}
                categories={categories}
                onCategorySelect={onCategorySelect}
                level={level + 1}
              />
              {index < childCategories.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  onCategorySelect,
  rootCategoryId,
}: CategoryTreeProps) {
  // If rootCategoryId is provided, only show that specific root category
  // Otherwise, show all root categories
  const rootCategories = rootCategoryId
    ? categories.filter((c) => c.id === rootCategoryId)
    : categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-0">
      {rootCategories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          categories={categories}
          onCategorySelect={onCategorySelect}
          level={0}
        />
      ))}
    </div>
  );
}
