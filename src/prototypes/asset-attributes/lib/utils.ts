import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AttributeType } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get display name for attribute types
export function getAttributeTypeLabel(type: AttributeType): string {
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
    default:
      return type;
  }
}
