import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CategoryTreeProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
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
  const [isExpanded, setIsExpanded] = useState(true);
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

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors group hover:bg-muted text-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onCategorySelect(category.id)}
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
        <span className="flex-1 text-sm">{category.name}</span>
        {attributeCount > 0 && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {attributeCount}
          </Badge>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childCategories.map((childCategory) => (
            <TreeNode
              key={childCategory.id}
              category={childCategory}
              categories={categories}
              onCategorySelect={onCategorySelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  onCategorySelect,
}: CategoryTreeProps) {
  // Get root categories (those without a parent)
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-0.5">
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
