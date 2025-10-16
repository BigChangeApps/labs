import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttributeStore } from "@/lib/store";
import { toast } from "sonner";

export function ManufacturersView() {
  const {
    manufacturers,
    categories,
    addManufacturer,
    editManufacturer,
    deleteManufacturer,
    addModel,
    editModel,
    deleteModel,
  } = useAttributeStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingManufacturer, setEditingManufacturer] = useState<string | null>(
    null
  );
  const [editingModel, setEditingModel] = useState<{
    manufacturerId: string;
    modelId: string;
  } | null>(null);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newModelName, setNewModelName] = useState<string>("");
  const [addingModelFor, setAddingModelFor] = useState<string | null>(null);
  const [isAddingManufacturer, setIsAddingManufacturer] = useState(false);

  const filteredManufacturers = manufacturers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.models.some((model) =>
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

  const handleAddManufacturer = () => {
    if (!newManufacturerName.trim()) {
      toast.error("Please enter a manufacturer name");
      return;
    }

    addManufacturer(newManufacturerName.trim());
    toast.success(`${newManufacturerName} added`);
    setNewManufacturerName("");
    setIsAddingManufacturer(false);
  };

  const handleEditManufacturer = (manufacturerId: string, name: string) => {
    if (!name.trim()) {
      toast.error("Manufacturer name cannot be empty");
      return;
    }

    editManufacturer(manufacturerId, name.trim());
    toast.success("Manufacturer updated");
    setEditingManufacturer(null);
  };

  const handleDeleteManufacturer = (manufacturerId: string) => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    if (!manufacturer) return;

    if (manufacturer.usedByCategories.length > 0) {
      toast.error("Cannot delete manufacturer in use by categories");
      return;
    }

    if (confirm(`Delete ${manufacturer.name}? This action cannot be undone.`)) {
      deleteManufacturer(manufacturerId);
      toast.success("Manufacturer deleted");
    }
  };

  const handleAddModel = (manufacturerId: string) => {
    if (!newModelName.trim()) {
      toast.error("Please enter a model name");
      return;
    }

    addModel(manufacturerId, newModelName.trim());
    toast.success("Model added");
    setNewModelName("");
    setAddingModelFor(null);
  };

  const handleEditModel = (
    manufacturerId: string,
    modelId: string,
    name: string
  ) => {
    if (!name.trim()) {
      toast.error("Model name cannot be empty");
      return;
    }

    editModel(manufacturerId, modelId, name.trim());
    toast.success("Model updated");
    setEditingModel(null);
  };

  const handleDeleteModel = (manufacturerId: string, modelId: string) => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    const model = manufacturer?.models.find((m) => m.id === modelId);

    if (!manufacturer || !model) return;

    if (confirm(`Delete ${model.name}? This action cannot be undone.`)) {
      deleteModel(manufacturerId, modelId);
      toast.success("Model deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manufacturers or models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAddingManufacturer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Manufacturer
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Models</TableHead>
              <TableHead>Used By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAddingManufacturer && (
              <TableRow>
                <TableCell></TableCell>
                <TableCell colSpan={3}>
                  <Input
                    placeholder="Manufacturer name"
                    value={newManufacturerName}
                    onChange={(e) => setNewManufacturerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddManufacturer();
                      if (e.key === "Escape") {
                        setIsAddingManufacturer(false);
                        setNewManufacturerName("");
                      }
                    }}
                    autoFocus
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={handleAddManufacturer}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingManufacturer(false);
                        setNewManufacturerName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filteredManufacturers.map((manufacturer) => (
              <>
                <TableRow key={manufacturer.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleRow(manufacturer.id)}
                    >
                      {expandedRows.has(manufacturer.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {editingManufacturer === manufacturer.id ? (
                      <Input
                        defaultValue={manufacturer.name}
                        onBlur={(e) =>
                          handleEditManufacturer(
                            manufacturer.id,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditManufacturer(
                              manufacturer.id,
                              e.currentTarget.value
                            );
                          }
                          if (e.key === "Escape") setEditingManufacturer(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{manufacturer.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {manufacturer.models.length} model
                      {manufacturer.models.length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {manufacturer.usedByCategories.length > 0 ? (
                        manufacturer.usedByCategories.map((catId) => {
                          const category = categories.find(
                            (c) => c.id === catId
                          );
                          return category ? (
                            <Badge
                              key={catId}
                              variant="secondary"
                              className="text-xs"
                            >
                              {category.name}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not used
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingManufacturer(manufacturer.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleDeleteManufacturer(manufacturer.id)
                        }
                        disabled={manufacturer.usedByCategories.length > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedRows.has(manufacturer.id) && (
                  <>
                    {manufacturer.models.map((model) => (
                      <TableRow key={model.id} className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell className="pl-12">
                          {editingModel?.manufacturerId === manufacturer.id &&
                          editingModel?.modelId === model.id ? (
                            <Input
                              defaultValue={model.name}
                              onBlur={(e) =>
                                handleEditModel(
                                  manufacturer.id,
                                  model.id,
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditModel(
                                    manufacturer.id,
                                    model.id,
                                    e.currentTarget.value
                                  );
                                }
                                if (e.key === "Escape") setEditingModel(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm">{model.name}</span>
                          )}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setEditingModel({
                                  manufacturerId: manufacturer.id,
                                  modelId: model.id,
                                })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDeleteModel(manufacturer.id, model.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {addingModelFor === manufacturer.id ? (
                      <TableRow className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell className="pl-12" colSpan={3}>
                          <Input
                            placeholder="Model name"
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleAddModel(manufacturer.id);
                              if (e.key === "Escape") {
                                setAddingModelFor(null);
                                setNewModelName("");
                              }
                            }}
                            autoFocus
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddModel(manufacturer.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingModelFor(null);
                                setNewModelName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell className="pl-12" colSpan={4}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAddingModelFor(manufacturer.id);
                              setNewModelName("");
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Model
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </>
            ))}

            {filteredManufacturers.length === 0 && !isAddingManufacturer && (
              <TableRow>
                <TableCell
                  colSpan={5}
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
  );
}
