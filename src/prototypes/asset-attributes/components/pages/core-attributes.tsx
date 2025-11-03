import { useState } from "react";
import {
  Search,
  Plus,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Switch } from "@/registry/ui/switch";
import { Badge } from "@/registry/ui/badge";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
import { useAttributeStore } from "../../lib/store";
import type { CoreAttribute, CoreAttributeSection } from "../../types";
import { CreateCoreAttributeDrawer } from "../features/attributes/create-core-attribute-drawer";
import { CoreAttributeDetailDrawer } from "../features/attributes/core-attribute-detail-drawer";

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
  status: "Operational status and physical condition",
  contact: "Contact person and physical location",
  dates: "Important dates and lifecycle information",
  warranty: "Warranty information",
  custom: "User-defined attributes",
};

// Helper function to get icon for attribute type
const getAttributeIcon = (type: string) => {
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
    case "search":
      return Search;
    default:
      return Type;
  }
};

export function CoreAttributes() {
  const { coreAttributes, toggleCoreAttribute } = useAttributeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Filter attributes based on search (include all attributes, required and optional)
  const filteredAttributes = searchQuery
    ? coreAttributes.filter(
        (attr) =>
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

  // Handle row click (but not toggle/badge clicks)
  const handleRowClick = (attributeId: string, event: React.MouseEvent) => {
    // Don't open drawer if clicking on the switch or badge
    const target = event.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="switch"]') ||
      target.closest('[data-badge]')
    ) {
      return;
    }
    handleViewDetails(attributeId);
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

              const enabledCount = attributes.filter(
                (attr) => attr.isEnabled
              ).length;

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
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary">
                          {enabledCount}/{attributes.length}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-5">
                    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                      {/* Attributes List */}
                      <div className="rounded-lg border bg-card">
                        {attributes.map((attribute, index) => {
                          const IconComponent = getAttributeIcon(
                            attribute.type
                          );
                          return (
                            <div key={attribute.id}>
                              <div 
                                className="flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                                onClick={(e) => handleRowClick(attribute.id, e)}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  {/* Type Icon - hidden on mobile */}
                                  <div className="hidden sm:block">
                                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      <span className="font-medium text-sm">
                                        {attribute.label}
                                      </span>
                                    </div>
                                    {attribute.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {attribute.description}
                                      </p>
                                    )}
                                    {attribute.dropdownOptions &&
                                      attribute.dropdownOptions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {attribute.dropdownOptions.map(
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
                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {attribute.isRequired ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                      data-badge
                                    >
                                      System
                                    </Badge>
                                  ) : (
                                    <Switch
                                      checked={attribute.isEnabled}
                                      onCheckedChange={() =>
                                        toggleCoreAttribute(attribute.id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </div>
                              </div>
                              {index < attributes.length - 1 && <Separator />}
                            </div>
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
            const enabledCount = attributes.filter(
              (attr) => attr.isEnabled
            ).length;

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
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary">
                          {enabledCount}/{attributes.length}
                        </Badge>
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
                          const IconComponent = getAttributeIcon(
                            attribute.type
                          );
                          return (
                            <div key={attribute.id}>
                              <div 
                                className="flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50 cursor-pointer"
                                onClick={(e) => handleRowClick(attribute.id, e)}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  {/* Type Icon - hidden on mobile */}
                                  <div className="hidden sm:block">
                                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      <span className="font-medium text-sm">
                                        {attribute.label}
                                      </span>
                                    </div>
                                    {attribute.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {attribute.description}
                                      </p>
                                    )}
                                    {attribute.dropdownOptions &&
                                      attribute.dropdownOptions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {attribute.dropdownOptions.map(
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
                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {attribute.isRequired ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                      data-badge
                                    >
                                      System
                                    </Badge>
                                  ) : (
                                    <Switch
                                      checked={attribute.isEnabled}
                                      onCheckedChange={() =>
                                        toggleCoreAttribute(attribute.id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </div>
                              </div>
                              {index < attributes.length - 1 && <Separator />}
                            </div>
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
      <CreateCoreAttributeDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
      />

      {/* Core Attribute Detail Drawer */}
      <CoreAttributeDetailDrawer
        attributeId={selectedAttributeId}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />
    </div>
  );
}
