import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card, CardContent } from "@/registry/ui/card";
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
import { toast } from "sonner";

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

  // Build system attributes array (separate from custom)
  const systemAttributes: AttributeWithSource[] = [];
  category.systemAttributes.forEach((config: CategoryAttributeConfig) => {
    // Look up in predefined category attributes
    const predefinedAttrs = predefinedCategoryAttributes[categoryId] || [];
    const attribute = predefinedAttrs.find(
      (a: Attribute) => a.id === config.attributeId
    );
    
    if (attribute) {
      systemAttributes.push({
        ...config,
        attribute,
        source: "system",
        isDeletable: false,
        isToggleable: true,
      });
    }
  });

  // Sort system attributes by order
  systemAttributes.sort((a, b) => a.order - b.order);

  // Split system attributes into preferred and other
  const systemPreferredAttributes = systemAttributes.filter(
    (item) => item.attribute.isPreferred === true
  );
  const systemOtherAttributes = systemAttributes.filter(
    (item) => item.attribute.isPreferred === false
  );

  // Build custom attributes array (separate from system)
  const customAttributes: AttributeWithSource[] = [];
  category.customAttributes.forEach((config: CategoryAttributeConfig) => {
    // Look up in custom category attributes
    const customAttrs = customCategoryAttributes[categoryId] || [];
    const attribute = customAttrs.find(
      (a: Attribute) => a.id === config.attributeId
    );
    
    if (attribute) {
      customAttributes.push({
        ...config,
        attribute,
        source: "custom",
        isDeletable: true,
        isToggleable: false,
      });
    }
  });

  // Sort custom attributes by order
  customAttributes.sort((a, b) => a.order - b.order);

  // Split custom attributes into preferred and other
  const preferredAttributes = customAttributes.filter(
    (item) => item.attribute.isPreferred === true
  );
  const otherAttributes = customAttributes.filter(
    (item) => item.attribute.isPreferred === false
  );

  const handleDeleteAttribute = (attributeId: string, label: string) => {
    if (window.confirm(`Remove "${label}" from this category?`)) {
      removeAttributeFromCategory(attributeId, categoryId);
    }
  };

  const handleViewDetails = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsDetailDrawerOpen(true);
  };

  const handleFeedbackClick = (attribute: Attribute) => {
    // TODO: Implement feedback functionality
    toast.info(`Feedback for "${attribute.label}"`);
  };

  // Helper function to render a list of attributes (for system or custom)
  const renderAttributeList = (
    attributes: AttributeWithSource[],
    variant: AttributeCardVariant
  ) => {
    if (attributes.length === 0) {
      return null;
    }

    return (
      <div className="rounded-lg border bg-card">
        {attributes.map((item, index) => {
          const isLast = index === attributes.length - 1;
          return (
            <AttributeCard
              key={item.attributeId}
              attribute={item.attribute}
              variant={variant}
              isEnabled={item.isEnabled}
              onToggle={
                variant !== "system"
                  ? () =>
                      toggleAttribute(
                        categoryId,
                        item.attributeId,
                        item.source === "system"
                      )
                  : undefined
              }
              onClick={
                variant === "custom" || variant === "predefined"
                  ? () => handleViewDetails(item.attributeId)
                  : undefined
              }
              onDelete={
                variant === "custom"
                  ? () =>
                      handleDeleteAttribute(
                        item.attributeId,
                        item.attribute.label
                      )
                  : undefined
              }
              onFeedback={
                variant !== "custom"
                  ? () => handleFeedbackClick(item.attribute)
                  : undefined
              }
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage attributes for this category
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDrawerOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add attribute
          </Button>
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

        {/* System Attributes Card */}
        {systemAttributes.length > 0 && (
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="space-y-3 sm:space-y-4">
                {/* Section Header */}
                <div className="space-y-1">
                  <h2 className="font-bold text-base">{category.name} attributes</h2>
                  <p className="text-sm text-muted-foreground">
                    Pre-set attributes for this category
                  </p>
                </div>

                {/* Conditional rendering based on preferred attributes */}
                {systemPreferredAttributes.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Preferred Attributes Section */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">Preferred attributes</h3>
                      </div>
                      {renderAttributeList(systemPreferredAttributes, "predefined")}
                    </div>

                    {/* Other Attributes Section */}
                    {systemOtherAttributes.length > 0 && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm">Other attributes</h3>
                        </div>
                        {renderAttributeList(systemOtherAttributes, "predefined")}
                      </div>
                    )}
                  </div>
                ) : (
                  // Single list when no preferred attributes exist
                  renderAttributeList(systemAttributes, "predefined")
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Attributes Card */}
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="space-y-3 sm:space-y-4">
              {/* Section Header */}
              <div className="space-y-1">
                <h2 className="font-bold text-base">Your attributes</h2>
                <p className="text-sm text-muted-foreground">
                  Attributes specific to this category
                </p>
              </div>

              {/* Conditional rendering based on preferred attributes */}
              {customAttributes.length === 0 ? (
                <div className="rounded-lg border bg-card">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm mb-4">
                      No attributes yet. Click "Add attribute" to create one.
                    </p>
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
              ) : preferredAttributes.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Preferred Attributes Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">Preferred attributes</h3>
                    </div>
                      {renderAttributeList(preferredAttributes, "custom")}
                  </div>

                  {/* Other Attributes Section */}
                  {otherAttributes.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">Other attributes</h3>
                      </div>
                      {renderAttributeList(otherAttributes, "custom")}
                    </div>
                  )}
                </div>
              ) : (
                // Single list when no preferred attributes exist
                renderAttributeList(customAttributes, "custom")
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attribute Detail Drawer - Show View or Edit based on attribute type */}
      {selectedAttributeId && (() => {
        // Check predefined attributes first
        const predefinedAttrs = predefinedCategoryAttributes[categoryId] || [];
        const predefinedAttribute = predefinedAttrs.find((a: Attribute) => a.id === selectedAttributeId);
        
        // Check custom attributes
        const customAttrs = customCategoryAttributes[categoryId] || [];
        const customAttribute = customAttrs.find((a: Attribute) => a.id === selectedAttributeId);
        
        const attribute = predefinedAttribute || customAttribute;
        
        // Predefined attributes are view-only, custom attributes are editable
        if (predefinedAttribute || attribute?.isSystem) {
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
