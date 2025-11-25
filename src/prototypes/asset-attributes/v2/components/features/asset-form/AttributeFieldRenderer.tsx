import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/registry/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import { Switch } from "@/registry/ui/switch";
import { Label } from "@/registry/ui/label";
import { Badge } from "@/registry/ui/badge";
import type { FormAttribute } from "../../../lib/asset-form-utils";
import { CategorySearchableSelect } from "./CategorySearchableSelect";
import { SiteSearchableSelect } from "./SiteSearchableSelect";
import { ManufacturerCreatableSelect } from "./ManufacturerCreatableSelect";
import { ModelCreatableSelect } from "./ModelCreatableSelect";
import { DatePicker } from "./DatePicker";

interface AttributeFieldRendererProps {
  attribute: FormAttribute;
  fieldName: string;
}

export function AttributeFieldRenderer({
  attribute,
  fieldName,
}: AttributeFieldRendererProps) {
  const { register, watch, setValue, formState } = useFormContext();
  const selectedManufacturer = watch("global-manufacturer");

  // Mock site options (for Site field)
  const siteOptions = useMemo(() => {
    if (attribute.id !== "global-contact") return [];
    return [
      {
        id: "site-1",
        name: "John Lewis & Partners",
        address: "Victoria Gate, Harewood Street, Leeds, LS2 7AR",
      },
      {
        id: "site-2",
        name: "Manchester Store",
        address: "123 High Street, Manchester, M1 1AA",
      },
      {
        id: "site-3",
        name: "Birmingham Bullring",
        address: "Bullring Shopping Centre, Birmingham, B5 4BU",
      },
      {
        id: "site-4",
        name: "London Oxford Street",
        address: "300 Oxford Street, London, W1C 1DX",
      },
      {
        id: "site-5",
        name: "Edinburgh Princes Street",
        address: "48 Princes Street, Edinburgh, EH2 2YJ",
      },
      {
        id: "site-6",
        name: "Bristol Cribbs Causeway",
        address: "Cribbs Causeway, Bristol, BS34 5DG",
      },
      {
        id: "site-7",
        name: "Liverpool One",
        address: "Liverpool One Shopping Centre, Liverpool, L1 8JQ",
      },
    ];
  }, [attribute.id]);

  const selectedSite = watch("global-contact");
  const selectedSiteData = siteOptions.find((s) => s.id === selectedSite);

  const renderField = () => {
    switch (attribute.type) {
      case "text":
        return (
          <Input
            {...register(fieldName)}
            placeholder={attribute.description}
            className="h-9"
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              {...register(fieldName, { valueAsNumber: true })}
              type="number"
              placeholder={attribute.description}
              className="h-9"
            />
            {attribute.units && (
              <span className="text-sm text-muted-foreground">
                {attribute.units}
              </span>
            )}
          </div>
        );

      case "dropdown":
        // Special handling for Category, Manufacturer, Model
        if (attribute.id === "global-category") {
          return (
            <CategorySearchableSelect
              value={watch(fieldName) || ""}
              onValueChange={(value) => setValue(fieldName, value)}
              placeholder="Select category"
            />
          );
        }

        if (attribute.id === "global-manufacturer") {
          return (
            <ManufacturerCreatableSelect
              value={watch(fieldName) || ""}
              onValueChange={(value) => {
                setValue(fieldName, value);
                // Clear model when manufacturer changes
                setValue("global-model", "");
              }}
              placeholder="Select manufacturer"
            />
          );
        }

        if (attribute.id === "global-model") {
          return (
            <ModelCreatableSelect
              value={watch(fieldName) || ""}
              onValueChange={(value) => setValue(fieldName, value)}
              manufacturerId={selectedManufacturer}
              placeholder="Select model"
              disabled={!selectedManufacturer}
            />
          );
        }

        // Regular dropdown
        return (
          <Select
            value={watch(fieldName) || ""}
            onValueChange={(value) => setValue(fieldName, value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {attribute.dropdownOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <DatePicker
            value={watch(fieldName) || ""}
            onChange={(value) => setValue(fieldName, value)}
            placeholder={attribute.description || "Select date"}
          />
        );

      case "boolean":
        return (
          <Switch
            checked={watch(fieldName) || false}
            onCheckedChange={(checked) => setValue(fieldName, checked)}
          />
        );

      case "search":
        // Site field
        if (attribute.id === "global-contact") {
          return (
            <div className="flex flex-col gap-2">
              <SiteSearchableSelect
                sites={siteOptions}
                value={watch(fieldName) || ""}
                onValueChange={(value) => setValue(fieldName, value)}
                placeholder="Select site"
              />
              {selectedSiteData && (
                <div className="bg-muted px-4 py-1.5 rounded-md text-sm">
                  {selectedSiteData.address}
                </div>
              )}
            </div>
          );
        }

        // Generic search field
        return (
          <Input
            {...register(fieldName)}
            placeholder={attribute.description}
            className="h-9"
          />
        );

      default:
        return (
          <Input
            {...register(fieldName)}
            placeholder={attribute.description}
            className="h-9"
          />
        );
    }
  };

  const error = formState.errors[fieldName];

  // Site, Condition, and Category are required; all other fields show Optional badge
  const isRequired = attribute.id === "global-contact" || attribute.id === "global-condition" || attribute.id === "global-category";

  return (
    <div className="flex items-start justify-between gap-4 w-full">
      <div className="flex flex-col gap-2 py-2.5 w-[210px] shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-left">
            {attribute.label}
          </Label>
          {!isRequired && (
            <Badge
              variant="secondary"
              className="text-[10px] font-medium rounded-none px-1 py-0"
            >
              Optional
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-[320px] shrink-0">
        {renderField()}
        {error && (
          <p className="text-sm text-destructive">
            {error.message as string}
          </p>
        )}
        {attribute.description && !error && attribute.id !== "global-contact" && attribute.id !== "global-category" && attribute.id !== "global-location" && (
          <p className="text-xs text-muted-foreground">
            {attribute.description}
          </p>
        )}
      </div>
    </div>
  );
}

