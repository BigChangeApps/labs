import { useState, useMemo } from "react";
import { SearchBar } from "@/labs/components/SearchBar";
import { PrototypeGrid } from "@/labs/components/PrototypeGrid";
import {
  prototypes,
  searchPrototypes,
  getAllTags,
} from "@/labs/data/prototypes";
import { Separator } from "@/registry/ui/separator";

export default function Labs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = useMemo(() => getAllTags(prototypes), []);

  const filteredPrototypes = useMemo(() => {
    let results = prototypes;

    // Apply search filter
    if (searchQuery) {
      results = searchPrototypes(searchQuery, results);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      results = results.filter((prototype) =>
        selectedTags.every((tag) => prototype.tags.includes(tag))
      );
    }

    return results;
  }, [searchQuery, selectedTags]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Labs</h1>
              <p className="text-muted-foreground mt-1">
                Design prototype playground
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{filteredPrototypes.length}</span>
              <span>
                {filteredPrototypes.length === 1 ? "prototype" : "prototypes"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Search and Filter */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            selectedTags={selectedTags}
            availableTags={availableTags}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
          />

          <Separator className="bg-border/40" />

          {/* Prototype Grid */}
          <PrototypeGrid prototypes={filteredPrototypes} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Design Prototypes Playground - BigChange</p>
            <p>Aligned with MFE Suite Standards</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
