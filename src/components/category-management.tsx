import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle2, ArrowRight } from "lucide-react";
import { useAttributeStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryTree } from "./category-tree";

export function CategoryManagement() {
  const { categories, coreAttributes } = useAttributeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter((c: { name: string }) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  // Count enabled core attributes
  const enabledCoreAttributesCount = coreAttributes.filter(
    (attr) => attr.isEnabled
  ).length;
  const totalCoreAttributes = coreAttributes.length;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
        {/* Core Attributes Card */}
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate("/core-attributes")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Core Attributes</CardTitle>
                <CardDescription>
                  Universal fields that appear on every asset
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/core-attributes");
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {enabledCoreAttributesCount} of {totalCoreAttributes} enabled
            </div>
          </CardContent>
        </Card>

          {/* Category-Specific Attributes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Category-Specific Attributes</CardTitle>
              <CardDescription>
                Manage attributes for specific equipment types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {/* Category Tree */}
              <div className="border rounded-lg p-4 bg-card">
                <CategoryTree
                  categories={filteredCategories}
                  onCategorySelect={handleCategorySelect}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
