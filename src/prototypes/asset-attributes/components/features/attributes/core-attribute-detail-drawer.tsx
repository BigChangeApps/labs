import {
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
  Search,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/registry/ui/sheet";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
import { Switch } from "@/registry/ui/switch";
import { Badge } from "@/registry/ui/badge";
import { useAttributeStore } from "../../../lib/store";
import type { CoreAttribute } from "../../../types";

interface CoreAttributeDetailDrawerProps {
  attributeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const getAttributeTypeLabel = (type: string): string => {
  switch (type) {
    case "text":
      return "Text";
    case "number":
      return "Number";
    case "dropdown":
      return "Dropdown";
    case "date":
      return "Date";
    case "boolean":
      return "Yes/No";
    case "search":
      return "Search";
    default:
      return type;
  }
};

const getSectionLabel = (section: string): string => {
  switch (section) {
    case "asset-info":
      return "Asset Information";
    case "status":
      return "Status & Condition";
    case "contact":
      return "Contact & Location";
    case "dates":
      return "Dates & Lifecycle";
    case "warranty":
      return "Warranty";
    case "custom":
      return "Your attributes";
    default:
      return section;
  }
};

export function CoreAttributeDetailDrawer({
  attributeId,
  open,
  onOpenChange,
}: CoreAttributeDetailDrawerProps) {
  const { coreAttributes } = useAttributeStore();

  const attribute = attributeId
    ? coreAttributes.find((a: CoreAttribute) => a.id === attributeId)
    : null;

  if (!attribute) return null;

  const IconComponent = getAttributeIcon(attribute.type);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Attribute Details</SheetTitle>
          <SheetDescription>
            {attribute.isRequired
              ? "System attribute (read-only)"
              : "Core attribute details"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Attribute Icon and Label */}
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <IconComponent className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-semibold">{attribute.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {getAttributeTypeLabel(attribute.type)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={attribute.label} disabled />
          </div>

          {attribute.description && (
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={attribute.description} disabled />
            </div>
          )}

          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={getAttributeTypeLabel(attribute.type)} disabled />
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <Input value={getSectionLabel(attribute.section)} disabled />
          </div>

          {attribute.type === "dropdown" && attribute.dropdownOptions && (
            <div className="space-y-2">
              <Label>Dropdown Options</Label>
              <div className="flex flex-wrap gap-1">
                {attribute.dropdownOptions.map((option) => (
                  <Badge key={option} variant="secondary" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status</Label>
              <p className="text-xs text-muted-foreground">
                Whether this attribute is enabled
              </p>
            </div>
            <Switch checked={attribute.isEnabled} disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Attribute</Label>
              <p className="text-xs text-muted-foreground">
                Required system attribute that cannot be disabled
              </p>
            </div>
            <Badge variant={attribute.isRequired ? "secondary" : "outline"}>
              {attribute.isRequired ? "System" : "Optional"}
            </Badge>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

