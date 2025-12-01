import { useState } from "react";
import { MoreVertical, RotateCcw, X } from "lucide-react";
import { CategorySearchDialog } from "./category-search-dialog";
import { Button } from "@/registry/ui/button";
import { Card } from "@/registry/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";

// Mock category data to get names
const categoryMap: Record<string, { name: string; count: number }> = {
  "1": { name: "Access Control Doors", count: 80 },
  "2": { name: "Acoustic Doors", count: 45 },
  "3": { name: "Actuators", count: 0 },
  "4": { name: "Air Conditioning Units", count: 0 },
  "5": { name: "Air Handling Units", count: 0 },
  "6": { name: "Automatic Bollards", count: 0 },
  "7": { name: "Automatic Gates", count: 0 },
  "8": { name: "Bidets", count: 0 },
  "9": { name: "Blast Resistant Doors", count: 0 },
};

export function CategorySearchDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addedCategories, setAddedCategories] = useState<string[]>([]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  const handleAddCategories = (categoryIds: string[]) => {
    setAddedCategories((prev) => {
      const newCategories = [...prev];
      categoryIds.forEach((id) => {
        if (!newCategories.includes(id)) {
          newCategories.push(id);
        }
      });
      return newCategories;
    });
    setDialogOpen(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setAddedCategories((prev) => prev.filter((id) => id !== categoryId));
    setOpenPopoverId(null);
  };

  const handleReset = () => {
    setAddedCategories([]);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Category Search</h1>
        <p className="text-sm text-muted-foreground">
          Add and manage categories. Click 'Add categories' to select categories, then remove them using the menu on each card.
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={handleOpenDialog} disabled={dialogOpen}>
              Add categories
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={addedCategories.length === 0 && !dialogOpen}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {addedCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Added Categories ({addedCategories.length})
              </h3>
              <div className="grid gap-3">
                {addedCategories.map((categoryId) => {
                  const category = categoryMap[categoryId];
                  if (!category) return null;

                  return (
                    <Card key={categoryId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {category.name}
                          </div>
                          {category.count > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {category.count} items
                            </div>
                          )}
                        </div>
                        <Popover
                          open={openPopoverId === categoryId}
                          onOpenChange={(open) =>
                            setOpenPopoverId(open ? categoryId : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-1" align="end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-destructive hover:text-destructive"
                              onClick={() => handleRemoveCategory(categoryId)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <CategorySearchDialog
            open={dialogOpen}
            onOpenChange={handleDialogOpenChange}
            alreadyAddedCategories={addedCategories}
            onAddCategories={handleAddCategories}
          />
        </div>
      </div>
    </div>
  );
}
