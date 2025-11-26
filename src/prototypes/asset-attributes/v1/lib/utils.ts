import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AttributeType } from "../types";
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
  supportsUnits: boolean;
  supportsDropdownOptions: boolean;
}

// Centralized type configurations - single source of truth for all attribute type metadata
export const attributeTypeConfigs: Record<AttributeType, AttributeTypeConfig> = {
  text: {
    value: "text",
    label: "Text",
    icon: Type,
    description: "Single line text input",
    supportsUnits: false,
    supportsDropdownOptions: false,
  },
  number: {
    value: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric value with optional units",
    supportsUnits: true,
    supportsDropdownOptions: false,
  },
  dropdown: {
    value: "dropdown",
    label: "Dropdown",
    icon: List,
    description: "Select from predefined options",
    supportsUnits: false,
    supportsDropdownOptions: true,
  },
  date: {
    value: "date",
    label: "Date",
    icon: Calendar,
    description: "Date picker",
    supportsUnits: false,
    supportsDropdownOptions: false,
  },
  boolean: {
    value: "boolean",
    label: "Yes/No",
    icon: CheckSquare,
    description: "True or false value",
    supportsUnits: false,
    supportsDropdownOptions: false,
  },
};

// Array of attribute types for consistent select dropdowns
export const attributeTypes: { value: AttributeType; label: string }[] =
  Object.values(attributeTypeConfigs).map(config => ({
    value: config.value,
    label: config.label,
  }));
