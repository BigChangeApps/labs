import { create } from "zustand";
import type {
  Attribute,
  Category,
  Manufacturer,
  CategoryAttributeConfig,
  CoreAttribute,
} from "../types";
import {
  predefinedCategoryAttributes as initialPredefinedCategoryAttributes,
  categories as initialCategories,
  manufacturers as initialManufacturers,
  coreAttributes as initialCoreAttributes,
} from "./mock-data";

interface AttributeStore {
  // State
  currentCategoryId: string;
  selectedCategoryView: string | null; // null = category list view, categoryId = category detail view
  currentSettingsTab: "categories" | "library";
  predefinedCategoryAttributes: Record<string, Attribute[]>;
  customCategoryAttributes: Record<string, Attribute[]>; // User-created category-specific attributes
  categories: Category[];
  manufacturers: Manufacturer[];
  coreAttributes: CoreAttribute[];

  // Navigation actions
  setCurrentCategory: (categoryId: string) => void;
  setSelectedCategoryView: (categoryId: string | null) => void;
  setCurrentSettingsTab: (tab: "categories" | "library") => void;

  // Attribute actions
  toggleAttribute: (
    categoryId: string,
    attributeId: string,
    isSystem: boolean
  ) => void;
  togglePreferred: (attributeId: string, categoryId: string) => void;
  reorderAttributes: (categoryId: string, attributeIds: string[]) => void;
  addAttribute: (
    attribute: Omit<Attribute, "id" | "isSystem">,
    categoryId: string
  ) => string;
  editAttribute: (attributeId: string, categoryId: string, updates: Partial<Attribute>) => void;
  deleteAttribute: (attributeId: string, categoryId: string) => void;
  removeAttributeFromCategory: (
    attributeId: string,
    categoryId: string
  ) => void;

  // Manufacturer actions
  addManufacturer: (name: string) => string;
  editManufacturer: (manufacturerId: string, name: string) => void;
  deleteManufacturer: (manufacturerId: string) => void;
  addModel: (manufacturerId: string, modelName: string) => void;
  editModel: (manufacturerId: string, modelId: string, name: string) => void;
  deleteModel: (manufacturerId: string, modelId: string) => void;

  // Core attribute actions
  toggleCoreAttribute: (attributeId: string) => void;
  addCoreAttribute: (attribute: Omit<CoreAttribute, "id">, section?: CoreAttributeSection) => string;
  editCoreAttribute: (attributeId: string, updates: Partial<CoreAttribute>) => void;
  deleteCoreAttribute: (attributeId: string) => void;
}

