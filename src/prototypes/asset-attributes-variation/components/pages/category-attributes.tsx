import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Settings, ChevronRight } from "lucide-react";
import { useAttributeStore } from "../../lib/store";
import { Input } from "@/registry/ui/input";
import { Button } from "@/registry/ui/button";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import type { Category, CategoryAttributeConfig } from "../../types";

export function CategoryAttributes() {
  const { categories } = useAttributeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter((c: { name: string }) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  // Get categories for display - always alphabetical
  const displayCategories = filteredCategories.sort(
    (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
  );

  // Helper function to calculate enabled attribute count for a category
  const getEnabledAttributeCount = (category: Category) => {
    const systemCount =
      category.systemAttributes?.filter((a: CategoryAttributeConfig) => a.isEnabled).length || 0;
    const customCount =
      category.customAttributes?.filter((a: CategoryAttributeConfig) => a.isEnabled).length || 0;
    return systemCount + customCount;
  };

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/asset-attributes-variation/category/${categoryId}`);
  };

  const handleAllCategoriesSelect = () => {
    navigate("/asset-attributes-variation/core-attributes");
  };

  // Categories list view
  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Attributes
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-10">
          {/* Core Attributes Card */}
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Icon */}
                <div className="bg-muted rounded-lg p-2">
                  <Settings className="h-5 w-5 text-hw-text" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="font-medium text-sm">Manage core attributes</div>
                  <div className="text-sm text-muted-foreground">
                    Manage the attributes that apply to all your assets
                  </div>
                </div>

                {/* Actions */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAllCategoriesSelect}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Attributes Section */}
          <div className="space-y-3 sm:space-y-4">
          {/* Section Header */}
          <div className="space-y-2 pb-2">
            <h2 className="font-medium text-lg">Category attributes</h2>
            <p className="text-sm text-muted-foreground ">
            Different asset categories may need their own data fields. Use category attributes to 
            define and manage the information that’s unique to each type, helping you keep your assets organised.
            </p>
          </div>

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

          {/* Categories List */}
          <Card>
            <CardContent className="p-0">
              {displayCategories.map((category, index) => {
                const enabledCount = getEnabledAttributeCount(category);

                return (
                  <div key={category.id}>
                    <div
                      className="flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-hw-text truncate">
                          {category.name}
                        </div>
                      </div>

                      {/* Right side actions */}
                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                        {/* Attribute Count */}
                        {enabledCount > 0 && (
                          <div className="px-2 py-1 bg-muted text-xs font-medium text-hw-text rounded-full">
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
              })}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
