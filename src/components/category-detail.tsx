import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Trash2,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttributeStore } from "@/lib/store";
import { UnifiedAddAttribute } from "./unified-add-attribute";
import type { Attribute, AttributeType } from "@/types";

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
  const {
    categories,
    attributeLibrary,
    getCategoryPath,
    getInheritedAttributes,
    toggleAttribute,
    togglePreferred,
    removeAttributeFromCategory,
  } = useAttributeStore();

  if (!categoryId) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-6">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const category = categories.find((c) => c.id === categoryId);
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

  const path = getCategoryPath(categoryId);
  const inheritedAttrs = getInheritedAttributes(categoryId);

  // Combine all attributes into a single list with source information
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

  const allAttributes: AttributeWithSource[] = [];

  // Add inherited attributes (read-only)
  inheritedAttrs.system.forEach((config) => {
    const attribute = attributeLibrary.find((a) => a.id === config.attributeId);
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      // Find parent category name
      const parentCategory = category.parentId
        ? categories.find((c) => c.id === category.parentId)
        : undefined;

      allAttributes.push({
        ...config,
        attribute,
        source: "inherited",
        isDeletable: false,
        isToggleable: false,
        parentName: parentCategory?.name,
      });
    }
  });

  inheritedAttrs.custom.forEach((config) => {
    const attribute = attributeLibrary.find((a) => a.id === config.attributeId);
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      const parentCategory = category.parentId
        ? categories.find((c) => c.id === category.parentId)
        : undefined;

      allAttributes.push({
        ...config,
        attribute,
        source: "inherited",
        isDeletable: false,
        isToggleable: false,
        parentName: parentCategory?.name,
      });
    }
  });

  // Add direct system attributes (toggleable)
  category.systemAttributes.forEach((config) => {
    const attribute = attributeLibrary.find((a) => a.id === config.attributeId);
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      allAttributes.push({
        ...config,
        attribute,
        source: "system",
        isDeletable: false,
        isToggleable: true,
      });
    }
  });

  // Add direct custom attributes (deletable and toggleable)
  category.customAttributes.forEach((config) => {
    const attribute = attributeLibrary.find((a) => a.id === config.attributeId);
    // Filter out system-wide attributes (manufacturer and model)
    if (
      attribute &&
      attribute.id !== "manufacturer" &&
      attribute.id !== "model"
    ) {
      allAttributes.push({
        ...config,
        attribute,
        source: "custom",
        isDeletable: true,
        isToggleable: true,
      });
    }
  });

  // Sort by source type first (system, inherited, custom), then by order
  allAttributes.sort((a, b) => {
    const sourceOrder = { system: 0, inherited: 1, custom: 2 };
    if (sourceOrder[a.source] !== sourceOrder[b.source]) {
      return sourceOrder[a.source] - sourceOrder[b.source];
    }
    return a.order - b.order;
  });

  const handleDeleteAttribute = (attributeId: string, label: string) => {
    if (window.confirm(`Remove "${label}" from this category?`)) {
      removeAttributeFromCategory(attributeId, categoryId);
    }
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

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {path.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <span>{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Category Title */}
          <h1 className="text-2xl font-semibold tracking-tight">
            {category.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure attributes for this category
          </p>
        </div>

        {/* All Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allAttributes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No attributes yet. Add from library or create a new one.
              </div>
            ) : (
              <div className="space-y-2">
                {allAttributes.map((item) => {
                  const IconComponent = getAttributeIcon(item.attribute.type);
                  return (
                    <div
                      key={item.attributeId}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.source === "inherited" ? "bg-muted/30" : "bg-card"
                      }`}
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
                            onClick={() => togglePreferred(item.attributeId)}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                item.attribute.isRequired
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
                      <div className="flex items-center gap-2 ml-4">
                        {item.isToggleable && (
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
                        )}
                        {item.isDeletable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleDeleteAttribute(
                                item.attributeId,
                                item.attribute.label
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
    </div>
  );
}
