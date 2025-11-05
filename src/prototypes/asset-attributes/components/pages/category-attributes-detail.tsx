import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Alert, AlertDescription } from "@/registry/ui/alert";
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

export function CategoryAttributesDetail() {
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

  // Helper function to render a list of attributes
  const renderAttributeList = (attributes: AttributeWithSource[]) => {
    if (attributes.length === 0) {
      return null;
    }

    return (
      <div className="rounded-lg border bg-card">
        {attributes.map((item, index) => {
          const isLast = index === attributes.length - 1;
          // Determine variant based on source
          const variant: AttributeCardVariant = item.source === "custom" ? "custom" : "predefined";

          return (
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
              onClick={() => handleViewDetails(item.attributeId)}
              showSeparator={!isLast}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "700px" }}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {category.name}
          </h1>
        </div>

        {/* Core Attributes Inheritance Alert */}
        <Alert className="bg-muted/50 border-muted">
          <AlertDescription className="text-sm text-muted-foreground">
            This category will inherit all core attributes and settings. Including Asset ID, Status and Location. <br></br>To edit attributes that apply to all
            assets, see{" "}
            <Link
              to="/asset-attributes/core-attributes"
              className="text-primary underline hover:text-primary/80"
            >
              core attributes
            </Link>
            .
          </AlertDescription>
        </Alert>

        {/* Attributes Section - Unified display of all attributes */}
        <div className="space-y-3 sm:space-y-4">
          {/* Section Header with Add CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-base">Attributes</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateDrawerOpen(true)}
              className="shrink-0"
            >
              Add attributes
            </Button>
          </div>

          {/* Conditional rendering based on attributes */}
          {allAttributes.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">
                  No attributes yet. Click "Add attribute" to create one.
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
