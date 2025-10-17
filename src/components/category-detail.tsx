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
  Link2,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAttributeStore } from "@/lib/store";
import { UnifiedAddAttribute } from "./unified-add-attribute";
import { AttributeDetailDrawer } from "./attribute-detail-drawer";
import type {
  Attribute,
  AttributeType,
  Category,
  CategoryAttributeConfig,
} from "@/types";

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

export function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const {
    categories,
    attributeLibrary,
    getInheritedAttributes,
    toggleAttribute,
    togglePreferred,
    removeAttributeFromCategory,
    enableParentInheritance,
  } = useAttributeStore();

  if (!categoryId) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-6">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const category = categories.find((c: Category) => c.id === categoryId);
  if (!category) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const inheritedAttrs = enableParentInheritance
    ? getInheritedAttributes(categoryId)
    : { system: [], custom: [] };

  const parentCategory = category.parentId
    ? categories.find((c: Category) => c.id === category.parentId)
    : undefined;

  // Type for attributes with display metadata
  type AttributeWithSource = {
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
    source: "system" | "custom" | "inherited";
    isDeletable: boolean;
    isToggleable: boolean;
    parentName?: string;
  };

  // Build inherited attributes array
  const inheritedAttributes: AttributeWithSource[] = [];

  if (enableParentInheritance) {
    inheritedAttrs.system.forEach((config: CategoryAttributeConfig) => {
      const attribute = attributeLibrary.find(
        (a: Attribute) => a.id === config.attributeId
      );
      // Filter out system-wide attributes (manufacturer and model)
      if (
        attribute &&
        attribute.id !== "manufacturer" &&
        attribute.id !== "model"
      ) {
        inheritedAttributes.push({
          ...config,
          attribute,
          source: "inherited",
          isDeletable: false,
          isToggleable: false,
          parentName: parentCategory?.name,
        });
      }
    });

    inheritedAttrs.custom.forEach((config: CategoryAttributeConfig) => {
      const attribute = attributeLibrary.find(
        (a: Attribute) => a.id === config.attributeId
      );
      // Filter out system-wide attributes (manufacturer and model)
      if (
        attribute &&
        attribute.id !== "manufacturer" &&
        attribute.id !== "model"
      ) {
        inheritedAttributes.push({
          ...config,
          attribute,
          source: "inherited",
          isDeletable: false,
          isToggleable: false,
          parentName: parentCategory?.name,
        });
      }
    });
  }

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
    const aOrder = a.source === "inherited" ? 2 : sourceOrder[a.source];
    const bOrder = b.source === "inherited" ? 2 : sourceOrder[b.source];
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
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
        {/* Back button and header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>

          {/* Category Title */}
          <h1 className="text-2xl font-semibold tracking-tight">
            {category.name}
          </h1>
        </div>

        {/* Inherited Attributes Card */}
        {inheritedAttributes.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {parentCategory ? (
                    <>
                      <span className="font-normal text-muted-foreground">
                        Inherited from
                      </span>{" "}
                      <Button
                        variant="link"
                        className="h-auto p-0 text-base font-bold text-primary hover:underline"
                        onClick={() => navigate(`/category/${parentCategory.id}`)}
                      >
                        {parentCategory.name}
                      </Button>
                    </>
                  ) : (
                    "Inherited Attributes"
                  )}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {inheritedAttributes.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inheritedAttributes.map((item) => {
                    const IconComponent = getAttributeIcon(item.attribute.type);
                    return (
                      <div
                        key={item.attributeId}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        {/* Link icon for inheritance */}
                        <div className="mt-0.5">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Type Icon */}
                        <div className="mt-0.5">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                              {item.attribute.label}
                            </span>

                            {/* Preferred star (read-only) */}
                            {item.attribute.isPreferred && (
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            )}
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
                    );
                  })}
                </div>
              </CardContent>
          </Card>
        )}

        {/* Direct Attributes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {directAttributes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No attributes yet. Add from library or create a new one.
              </div>
            ) : (
              <div className="space-y-2">
                {directAttributes.map((item) => {
                  const IconComponent = getAttributeIcon(item.attribute.type);
                  return (
                    <div
                      key={item.attributeId}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                        item.source === "custom"
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : "bg-card"
                      }`}
                      onClick={() => handleCardClick(item.attributeId)}
                    >
                      {/* Type Icon */}
                      <div className="mt-0.5">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
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
                            className="h-6 w-6 -ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePreferred(item.attributeId);
                            }}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
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
                              {item.attribute.dropdownOptions.map((option) => (
                                <Badge
                                  key={option}
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-2 ml-4"
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
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <UnifiedAddAttribute categoryId={categoryId} />
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
    </div>
  );
}
