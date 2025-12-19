import React, { useEffect, useImperativeHandle, useState, useRef } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AttributeType, Attribute, GlobalAttribute, GlobalAttributeSection, MeasurementCategory, NumberFormat } from "../../../types";
import { attributeTypeConfigs, measurementCategories, currencies, numberFormatConfigs } from "../../../lib/utils";
import { attributeFormSchema } from "../../../lib/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/ui/form";
import { Input } from "@/registry/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { Kbd } from "@/registry/ui/kbd";
import { X, Plus, CornerDownLeft } from "lucide-react";
import { AttributePreferredField } from "./fields/AttributePreferredField";
import { usePreferredField } from "../../../lib/use-category-add-button";

export type AttributeFormMode = "add" | "edit";
export type AttributeFormContext = "category" | "global";

export interface AttributeFormData {
  label: string;
  type: AttributeType;
  description: string;
  dropdownOptions: string[];
  units: string;
  isPreferred: boolean;
  isEnabled: boolean;
  section?: GlobalAttributeSection;
  numberFormat?: NumberFormat;
  measurementCategory?: MeasurementCategory;
  measurementUnit?: string;
  currency?: string;
  suffix?: string;
}

interface AttributeFormProps {
  mode: AttributeFormMode;
  context: AttributeFormContext;
  initialData?: Partial<AttributeFormData>;
  onSubmit?: (data: AttributeFormData) => void;
  onCancel?: () => void;
  formRef?: React.RefObject<{ submit: () => void }>;
  formId?: string;
}

