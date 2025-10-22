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
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Switch } from "@shared/components/ui/switch";
import { Badge } from "@shared/components/ui/badge";
import { Card, CardContent } from "@shared/components/ui/card";
import { Separator } from "@shared/components/ui/separator";
import { useAttributeStore } from "../../lib/store";
import type { CoreAttribute, CoreAttributeSection } from "../../types";
import { CreateCoreAttributeDrawer } from "../features/attributes/create-core-attribute-drawer";

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

  // Filter attributes based on search and exclude required attributes
  const filteredAttributes = searchQuery
    ? coreAttributes.filter(
        (attr) =>
          !attr.isRequired &&
          (attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attr.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : coreAttributes.filter((attr) => !attr.isRequired);

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

  // Handle opening create drawer
  const handleAddCustomAttribute = () => {
    setCreateDrawerOpen(true);
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "700px" }}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Core Attributes
          </h1>
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
        <div className="w-full space-y-4 sm:space-y-6">
          {sections.map((section) => {
            const attributes = groupedAttributes[section] || [];
            if (attributes.length === 0 && section !== "custom") return null;

            const enabledCount = attributes.filter(
              (attr) => attr.isEnabled
            ).length;

            return (
              <Card key={section}>
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
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="secondary">
                          {enabledCount}/{attributes.length}
                        </Badge>
                        {section === "custom" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCustomAttribute}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add attribute
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Attributes List */}
                    <div className="rounded-lg border bg-card">
                      {attributes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No attributes yet. Click "Add attribute" to create
                          one.
                        </div>
                      ) : (
                        attributes.map((attribute, index) => {
                          const IconComponent = getAttributeIcon(
                            attribute.type
                          );
                          return (
                            <div key={attribute.id}>
                              <div className="flex items-start justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-colors hover:bg-muted/50">
                                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                  {/* Type Icon - hidden on mobile */}
                                  <div className="mt-0.5 hidden sm:block">
                                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      <span className="font-medium text-sm">
                                        {attribute.label}
                                      </span>
                                      {attribute.isRequired && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          Required
                                        </Badge>
                                      )}
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
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Switch
                                    checked={attribute.isEnabled}
                                    onCheckedChange={() =>
                                      toggleCoreAttribute(attribute.id)
                                    }
                                    disabled={attribute.isRequired}
                                  />
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
          })}
        </div>
      </div>

      {/* Create Core Attribute Drawer */}
      <CreateCoreAttributeDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
      />
    </div>
  );
}
