import { z } from "zod";

// Base schema for attribute types
const attributeTypeSchema = z.enum(["text", "number", "dropdown", "date", "boolean"]);

// Base schema for core attribute sections
const coreAttributeSectionSchema = z.enum([
  "asset-info",
  "status",
  "contact",
  "dates",
  "warranty",
  "custom",
]);

// Attribute form schema for category and core attributes
export const attributeFormSchema = z.object({
  label: z
    .string()
    .min(1, "Attribute label is required")
    .max(100, "Label must be 100 characters or less"),

  type: attributeTypeSchema,

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .default(""),

  dropdownOptions: z
    .array(z.string())
    .default([""]),

  units: z
    .string()
    .max(50, "Units must be 50 characters or less")
    .default(""),

  isPreferred: z.boolean().default(false),

  isEnabled: z.boolean().default(true),

  section: coreAttributeSectionSchema.default("custom"),
})
  .refine(
    (data) => {
      // If type is dropdown, must have at least one non-empty option
      if (data.type === "dropdown") {
        const validOptions = data.dropdownOptions?.filter((opt) => opt.trim().length > 0) ?? [];
        return validOptions.length > 0;
      }
      return true;
    },
    {
      message: "Dropdown attributes must have at least one option",
      path: ["dropdownOptions"],
    }
  );

// Manufacturer form schema
export const manufacturerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Manufacturer name is required")
    .max(100, "Name must be 100 characters or less"),

  models: z
    .array(z.string())
    .default([""]),
});

// Type inference helpers
export type AttributeFormValues = z.infer<typeof attributeFormSchema>;
export type ManufacturerFormValues = z.infer<typeof manufacturerFormSchema>;
