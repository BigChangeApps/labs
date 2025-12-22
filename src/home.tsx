import { useState, useMemo, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PrototypeGrid } from "@/components/PrototypeGrid";
import { getVisiblePrototypes, searchPrototypes } from "@/data/prototypes";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const visiblePrototypes = useMemo(() => getVisiblePrototypes(), []);

  // Set page title
  useEffect(() => {
    document.title = "BigChange Labs";
  }, []);

  const filteredPrototypes = useMemo(() => {
    if (!searchQuery) {
      return visiblePrototypes;
    }
    return searchPrototypes(searchQuery, visiblePrototypes);
  }, [searchQuery, visiblePrototypes]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/bigchange-logo.svg"
              alt="BigChange"
              className="h-6 w-6"
            />
            <span className="text-xl font-semibold tracking-tight">Labs</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            BigChange Labs
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Explore interactive prototypes and design concepts. Test new ideas,
            gather feedback, and shape the future of BigChange products.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-16">
        <div className="space-y-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search prototypes..."
          />

          {/* Prototype Grid */}
          <PrototypeGrid prototypes={filteredPrototypes} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img
              src="/bigchange-logo.svg"
              alt="BigChange"
              className="h-5 w-5 opacity-60"
            />
            <span>BigChange Design Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
