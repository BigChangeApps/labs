import type { Attribute, Category, Manufacturer } from "../types";

// All attributes in the library
export const attributeLibrary: Attribute[] = [
  // System attributes
  {
    id: "manufacturer",
    label: "Manufacturer",
    type: "dropdown",
    isSystem: true,
    isRequired: true,
    appliedToCategories: ["boiler", "cctv", "pump"],
    description: "Equipment manufacturer",
  },
  {
    id: "model",
    label: "Model",
    type: "dropdown",
    isSystem: true,
    isRequired: true,
    appliedToCategories: ["boiler", "cctv", "pump"],
    description: "Equipment model",
  },
  {
    id: "flue-type",
    label: "Flue Type",
    type: "dropdown",
    isSystem: true,
    isRequired: false,
    appliedToCategories: ["boiler"],
    description: "Type of flue system",
  },
  {
    id: "gas-pressure",
    label: "Gas Pressure",
    type: "number",
    isSystem: true,
    isRequired: false,
    appliedToCategories: ["boiler"],
    description: "Gas pressure in mbar",
  },
  // Custom attributes
  {
    id: "inspection-frequency",
    label: "Inspection Frequency",
    type: "dropdown",
    isSystem: false,
    isRequired: false,
    appliedToCategories: ["boiler", "cctv", "pump"],
    description: "How often equipment should be inspected",
  },
  {
    id: "height",
    label: "Height (mm)",
    type: "number",
    isSystem: false,
    isRequired: false,
    appliedToCategories: ["boiler"],
    description: "Height of the equipment in millimeters",
  },
  {
    id: "pressure-rating",
    label: "Pressure Rating",
    type: "number",
    isSystem: false,
    isRequired: false,
    appliedToCategories: [],
    description: "Maximum pressure rating in bar",
  },
  {
    id: "safety-certificate",
    label: "Safety Certificate",
    type: "text",
    isSystem: false,
    isRequired: false,
    appliedToCategories: [],
    description: "Safety certificate reference number",
  },
  {
    id: "installation-date",
    label: "Installation Date",
    type: "date",
    isSystem: false,
    isRequired: false,
    appliedToCategories: [],
    description: "Date of installation",
  },
];

// Categories with their attribute configurations
export const categories: Category[] = [
  {
    id: "boiler",
    name: "Boiler",
    systemAttributes: [
      { attributeId: "manufacturer", isEnabled: true, order: 0 },
      { attributeId: "model", isEnabled: true, order: 1 },
      { attributeId: "flue-type", isEnabled: true, order: 2 },
      { attributeId: "gas-pressure", isEnabled: true, order: 3 },
    ],
    customAttributes: [
      { attributeId: "inspection-frequency", isEnabled: true, order: 0 },
      { attributeId: "height", isEnabled: true, order: 1 },
    ],
  },
  {
    id: "cctv",
    name: "CCTV",
    systemAttributes: [
      { attributeId: "manufacturer", isEnabled: true, order: 0 },
      { attributeId: "model", isEnabled: true, order: 1 },
    ],
    customAttributes: [
      { attributeId: "inspection-frequency", isEnabled: true, order: 0 },
    ],
  },
  {
    id: "pump",
    name: "Pump",
    systemAttributes: [
      { attributeId: "manufacturer", isEnabled: true, order: 0 },
      { attributeId: "model", isEnabled: true, order: 1 },
    ],
    customAttributes: [
      { attributeId: "inspection-frequency", isEnabled: true, order: 0 },
    ],
  },
];

// Manufacturers with models
export const manufacturers: Manufacturer[] = [
  {
    id: "vaillant",
    name: "Vaillant",
    models: [
      { id: "ecotec-pro", name: "ecoTEC Pro" },
      { id: "ecotec-plus", name: "ecoTEC Plus" },
    ],
    usedByCategories: ["boiler"],
  },
  {
    id: "worcester-bosch",
    name: "Worcester Bosch",
    models: [
      { id: "greenstar", name: "Greenstar" },
      { id: "cdi-compact", name: "CDI Compact" },
    ],
    usedByCategories: ["boiler"],
  },
];
