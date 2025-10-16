export type AttributeType = "text" | "number" | "dropdown" | "date" | "boolean";

export interface Attribute {
  id: string;
  label: string;
  type: AttributeType;
  isSystem: boolean;
  isRequired: boolean;
  defaultValue?: string | number | boolean;
  appliedToCategories: string[];
  description?: string;
  order?: number;
  dropdownOptions?: string[];
}

export interface CategoryAttributeConfig {
  attributeId: string;
  isEnabled: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: string[];
  systemAttributes: CategoryAttributeConfig[];
  customAttributes: CategoryAttributeConfig[];
  inheritedAttributes?: CategoryAttributeConfig[];
}

export interface Model {
  id: string;
  name: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  models: Model[];
  usedByCategories: string[];
}
