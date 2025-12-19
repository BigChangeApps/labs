import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AttributeType, MeasurementCategory, NumberFormat } from "../types";
import {
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
  Search,
  type LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get icon component for attribute type
export function getAttributeIcon(
  type: AttributeType | "search"
): LucideIcon {
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
}

// Helper function to get display name for attribute types
export function getAttributeTypeLabel(type: AttributeType | "search"): string {
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
}

// Centralized configuration for attribute types
export interface AttributeTypeConfig {
  value: AttributeType;
  label: string;
  icon: LucideIcon;
  description: string;
  supportsDropdownOptions: boolean;
  supportsNumberFormat: boolean;
}

// Centralized type configurations - single source of truth for all attribute type metadata
export const attributeTypeConfigs: Record<AttributeType, AttributeTypeConfig> = {
  text: {
    value: "text",
    label: "Text",
    icon: Type,
    description: "Single line text input",
    supportsDropdownOptions: false,
    supportsNumberFormat: false,
  },
  number: {
    value: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric value with optional formatting",
    supportsDropdownOptions: false,
    supportsNumberFormat: true,
  },
  dropdown: {
    value: "dropdown",
    label: "Dropdown",
    icon: List,
    description: "Select from predefined options",
    supportsDropdownOptions: true,
    supportsNumberFormat: false,
  },
  date: {
    value: "date",
    label: "Date",
    icon: Calendar,
    description: "Date picker",
    supportsDropdownOptions: false,
    supportsNumberFormat: false,
  },
  boolean: {
    value: "boolean",
    label: "Yes/No",
    icon: CheckSquare,
    description: "True or false value",
    supportsDropdownOptions: false,
    supportsNumberFormat: false,
  },
};

// Number format options
export interface NumberFormatConfig {
  value: NumberFormat;
  label: string;
  description: string;
}

export const numberFormatConfigs: NumberFormatConfig[] = [
  { value: "measurement", label: "Measurement", description: "With unit (length, weight, etc.)" },
  { value: "currency", label: "Currency", description: "Monetary value" },
  { value: "percentage", label: "Percentage", description: "Displayed as %" },
];

// Measurement unit data
export interface MeasurementUnit {
  value: string;
  label: string;
  symbol: string;
}

export interface MeasurementCategoryConfig {
  value: MeasurementCategory;
  label: string;
  units: MeasurementUnit[];
}

export const measurementCategories: MeasurementCategoryConfig[] = [
  {
    value: "length",
    label: "Length",
    units: [
      { value: "mm", label: "Millimeters", symbol: "mm" },
      { value: "cm", label: "Centimeters", symbol: "cm" },
      { value: "m", label: "Meters", symbol: "m" },
      { value: "km", label: "Kilometers", symbol: "km" },
      { value: "in", label: "Inches", symbol: "in" },
      { value: "ft", label: "Feet", symbol: "ft" },
      { value: "yd", label: "Yards", symbol: "yd" },
      { value: "mi", label: "Miles", symbol: "mi" },
    ],
  },
  {
    value: "weight",
    label: "Weight",
    units: [
      { value: "g", label: "Grams", symbol: "g" },
      { value: "kg", label: "Kilograms", symbol: "kg" },
      { value: "oz", label: "Ounces", symbol: "oz" },
      { value: "lb", label: "Pounds", symbol: "lb" },
      { value: "ton", label: "Metric tons", symbol: "t" },
    ],
  },
  {
    value: "volume",
    label: "Volume",
    units: [
      { value: "ml", label: "Milliliters", symbol: "ml" },
      { value: "l", label: "Liters", symbol: "L" },
      { value: "m3", label: "Cubic meters", symbol: "m³" },
      { value: "gal", label: "Gallons", symbol: "gal" },
      { value: "floz", label: "Fluid ounces", symbol: "fl oz" },
    ],
  },
  {
    value: "area",
    label: "Area",
    units: [
      { value: "m2", label: "Square meters", symbol: "m²" },
      { value: "km2", label: "Square kilometers", symbol: "km²" },
      { value: "ft2", label: "Square feet", symbol: "ft²" },
      { value: "acre", label: "Acres", symbol: "ac" },
      { value: "ha", label: "Hectares", symbol: "ha" },
    ],
  },
  {
    value: "temperature",
    label: "Temperature",
    units: [
      { value: "c", label: "Celsius", symbol: "°C" },
      { value: "f", label: "Fahrenheit", symbol: "°F" },
      { value: "k", label: "Kelvin", symbol: "K" },
    ],
  },
  {
    value: "time",
    label: "Time / Duration",
    units: [
      { value: "sec", label: "Seconds", symbol: "s" },
      { value: "min", label: "Minutes", symbol: "min" },
      { value: "hr", label: "Hours", symbol: "hr" },
      { value: "day", label: "Days", symbol: "days" },
      { value: "wk", label: "Weeks", symbol: "wks" },
      { value: "mo", label: "Months", symbol: "mo" },
      { value: "yr", label: "Years", symbol: "yrs" },
    ],
  },
  {
    value: "speed",
    label: "Speed",
    units: [
      { value: "ms", label: "Meters per second", symbol: "m/s" },
      { value: "kmh", label: "Kilometers per hour", symbol: "km/h" },
      { value: "mph", label: "Miles per hour", symbol: "mph" },
    ],
  },
  {
    value: "pressure",
    label: "Pressure",
    units: [
      { value: "psi", label: "PSI", symbol: "psi" },
      { value: "bar", label: "Bar", symbol: "bar" },
      { value: "kpa", label: "Kilopascals", symbol: "kPa" },
      { value: "pa", label: "Pascals", symbol: "Pa" },
    ],
  },
  {
    value: "power",
    label: "Power",
    units: [
      { value: "w", label: "Watts", symbol: "W" },
      { value: "kw", label: "Kilowatts", symbol: "kW" },
      { value: "hp", label: "Horsepower", symbol: "HP" },
    ],
  },
];

// Currency data
export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

export const currencies: CurrencyOption[] = [
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { value: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
  { value: "ZAR", label: "South African Rand", symbol: "R" },
  { value: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { value: "SEK", label: "Swedish Krona", symbol: "kr" },
  { value: "NOK", label: "Norwegian Krone", symbol: "kr" },
  { value: "DKK", label: "Danish Krone", symbol: "kr" },
];

// Helper to get measurement unit by category and value
export function getMeasurementUnit(category: MeasurementCategory, unitValue: string): MeasurementUnit | undefined {
  const categoryConfig = measurementCategories.find(c => c.value === category);
  return categoryConfig?.units.find(u => u.value === unitValue);
}

// Helper to get currency by value
export function getCurrency(currencyValue: string): CurrencyOption | undefined {
  return currencies.find(c => c.value === currencyValue);
}

// Array of attribute types for consistent select dropdowns
export const attributeTypes: { value: AttributeType; label: string }[] =
  Object.values(attributeTypeConfigs).map(config => ({
    value: config.value,
    label: config.label,
  }));

/**
 * Format an ISO date string to "DD MMMM YYYY" format (e.g., "30 June 2025")
 */
export function formatDateLong(dateString: string | undefined | null): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