// Utility function for smart sentence case handling
function toSentenceCase(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  // Split into words and apply smart casing logic
  const words = trimmed.split(/\s+/);

  const processedWords = words.map((word, index) => {
    if (!word) return word;

    const isAllCaps = word === word.toUpperCase() && /[A-Z]/.test(word);
    const wordLength = word.replace(/[^A-Za-z]/g, '').length; // Count only letters

    // First word: preserve short acronyms (2-4 letters), otherwise capitalize normally
    if (index === 0) {
      if (isAllCaps && wordLength >= 2 && wordLength <= 4) {
        return word; // Keep acronym as-is (CPU, API, USB, ID, VIN)
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // Subsequent words: title case (capitalize each word)
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return processedWords.join(' ');
}

export const AttributeForm = React.forwardRef<
  { submit: () => void },
  AttributeFormProps
>(({ context, initialData, onSubmit, formId = "attribute-form" }, ref) => {
  const [hasAutoFormatted, setHasAutoFormatted] = React.useState(false);
  const [autoFormattedValue, setAutoFormattedValue] = React.useState<string>("");
  const showPreferredField = usePreferredField();

  // NOTE: Enter key functionality for dropdown options
  // This state and ref management enables pressing Enter to add/focus next option
  // Similar implementation exists in ManufacturerForm.tsx - kept separate for simplicity
  // Consider extracting to shared component/hook if a third form needs this pattern
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const addOptionButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Zod v4 compatibility with react-hook-form resolver
    // @ts-ignore - Zod v4 compatibility with react-hook-form resolver (using @ts-ignore instead of @ts-expect-error to avoid unused directive error in some build environments)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod resolver compatibility
    resolver: zodResolver(attributeFormSchema) as any,
    defaultValues: {
      label: initialData?.label || "",
      type: (initialData?.type || "text") as AttributeType,
      description: initialData?.description || "",
      dropdownOptions: initialData?.dropdownOptions && initialData.dropdownOptions.length > 0
        ? initialData.dropdownOptions
        : ["", "", ""],
      units: initialData?.units || "",
      isPreferred: initialData?.isPreferred || false,
      isEnabled: initialData?.isEnabled ?? true,
      section: initialData?.section || "asset-info",
      numberFormat: initialData?.numberFormat || "",
      measurementCategory: initialData?.measurementCategory || "length",
      measurementUnit: initialData?.measurementUnit || "cm",
      currency: initialData?.currency || "GBP",
      suffix: initialData?.suffix || "",
    },
  });

  const watchedType = form.watch("type");
  const watchedNumberFormat = form.watch("numberFormat");
  const watchedMeasurementCategory = form.watch("measurementCategory");
  const typeConfig = attributeTypeConfigs[watchedType];

  // Get available units for selected measurement category
  const availableUnits = measurementCategories.find(
    c => c.value === watchedMeasurementCategory
  )?.units || [];

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        label: initialData.label || "",
        type: (initialData.type || "text") as AttributeType,
        description: initialData.description || "",
        dropdownOptions: initialData.dropdownOptions && initialData.dropdownOptions.length > 0
          ? initialData.dropdownOptions
          : ["", "", ""],
        units: initialData.units || "",
        isPreferred: initialData.isPreferred || false,
        isEnabled: initialData.isEnabled ?? true,
        section: initialData.section || "asset-info",
        numberFormat: initialData.numberFormat || "",
        measurementCategory: initialData.measurementCategory || "length",
        measurementUnit: initialData.measurementUnit || "cm",
        currency: initialData.currency || "GBP",
        suffix: initialData.suffix || "",
      });
    }
  }, [initialData, form]);

  // Reset dropdown options when type changes away from dropdown
  useEffect(() => {
    if (watchedType !== "dropdown") {
      form.setValue("dropdownOptions", ["", "", ""]);
    }
  }, [watchedType, form]);

  const handleFormSubmit = (data: FieldValues) => {
    if (!onSubmit) return;

    const formData: AttributeFormData = {
      label: data.label.trim(),
      type: data.type,
      description: data.description?.trim() || "",
      dropdownOptions: typeConfig.supportsDropdownOptions
        ? (data.dropdownOptions || []).map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
        : [],
      units: "",
      isPreferred: context === "category" ? data.isPreferred : false,
      isEnabled: context === "global" ? data.isEnabled : true,
      section: context === "global" ? (data.section || "asset-info") : undefined,
      numberFormat: data.numberFormat || undefined,
      measurementCategory: data.numberFormat === "measurement" ? data.measurementCategory : undefined,
      measurementUnit: data.numberFormat === "measurement" ? data.measurementUnit : undefined,
      currency: data.numberFormat === "currency" ? data.currency : undefined,
    };

    onSubmit(formData);
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit(handleFormSubmit)();
    },
  }));

  const handleLabelBlur = () => {
    const currentValue = form.getValues("label");
    if (!currentValue) return;

    const formattedValue = toSentenceCase(currentValue);

    // If we previously auto-formatted and user changed it back, don't re-format
    if (hasAutoFormatted && currentValue !== autoFormattedValue) {
      // User has manually edited after our auto-format, so stop formatting
      return;
    }

    // Only apply formatting if it would change the value
    if (currentValue !== formattedValue) {
      form.setValue("label", formattedValue);
      setAutoFormattedValue(formattedValue);
      setHasAutoFormatted(true);
    }
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Attribute label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    handleLabelBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Description
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium rounded-none px-1 py-0"
                >
                  Optional
                </Badge>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(attributeTypeConfigs).map((config) => (
                    <SelectItem key={config.value} value={config.value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {typeConfig.supportsNumberFormat && (
          <FormField
            control={form.control}
            name="numberFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Format
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium rounded-none px-1 py-0"
                  >
                    Optional
                  </Badge>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {numberFormatConfigs.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {typeConfig.supportsDropdownOptions && (
          <FormField
            control={form.control}
            name="dropdownOptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropdown options</FormLabel>
                <div className="space-y-2">
                  <div className="max-h-[240px] overflow-y-auto space-y-2 p-1 -m-1">
                    {field.value?.map((option, index) => {
                      const isLastInput = index === (field.value?.length || 0) - 1;

                      return (
                        <div key={index} className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              ref={(el: HTMLInputElement | null) => {
                                if (el) {
                                  inputRefs.current.set(index, el);
                                } else {
                                  inputRefs.current.delete(index);
                                }
                              }}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(field.value || [])];
                                newOptions[index] = e.target.value;
                                field.onChange(newOptions);
                              }}
                              onFocus={() => setFocusedIndex(index)}
                              onBlur={() => setFocusedIndex(null)}
                              onKeyDown={(e) => {
                                // Handle Enter key
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (isLastInput) {
                                    // On last input, add a new option and focus it
                                    const newIndex = (field.value?.length || 0);
                                    field.onChange([...(field.value || []), ""]);
                                    setTimeout(() => {
                                      inputRefs.current.get(newIndex)?.focus();
                                    }, 0);
                                  } else {
                                    // Not on last input, move to next field
                                    inputRefs.current.get(index + 1)?.focus();
                                  }
                                }

                                // Handle Tab to manually move focus to remove button
                                if (e.key === "Tab" && !e.shiftKey && field.value && field.value.length > 1) {
                                  e.preventDefault();
                                  // Focus the remove button next to this input
                                  const currentInput = e.currentTarget;
                                  const removeButton = currentInput.parentElement?.nextElementSibling as HTMLElement;
                                  if (removeButton && removeButton.tagName === "BUTTON") {
                                    removeButton.focus();
                                  }
                                }

                                // Handle Shift+Tab for backwards navigation
                                if (e.key === "Tab" && e.shiftKey && index > 0) {
                                  e.preventDefault();
                                  // Focus the previous input or button
                                  const prevRemoveButton = inputRefs.current.get(index - 1)?.parentElement?.nextElementSibling as HTMLElement;
                                  if (prevRemoveButton && prevRemoveButton.tagName === "BUTTON" && field.value && field.value.length > 1) {
                                    prevRemoveButton.focus();
                                  } else {
                                    inputRefs.current.get(index - 1)?.focus();
                                  }
                                }
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="pr-12"
                            />
                            {focusedIndex === index && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Kbd>
                                  <CornerDownLeft className="h-3 w-3" />
                                </Kbd>
                              </div>
                            )}
                          </div>
                          {field.value && field.value.length > 1 && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              tabIndex={0}
                              onClick={() => {
                                const newOptions = field.value?.filter((_, i) => i !== index);
                                field.onChange(newOptions);
                              }}
                              onKeyDown={(e) => {
                                // Handle Tab to move to next input or Add Option button
                                if (e.key === "Tab" && !e.shiftKey) {
                                  e.preventDefault();
                                  const nextIndex = index + 1;
                                  if (nextIndex < (field.value?.length || 0)) {
                                    inputRefs.current.get(nextIndex)?.focus();
                                  } else {
                                    // We're on the last remove button, focus the "Add Option" button
                                    addOptionButtonRef.current?.focus();
                                  }
                                }

                                // Handle Shift+Tab to move back to current input
                                if (e.key === "Tab" && e.shiftKey) {
                                  e.preventDefault();
                                  inputRefs.current.get(index)?.focus();
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    ref={addOptionButtonRef}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      field.onChange([...(field.value || []), ""]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add option
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedNumberFormat === "measurement" && (
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="measurementCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset unit to first unit of new category
                      const newCategory = measurementCategories.find(c => c.value === value);
                      if (newCategory?.units[0]) {
                        form.setValue("measurementUnit", newCategory.units[0].value);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {measurementCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchedNumberFormat === "currency" && (
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.symbol} - {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {context === "category" && showPreferredField && (
          <FormField
            control={form.control}
            name="isPreferred"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AttributePreferredField
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {context === "global" && (
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="asset-info">Asset info</SelectItem>
                    <SelectItem value="dates">Dates and lifecycle</SelectItem>
                    <SelectItem value="warranty">Warranty</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
});

// Export helper to convert form data to Attribute or GlobalAttribute
// eslint-disable-next-line react-refresh/only-export-components
export function formDataToAttribute(
  formData: AttributeFormData
): Omit<Attribute, "id"> | Omit<GlobalAttribute, "id"> {
  const baseFields = {
    label: formData.label,
    type: formData.type,
    description: formData.description || undefined,
    dropdownOptions:
      formData.dropdownOptions.length > 0
        ? formData.dropdownOptions
        : undefined,
    units: formData.units || undefined,
    measurementConfig: formData.measurementCategory && formData.measurementUnit
      ? { category: formData.measurementCategory, unit: formData.measurementUnit }
      : undefined,
    currencyConfig: formData.currency
      ? { currency: formData.currency }
      : undefined,
    suffix: formData.suffix || undefined,
  };

  if (formData.section !== undefined) {
    // Global attribute
    return {
      ...baseFields,
      section: formData.section,
      isEnabled: formData.isEnabled,
      isRequired: false,
    } as Omit<GlobalAttribute, "id">;
  } else {
    // Category attribute
    return {
      ...baseFields,
      isSystem: false,
      isPreferred: formData.isPreferred,
    } as Omit<Attribute, "id">;
  }
}

// Export helper to convert Attribute or GlobalAttribute to form data
// eslint-disable-next-line react-refresh/only-export-components
export function attributeToFormData(
  attribute: Attribute | GlobalAttribute,
  context: AttributeFormContext
): AttributeFormData {
  const baseFields = {
    label: attribute.label,
    type: attribute.type as AttributeType,
    description: attribute.description || "",
    dropdownOptions: attribute.dropdownOptions || [""],
    units: attribute.units || "",
    measurementCategory: attribute.measurementConfig?.category,
    measurementUnit: attribute.measurementConfig?.unit,
    currency: attribute.currencyConfig?.currency,
    suffix: attribute.suffix || "",
  };

  if (context === "global") {
    const globalAttr = attribute as GlobalAttribute;
    return {
      ...baseFields,
      isPreferred: false,
      isEnabled: globalAttr.isEnabled,
      section: globalAttr.section,
    };
  } else {
    const catAttr = attribute as Attribute;
    return {
      ...baseFields,
      isPreferred: catAttr.isPreferred,
      isEnabled: true,
    };
  }
}
