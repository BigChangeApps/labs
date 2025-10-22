import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
  Star,
  MoreVertical,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Switch } from "@shared/components/ui/switch";
import { Card, CardContent } from "@shared/components/ui/card";
import { Separator } from "@shared/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import { useAttributeStore } from "../../lib/store";
import { AttributeDetailDrawer } from "../features/attributes/attribute-detail-drawer";
import { CreateAttributeDrawer } from "../features/attributes/create-attribute-drawer";
import type {
  Attribute,
  AttributeType,
  Category,
  CategoryAttributeConfig,
} from "../../types";

// Helper function to get icon for attribute type
const getAttributeIcon = (type: AttributeType) => {
  switch (type) {
    case "text":
      return Type;
    case "number":
      return Hash;
    case "dropdown":
      return List;
    case "date":
      return Calendar;
    case "boolean":
      return CheckSquare;
    default:
      return Type;
  }
};

export function CategoryAttributesDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const {
    categories,
    attributeLibrary,
    toggleAttribute,
    togglePreferred,
    removeAttributeFromCategory,
  } = useAttributeStore();

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
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  // Type for attributes with display metadata
  type AttributeWithSource = {
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
    source: "system" | "custom";
    isDeletable: boolean;
    isToggleable: boolean;
  };

  // Build direct attributes array (system and custom)
  const directAttributes: AttributeWithSource[] = [];

  // Add direct system attributes (toggleable)
  category.systemAttributes.forEach((config: CategoryAttributeConfig) => {
    const attribute = attributeLibrary.find(
      (a: Attribute) => a.id === config.attributeId
    );
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      directAttributes.push({
        ...config,
        attribute,
        source: "system",
        isDeletable: false,
        isToggleable: true,
      });
    }
  });

  // Add direct custom attributes (deletable)
  category.customAttributes.forEach((config: CategoryAttributeConfig) => {
    const attribute = attributeLibrary.find(
      (a: Attribute) => a.id === config.attributeId
    );
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      directAttributes.push({
        ...config,
        attribute,
        source: "custom",
        isDeletable: true,
        isToggleable: false,
      });
    }
  });

  // Sort direct attributes by source (system first, then custom), then by order
  directAttributes.sort((a, b) => {
    const sourceOrder: Record<"system" | "custom", number> = {
      system: 0,
      custom: 1,
    };
    const aOrder = sourceOrder[a.source];
    const bOrder = sourceOrder[b.source];
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.order - b.order;
  });

  const handleDeleteAttribute = (attributeId: string, label: string) => {
    if (window.confirm(`Remove "${label}" from this category?`)) {
      removeAttributeFromCategory(attributeId, categoryId);
    }
    setOpenPopoverId(null);
  };

  const handleViewDetails = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsDetailDrawerOpen(true);
    setOpenPopoverId(null);
  };

  const handleCardClick = (attributeId: string) => {
    handleViewDetails(attributeId);
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "700px" }}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage attributes for this category
          </p>
        </div>

        {/* Direct Attributes Card */}
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="space-y-3 sm:space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-bold text-base">Your attributes</h2>
                  <p className="text-sm text-muted-foreground">
                    Attributes specific to this category
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant="secondary">
                    {directAttributes.filter((attr) => attr.isEnabled).length}/
                    {directAttributes.length}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateDrawerOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add attribute
                  </Button>
                </div>
              </div>

              {/* Attributes List */}
              <div className="rounded-lg border bg-card">
                {directAttributes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No attributes yet. Create a new one.
                  </div>
                ) : (
                  directAttributes.map((item, index) => {
                    const IconComponent = getAttributeIcon(item.attribute.type);
                    return (
                      <div key={item.attributeId}>
                        <div
                          className="flex items-start justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleCardClick(item.attributeId)}
                        >
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            {/* Type Icon - hidden on mobile */}
                            <div className="mt-0.5 hidden sm:block">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {item.attribute.label}
                                </span>

                                {/* Custom indicator as plain text */}
                                {item.source === "custom" && (
                                  <span className="text-xs text-muted-foreground">
                                    Custom
                                  </span>
                                )}

                                {/* Preferred star toggle - right after name */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 sm:h-6 sm:w-6 -ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreferred(item.attributeId);
                                  }}
                                >
                                  <Star
                                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                      item.attribute.isPreferred
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </Button>
                              </div>

                              {/* Dropdown options */}
                              {item.attribute.type === "dropdown" &&
                                item.attribute.dropdownOptions && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.attribute.dropdownOptions.map(
                                      (option) => (
                                        <Badge
                                          key={option}
                                          variant="secondary"
                                          className="text-xs font-normal"
                                        >
                                          {option}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div
                            className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Toggle switch for all attributes */}
                            <Switch
                              checked={item.isEnabled}
                              onCheckedChange={() =>
                                toggleAttribute(
                                  categoryId,
                                  item.attributeId,
                                  item.source === "system"
                                )
                              }
                            />

                            {/* 3-dot menu */}
                            <Popover
                              open={openPopoverId === item.attributeId}
                              onOpenChange={(open) =>
                                setOpenPopoverId(open ? item.attributeId : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-48 p-1"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start h-9 px-2"
                                  onClick={() =>
                                    handleViewDetails(item.attributeId)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                {item.isDeletable && (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start h-9 px-2 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteAttribute(
                                        item.attributeId,
                                        item.attribute.label
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                )}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        {index < directAttributes.length - 1 && <Separator />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attribute Detail Drawer */}
      <AttributeDetailDrawer
        attributeId={selectedAttributeId}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />

      {/* Create Attribute Drawer */}
      <CreateAttributeDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        categoryId={categoryId}
      />
    </div>
  );
}