export const useAttributeStore = create<AttributeStore>((set) => ({
  // Initial state
  currentCategoryId: "boiler",
  selectedCategoryView: null, // Start at category list view
  currentSettingsTab: "categories",
  predefinedCategoryAttributes: initialPredefinedCategoryAttributes,
  customCategoryAttributes: {}, // Start empty - users create these
  categories: initialCategories,
  manufacturers: initialManufacturers,
  coreAttributes: initialCoreAttributes,

  // Navigation actions
  setCurrentCategory: (categoryId) => {
    set({ currentCategoryId: categoryId });
  },

  setSelectedCategoryView: (categoryId) => {
    set({ selectedCategoryView: categoryId });
    if (categoryId) {
      set({ currentCategoryId: categoryId });
    }
  },

  setCurrentSettingsTab: (tab) => {
    set({ currentSettingsTab: tab });
  },

  // Get the full path of categories from root to the given category
  getCategoryPath: (categoryId: string) => {
    const state = useAttributeStore.getState();
    const path: Category[] = [];
    let currentId: string | undefined = categoryId;

    while (currentId) {
      const category = state.categories.find(
        (c: Category) => c.id === currentId
      );
      if (category) {
        path.unshift(category);
        currentId = category.parentId;
      } else {
        break;
      }
    }

    return path;
  },

  // Toggle attribute on/off for a category
  toggleAttribute: (categoryId, attributeId, isSystem) => {
    set((state) => {
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const attrList = isSystem ? cat.systemAttributes : cat.customAttributes;
        const attrListKey = isSystem ? "systemAttributes" : "customAttributes";

        return {
          ...cat,
          [attrListKey]: attrList.map((attr) =>
            attr.attributeId === attributeId
              ? { ...attr, isEnabled: !attr.isEnabled }
              : attr
          ),
        };
      });

      return { categories };
    });
  },

  // Toggle preferred status of an attribute
  togglePreferred: (attributeId, categoryId) => {
    set((state) => {
      // Check predefined attributes first
      const predefinedAttrs = state.predefinedCategoryAttributes[categoryId] || [];
      const predefinedIndex = predefinedAttrs.findIndex((attr) => attr.id === attributeId);
      
      if (predefinedIndex !== -1) {
        const updatedPredefined = { ...state.predefinedCategoryAttributes };
        updatedPredefined[categoryId] = predefinedAttrs.map((attr) =>
          attr.id === attributeId
            ? { ...attr, isPreferred: !attr.isPreferred }
            : attr
        );
        return { predefinedCategoryAttributes: updatedPredefined };
      }

      // Check custom attributes
      const customAttrs = state.customCategoryAttributes[categoryId] || [];
      const customIndex = customAttrs.findIndex((attr) => attr.id === attributeId);
      
      if (customIndex !== -1) {
        const updatedCustom = { ...state.customCategoryAttributes };
        updatedCustom[categoryId] = customAttrs.map((attr) =>
          attr.id === attributeId
            ? { ...attr, isPreferred: !attr.isPreferred }
            : attr
        );
        return { customCategoryAttributes: updatedCustom };
      }

      return {};
    });
  },

  // Reorder attributes within a category
  reorderAttributes: (categoryId, attributeIds) => {
    set((state) => {
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const updatedCustomAttrs = attributeIds
          .map((id, index) => {
            const existing = cat.customAttributes.find(
              (a) => a.attributeId === id
            );
            return existing ? { ...existing, order: index } : null;
          })
          .filter(Boolean) as CategoryAttributeConfig[];

        return {
          ...cat,
          customAttributes: updatedCustomAttrs,
        };
      });

      return { categories };
    });
  },

  // Add new attribute to category
  addAttribute: (attribute, categoryId) => {
    const newId = `custom-${Date.now()}`;
    const newAttribute: Attribute = {
      ...attribute,
      id: newId,
      isSystem: false,
    };

    set((state) => {
      // Add to custom category attributes
      const customCategoryAttributes = { ...state.customCategoryAttributes };
      if (!customCategoryAttributes[categoryId]) {
        customCategoryAttributes[categoryId] = [];
      }
      customCategoryAttributes[categoryId] = [
        ...customCategoryAttributes[categoryId],
        newAttribute,
      ];

      // Add to the specified category's customAttributes array
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        return {
          ...cat,
          customAttributes: [
            ...cat.customAttributes,
            {
              attributeId: newId,
              isEnabled: true,
              order: cat.customAttributes.length,
            },
          ],
        };
      });

      return { customCategoryAttributes, categories };
    });

    return newId;
  },

  // Edit existing attribute
  editAttribute: (attributeId, categoryId, updates) => {
    set((state) => {
      // Check custom attributes
      const customAttrs = state.customCategoryAttributes[categoryId] || [];
      const customIndex = customAttrs.findIndex((attr) => attr.id === attributeId);
      
      if (customIndex !== -1) {
        const updatedCustom = { ...state.customCategoryAttributes };
        updatedCustom[categoryId] = customAttrs.map((attr) =>
          attr.id === attributeId ? { ...attr, ...updates } : attr
        );
        return { customCategoryAttributes: updatedCustom };
      }

      return {};
    });
  },

  // Delete attribute from category
  deleteAttribute: (attributeId, categoryId) => {
    set((state) => {
      // Remove from custom category attributes
      const customCategoryAttributes = { ...state.customCategoryAttributes };
      if (customCategoryAttributes[categoryId]) {
        customCategoryAttributes[categoryId] = customCategoryAttributes[categoryId].filter(
          (attr) => attr.id !== attributeId
        );
      }

      // Remove from category's customAttributes array
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        return {
          ...cat,
          customAttributes: cat.customAttributes.filter(
            (a) => a.attributeId !== attributeId
          ),
        };
      });

      return { customCategoryAttributes, categories };
    });
  },

  // Remove attribute from a category
  removeAttributeFromCategory: (attributeId, categoryId) => {
    set((state) => {
      // Remove from custom category attributes
      const customCategoryAttributes = { ...state.customCategoryAttributes };
      if (customCategoryAttributes[categoryId]) {
        customCategoryAttributes[categoryId] = customCategoryAttributes[categoryId].filter(
          (attr) => attr.id !== attributeId
        );
      }

      // Remove from category's customAttributes array
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        return {
          ...cat,
          customAttributes: cat.customAttributes.filter(
            (a) => a.attributeId !== attributeId
          ),
        };
      });

      return { customCategoryAttributes, categories };
    });
  },

  // Manufacturer actions
  addManufacturer: (name) => {
    const newId = `manufacturer-${Date.now()}`;
    set((state) => ({
      manufacturers: [
        ...state.manufacturers,
        {
          id: newId,
          name,
          models: [],
          usedByCategories: [],
        },
      ],
    }));
    return newId;
  },

  editManufacturer: (manufacturerId, name) => {
    set((state) => ({
      manufacturers: state.manufacturers.map((m) =>
        m.id === manufacturerId ? { ...m, name } : m
      ),
    }));
  },

  deleteManufacturer: (manufacturerId) => {
    set((state) => ({
      manufacturers: state.manufacturers.filter((m) => m.id !== manufacturerId),
    }));
  },

  addModel: (manufacturerId, modelName) => {
    const newModelId = `model-${Date.now()}`;
    set((state) => ({
      manufacturers: state.manufacturers.map((m) =>
        m.id === manufacturerId
          ? {
              ...m,
              models: [...m.models, { id: newModelId, name: modelName }],
            }
          : m
      ),
    }));
  },

  editModel: (manufacturerId, modelId, name) => {
    set((state) => ({
      manufacturers: state.manufacturers.map((m) =>
        m.id === manufacturerId
          ? {
              ...m,
              models: m.models.map((model) =>
                model.id === modelId ? { ...model, name } : model
              ),
            }
          : m
      ),
    }));
  },

  deleteModel: (manufacturerId, modelId) => {
    set((state) => ({
      manufacturers: state.manufacturers.map((m) =>
        m.id === manufacturerId
          ? {
              ...m,
              models: m.models.filter((model) => model.id !== modelId),
            }
          : m
      ),
    }));
  },

  // Toggle core attribute on/off
  toggleCoreAttribute: (attributeId) => {
    set((state) => {
      const coreAttributes = state.coreAttributes.map((attr) =>
        attr.id === attributeId && !attr.isRequired
          ? { ...attr, isEnabled: !attr.isEnabled }
          : attr
      );

      return { coreAttributes };
    });
  },

  addCoreAttribute: (attribute, section) => {
    const newId = `core-custom-${Date.now()}`;
    const newCoreAttribute: CoreAttribute = {
      ...attribute,
      id: newId,
      section: section || attribute.section || "custom", // Use provided section or attribute's section, fallback to custom
    };

    set((state) => {
      const coreAttributes = [...state.coreAttributes, newCoreAttribute];
      return { coreAttributes };
    });

    return newId;
  },

  editCoreAttribute: (attributeId, updates) => {
    set((state) => {
      const coreAttributes = state.coreAttributes.map((attr) =>
        attr.id === attributeId ? { ...attr, ...updates } : attr
      );

      return { coreAttributes };
    });
  },

  deleteCoreAttribute: (attributeId) => {
    set((state) => {
      const coreAttributes = state.coreAttributes.filter(
        (attr) => attr.id !== attributeId
      );

      return { coreAttributes };
    });
  },
}));
