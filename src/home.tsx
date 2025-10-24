import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PrototypeGrid } from "@/components/PrototypeGrid";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { prototypes, searchPrototypes } from "@/data/prototypes";
import { Separator } from "@/registry/ui/separator";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrototypes = useMemo(() => {
    if (!searchQuery) {
      return prototypes;
    }
    return searchPrototypes(searchQuery, prototypes);
  }, [searchQuery]);

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
            <div className="flex items-center gap-6">
              <BrandSwitcher />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{filteredPrototypes.length}</span>
                <span>
                  {filteredPrototypes.length === 1 ? "prototype" : "prototypes"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search prototypes..."
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
