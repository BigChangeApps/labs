import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Settings, ChevronRight } from "lucide-react";
import { useAttributeStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CategoryManagement() {
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
  const getEnabledAttributeCount = (category: any) => {
    const systemCount =
      category.systemAttributes?.filter((a: any) => a.isEnabled).length || 0;
    const customCount =
      category.customAttributes?.filter((a: any) => a.isEnabled).length || 0;
    return systemCount + customCount;
  };

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const handleAllCategoriesSelect = () => {
    navigate("/core-attributes");
  };

  // Categories list view
  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
          <p className="text-muted-foreground">
            Attributes are used to store extra information about your assets.
          </p>
        </div>

        {/* Core Attributes Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="bg-muted rounded-lg p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-bold text-base">Core attributes</div>
                <div className="text-sm text-muted-foreground">
                  Core attributes apply to all your assets in BigChange
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

        {/* Category Attributes Section */}
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Section Header */}
              <div className="space-y-1">
                <h2 className="font-bold text-base">Category attributes</h2>
                <p className="text-sm text-muted-foreground">
                  Organise the types of data you'd like to collect for certain
                  categories of assets.
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
              <div className="rounded-lg border bg-card">
                {displayCategories.map((category, index) => {
                  const enabledCount = getEnabledAttributeCount(category);

                  return (
                    <div key={category.id}>
                      <div
                        className="flex items-center gap-4 py-3 px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        {/* Content */}
                        <div className="flex-1">
                          <div className="font-medium text-sm text-primary">
                            {category.name}
                          </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-1">
                          {/* Attribute Count */}
                          {enabledCount > 0 && (
                            <div className="px-2 py-1 bg-muted text-xs font-medium text-primary rounded-full">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
