import React, { useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AttributeType, Attribute, CoreAttribute } from "../../../types";
import { attributeTypeConfigs } from "../../../lib/utils";
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
import { Textarea } from "@/registry/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import { Button } from "@/registry/ui/button";
import { X, Plus } from "lucide-react";

export type AttributeFormMode = "add" | "edit";
export type AttributeFormContext = "category" | "core";

export interface AttributeFormData {
  label: string;
  type: AttributeType;
  description: string;
  dropdownOptions: string[];
  units: string;
  isPreferred: boolean;
  isEnabled: boolean;
  section?: "asset-info" | "status" | "contact" | "dates" | "warranty" | "custom";
}

interface AttributeFormProps {
  mode: AttributeFormMode;
  context: AttributeFormContext;
  initialData?: Partial<AttributeFormData>;
  onSubmit?: (data: AttributeFormData) => void;
  onCancel?: () => void;
  formRef?: React.RefObject<{ submit: () => void }>;
}

// Utility function for text case handling
function toSentenceCase(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export const AttributeForm = React.forwardRef<
  { submit: () => void },
  AttributeFormProps
>(({ context, initialData, onSubmit }, ref) => {
  const form = useForm({
    resolver: zodResolver(attributeFormSchema) as any,
    defaultValues: {
      label: initialData?.label || "",
      type: (initialData?.type || "text") as AttributeType,
      description: initialData?.description || "",
      dropdownOptions: initialData?.dropdownOptions && initialData.dropdownOptions.length > 0
        ? initialData.dropdownOptions
        : [""],
      units: initialData?.units || "",
      isPreferred: initialData?.isPreferred || false,
      isEnabled: initialData?.isEnabled ?? true,
      section: initialData?.section || "custom",
    },
  });

  const watchedType = form.watch("type");
  const typeConfig = attributeTypeConfigs[watchedType];

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        label: initialData.label || "",
        type: (initialData.type || "text") as AttributeType,
        description: initialData.description || "",
        dropdownOptions: initialData.dropdownOptions && initialData.dropdownOptions.length > 0
          ? initialData.dropdownOptions
          : [""],
        units: initialData.units || "",
        isPreferred: initialData.isPreferred || false,
        isEnabled: initialData.isEnabled ?? true,
        section: initialData.section || "custom",
      });
    }
  }, [initialData, form]);

  // Reset dropdown options when type changes away from dropdown
  useEffect(() => {
    if (watchedType !== "dropdown") {
      form.setValue("dropdownOptions", [""]);
    }
  }, [watchedType, form]);

  const handleFormSubmit = (data: any) => {
    if (!onSubmit) return;

    const formData: AttributeFormData = {
      label: data.label.trim(),
      type: data.type,
      description: data.description?.trim() || "",
      dropdownOptions: typeConfig.supportsDropdownOptions
        ? (data.dropdownOptions || []).map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
        : [],
      units: typeConfig.supportsUnits && data.units ? data.units.trim() : "",
      isPreferred: context === "category" ? data.isPreferred : false,
      isEnabled: context === "core" ? data.isEnabled : true,
      section: context === "core" ? data.section : undefined,
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
    if (currentValue && currentValue !== toSentenceCase(currentValue)) {
      form.setValue("label", toSentenceCase(currentValue));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-1 space-y-6">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribute Label</FormLabel>
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
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
              <FormLabel>Attribute Type</FormLabel>
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

        {typeConfig.supportsDropdownOptions && (
          <FormField
            control={form.control}
            name="dropdownOptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropdown Options</FormLabel>
                <div className="space-y-2">
                  {field.value?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <FormControl>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(field.value || [])];
                            newOptions[index] = e.target.value;
                            field.onChange(newOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      </FormControl>
                      {field.value && field.value.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOptions = field.value?.filter((_, i) => i !== index);
                            field.onChange(newOptions);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      field.onChange([...(field.value || []), ""]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {typeConfig.supportsUnits && (
          <FormField
            control={form.control}
            name="units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., kg, cm, hours" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
});

// Export helper to convert form data to Attribute or CoreAttribute
export function formDataToAttribute(
  formData: AttributeFormData
): Omit<Attribute, "id"> | Omit<CoreAttribute, "id"> {
  if (formData.section !== undefined) {
    // Core attribute
    return {
      label: formData.label,
      type: formData.type,
      section: formData.section,
      isEnabled: formData.isEnabled,
      isRequired: false,
      description: formData.description || undefined,
      dropdownOptions:
        formData.dropdownOptions.length > 0
          ? formData.dropdownOptions
          : undefined,
      units: formData.units || undefined,
    } as Omit<CoreAttribute, "id">;
  } else {
    // Category attribute
    return {
      label: formData.label,
      type: formData.type,
      isSystem: false,
      isPreferred: formData.isPreferred,
      description: formData.description || undefined,
      dropdownOptions:
        formData.dropdownOptions.length > 0
          ? formData.dropdownOptions
          : undefined,
      units: formData.units || undefined,
    } as Omit<Attribute, "id">;
  }
}

// Export helper to convert Attribute or CoreAttribute to form data
export function attributeToFormData(
  attribute: Attribute | CoreAttribute,
  context: AttributeFormContext
): AttributeFormData {
  if (context === "core") {
    const coreAttr = attribute as CoreAttribute;
    return {
      label: coreAttr.label,
      type: coreAttr.type as AttributeType,
      description: coreAttr.description || "",
      dropdownOptions: coreAttr.dropdownOptions || [""],
      units: coreAttr.units || "",
      isPreferred: false,
      isEnabled: coreAttr.isEnabled,
      section: coreAttr.section,
    };
  } else {
    const catAttr = attribute as Attribute;
    return {
      label: catAttr.label,
      type: catAttr.type,
      description: catAttr.description || "",
      dropdownOptions: catAttr.dropdownOptions || [""],
      units: catAttr.units || "",
      isPreferred: catAttr.isPreferred,
      isEnabled: true,
    };
  }
}
