import { useMemo, useCallback, memo } from "react";
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
import { ATTRIBUTE_IDS } from "./attribute-constants";

interface Site {
  id: string;
  name: string;
  address: string;
}

interface AttributeFieldProps {
  attribute: FormAttribute;
  fieldName: string;
  siteOptions?: Site[];
}

/**
 * Helper function to determine if description should be shown
 */
function shouldShowDescription(
  attribute: FormAttribute,
  hasError: boolean
): boolean {
  if (!attribute.description) return false;
  if (hasError) return false;
  
  // Don't show description for these fields (they have custom UI)
  const hideDescriptionFor: string[] = [
    ATTRIBUTE_IDS.CONTACT,
    ATTRIBUTE_IDS.CATEGORY,
    ATTRIBUTE_IDS.LOCATION,
  ];
  
  return !hideDescriptionFor.includes(attribute.id);
}

/**
 * Helper function to safely extract error message
 */
function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Invalid value";
}

// Default site options for prototype (fallback)
const DEFAULT_SITE_OPTIONS: Site[] = [
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

function AttributeFieldComponent({
  attribute,
  fieldName,
  siteOptions = DEFAULT_SITE_OPTIONS,
}: AttributeFieldProps) {
  const { register, watch, setValue, formState } = useFormContext();
  
  // Watch manufacturer and contact (used for cross-field dependencies)
  // Watch fieldName individually for reactivity
  const selectedManufacturer = watch(ATTRIBUTE_IDS.MANUFACTURER) as string | undefined;
  const selectedSite = watch(ATTRIBUTE_IDS.CONTACT) as string | undefined;

  // Memoize site options - only recalculate if attribute.id changes
  const siteOptionsForField = useMemo(() => {
    if (attribute.id !== ATTRIBUTE_IDS.CONTACT) return [];
    return siteOptions;
  }, [attribute.id, siteOptions]);

  const selectedSiteData = useMemo(() => {
    if (!selectedSite) return null;
    return siteOptionsForField.find((s) => s.id === selectedSite) || null;
  }, [selectedSite, siteOptionsForField]);

  // Get current field value - watch individually for proper reactivity
  const fieldValue = watch(fieldName);

  // Memoize renderField function to prevent recreation on each render
  const renderField = useCallback(() => {
    switch (attribute.type) {
      case "text":
        return (
          <Input
            {...register(fieldName)}
            placeholder={
              attribute.id === ATTRIBUTE_IDS.LOCATION
                ? ""
                : attribute.description
            }
            className="h-9"
            aria-label={attribute.label}
            aria-describedby={
              formState.errors[fieldName]
                ? `${fieldName}-error`
                : attribute.description
                ? `${fieldName}-description`
                : undefined
            }
            aria-invalid={!!formState.errors[fieldName]}
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              {...register(fieldName, { valueAsNumber: true })}
              type="number"
              placeholder={
                attribute.id === ATTRIBUTE_IDS.LOCATION
                  ? ""
                  : attribute.description
              }
              className="h-9"
              aria-label={attribute.label}
              aria-describedby={
                formState.errors[fieldName]
                  ? `${fieldName}-error`
                  : attribute.description
                  ? `${fieldName}-description`
                  : undefined
              }
              aria-invalid={!!formState.errors[fieldName]}
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
        if (attribute.id === ATTRIBUTE_IDS.CATEGORY) {
          return (
            <CategorySearchableSelect
              value={fieldValue || ""}
              onValueChange={(value) => setValue(fieldName, value)}
              placeholder="Select category"
            />
          );
        }

        if (attribute.id === ATTRIBUTE_IDS.MANUFACTURER) {
          return (
            <ManufacturerCreatableSelect
              value={fieldValue || ""}
              onValueChange={(value) => {
                setValue(fieldName, value);
                // Clear model when manufacturer changes
                setValue(ATTRIBUTE_IDS.MODEL, "");
              }}
              placeholder="Select manufacturer"
            />
          );
        }

        if (attribute.id === ATTRIBUTE_IDS.MODEL) {
          return (
            <ModelCreatableSelect
              value={fieldValue || ""}
              onValueChange={(value) => setValue(fieldName, value)}
              manufacturerId={selectedManufacturer}
              placeholder="Select model"
              disabled={!selectedManufacturer}
            />
          );
        }

        // Regular dropdown - handle missing options gracefully
        {
          const dropdownOptions = attribute.dropdownOptions || [];
          return (
            <Select
              value={fieldValue || ""}
              onValueChange={(value) => setValue(fieldName, value)}
            >
              <SelectTrigger className="h-9" aria-label={attribute.label}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.length > 0 ? (
                  dropdownOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No options available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          );
        }

      case "date":
        return (
          <DatePicker
            value={fieldValue || ""}
            onChange={(value) => setValue(fieldName, value)}
            placeholder={attribute.description || "Select date"}
          />
        );

      case "boolean":
        return (
          <Switch
            checked={(fieldValue as boolean) || false}
            onCheckedChange={(checked) => setValue(fieldName, checked)}
            aria-label={attribute.label}
          />
        );

      case "search":
        // Site field
        if (attribute.id === ATTRIBUTE_IDS.CONTACT) {
          return (
            <div className="flex flex-col gap-2">
              <SiteSearchableSelect
                sites={siteOptionsForField}
                value={fieldValue || ""}
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
            placeholder={
              attribute.id === ATTRIBUTE_IDS.LOCATION
                ? ""
                : attribute.description
            }
            className="h-9"
            aria-label={attribute.label}
            aria-describedby={
              formState.errors[fieldName]
                ? `${fieldName}-error`
                : attribute.description
                ? `${fieldName}-description`
                : undefined
            }
            aria-invalid={!!formState.errors[fieldName]}
          />
        );

      default:
        return (
          <Input
            {...register(fieldName)}
            placeholder={
              attribute.id === ATTRIBUTE_IDS.LOCATION
                ? ""
                : attribute.description
            }
            className="h-9"
            aria-label={attribute.label}
            aria-describedby={
              formState.errors[fieldName]
                ? `${fieldName}-error`
                : attribute.description
                ? `${fieldName}-description`
                : undefined
            }
            aria-invalid={!!formState.errors[fieldName]}
          />
        );
    }
  }, [
    attribute,
    fieldName,
    fieldValue,
    selectedManufacturer,
    selectedSiteData,
    siteOptionsForField,
    register,
    setValue,
    formState.errors,
  ]);

  const error = formState.errors[fieldName];
  const errorMessage = getErrorMessage(error);
  const hasError = !!error;

  // Site, Condition, and Category are required; all other fields show Optional badge
  const isRequired =
    attribute.id === ATTRIBUTE_IDS.CONTACT ||
    attribute.id === ATTRIBUTE_IDS.CONDITION ||
    attribute.id === ATTRIBUTE_IDS.CATEGORY;

  const showDescription = shouldShowDescription(attribute, hasError);
  const errorId = `${fieldName}-error`;
  const descriptionId = `${fieldName}-description`;

  return (
    <div className="flex items-start justify-between gap-4 w-full min-w-0">
      <div className="flex flex-col gap-2 py-2.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-left" htmlFor={fieldName}>
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
      <div className="flex flex-col gap-2 flex-1 min-w-0 max-w-[280px]">
        {renderField()}
        {errorMessage && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        )}
        {showDescription && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {attribute.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const AttributeField = memo(AttributeFieldComponent);

