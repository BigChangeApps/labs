import { useState, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useAttributeStore } from "../../../lib/store";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import { Button } from "@/registry/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import type { Category } from "../../../types";

interface CategorySelectionProps {
  onSelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export function CategorySelection({
  onSelect,
  selectedCategoryId,
}: CategorySelectionProps) {
  const { categories } = useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);


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
      return {
        filteredTree: categoryTree,
        filteredChildrenMap: new Map<string, Category[]>(),
      };
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
    onSelect(categoryId);
    setIsDialogOpen(false);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const renderCategoryItem = (category: Category, isChild: boolean = false) => {
    const isSelected = category.id === selectedCategoryId;

    return (
      <div
        key={category.id}
        className={`flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer rounded-lg ${
          isChild ? "pl-6 sm:pl-8" : ""
        } ${isSelected ? "bg-muted" : ""}`}
        onClick={() => handleCategorySelect(category.id)}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div
            className={`text-sm truncate ${
              isChild ? "font-normal" : "font-medium"
            }`}
          >
            {category.name}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  };

  return (
    <>
      {/* Category Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Category</DialogTitle>
            <DialogDescription>
              Choose a category for your asset
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Search bar */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories Tree */}
            <div className="flex-1 overflow-y-auto">
              <Card>
                <CardContent className="p-0">
                  {filteredTree.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">
                        No categories found
                      </p>
                    </div>
                  ) : (
                    filteredTree.map((parent: Category, parentIndex: number) => {
                      const children =
                        searchQuery && filteredChildrenMap.has(parent.id)
                          ? filteredChildrenMap.get(parent.id)!
                          : categories.filter(
                              (c: Category) => c.parentId === parent.id
                            );
                      const hasChildren = children.length > 0;

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
                          {(() => {
                            const isSelected = parent.id === selectedCategoryId;
                            return (
                              <div
                                className={`flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer rounded-lg pl-6 sm:pl-8 ${
                                  isSelected ? "bg-muted" : ""
                                }`}
                                onClick={() => handleCategorySelect(parent.id)}
                              >
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                  <div className="text-sm text-hw-text truncate font-normal">
                                    All {parent.name}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            );
                          })()}

                          {/* Children Categories */}
                          {hasChildren && (
                            <div>
                              {children.map(
                                (child: Category, childIndex: number) => (
                                  <div key={child.id}>
                                    {childIndex === 0 && <Separator />}
                                    {renderCategoryItem(child, true)}
                                    {childIndex < children.length - 1 && (
                                      <Separator />
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Selection Button/Display */}
      {selectedCategory ? (
        <Button
          variant="link"
          onClick={() => setIsDialogOpen(true)}
          className="text-primary p-0 h-auto"
        >
          Change type
        </Button>
      ) : (
        <Button onClick={() => setIsDialogOpen(true)} variant="default">
          Select Category
        </Button>
      )}
    </>
  );
}

