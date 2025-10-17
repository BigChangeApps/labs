import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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
import { CreateAttributeDrawer } from "./create-attribute-drawer";
import { EditAttributeDrawer } from "./edit-attribute-drawer";
import { toast } from "sonner";
import type { Attribute, Category } from "@/types";

export function AttributeLibrary() {
  const { attributeLibrary, categories, deleteAttribute, currentCategoryId } =
    useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null
  );

  // Filter to show only custom attributes (not system attributes)
  const customAttributesOnly = attributeLibrary.filter(
    (attr: Attribute) => !attr.isSystem
  );

  const filteredAttributes = customAttributesOnly.filter((attr: Attribute) => {
    const query = searchQuery.toLowerCase();
    return (
      attr.label.toLowerCase().includes(query) ||
      attr.description?.toLowerCase().includes(query) ||
      attr.type.toLowerCase().includes(query)
    );
  });

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => categories.find((c: Category) => c.id === id)?.name)
      .filter(Boolean);
  };

  const handleDelete = (attributeId: string, label: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${label}"? This will remove it from all categories.`
      )
    ) {
      deleteAttribute(attributeId);
      toast.success(`Deleted attribute "${label}"`);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-3">
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Attribute
          </Button>
        </div>

        {filteredAttributes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? (
              <p>No attributes found matching "{searchQuery}"</p>
            ) : (
              <div className="space-y-2">
                <p>No custom attributes in library yet.</p>
                <p className="text-sm">
                  Create your first attribute to get started.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Applied To</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.map((attr: Attribute) => {
                  const appliedCategories = getCategoryNames(
                    attr.appliedToCategories
                  );

                  return (
                    <TableRow key={attr.id}>
                      <TableCell className="font-medium">
                        {attr.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {attr.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {attr.description || "—"}
                      </TableCell>
                      <TableCell>
                        {appliedCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {appliedCategories.map((name) => (
                              <Badge
                                key={name}
                                variant="secondary"
                                className="text-xs"
                              >
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not applied
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingAttributeId(attr.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(attr.id, attr.label)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateAttributeDrawer
          open={isCreateDrawerOpen}
          onOpenChange={setIsCreateDrawerOpen}
          categoryId={currentCategoryId}
        />

        {editingAttributeId && (
          <EditAttributeDrawer
            attributeId={editingAttributeId}
            open={!!editingAttributeId}
            onOpenChange={(open) => !open && setEditingAttributeId(null)}
          />
        )}
      </div>
    </div>
  );
}
