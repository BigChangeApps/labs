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

// Array of attribute types for consistent select dropdowns
export const attributeTypes: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes/No" },
];
