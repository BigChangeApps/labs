import { useState } from "react";
import {
  Plus,
  Edit,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import { useAttributeStore } from "../../lib/store";
import { toast } from "sonner";
import type { Manufacturer, Model } from "../../types";
import { CreateManufacturerDrawer } from "../features/manufacturers/create-manufacturer-drawer";
import { EditManufacturerDrawer } from "../features/manufacturers/edit-manufacturer-drawer";

export function Manufacturers() {
  const { manufacturers, addManufacturer, addModel } =
    useAttributeStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editDrawerManufacturerId, setEditDrawerManufacturerId] = useState<
    string | null
  >(null);

  // Filter manufacturers based on search query only
  const filteredManufacturers = manufacturers.filter(
    (m: Manufacturer) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.models.some((model: Model) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const toggleRow = (manufacturerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(manufacturerId)) {
      newExpanded.delete(manufacturerId);
    } else {
      newExpanded.add(manufacturerId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddManufacturer = (
    manufacturerName: string,
    models: string[]
  ) => {
    const manufacturerId = addManufacturer(manufacturerName);

    // Add models if any were provided
    models.forEach((modelName) => {
      addModel(manufacturerId, modelName);
    });

    if (models.length > 0) {
      toast.success(
        `${manufacturerName} added with ${models.length} model${
          models.length !== 1 ? "s" : ""
        }`
      );
    } else {
      toast.success(`${manufacturerName} added`);
    }

    setIsDrawerOpen(false);
  };

  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Manufacturers
            </h1>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Manufacturer
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-10">
          {/* Manufacturers Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search manufacturers or models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Manufacturers List */}
            <Card>
              <CardContent className="p-0">
                {filteredManufacturers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">
                      {searchQuery
                        ? "No manufacturers found"
                        : "No manufacturers yet. Add one to get started."}
                    </p>
                  </div>
                ) : (
                  filteredManufacturers.map((manufacturer: Manufacturer, manufacturerIndex: number) => {
                    const isExpanded = expandedRows.has(manufacturer.id);
                    const hasModels = manufacturer.models.length > 0;

                    const isLast = manufacturerIndex === filteredManufacturers.length - 1;
                    const shouldShowHeaderBorder = isExpanded;

                    return (
                      <div key={manufacturer.id}>
                        {/* Manufacturer Header */}
                        <div className={`px-3 sm:px-4 py-3 bg-muted/30 ${shouldShowHeaderBorder ? 'border-b' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                onClick={() => toggleRow(manufacturer.id)}
                                className="flex items-center justify-center h-6 w-6 shrink-0 hover:bg-muted/50 rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                              <div className="text-sm font-bold text-muted-foreground tracking-wide truncate">
                                {manufacturer.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditDrawerManufacturerId(manufacturer.id);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Models - Shown when expanded */}
                        {isExpanded && (
                          <div>
                            {hasModels ? (
                              manufacturer.models.map((model: Model, modelIndex: number) => (
                                <div key={model.id}>
                                  <div className="flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 pl-[44px] sm:pl-[48px] transition-colors hover:bg-muted/50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-hw-text truncate font-normal">
                                        {model.name}
                                      </div>
                                    </div>
                                  </div>
                                  {modelIndex < manufacturer.models.length - 1 && <Separator />}
                                </div>
                              ))
                            ) : (
                              <div className="py-3 px-3 sm:px-4 pl-[44px] sm:pl-[48px] text-muted-foreground text-sm">
                                No models yet
                              </div>
                            )}
                          </div>
                        )}

                        {/* Separator between manufacturers */}
                        {!isLast && <Separator />}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateManufacturerDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleAddManufacturer}
      />

      <EditManufacturerDrawer
        manufacturerId={editDrawerManufacturerId}
        open={editDrawerManufacturerId !== null}
        onOpenChange={(open) => {
          if (!open) setEditDrawerManufacturerId(null);
        }}
      />
    </div>
  );
}
