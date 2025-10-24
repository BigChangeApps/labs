import { Input } from "@/registry/ui/input";
import { Badge } from "@/registry/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/registry/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export function SearchBar({
  value,
  onChange,
  selectedTags,
  availableTags,
  onTagSelect,
  onTagRemove,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prototypes..."
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="pl-10 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() =>
                  isSelected ? onTagRemove(tag) : onTagSelect(tag)
                }
              >
                {tag}
                {isSelected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1.5 hover:bg-transparent"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onTagRemove(tag);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
