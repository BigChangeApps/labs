import { PrototypeCard } from "./PrototypeCard";
import type { PrototypeMetadata } from "../data/prototypes";

interface PrototypeGridProps {
  prototypes: PrototypeMetadata[];
}

export function PrototypeGrid({ prototypes }: PrototypeGridProps) {
  if (prototypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4 opacity-20">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No prototypes found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prototypes.map((prototype) => (
        <PrototypeCard key={prototype.id} prototype={prototype} />
      ))}
    </div>
  );
}
