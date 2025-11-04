import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { useAttributeStore } from "../../lib/store";
import type { CoreAttribute, CoreAttributeSection } from "../../types";
import { AttributeViewDrawer } from "../features/attributes/AttributeViewDrawer";
import { AttributeEditDrawer } from "../features/attributes/AttributeEditDrawer";
import { AttributeAddDrawer } from "../features/attributes/AttributeAddDrawer";
import { AttributeCard, type AttributeCardVariant } from "../features/attributes/AttributeCard";
import { toast } from "sonner";

const sectionLabels: Record<CoreAttributeSection, string> = {
  "asset-info": "Asset Information",
  status: "Status & Condition",
  contact: "Contact & Location",
  dates: "Dates & Lifecycle",
  warranty: "Warranty",
  custom: "Your attributes",
};

const sectionDescriptions: Record<CoreAttributeSection, string> = {
  "asset-info": "Basic information about the asset",
  status: "Status and physical condition",
  contact: "Contact person and physical location",
  dates: "Important dates and lifecycle information",
  warranty: "Warranty information",
  custom: "User-defined attributes",
};

export function CoreAttributes() {
  const { coreAttributes, toggleCoreAttribute, deleteCoreAttribute } = useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<CoreAttribute | null>(null);
  const [deletingAttributeIds, setDeletingAttributeIds] = useState<Set<string>>(new Set());

  // Filter attributes based on search (include all attributes, required and optional)
  // Also include items being deleted so they can animate out
  const filteredAttributes = searchQuery
    ? coreAttributes.filter(
        (attr) =>
          deletingAttributeIds.has(attr.id) ||
          attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coreAttributes;

  // Group attributes by section
  const groupedAttributes = filteredAttributes.reduce((acc, attr) => {
    if (!acc[attr.section]) {
      acc[attr.section] = [];
    }
    acc[attr.section].push(attr);
    return acc;
  }, {} as Record<CoreAttributeSection, CoreAttribute[]>);

  const sections: CoreAttributeSection[] = [
    "asset-info",
    "status",
    "contact",
    "dates",
    "warranty",
    "custom",
  ];

  // Separate collapsible sections from custom
  const collapsibleSections = sections.filter((s) => s !== "custom");

  // Handle opening create drawer
  const handleAddCustomAttribute = () => {
    setCreateDrawerOpen(true);
  };

  // Handle opening detail drawer
  const handleViewDetails = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsDetailDrawerOpen(true);
  };

  // Handle delete from list view
  const handleDeleteClick = (attribute: CoreAttribute) => {
    setAttributeToDelete(attribute);
    setDeleteDialogOpen(true);
  };

  // Handle feedback click
  const handleFeedbackClick = (attribute: CoreAttribute) => {
    // TODO: Implement feedback functionality
    toast.info(`Feedback for "${attribute.label}"`);
  };

  // Determine variant based on attribute properties
  const getAttributeVariant = (attribute: CoreAttribute): AttributeCardVariant => {
    if (attribute.isRequired) {
      return "system";
    }
    if (attribute.section === "custom") {
      return "custom";
    }
    return "predefined";
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
      deleteCoreAttribute(attributeId);
      setDeletingAttributeIds((prev) => {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      });
      toast.success(`Deleted "${attributeLabel}"`);
    }, 300); // Match animation duration
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "700px" }}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Core Attributes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage universal fields that appear on every asset
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCustomAttribute}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add attribute
          </Button>
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
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Collapsible Sections */}
          <Accordion type="multiple" className="w-full">
            {collapsibleSections.map((section) => {
              const attributes = groupedAttributes[section] || [];
              if (attributes.length === 0) return null;

              return (
                <AccordionItem
                  key={section}
                  value={section}
                  className="border rounded-lg mb-4 sm:mb-6 last:mb-0"
                >
                  <AccordionTrigger className="px-3 sm:px-5 hover:no-underline border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full text-left">
                      <div className="space-y-1">
                        <h2 className="font-bold text-base">
                          {sectionLabels[section]}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {sectionDescriptions[section]}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-5">
                    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                      {/* Attributes List */}
                      <div className="rounded-lg border bg-card">
                        {attributes.map((attribute, index) => {
                          const variant = getAttributeVariant(attribute);
                          const isDeleting = deletingAttributeIds.has(attribute.id);
                          const isLast = index === attributes.length - 1;
                          return (
                            <AttributeCard
                              key={attribute.id}
                              attribute={attribute}
                              variant={variant}
                              isEnabled={attribute.isEnabled}
                              onToggle={
                                variant !== "system"
                                  ? () => toggleCoreAttribute(attribute.id)
                                  : undefined
                              }
                              onClick={
                                variant === "custom"
                                  ? () => handleViewDetails(attribute.id)
                                  : undefined
                              }
                              onDelete={
                                variant === "custom"
                                  ? () => handleDeleteClick(attribute)
                                  : undefined
                              }
                              onFeedback={
                                variant !== "custom"
                                  ? () => handleFeedbackClick(attribute)
                                  : undefined
                              }
                              isDeleting={isDeleting}
                              showSeparator={!isLast}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Custom Section - Always visible, not collapsible */}
          {(() => {
            const section = "custom";
            const attributes = groupedAttributes[section] || [];

            return (
              <Card>
                <CardContent className="p-3 sm:p-5">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="font-bold text-base">
                          {sectionLabels[section]}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {sectionDescriptions[section]}
                        </p>
                      </div>
                    </div>

                    {/* Attributes List */}
                    <div className="rounded-lg border bg-card">
                      {attributes.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm mb-4">
                            No attributes yet. Click "Add attribute" to create
                            one.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCustomAttribute}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add attribute
                          </Button>
                        </div>
                      ) : (
                        attributes.map((attribute, index) => {
                          const variant = getAttributeVariant(attribute);
                          const isDeleting = deletingAttributeIds.has(attribute.id);
                          const isLast = index === attributes.length - 1;
                          return (
                            <AttributeCard
                              key={attribute.id}
                              attribute={attribute}
                              variant={variant}
                              isEnabled={attribute.isEnabled}
                              onToggle={
                                variant !== "system"
                                  ? () => toggleCoreAttribute(attribute.id)
                                  : undefined
                              }
                              onClick={
                                variant === "custom"
                                  ? () => handleViewDetails(attribute.id)
                                  : undefined
                              }
                              onDelete={
                                variant === "custom"
                                  ? () => handleDeleteClick(attribute)
                                  : undefined
                              }
                              onFeedback={
                                variant !== "custom"
                                  ? () => handleFeedbackClick(attribute)
                                  : undefined
                              }
                              isDeleting={isDeleting}
                              showSeparator={!isLast}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>

      {/* Create Core Attribute Drawer */}
      <AttributeAddDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        context="core"
      />

      {/* Core Attribute Detail Drawer - Show View or Edit based on attribute type */}
      {selectedAttributeId && (() => {
        const attribute = coreAttributes.find((a: CoreAttribute) => a.id === selectedAttributeId);
        if (attribute?.isRequired) {
          return (
            <AttributeViewDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={setIsDetailDrawerOpen}
              context="core"
            />
          );
        } else {
          return (
            <AttributeEditDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={setIsDetailDrawerOpen}
              context="core"
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
              variant="outline"
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
