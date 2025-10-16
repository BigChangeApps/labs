import { useState } from "react";
import { GripVertical, Edit, Plus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAttributeStore } from "@/lib/store";
import type { Attribute } from "@/types";
import { AddFromLibraryModal } from "./add-from-library-modal";
import { CreateAttributeDrawer } from "./create-attribute-drawer";
import { EditAttributeDrawer } from "./edit-attribute-drawer";

interface SortableAttributeRowProps {
  item: {
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
  };
  onToggle: () => void;
  onEdit: () => void;
}

function SortableAttributeRow({
  item,
  onToggle,
  onEdit,
}: SortableAttributeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.attributeId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{item.attribute.label}</span>
            {item.attribute.appliedToCategories.length >= 3 && (
              <Badge variant="destructive" className="text-xs">
                Shared ({item.attribute.appliedToCategories.length})
              </Badge>
            )}
          </div>
          {item.attribute.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.attribute.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {item.attribute.type}
        </Badge>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Switch checked={item.isEnabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}

export function CustomAttributes() {
  const {
    currentCategoryId,
    categories,
    attributeLibrary,
    toggleAttribute,
    reorderAttributes,
  } = useAttributeStore();
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  if (!currentCategory) return null;

  const customAttributes = currentCategory.customAttributes
    .map((config) => {
      const attribute = attributeLibrary.find(
        (a) => a.id === config.attributeId
      );
      return { ...config, attribute: attribute as Attribute };
    })
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = customAttributes.findIndex(
        (item) => item.attributeId === active.id
      );
      const newIndex = customAttributes.findIndex(
        (item) => item.attributeId === over.id
      );

      const reordered = arrayMove(customAttributes, oldIndex, newIndex);
      const attributeIds = reordered.map((item) => item.attributeId);
      reorderAttributes(currentCategoryId, attributeIds);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Custom Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customAttributes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No custom attributes yet. Add from library or create a new one.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customAttributes.map((item) => item.attributeId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {customAttributes.map((item) => (
                    <SortableAttributeRow
                      key={item.attributeId}
                      item={item}
                      onToggle={() =>
                        toggleAttribute(
                          currentCategoryId,
                          item.attributeId,
                          false
                        )
                      }
                      onEdit={() => setEditingAttributeId(item.attributeId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsLibraryModalOpen(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add from Library
            </Button>
            <Button
              onClick={() => setIsCreateDrawerOpen(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Attribute
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddFromLibraryModal
        open={isLibraryModalOpen}
        onOpenChange={setIsLibraryModalOpen}
      />

      <CreateAttributeDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
      />

      {editingAttributeId && (
        <EditAttributeDrawer
          attributeId={editingAttributeId}
          open={!!editingAttributeId}
          onOpenChange={(open) => !open && setEditingAttributeId(null)}
        />
      )}
    </>
  );
}
