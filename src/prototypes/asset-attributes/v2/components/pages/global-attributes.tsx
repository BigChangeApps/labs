import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card } from "@/registry/ui/card";
import { Input } from "@/registry/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAttributeStore } from "../../lib/store";
import type { GlobalAttribute, GlobalAttributeSection } from "../../types";
import { AttributeViewDrawer } from "../features/attributes/AttributeViewDrawer";
import { AttributeEditDrawer } from "../features/attributes/AttributeEditDrawer";
import { AttributeCard, type AttributeCardVariant } from "../features/attributes/AttributeCard";
import { InlineAttributeAddCard } from "../features/attributes/InlineAttributeAddCard";
import { InlineAttributeEditCard } from "../features/attributes/InlineAttributeEditCard";
import { AttributeAddDrawer } from "../features/attributes/AttributeAddDrawer";
import { AttributeAddSidebar } from "../features/attributes/AttributeAddSidebar";
import { useInlineAttributeForms, useSidebarAttributeForms } from "../../lib/use-category-add-button";
import { toast } from "sonner";

// Sortable wrapper component for AttributeCard
function SortableGlobalAttributeCard({
  attribute,
  variant,
  onToggle,
  onClick,
  isDeleting,
}: {
  attribute: GlobalAttribute;
  variant: AttributeCardVariant;
  onToggle?: () => void;
  onClick: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attribute.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AttributeCard
        attribute={attribute}
        variant={variant}
        isEnabled={attribute.isEnabled}
        onToggle={onToggle}
        onClick={onClick}
        isDeleting={isDeleting}
        showSeparator={false}
        isDraggable={true}
        dragHandleProps={listeners}
      />
    </div>
  );
}

const sectionLabels: Record<GlobalAttributeSection, string> = {
  "asset-info": "Asset info",
  status: "Status and condition",
  contact: "Location",
  dates: "Dates and lifecycle",
  warranty: "Warranty",
  custom: "Custom",
  "your-attributes": "Your attributes",
};

