import { useAttributeStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function CategorySidebar() {
  const { categories, currentCategoryId, setCurrentCategory } =
    useAttributeStore();

  return (
    <div className="w-[280px] border-r bg-muted/30 p-4">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Categories
      </h2>
      <div className="space-y-1">
        {categories.map((category: Category) => (
          <button
            key={category.id}
            onClick={() => setCurrentCategory(category.id)}
            className={cn(
              "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentCategoryId === category.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-foreground"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
