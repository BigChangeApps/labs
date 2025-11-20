import { z } from "zod";
import type { FormAttribute } from "./asset-form-utils";

/**
 * Create a dynamic Zod schema based on the attributes for a category
 */
export function createAssetFormSchema(attributes: FormAttribute[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  attributes.forEach((attr) => {
    const fieldName = attr.id;

    let fieldSchema: z.ZodTypeAny;

    switch (attr.type) {
      case "text":
      case "search":
        fieldSchema = z.string();
        break;

      case "number":
        // Accept number or string that can be parsed to number
        fieldSchema = z.union([
          z.number(),
          z.string().transform((val) => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
          }),
        ]);
        break;

      case "date":
        // Accept string or date
        fieldSchema = z.union([z.string(), z.date()]);
        break;

      case "boolean":
        fieldSchema = z.boolean();
        break;

      case "dropdown":
        fieldSchema = z.string();
        break;

      default:
        fieldSchema = z.string();
    }

    // Site (global-contact), Condition (global-condition), and Category (global-category) are required; all other fields are optional
    if (attr.id === "global-contact" || attr.id === "global-condition" || attr.id === "global-category") {
      // Site, Condition, and Category are required
      if (attr.type === "number" || attr.type === "date") {
        // Union types (number, date) use refine for validation
        schemaFields[fieldName] = fieldSchema.refine(
          (val) => val !== undefined && val !== null && val !== "",
          { message: `${attr.label} is required` }
        );
      } else {
        // String fields use min(1)
        schemaFields[fieldName] = fieldSchema.min(1, `${attr.label} is required`);
      }
    } else {
      // All other fields are optional - allow empty strings and undefined
      if (attr.type === "text" || attr.type === "search" || attr.type === "dropdown") {
        // For string fields, convert empty strings to undefined, then validate as optional
        schemaFields[fieldName] = z.preprocess(
          (val) => (val === "" || val === null ? undefined : val),
          z.string().min(1).optional()
        );
      } else if (attr.type === "number") {
        // For number fields, allow undefined or empty string
        schemaFields[fieldName] = z.preprocess(
          (val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            if (typeof val === "number") return val;
            const num = parseFloat(val);
            return isNaN(num) ? undefined : num;
          },
          z.number().optional()
        );
      } else if (attr.type === "date") {
        // For date fields, allow undefined or empty string
        schemaFields[fieldName] = z.preprocess(
          (val) => (val === "" || val === null ? undefined : val),
          z.union([z.string(), z.date()]).optional()
        );
      } else {
        // Boolean and other fields
        schemaFields[fieldName] = fieldSchema.optional();
      }
    }
  });

  // Add conditional validation: Model requires Manufacturer
  const modelAttr = attributes.find((a) => a.id === "global-model");
  const manufacturerAttr = attributes.find((a) => a.id === "global-manufacturer");

  if (modelAttr && manufacturerAttr) {
    return z
      .object(schemaFields)
      .refine(
        (data) => {
          // If model is provided, manufacturer must be provided
          if (data["global-model"] && !data["global-manufacturer"]) {
            return false;
          }
          return true;
        },
        {
          message: "Manufacturer is required when Model is selected",
          path: ["global-manufacturer"],
        }
      );
  }

  return z.object(schemaFields);
}

