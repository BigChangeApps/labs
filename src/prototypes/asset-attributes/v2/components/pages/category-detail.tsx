import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/registry/ui/button";
import { ChevronDown, ChevronUp, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu";
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
import { AttributeViewDrawer } from "../features/attributes/AttributeViewDrawer";
import { AttributeEditDrawer } from "../features/attributes/AttributeEditDrawer";
import { AttributeAddDrawer } from "../features/attributes/AttributeAddDrawer";
import { AttributeCard, type AttributeCardVariant } from "../features/attributes/AttributeCard";
import type {
  Attribute,
  Category,
  CategoryAttributeConfig,
} from "../../types";

// Sortable wrapper component for AttributeCard
function SortableAttributeCard({
  item,
  categoryId,
  onViewDetails,
  toggleAttribute,
}: {
  item: {
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
    source: "system" | "custom";
    isDeletable: boolean;
    isToggleable: boolean;
  };
  categoryId: string;
  onViewDetails: (id: string) => void;
  toggleAttribute: (categoryId: string, attributeId: string, isSystem: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.attributeId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const variant: AttributeCardVariant = item.source === "custom" ? "custom" : "predefined";

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AttributeCard
        key={item.attributeId}
        attribute={item.attribute}
        variant={variant}
        isEnabled={item.isEnabled}
        onToggle={
          item.isToggleable
            ? () =>
                toggleAttribute(
                  categoryId,
                  item.attributeId,
                  item.source === "system"
                )
            : undefined
        }
        onClick={() => onViewDetails(item.attributeId)}
        showSeparator={false}
        isDraggable={false}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const {
    categories,
    predefinedCategoryAttributes,
    customCategoryAttributes,
    toggleAttribute,
    reorderAttributes,
    getInheritedAttributes,
    deleteCategory,
  } = useAttributeStore();
  const [isInheritedExpanded, setIsInheritedExpanded] = useState(true);

  // Check if a category is custom (user-created)
  const isCustomCategory = (categoryId: string) => {
    return categoryId.startsWith("category-");
  };

  const handleDeleteCategory = () => {
    if (categoryId && isCustomCategory(categoryId)) {
      deleteCategory(categoryId);
      navigate("../categories");
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!categoryId) {
    return (
      <div className="w-full">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const category = categories.find((c: Category) => c.id === categoryId);
  if (!category) {
    return (
      <div className="w-full">
        <Link
          to="../categories"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to categories
        </Link>
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const isChildCategory = !!category.parentId;
  const inheritedAttributes = isChildCategory ? getInheritedAttributes(categoryId) : [];
  const parentCategory = category.parentId
    ? categories.find((c: Category) => c.id === category.parentId)
    : null;

  // Type for attributes with display metadata
  type AttributeWithSource = {
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
    source: "system" | "custom";
    isDeletable: boolean;
    isToggleable: boolean;
    isInherited?: boolean;
    parentCategoryId?: string;
    parentCategoryName?: string;
  };

  // Build all attributes array (both system and custom)
  const allAttributes: AttributeWithSource[] = [];

  // Add system attributes
  category.systemAttributes.forEach((config: CategoryAttributeConfig) => {
    const predefinedAttrs = predefinedCategoryAttributes[categoryId] || [];
    const attribute = predefinedAttrs.find(
      (a: Attribute) => a.id === config.attributeId
    );

    if (attribute) {
      allAttributes.push({
        ...config,
        attribute,
        source: "system",
        isDeletable: false,
        isToggleable: true,
      });
    }
  });

  // Add custom attributes
  category.customAttributes.forEach((config: CategoryAttributeConfig) => {
    const customAttrs = customCategoryAttributes[categoryId] || [];
    const attribute = customAttrs.find(
      (a: Attribute) => a.id === config.attributeId
    );

    if (attribute) {
      allAttributes.push({
        ...config,
        attribute,
        source: "custom",
        isDeletable: true,
        isToggleable: true,
      });
    }
  });

  // Sort all attributes by order
  allAttributes.sort((a, b) => a.order - b.order);

  const handleViewDetails = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsDetailDrawerOpen(true);
  };

  // Handle drag end - reorder attributes
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = allAttributes.findIndex(
      (item) => item.attributeId === active.id
    );
    const newIndex = allAttributes.findIndex(
      (item) => item.attributeId === over.id
    );

    // Create new ordered array
    const reorderedAttributes = arrayMove(allAttributes, oldIndex, newIndex);

    // Extract just the IDs in the new order and update the store
    const orderedIds = reorderedAttributes.map((item) => item.attributeId);
    reorderAttributes(categoryId, orderedIds);
  };

  // Helper function to render a list of attributes
  const renderAttributeList = (attributes: AttributeWithSource[]) => {
    if (attributes.length === 0) {
      return null;
    }

    // Get IDs for sortable context
    const attributeIds = attributes.map((item) => item.attributeId);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={attributeIds} strategy={verticalListSortingStrategy}>
          <div className="rounded-lg border bg-card divide-y">
            {attributes.map((item) => (
              <SortableAttributeCard
                key={item.attributeId}
                item={item}
                categoryId={categoryId}
                onViewDetails={handleViewDetails}
                toggleAttribute={toggleAttribute}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Link
          to="../categories"
          className="text-sm text-muted-foreground hover:text-foreground inline-block"
        >
          ← Back to categories
        </Link>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateDrawerOpen(true)}
                className="shrink-0"
              >
                Add attributes
              </Button>
              {categoryId && isCustomCategory(categoryId) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDeleteCategory}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {parentCategory && (
            <p className="text-base text-muted-foreground">
              Part of {parentCategory.name}
            </p>
          )}
        </div>

        {/* Inherited Attributes Section */}
        {isChildCategory && inheritedAttributes.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-bold text-base hover:bg-transparent"
              onClick={() => setIsInheritedExpanded(!isInheritedExpanded)}
            >
              <span>Inherited Attributes</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal text-muted-foreground">
                  {inheritedAttributes.length} attribute{inheritedAttributes.length !== 1 ? "s" : ""}
                </span>
                {isInheritedExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </Button>
            {isInheritedExpanded && (
              <div className="pt-3">
                <div className="rounded-lg border bg-card divide-y">
                  {inheritedAttributes.map((item) => (
                    <AttributeCard
                      key={item.attributeId}
                      attribute={item.attribute}
                      variant={item.source === "custom" ? "custom" : "predefined"}
                      isEnabled={item.isEnabled}
                      onClick={() => {
                        setSelectedAttributeId(item.attributeId);
                        setIsDetailDrawerOpen(true);
                      }}
                      showSeparator={false}
                      isDraggable={false}
                      isInherited={true}
                      inheritedFrom={item.parentCategoryName}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attributes Section - Unified display of all attributes */}
        <div className="space-y-3 sm:space-y-4">
          {/* Conditional rendering based on attributes */}
          {allAttributes.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">
                  There are no attributes for this category yet.
                </p>
              </div>
            </div>
          ) : (
            renderAttributeList(allAttributes)
          )}
        </div>
      </div>

      {/* Attribute Detail Drawer - Show View or Edit based on attribute type */}
      {selectedAttributeId && (() => {
        // Check if it's an inherited attribute
        const inheritedItem = inheritedAttributes.find(
          (item) => item.attributeId === selectedAttributeId
        );
        
        if (inheritedItem) {
          // Inherited attributes are always view-only
          return (
            <AttributeViewDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={setIsDetailDrawerOpen}
              context="category"
              categoryId={inheritedItem.parentCategoryId}
            />
          );
        }

        // Find the attribute in our combined list to determine its source
        const attributeItem = allAttributes.find(
          (item) => item.attributeId === selectedAttributeId
        );

        // System (predefined) attributes are view-only, custom attributes are editable
        if (attributeItem?.source === "system") {
          return (
            <AttributeViewDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={setIsDetailDrawerOpen}
              context="category"
              categoryId={categoryId}
            />
          );
        } else {
          return (
            <AttributeEditDrawer
              attributeId={selectedAttributeId}
              open={isDetailDrawerOpen}
              onOpenChange={setIsDetailDrawerOpen}
              context="category"
              categoryId={categoryId}
            />
          );
        }
      })()}

      {/* Create Attribute Drawer */}
      <AttributeAddDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        context="category"
        categoryId={categoryId}
      />
    </div>
  );
}

