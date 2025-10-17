import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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

const sectionLabels: Record<CoreAttributeSection, string> = {
  "asset-info": "Asset Information",
  status: "Status & Condition",
  contact: "Contact & Location",
  dates: "Dates & Lifecycle",
  warranty: "Warranty",
};

const sectionDescriptions: Record<CoreAttributeSection, string> = {
  "asset-info": "Basic information about the asset",
  status: "Operational status and physical condition",
  contact: "Contact person and physical location",
  dates: "Important dates and lifecycle information",
  warranty: "Warranty information",
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

  // Filter attributes based on search
  const filteredAttributes = searchQuery
    ? coreAttributes.filter(
        (attr) =>
          attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coreAttributes;

  // Group attributes by section
  const groupedAttributes = filteredAttributes.reduce(
    (acc, attr) => {
      if (!acc[attr.section]) {
        acc[attr.section] = [];
      }
      acc[attr.section].push(attr);
      return acc;
    },
    {} as Record<CoreAttributeSection, CoreAttribute[]>
  );

  const sections: CoreAttributeSection[] = [
    "asset-info",
    "status",
    "contact",
    "dates",
    "warranty",
  ];

  // Count enabled attributes
  const enabledCount = coreAttributes.filter((attr) => attr.isEnabled).length;
  const totalCount = coreAttributes.length;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
              regardless of category. Required fields cannot be disabled. To
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
        <Card>
          <CardContent className="pt-6">
            <Accordion
              type="multiple"
              defaultValue={sections}
              className="w-full"
            >
              {sections.map((section) => {
                const attributes = groupedAttributes[section] || [];
                if (attributes.length === 0) return null;

                const enabledCount = attributes.filter(
                  (attr) => attr.isEnabled
                ).length;

                return (
                  <AccordionItem key={section} value={section}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {sectionLabels[section]}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {sectionDescriptions[section]}
                          </span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {enabledCount}/{attributes.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {attributes.map((attribute) => (
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
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
