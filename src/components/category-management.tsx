import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Settings,
  Folder,
  ChevronRight,
  ChevronDown,
  Flame,
  Droplets,
  Zap,
  Wrench,
  Building,
  Car,
  Shield,
  Cpu,
  Monitor,
} from "lucide-react";
import { useAttributeStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoreAttributesView } from "./core-attributes-view";

export function CategoryManagement() {
  const {
    categories,
    coreAttributes,
    enableParentInheritance,
    showAlphabeticalCategories,
  } = useAttributeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"list" | "all-categories">(
    "list"
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter((c: { name: string }) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  // Get categories for display based on view mode
  const displayCategories = showAlphabeticalCategories
    ? filteredCategories.sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name)
      )
    : filteredCategories.filter((c: { parentId?: string }) => !c.parentId);

  // Helper function to calculate enabled attribute count for a category
  const getEnabledAttributeCount = (category: any) => {
    const systemCount =
      category.systemAttributes?.filter((a: any) => a.isEnabled).length || 0;
    const customCount =
      category.customAttributes?.filter((a: any) => a.isEnabled).length || 0;
    return systemCount + customCount;
  };

  // Helper function to get appropriate icon for a category
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();

    if (name.includes("heating") || name.includes("hvac")) return Flame;
    if (name.includes("water") || name.includes("plumbing")) return Droplets;
    if (name.includes("electrical") || name.includes("power")) return Zap;
    if (name.includes("maintenance") || name.includes("repair")) return Wrench;
    if (name.includes("building") || name.includes("facility")) return Building;
    if (name.includes("vehicle") || name.includes("transport")) return Car;
    if (name.includes("security") || name.includes("safety")) return Shield;
    if (
      name.includes("computer") ||
      name.includes("it") ||
      name.includes("tech")
    )
      return Cpu;
    if (name.includes("office") || name.includes("equipment")) return Monitor;

    // Default fallback
    return Folder;
  };

  // Helper function to get child category count for a parent
  const getChildCategoryCount = (category: any) => {
    return getChildCategories(category.id).length;
  };

  // Helper function to determine if a category is clickable
  const isCategoryClickable = (category: any) => {
    const hasChildren = category.children && category.children.length > 0;
    // Always clickable if inheritance is enabled, only clickable if it's a leaf node when inheritance is disabled
    return enableParentInheritance || !hasChildren;
  };

  // Helper function to get child categories
  const getChildCategories = (parentId: string) => {
    return filteredCategories.filter((c: any) => c.parentId === parentId);
  };

  // Helper function to toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const handleAllCategoriesSelect = () => {
    setSelectedView("all-categories");
  };

  const handleBackToList = () => {
    setSelectedView("list");
  };

  // Count enabled core attributes
  const enabledCoreAttributesCount = coreAttributes.filter(
    (attr) => attr.isEnabled
  ).length;

  // New list view with "All Categories" option
  if (selectedView === "all-categories") {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-6">
        <div className="space-y-6">
          {/* Back button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </div>

          {/* Core Attributes View */}
          <CoreAttributesView />
        </div>
      </div>
    );
  }

  // Categories list view
  return (
    <div className="container max-w-4xl mx-auto py-8 px-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
            <p className="text-muted-foreground mt-1">
              Manage core and category-specific attributes
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* All Categories Card */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-start gap-4 py-4 px-4">
              {/* Icon */}
              <div className="mt-1">
                <Settings className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-bold text-sm text-primary">
                  Core Attributes
                </div>
                <div className="text-sm text-muted-foreground">
                  {enabledCoreAttributesCount} attributes
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAllCategoriesSelect}
              >
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card>
          <CardContent className="p-0">
            {showAlphabeticalCategories
              ? /* Alphabetical View */
                displayCategories.map((category, index) => {
                  const enabledCount = getEnabledAttributeCount(category);
                  const CategoryIcon = getCategoryIcon(category.name);

                  return (
                    <div key={category.id}>
                      <div
                        className="flex items-center gap-4 py-4 px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        {/* Icon */}
                        <div>
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="font-bold text-sm text-primary">
                            {category.name}
                          </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-1">
                          {/* Attribute Count */}
                          {enabledCount > 0 && (
                            <div className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded-full">
                              {enabledCount}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="p-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      {index < displayCategories.length - 1 && <Separator />}
                    </div>
                  );
                })
              : /* Hierarchical View */
                displayCategories.map((category, index) => {
                  const childCount = getChildCategoryCount(category);
                  const isClickable = isCategoryClickable(category);
                  const hasChildren =
                    category.children && category.children.length > 0;
                  const isExpanded = expandedCategories.has(category.id);
                  const childCategories = getChildCategories(category.id);
                  const CategoryIcon = getCategoryIcon(category.name);

                  return (
                    <div key={category.id}>
                      <div
                        className={`flex items-start gap-4 py-4 px-4 transition-colors ${
                          hasChildren ? "cursor-pointer hover:bg-muted/50" : ""
                        }`}
                        onClick={
                          hasChildren
                            ? () => toggleCategoryExpansion(category.id)
                            : undefined
                        }
                      >
                        {/* Icon */}
                        <div className="mt-1">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="font-bold text-sm text-primary">
                            {category.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {childCount} categories
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {hasChildren && (
                            <div className="h-8 w-8 flex items-center justify-center">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          {isClickable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategorySelect(category.id);
                              }}
                            >
                              Configure
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Child Categories */}
                      {hasChildren &&
                        isExpanded &&
                        childCategories.length > 0 && (
                          <div className="px-4 pb-4">
                            <div className="ml-6 space-y-2">
                              {childCategories.map((childCategory) => {
                                const enabledCount =
                                  getEnabledAttributeCount(childCategory);
                                const childIsClickable =
                                  isCategoryClickable(childCategory);
                                return (
                                  <div
                                    key={childCategory.id}
                                    className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm text-foreground">
                                        {childCategory.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {enabledCount} attributes
                                      </div>
                                    </div>
                                    {childIsClickable && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleCategorySelect(childCategory.id)
                                        }
                                      >
                                        Configure
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {index < displayCategories.length - 1 && <Separator />}
                    </div>
                  );
                })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
