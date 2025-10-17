import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAttributeStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { CategoryTree } from "./category-tree";

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

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
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
      </div>
    </div>
  );
}
