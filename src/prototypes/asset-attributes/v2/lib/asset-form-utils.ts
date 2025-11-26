import type {
  Attribute,
  GlobalAttribute,
  CategoryAttributeConfig,
} from "../types";
import { useAttributeStore } from "./store";

export interface FormAttribute {
  id: string;
  label: string;
  type: Attribute["type"] | GlobalAttribute["type"];
  isRequired: boolean;
  isEnabled: boolean;
  description?: string;
  dropdownOptions?: string[];
  units?: string;
  source: "global" | "category-system" | "category-custom" | "inherited";
}

export interface OrganizedAttributes {
  assetInfo: FormAttribute[];
  location: FormAttribute[];
  manufacturer: FormAttribute[];
  attributes: FormAttribute[];
  installation: FormAttribute[];
  warranty: FormAttribute[];
}

/**
 * Get all enabled attributes for a category, organized by form section
 * @param categoryId - The category ID, or null if no category selected
 * @param includeCategoryField - If true, includes global-category in Asset Info section
 */
export function organizeAttributesForForm(
  categoryId: string | null,
  includeCategoryField: boolean = false
): OrganizedAttributes {
  const store = useAttributeStore.getState();
  
  const result: OrganizedAttributes = {
    assetInfo: [],
    location: [],
    manufacturer: [],
    attributes: [],
    installation: [],
    warranty: [],
  };

  // Get enabled global attributes
  const enabledGlobalAttributes = store.globalAttributes.filter(
    (attr) => attr.isEnabled
  );

  // If no category is selected, we still want to show global attributes
  // (when includeCategoryField is true, we show the full form with category field)
  if (!categoryId) {
    // If includeCategoryField is false and no category, return empty
    if (!includeCategoryField) {
      return {
        assetInfo: [],
        location: [],
        manufacturer: [],
        attributes: [],
        installation: [],
        warranty: [],
      };
    }
    // Otherwise, continue to process global attributes below
  }

  // Only process category-specific attributes if category exists
  const category = categoryId ? store.categories.find((c) => c.id === categoryId) : null;

  // Organize global attributes by section
  enabledGlobalAttributes.forEach((attr) => {
    const formAttr: FormAttribute = {
      id: attr.id,
      label: attr.label,
      type: attr.type,
      isRequired: attr.isRequired,
      isEnabled: attr.isEnabled,
      description: attr.description,
      dropdownOptions: attr.dropdownOptions,
      units: attr.units,
      source: "global",
    };

    switch (attr.section) {
      case "asset-info": {
        // Filter out Category, Manufacturer, Model, Serial number, Date of manufacture, Asset ID
        // Date of installation and Date of last service go to Installation section
        // These go to specific sections or are set after creation
        // Exception: include global-category if includeCategoryField is true
        const excludedIds = [
          "global-manufacturer",
          "global-model",
          "global-manufacturer-serial",
          "global-date-manufacture",
          "global-asset-id",
          "global-date-installation",
          "global-date-last-service",
        ];

        // Only exclude global-category if includeCategoryField is false
        if (!includeCategoryField) {
          excludedIds.push("global-category");
        }

        if (!excludedIds.includes(attr.id)) {
          result.assetInfo.push(formAttr);
        }
        break;
      }
      case "contact":
        // Site and Location go to location section
        if (["global-contact", "global-location"].includes(attr.id)) {
          result.location.push(formAttr);
        }
        break;
      case "status":
        // Condition goes to asset info
        if (attr.id === "global-condition") {
          result.assetInfo.push(formAttr);
        }
        break;
      case "dates":
        // End of life goes to warranty section
        if (attr.id === "global-end-of-life") {
          result.warranty.push(formAttr);
        } else {
          result.installation.push(formAttr);
        }
        break;
      case "warranty":
        result.warranty.push(formAttr);
        break;
      case "your-attributes":
        result.attributes.push(formAttr);
        break;
    }
  });

  // Add manufacturer-related global attributes
  const manufacturerAttr = enabledGlobalAttributes.find(
    (a) => a.id === "global-manufacturer"
  );
  const modelAttr = enabledGlobalAttributes.find((a) => a.id === "global-model");
  const serialAttr = enabledGlobalAttributes.find(
    (a) => a.id === "global-manufacturer-serial"
  );
  const dateManufactureAttr = enabledGlobalAttributes.find(
    (a) => a.id === "global-date-manufacture"
  );

  if (manufacturerAttr) {
    result.manufacturer.push({
      id: manufacturerAttr.id,
      label: manufacturerAttr.label,
      type: manufacturerAttr.type,
      isRequired: manufacturerAttr.isRequired,
      isEnabled: manufacturerAttr.isEnabled,
      description: manufacturerAttr.description,
      dropdownOptions: manufacturerAttr.dropdownOptions,
      units: manufacturerAttr.units,
      source: "global",
    });
  }

  if (modelAttr) {
    result.manufacturer.push({
      id: modelAttr.id,
      label: modelAttr.label,
      type: modelAttr.type,
      isRequired: modelAttr.isRequired,
      isEnabled: modelAttr.isEnabled,
      description: modelAttr.description,
      dropdownOptions: modelAttr.dropdownOptions,
      units: modelAttr.units,
      source: "global",
    });
  }

  if (serialAttr) {
    result.manufacturer.push({
      id: serialAttr.id,
      label: serialAttr.label,
      type: serialAttr.type,
      isRequired: serialAttr.isRequired,
      isEnabled: serialAttr.isEnabled,
      description: serialAttr.description,
      dropdownOptions: serialAttr.dropdownOptions,
      units: serialAttr.units,
      source: "global",
    });
  }

  if (dateManufactureAttr) {
    result.manufacturer.push({
      id: dateManufactureAttr.id,
      label: dateManufactureAttr.label,
      type: dateManufactureAttr.type,
      isRequired: dateManufactureAttr.isRequired,
      isEnabled: dateManufactureAttr.isEnabled,
      description: dateManufactureAttr.description,
      dropdownOptions: dateManufactureAttr.dropdownOptions,
      units: dateManufactureAttr.units,
      source: "global",
    });
  }

  // Add Date of installation and Date of last service to Installation section
  const dateInstallationAttr = enabledGlobalAttributes.find(
    (a) => a.id === "global-date-installation"
  );
  const dateLastServiceAttr = enabledGlobalAttributes.find(
    (a) => a.id === "global-date-last-service"
  );

  if (dateInstallationAttr) {
    result.installation.push({
      id: dateInstallationAttr.id,
      label: dateInstallationAttr.label,
      type: dateInstallationAttr.type,
      isRequired: dateInstallationAttr.isRequired,
      isEnabled: dateInstallationAttr.isEnabled,
      description: dateInstallationAttr.description,
      dropdownOptions: dateInstallationAttr.dropdownOptions,
      units: dateInstallationAttr.units,
      source: "global",
    });
  }

  if (dateLastServiceAttr) {
    result.installation.push({
      id: dateLastServiceAttr.id,
      label: dateLastServiceAttr.label,
      type: dateLastServiceAttr.type,
      isRequired: dateLastServiceAttr.isRequired,
      isEnabled: dateLastServiceAttr.isEnabled,
      description: dateLastServiceAttr.description,
      dropdownOptions: dateLastServiceAttr.dropdownOptions,
      units: dateLastServiceAttr.units,
      source: "global",
    });
  }

  // Get category-specific attributes (system + custom) - only if category exists
  if (categoryId && category) {
    const predefinedAttrs = store.predefinedCategoryAttributes[categoryId] || [];
    const customAttrs = store.customCategoryAttributes[categoryId] || [];

    // Add system attributes
    category.systemAttributes.forEach((config: CategoryAttributeConfig) => {
    if (!config.isEnabled) return;

    const attribute = predefinedAttrs.find(
      (a) => a.id === config.attributeId
    );
    if (attribute) {
      result.attributes.push({
        id: attribute.id,
        label: attribute.label,
        type: attribute.type,
        isRequired: false, // Category attributes are not required by default
        isEnabled: config.isEnabled,
        description: attribute.description,
        dropdownOptions: attribute.dropdownOptions,
        units: attribute.units,
        source: "category-system",
      });
    }
  });

  // Add custom attributes
  category.customAttributes.forEach((config: CategoryAttributeConfig) => {
    if (!config.isEnabled) return;

    const attribute = customAttrs.find((a) => a.id === config.attributeId);
    if (attribute) {
      result.attributes.push({
        id: attribute.id,
        label: attribute.label,
        type: attribute.type,
        isRequired: false,
        isEnabled: config.isEnabled,
        description: attribute.description,
        dropdownOptions: attribute.dropdownOptions,
        units: attribute.units,
        source: "category-custom",
      });
    }
  });

    // Get inherited attributes
    const inheritedAttributes = store.getInheritedAttributes(categoryId);
    inheritedAttributes.forEach((item) => {
      if (item.isEnabled) {
        result.attributes.push({
          id: item.attribute.id,
          label: item.attribute.label,
          type: item.attribute.type,
          isRequired: false,
          isEnabled: item.isEnabled,
          description: item.attribute.description,
          dropdownOptions: item.attribute.dropdownOptions,
          units: item.attribute.units,
          source: "inherited",
        });
      }
    });

    // Sort attributes by order (for category attributes)
    const sortByOrder = (attrs: FormAttribute[]) => {
      // For category attributes, maintain order from config
      const systemOrder = new Map<string, number>();
      const customOrder = new Map<string, number>();

      if (category) {
        category.systemAttributes.forEach((config) => {
          systemOrder.set(config.attributeId, config.order);
        });
        category.customAttributes.forEach((config) => {
          customOrder.set(config.attributeId, config.order);
        });
      }

      return attrs.sort((a, b) => {
        const aOrder = systemOrder.get(a.id) ?? customOrder.get(a.id) ?? 999;
        const bOrder = systemOrder.get(b.id) ?? customOrder.get(b.id) ?? 999;
        return aOrder - bOrder;
      });
    };

    result.attributes = sortByOrder(result.attributes);
  }

  // Sort Asset Info fields to ensure Category comes first, before Reference
  result.assetInfo.sort((a, b) => {
    // Category always comes first
    if (a.id === "global-category") return -1;
    if (b.id === "global-category") return 1;
    
    // Reference comes second (after Category)
    if (a.id === "global-customer-reference") return -1;
    if (b.id === "global-customer-reference") return 1;
    
    // All other fields maintain their original order
    return 0;
  });

  return result;
}

