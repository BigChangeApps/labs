import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Plus } from "lucide-react";
import { useAttributeStore } from "../../lib/store";
import { useCategoryAddButton, useParentInheritance } from "../../lib/use-category-add-button";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { CategoryAddDialog } from "../features/attributes/CategoryAddDialog";
import type { Category } from "../../types";

export function Categories() {
  const { categories } = useAttributeStore();
  const navigate = useNavigate();
  const showAddButton = useCategoryAddButton();
  const showParentInheritance = useParentInheritance();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    undefined
  );

  // Check if a category is custom (user-created)
  const isCustomCategory = (categoryId: string) => {
    return categoryId.startsWith("category-");
  };

  // Organize categories into parent-child structure
  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter((c: Category) => !c.parentId);
    const childMap = new Map<string, Category[]>();
    
    // Build child map
    categories.forEach((cat: Category) => {
      if (cat.parentId) {
        if (!childMap.has(cat.parentId)) {
          childMap.set(cat.parentId, []);
        }
        childMap.get(cat.parentId)!.push(cat);
      }
    });

    // Sort children alphabetically
    childMap.forEach((children) => {
      children.sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort parents alphabetically, but put "Other" at the end
    return parentCategories.sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Filter categories based on search query
  const { filteredTree, filteredChildrenMap } = useMemo(() => {
    if (!searchQuery) {
      return { filteredTree: categoryTree, filteredChildrenMap: new Map<string, Category[]>() };
    }

    const query = searchQuery.toLowerCase();
    const filteredParents: Category[] = [];
    const filteredChildrenMap = new Map<string, Category[]>();

    categoryTree.forEach((parent: Category) => {
      const matchesParent = parent.name.toLowerCase().includes(query);
      const matchingChildren: Category[] = [];

      // Check children
      const children = categories.filter(
        (c: Category) => c.parentId === parent.id
      );
      children.forEach((child: Category) => {
        if (child.name.toLowerCase().includes(query)) {
          matchingChildren.push(child);
        }
      });

      // Include parent if it matches or has matching children
      if (matchesParent || matchingChildren.length > 0) {
        filteredParents.push(parent);
        if (matchingChildren.length > 0) {
          filteredChildrenMap.set(parent.id, matchingChildren);
        }
      }
    });

    return { filteredTree: filteredParents, filteredChildrenMap };
  }, [categoryTree, searchQuery, categories]);


  const handleCategorySelect = (categoryId: string) => {
    navigate(`../category/${categoryId}`);
  };

  const handleAddCategory = (e: React.MouseEvent, parentId?: string) => {
    e.stopPropagation();
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  };

  const renderCategoryItem = (category: Category, isChild: boolean = false) => {
    const isCustom = isCustomCategory(category.id);
    
    return (
      <div
        key={category.id}
        className={`flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer rounded-lg ${
          isChild ? "pl-6 sm:pl-8" : ""
        }`}
        onClick={() => handleCategorySelect(category.id)}
      >
        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className={`text-sm text-hw-text truncate ${isChild ? "font-normal" : "font-medium"}`}>
            {category.name}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isCustom && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Custom
            </Badge>
          )}
          {/* Chevron */}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  // Categories list view
  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Categories
            </h1>
            {showAddButton && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => handleAddCategory(e)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            Add new categories whenever you need them, and customise each one with its own attributes. That way you only capture the information that's relevant to those assets.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-10">
          {/* Category Attributes Section */}
          <div className="space-y-3 sm:space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories Tree */}
          <Card>
            <CardContent className="p-0">
              {filteredTree.length === 0 ? (
                <div className="text-center py-8 px-4">
                  {searchQuery ? (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        No search found for '{searchQuery}'
                      </p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSelectedParentId(undefined);
                          setIsAddDialogOpen(true);
                        }}
                        className="text-primary"
                      >
                        Create category
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No categories found</p>
                  )}
                </div>
              ) : showParentInheritance ? (
                // Grouped view: Show parent headers with "All [Category]" and children
                filteredTree.map((parent: Category, parentIndex: number) => {
                  // Use filtered children if searching, otherwise use all children
                  const children = searchQuery && filteredChildrenMap.has(parent.id)
                    ? filteredChildrenMap.get(parent.id)!
                    : categories.filter((c: Category) => c.parentId === parent.id);
                  const hasChildren = children.length > 0;
                  const isCustom = isCustomCategory(parent.id);

                  return (
                    <div key={parent.id}>
                      {/* Divider between groups */}
                      {parentIndex > 0 && <Separator />}

                      {/* Parent Category as Heading */}
                      <div className="px-3 sm:px-4 py-3 border-b bg-muted/30">
                        <div className="text-sm font-bold text-muted-foreground tracking-wide">
                          {parent.name}
                        </div>
                      </div>

                      {/* "All [Category name]" as first item */}
                      <div
                        className="flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer rounded-lg pl-6 sm:pl-8"
                        onClick={() => handleCategorySelect(parent.id)}
                      >
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <div className="text-sm text-hw-text truncate font-normal">
                            All {parent.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCustom && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              Custom
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Children Categories */}
                      {hasChildren && (
                        <div>
                          {children.map((child: Category, childIndex: number) => (
                            <div key={child.id}>
                              {childIndex === 0 && <Separator />}
                              {renderCategoryItem(child, true)}
                              {childIndex < children.length - 1 && <Separator />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Flat view: Just show all children in one list, no groupings
                (() => {
                  const allChildren = categories
                    .filter((c: Category) => c.parentId) // Only categories with a parent (children)
                    .filter((c: Category) => {
                      if (!searchQuery) return true;
                      return c.name.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                  return allChildren.map((child: Category, index: number) => (
                    <div key={child.id}>
                      {index > 0 && <Separator />}
                      {renderCategoryItem(child, false)}
                    </div>
                  ));
                })()
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Add Category Dialog */}
      <CategoryAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        parentId={selectedParentId}
        initialName={searchQuery && filteredTree.length === 0 ? searchQuery : undefined}
      />
    </div>
  );
}

