import React, { useState, useEffect, useImperativeHandle } from "react";
import type { AttributeType, Attribute, CoreAttribute } from "../../../types";
import { attributeTypeConfigs } from "../../../lib/utils";
import {
  AttributeLabelField,
  AttributeTypeField,
  AttributeDescriptionField,
  AttributeDropdownOptionsField,
  AttributeUnitsField,
  AttributePreferredField,
} from "./fields";

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

export const AttributeForm = React.forwardRef<
  { submit: () => void },
  AttributeFormProps
>(({ context, initialData, onSubmit }, ref) => {

  const [label, setLabel] = useState(initialData?.label || "");
  const [type, setType] = useState<AttributeType>(
    initialData?.type || "text"
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(
    initialData?.dropdownOptions && initialData.dropdownOptions.length > 0
      ? initialData.dropdownOptions
      : [""]
  );
  const [units, setUnits] = useState(initialData?.units || "");
  const [isPreferred, setIsPreferred] = useState(
    initialData?.isPreferred || false
  );
  const [isEnabled, setIsEnabled] = useState(
    initialData?.isEnabled ?? true
  );
  const [section, setSection] = useState<
    "asset-info" | "status" | "contact" | "dates" | "warranty" | "custom"
  >(initialData?.section || "custom");

  // Reset dropdown options when type changes away from dropdown
  const handleTypeChange = () => {
    if (type !== "dropdown") {
      setDropdownOptions([""]);
    } else if (
      dropdownOptions.length === 0 ||
      (dropdownOptions.length === 1 && dropdownOptions[0] === "")
    ) {
      setDropdownOptions([""]);
    }
  };

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.label !== undefined) setLabel(initialData.label);
      if (initialData.type !== undefined) setType(initialData.type);
      if (initialData.description !== undefined)
        setDescription(initialData.description);
      if (
        initialData.dropdownOptions !== undefined &&
        initialData.dropdownOptions.length > 0
      ) {
        setDropdownOptions(initialData.dropdownOptions);
      } else if (type === "dropdown") {
        setDropdownOptions([""]);
      }
      if (initialData.units !== undefined) setUnits(initialData.units);
      if (initialData.isPreferred !== undefined)
        setIsPreferred(initialData.isPreferred);
      if (initialData.isEnabled !== undefined)
        setIsEnabled(initialData.isEnabled);
      if (initialData.section !== undefined) setSection(initialData.section);
    }
  }, [initialData, type]);

  const handleSubmit = () => {
    if (!onSubmit) return false;

    // Validation
    if (!label.trim()) {
      return false;
    }

    // Use centralized config for validation
    const typeConfig = attributeTypeConfigs[type];
    if (typeConfig.supportsDropdownOptions) {
      const validOptions = dropdownOptions
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
      if (validOptions.length === 0) {
        return false;
      }
    }

    const formData: AttributeFormData = {
      label: label.trim(),
      type,
      description: description.trim(),
      dropdownOptions: typeConfig.supportsDropdownOptions
        ? dropdownOptions.map((opt) => opt.trim()).filter((opt) => opt.length > 0)
        : [],
      units: typeConfig.supportsUnits && units.trim() ? units.trim() : "",
      isPreferred: context === "category" ? isPreferred : false,
      isEnabled: context === "core" ? isEnabled : true,
      section: context === "core" ? section : undefined,
    };

    onSubmit(formData);
    return true;
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      return handleSubmit();
    },
  }));

  return (
    <div className="flex-1 py-6 space-y-4">
      <AttributeLabelField
        value={label}
        onChange={setLabel}
      />

      <AttributeDescriptionField
        value={description}
        onChange={setDescription}
      />

      <AttributeTypeField
        value={type}
        onChange={setType}
        onTypeChange={handleTypeChange}
      />

      {attributeTypeConfigs[type].supportsDropdownOptions && (
        <AttributeDropdownOptionsField
          options={dropdownOptions}
          onChange={setDropdownOptions}
        />
      )}

      {attributeTypeConfigs[type].supportsUnits && (
        <AttributeUnitsField
          value={units}
          onChange={setUnits}
        />
      )}

      {context === "category" && (
        <AttributePreferredField
          value={isPreferred}
          onChange={setIsPreferred}
        />
      )}
    </div>
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
      units: formData.units || undefined, // Now supported for core attributes
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
      units: coreAttr.units || "", // Now reads units from core attributes
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

