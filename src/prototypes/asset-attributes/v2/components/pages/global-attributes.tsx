import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { useAttributeStore } from "../../lib/store";
import type { GlobalAttribute, GlobalAttributeSection } from "../../types";
import { AttributeViewDrawer } from "../features/attributes/AttributeViewDrawer";
import { AttributeEditDrawer } from "../features/attributes/AttributeEditDrawer";
import { AttributeAddDrawer } from "../features/attributes/AttributeAddDrawer";
import { AttributeCard, type AttributeCardVariant } from "../features/attributes/AttributeCard";
import { toast } from "sonner";

const sectionLabels: Record<GlobalAttributeSection, string> = {
  "asset-info": "Asset Information",
  status: "Status & Condition",
  contact: "Contact & Location",
  dates: "Dates & Lifecycle",
  warranty: "Warranty",
  custom: "Custom",
  "your-attributes": "Your attributes",
};

export function GlobalAttributes() {
  const { globalAttributes, toggleGlobalAttribute, deleteGlobalAttribute } = useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createDrawerSection, setCreateDrawerSection] = useState<GlobalAttributeSection | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<GlobalAttribute | null>(null);
  const [deletingAttributeIds, setDeletingAttributeIds] = useState<Set<string>>(new Set());

  // Hide fundamental system attributes (Category and Asset ID) and Contact & Location section
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
    "status",
    "contact",
    "dates",
    "warranty",
    "your-attributes",
  ];

  // Handle opening detail drawer
  const handleViewDetails = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsDetailDrawerOpen(true);
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
              Global Attributes
            </h1>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreateDrawerOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add attribute
            </Button>
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

            return (
              <div key={section} className="space-y-3 sm:space-y-4">
                {/* Section Header */}
                <div>
                  <h2 className="font-bold text-base">
                    {sectionLabels[section]}
                  </h2>
                </div>

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
                            ? () => toggleGlobalAttribute(attribute.id)
                            : undefined
                        }
                        onClick={() => handleViewDetails(attribute.id)}
                        isDeleting={isDeleting}
                        showSeparator={!isLast}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Global Attribute Drawer */}
      <AttributeAddDrawer
        open={createDrawerOpen}
        onOpenChange={(open) => {
          setCreateDrawerOpen(open);
          if (!open) setCreateDrawerSection(null);
        }}
        context="global"
        section={createDrawerSection}
      />

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