export function GlobalAttributes() {
  const { globalAttributes, toggleGlobalAttribute, deleteGlobalAttribute, reorderGlobalAttributes, addGlobalAttribute, editGlobalAttribute } = useAttributeStore();
  const useInlineForms = useInlineAttributeForms();
  const useSidebarForms = useSidebarAttributeForms();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToSection, setAddingToSection] = useState<GlobalAttributeSection | null>(null);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<GlobalAttribute | null>(null);
  const [deletingAttributeIds, setDeletingAttributeIds] = useState<Set<string>>(new Set());

  // Hide fundamental system attributes (Category and Asset ID) and Location section
  const hiddenAttributes = ["Category", "Asset ID", "Site", "Location"];

  // Filter attributes based on search (include all attributes, required and optional)
  // Also include items being deleted so they can animate out
  const filteredAttributes = (searchQuery
    ? globalAttributes.filter(
        (attr) =>
          deletingAttributeIds.has(attr.id) ||
          attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : globalAttributes
  ).filter((attr) => !hiddenAttributes.includes(attr.label));

  // Group attributes by section
  const groupedAttributes = filteredAttributes.reduce((acc, attr) => {
    if (!acc[attr.section]) {
      acc[attr.section] = [];
    }
    acc[attr.section].push(attr);
    return acc;
  }, {} as Record<GlobalAttributeSection, GlobalAttribute[]>);

  const sections: GlobalAttributeSection[] = [
    "asset-info",
    "dates",
    "warranty",
  ];

  // Handle opening detail/edit view
  const handleViewDetails = (attributeId: string) => {
    const attribute = globalAttributes.find((a) => a.id === attributeId);
    if (!attribute) return;

    const variant = getAttributeVariant(attribute);

    // For custom attributes with inline forms enabled, use inline edit
    if (useInlineForms && variant === "custom") {
      setEditingAttributeId(attributeId);
    } else {
      // Use drawer/modal for system, predefined, or when inline forms disabled
      setSelectedAttributeId(attributeId);
      setIsDetailDrawerOpen(true);
    }
  };

  // Handle inline edit save
  const handleInlineEditSave = (attributeId: string, data: {
    label: string;
    type: string;
    description?: string;
    dropdownOptions?: string[];
    measurementCategory?: string;
    measurementUnit?: string;
    currency?: string;
  }) => {
    editGlobalAttribute(attributeId, {
      label: data.label,
      type: data.type as GlobalAttribute["type"],
      description: data.description,
      dropdownOptions: data.dropdownOptions,
      measurementConfig: data.measurementCategory && data.measurementUnit
        ? { category: data.measurementCategory as GlobalAttribute["measurementConfig"] extends { category: infer C } ? C : never, unit: data.measurementUnit }
        : undefined,
      currencyConfig: data.currency
        ? { currency: data.currency }
        : undefined,
    });

    setEditingAttributeId(null);
    toast.success(`Updated "${data.label}"`);
  };

  // Handle inline edit delete
  const handleInlineEditDelete = (attributeId: string) => {
    const attribute = globalAttributes.find((a) => a.id === attributeId);
    if (!attribute) return;

    setDeletingAttributeIds((prev) => new Set(prev).add(attributeId));
    setEditingAttributeId(null);

    setTimeout(() => {
      deleteGlobalAttribute(attributeId);
      setDeletingAttributeIds((prev) => {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      });
      toast.success(`Deleted "${attribute.label}"`);
    }, 300);
  };

  // Determine variant based on attribute properties
  const getAttributeVariant = (attribute: GlobalAttribute): AttributeCardVariant => {
    if (attribute.isRequired) {
      return "system";
    }
    // Check if it's a custom attribute (created by user)
    if (attribute.id.startsWith("global-custom-")) {
      return "custom";
    }
    return "predefined";
  };

  // Handle inline add save
  const handleInlineSave = (data: {
    label: string;
    type: string;
    description?: string;
    dropdownOptions?: string[];
    section: GlobalAttributeSection;
    measurementCategory?: string;
    measurementUnit?: string;
    currency?: string;
  }) => {
    addGlobalAttribute({
      label: data.label,
      type: data.type as GlobalAttribute["type"],
      description: data.description,
      dropdownOptions: data.dropdownOptions,
      section: data.section,
      isRequired: false,
      isEnabled: true,
      measurementConfig: data.measurementCategory && data.measurementUnit
        ? { category: data.measurementCategory as GlobalAttribute["measurementConfig"] extends { category: infer C } ? C : never, unit: data.measurementUnit }
        : undefined,
      currencyConfig: data.currency
        ? { currency: data.currency }
        : undefined,
    });

    setAddingToSection(null);
    toast.success(`Added "${data.label}"`);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (!attributeToDelete) return;
    
    // Add to deleting set to trigger exit animation
    setDeletingAttributeIds((prev) => new Set(prev).add(attributeToDelete.id));
    
    // Close dialog immediately
    setDeleteDialogOpen(false);
    const attributeLabel = attributeToDelete.label;
    const attributeId = attributeToDelete.id;
    setAttributeToDelete(null);
    
    // Wait for animation to complete, then remove from store and deleting set
    setTimeout(() => {
      deleteGlobalAttribute(attributeId);
      setDeletingAttributeIds((prev) => {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      });
      toast.success(`Deleted "${attributeLabel}"`);
    }, 300); // Match animation duration
  };

  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Global attributes
            </h1>
            {!useInlineForms && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddDrawerOpen(true)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage universal fields that appear on every asset
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Attributes by Section */}
        <div className="w-full space-y-8 sm:space-y-10">
          {sections.map((section) => {
            const attributes = groupedAttributes[section] || [];
            if (attributes.length === 0) return null;

            // Handle drag end for this section - all attributes can be reordered
            const handleSectionDragEnd = (event: DragEndEvent) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;

              const oldIndex = attributes.findIndex((a) => a.id === active.id);
              const newIndex = attributes.findIndex((a) => a.id === over.id);
              const reordered = arrayMove(attributes, oldIndex, newIndex);

              reorderGlobalAttributes(section, reordered.map((a) => a.id));
            };

            const isAddingToThisSection = addingToSection === section;

            return (
              <div key={section} className="space-y-3 sm:space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base">
                    {sectionLabels[section]}
                  </h2>
                  {useInlineForms && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingToSection(section)}
                      disabled={addingToSection !== null || editingAttributeId !== null}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  )}
                </div>

                {/* All Attributes (all draggable) */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSectionDragEnd}
                >
                  <SortableContext
                    items={attributes.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Card className="divide-y overflow-hidden">
                      {attributes.map((attribute) => {
                        const variant = getAttributeVariant(attribute);
                        const isDeleting = deletingAttributeIds.has(attribute.id);
                        const isEditing = editingAttributeId === attribute.id;

                        // Show inline edit card for this attribute
                        if (isEditing && useInlineForms) {
                          return (
                            <InlineAttributeEditCard
                              key={attribute.id}
                              attribute={attribute}
                              onSave={(data) => handleInlineEditSave(attribute.id, data)}
                              onDelete={() => handleInlineEditDelete(attribute.id)}
                              onCancel={() => setEditingAttributeId(null)}
                            />
                          );
                        }

                        return (
                          <SortableGlobalAttributeCard
                            key={attribute.id}
                            attribute={attribute}
                            variant={variant}
                            onToggle={
                              variant !== "system"
                                ? () => toggleGlobalAttribute(attribute.id)
                                : undefined
                            }
                            onClick={() => handleViewDetails(attribute.id)}
                            isDeleting={isDeleting}
                          />
                        );
                      })}

                      {/* Inline Add Card */}
                      {isAddingToThisSection && useInlineForms && (
                        <InlineAttributeAddCard
                          section={section}
                          onSave={handleInlineSave}
                          onCancel={() => setAddingToSection(null)}
                        />
                      )}
                    </Card>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Drawer/Sidebar (for non-inline mode) */}
      {!useInlineForms && useSidebarForms && (
        <AttributeAddSidebar
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          context="global"
        />
      )}
      {!useInlineForms && !useSidebarForms && (
        <AttributeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          context="global"
        />
      )}

      {/* Global Attribute Detail Drawer - Show View or Edit based on attribute type */}
      {selectedAttributeId && (() => {
        const attribute = globalAttributes.find((a: GlobalAttribute) => a.id === selectedAttributeId);
        // Don't render drawer if attribute was deleted
        if (!attribute) return null;
        const variant = getAttributeVariant(attribute);

        // System and predefined attributes are view-only, custom attributes are editable
        if (variant === "system" || variant === "predefined") {
          return (
            <AttributeViewDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={(open) => {
                setIsDetailDrawerOpen(open);
                if (!open) {
                  setSelectedAttributeId(null);
                }
              }}
              context="global"
            />
          );
        } else {
          return (
            <AttributeEditDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={(open) => {
                setIsDetailDrawerOpen(open);
                if (!open) {
                  setSelectedAttributeId(null);
                }
              }}
              context="global"
            />
          );
        }
      })()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {attributeToDelete?.label}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attribute? This will remove
              the attribute and any associated data. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAttributeToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



