export type AttributeType = "text" | "number" | "dropdown" | "date" | "boolean";

export type NumberFormat = "measurement" | "currency" | "percentage";

export type MeasurementCategory = "length" | "weight" | "volume" | "area" | "temperature" | "time" | "speed" | "pressure" | "power";

export interface MeasurementConfig {
  category: MeasurementCategory;
  unit: string;
}

export interface CurrencyConfig {
  currency: string; // ISO 4217 code: "GBP", "USD", "EUR", etc.
}

export interface Attribute {
  id: string;
  label: string;
  type: AttributeType;
  isSystem: boolean;
  isPreferred: boolean;
  description?: string;
  order?: number;
  dropdownOptions?: string[];
  numberFormat?: NumberFormat; // For number type: none, measurement, currency, percentage, suffix
  measurementConfig?: MeasurementConfig;
  currencyConfig?: CurrencyConfig;
  suffix?: string; // For number type with suffix format
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
  numberFormat?: NumberFormat; // For number type: none, measurement, currency, percentage, suffix
  measurementConfig?: MeasurementConfig;
  currencyConfig?: CurrencyConfig;
  suffix?: string; // For number type with suffix format
}

