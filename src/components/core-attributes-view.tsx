import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAttributeStore } from "@/lib/store";
import type { CoreAttribute, CoreAttributeSection } from "@/types";
import { CreateCoreAttributeDrawer } from "@/components/create-core-attribute-drawer";

const sectionLabels: Record<CoreAttributeSection, string> = {
  "asset-info": "Asset Information",
  status: "Status & Condition",
  contact: "Contact & Location",
  dates: "Dates & Lifecycle",
  warranty: "Warranty",
  custom: "Custom Attributes",
};

const sectionDescriptions: Record<CoreAttributeSection, string> = {
  "asset-info": "Basic information about the asset",
  status: "Operational status and physical condition",
  contact: "Contact person and physical location",
  dates: "Important dates and lifecycle information",
  warranty: "Warranty information",
  custom: "User-defined custom attributes",
};

function getAttributeTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    text: "Text",
    number: "Number",
    dropdown: "Dropdown",
    date: "Date",
    boolean: "Yes/No",
    search: "Search",
  };
  return typeLabels[type] || type;
}

export function CoreAttributesView() {
  const navigate = useNavigate();
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

  // Count enabled attributes (excluding required ones)
  const enabledCount = coreAttributes.filter(
    (attr) => attr.isEnabled && !attr.isRequired
  ).length;
  const totalCount = coreAttributes.filter((attr) => !attr.isRequired).length;

  // Handle opening create drawer
  const handleAddCustomAttribute = () => {
    setCreateDrawerOpen(true);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Core Attributes
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage universal fields that appear on every asset
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {enabledCount} of {totalCount} enabled
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Core Attributes</CardTitle>
            <CardDescription>
              Core attributes are universal fields that appear on every asset,
              regardless of category. All assets automatically include required
              fields such as Status, Condition, Barcode, Category, Manufacturer,
              Model, Contact, and Location. These fields cannot be disabled. To
              manage category-specific attributes (like "Gas Pressure" for
              Boilers), go to{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-primary"
                onClick={() => navigate("/")}
              >
                Categories & Attributes
              </Button>
              .
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Attributes by Section */}
        <Accordion
          type="multiple"
          defaultValue={["custom"]}
          className="w-full space-y-4"
        >
          {sections.map((section) => {
            const attributes = groupedAttributes[section] || [];
            if (attributes.length === 0 && section !== "custom") return null;

            const enabledCount = attributes.filter(
              (attr) => attr.isEnabled
            ).length;

            return (
              <AccordionItem
                key={section}
                value={section}
                className="border rounded-lg"
              >
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {sectionLabels[section]}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {sectionDescriptions[section]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {enabledCount}/{attributes.length}
                      </Badge>
                      {section === "custom" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCustomAttribute();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-3">
                    {attributes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No custom attributes yet. Click "Add Custom" to create
                        one.
                      </div>
                    ) : (
                      attributes.map((attribute) => (
                        <div
                          key={attribute.id}
                          className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium">
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
                              <Badge variant="outline" className="text-xs">
                                {getAttributeTypeLabel(attribute.type)}
                              </Badge>
                            </div>
                            {attribute.description && (
                              <p className="text-sm text-muted-foreground">
                                {attribute.description}
                              </p>
                            )}
                            {attribute.dropdownOptions &&
                              attribute.dropdownOptions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {attribute.dropdownOptions.map((option) => (
                                    <Badge
                                      key={option}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={attribute.isEnabled}
                              onCheckedChange={() =>
                                toggleCoreAttribute(attribute.id)
                              }
                              disabled={attribute.isRequired}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Create Core Attribute Drawer */}
      <CreateCoreAttributeDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
      />
    </div>
  );
}
