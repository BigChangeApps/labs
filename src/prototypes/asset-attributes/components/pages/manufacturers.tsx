import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { useAttributeStore } from "../../lib/store";
import { toast } from "sonner";
import type { Manufacturer, Model } from "../../types";
import { CreateManufacturerDrawer } from "../features/manufacturers/create-manufacturer-drawer";
import { EditManufacturerDrawer } from "../features/manufacturers/edit-manufacturer-drawer";

export function Manufacturers() {
  const { manufacturers, addManufacturer, deleteManufacturer, addModel } =
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

  const handleDeleteManufacturer = (manufacturerId: string) => {
    const manufacturer = manufacturers.find(
      (m: Manufacturer) => m.id === manufacturerId
    );
    if (!manufacturer) return;

    if (confirm(`Delete ${manufacturer.name}? This action cannot be undone.`)) {
      deleteManufacturer(manufacturerId);
      toast.success("Manufacturer deleted");
    }
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "700px" }}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Manufacturers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage manufacturers and their models for your assets.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manufacturers or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manufacturer
          </Button>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead className="hidden sm:table-cell">Models</TableHead>
                <TableHead className="text-right w-[80px] sm:w-auto">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManufacturers.map((manufacturer: Manufacturer) => (
                <>
                  <TableRow
                    key={manufacturer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(manufacturer.id)}
                  >
                    <TableCell className="p-2 sm:p-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        {expandedRows.has(manufacturer.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{manufacturer.name}</span>
                        {/* Show model count on mobile (inline) */}
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {manufacturer.models.length} model
                          {manufacturer.models.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    {/* Hide models column on mobile */}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {manufacturer.models.length} model
                        {manufacturer.models.length !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-right p-2 sm:p-4">
                      <div className="flex justify-end gap-0.5 sm:gap-1">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteManufacturer(manufacturer.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedRows.has(manufacturer.id) && (
                    <>
                      {manufacturer.models.map((model: Model) => (
                        <TableRow key={model.id} className="bg-muted/30">
                          <TableCell className="p-2 sm:p-4"></TableCell>
                          <TableCell
                            className="pl-6 sm:pl-12 p-2 sm:p-4"
                            colSpan={3}
                          >
                            <span className="text-sm">{model.name}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {manufacturer.models.length === 0 && (
                        <TableRow className="bg-muted/30">
                          <TableCell className="p-2 sm:p-4"></TableCell>
                          <TableCell
                            className="pl-6 sm:pl-12 text-muted-foreground text-sm p-2 sm:p-4"
                            colSpan={3}
                          >
                            No models yet
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </>
              ))}

              {filteredManufacturers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {searchQuery
                      ? "No manufacturers found"
                      : "No manufacturers yet. Add one to get started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
