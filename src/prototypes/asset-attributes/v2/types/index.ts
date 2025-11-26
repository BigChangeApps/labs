export type AttributeType = "text" | "number" | "dropdown" | "date" | "boolean";

export interface Attribute {
  id: string;
  label: string;
  type: AttributeType;
  isSystem: boolean;
  isPreferred: boolean;
  description?: string;
  order?: number;
  dropdownOptions?: string[];
  units?: string;
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

export type GlobalAttributeSection =
  | "asset-info"
  | "status"
  | "contact"
  | "dates"
  | "warranty"
  | "custom"
  | "your-attributes";

export interface GlobalAttribute {
  id: string;
  label: string;
  type: AttributeType | "search";
  section: GlobalAttributeSection;
  isEnabled: boolean;
  isRequired: boolean;
  description?: string;
  detailedDescription?: string;
  dropdownOptions?: string[];
  units?: string; // Added for consistency with category attributes
}

