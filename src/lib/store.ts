import { create } from "zustand";
import type {
  Attribute,
  Category,
  Manufacturer,
  CategoryAttributeConfig,
} from "../types";
import {
  attributeLibrary as initialAttributeLibrary,
  categories as initialCategories,
  manufacturers as initialManufacturers,
} from "./mock-data";

interface AttributeStore {
  // State
  currentCategoryId: string;
  selectedCategoryView: string | null; // null = category list view, categoryId = category detail view
  currentSettingsTab: "categories" | "library";
  attributeLibrary: Attribute[];
  categories: Category[];
  manufacturers: Manufacturer[];
  enableParentInheritance: boolean;

  // Navigation actions
  setCurrentCategory: (categoryId: string) => void;
  setSelectedCategoryView: (categoryId: string | null) => void;
  setCurrentSettingsTab: (tab: "categories" | "library") => void;
  toggleParentInheritance: () => void;

  // Helper functions for hierarchical categories
  getCategoryPath: (categoryId: string) => Category[];
  getInheritedAttributes: (categoryId: string) => {
    system: CategoryAttributeConfig[];
    custom: CategoryAttributeConfig[];
  };

  // Attribute actions
  toggleAttribute: (
    categoryId: string,
    attributeId: string,
    isSystem: boolean
  ) => void;
  togglePreferred: (attributeId: string) => void;
  reorderAttributes: (categoryId: string, attributeIds: string[]) => void;
  addAttribute: (attribute: Omit<Attribute, "id" | "isSystem">) => string;
  editAttribute: (attributeId: string, updates: Partial<Attribute>) => void;
  deleteAttribute: (attributeId: string) => void;
  applyAttributeToCategory: (attributeId: string, categoryId: string) => void;
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
}

// Load enableParentInheritance from localStorage, default to true
const getInitialParentInheritance = (): boolean => {
  try {
    const stored = localStorage.getItem("enableParentInheritance");
    return stored !== null ? JSON.parse(stored) : true;
  } catch {
    return true;
  }
};

export const useAttributeStore = create<AttributeStore>((set) => ({
  // Initial state
  currentCategoryId: "boiler",
  selectedCategoryView: null, // Start at category list view
  currentSettingsTab: "categories",
  attributeLibrary: initialAttributeLibrary,
  categories: initialCategories,
  manufacturers: initialManufacturers,
  enableParentInheritance: getInitialParentInheritance(),

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

  toggleParentInheritance: () => {
    set((state) => {
      const newValue = !state.enableParentInheritance;
      localStorage.setItem("enableParentInheritance", JSON.stringify(newValue));
      return { enableParentInheritance: newValue };
    });
  },

  // Get the full path of categories from root to the given category
  getCategoryPath: (categoryId) => {
    const state = useAttributeStore.getState();
    const path: Category[] = [];
    let currentId: string | undefined = categoryId;

    while (currentId) {
      const category = state.categories.find((c) => c.id === currentId);
      if (category) {
        path.unshift(category);
        currentId = category.parentId;
      } else {
        break;
      }
    }

    return path;
  },

  // Get inherited attributes from parent categories
  getInheritedAttributes: (categoryId) => {
    const state = useAttributeStore.getState();
    const category = state.categories.find((c) => c.id === categoryId);

    if (!category || !category.parentId) {
      return { system: [], custom: [] };
    }

    // Get parent category
    const parent = state.categories.find((c) => c.id === category.parentId);
    if (!parent) {
      return { system: [], custom: [] };
    }

    // Recursively get all inherited attributes from ancestor chain
    const parentInherited = state.getInheritedAttributes(parent.id);

    return {
      system: [...parentInherited.system, ...parent.systemAttributes],
      custom: [...parentInherited.custom, ...parent.customAttributes],
    };
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
  togglePreferred: (attributeId) => {
    set((state) => {
      const attributeLibrary = state.attributeLibrary.map((attr) =>
        attr.id === attributeId
          ? { ...attr, isRequired: !attr.isRequired }
          : attr
      );

      return { attributeLibrary };
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

  // Add new attribute to library
  addAttribute: (attribute) => {
    const newId = `custom-${Date.now()}`;
    const newAttribute: Attribute = {
      ...attribute,
      id: newId,
      isSystem: false,
    };

    set((state) => {
      // Add to library
      const attributeLibrary = [...state.attributeLibrary, newAttribute];

      // Add to categories if applicable
      const categories = state.categories.map((cat) => {
        if (!attribute.appliedToCategories.includes(cat.id)) return cat;

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

      return { attributeLibrary, categories };
    });

    return newId;
  },

  // Edit existing attribute
  editAttribute: (attributeId, updates) => {
    set((state) => {
      const attributeLibrary = state.attributeLibrary.map((attr) =>
        attr.id === attributeId ? { ...attr, ...updates } : attr
      );

      // If appliedToCategories changed, update category configs
      let categories = state.categories;
      if (updates.appliedToCategories) {
        const oldAttr = state.attributeLibrary.find(
          (a) => a.id === attributeId
        );
        const newCategories = updates.appliedToCategories;
        const oldCategories = oldAttr?.appliedToCategories || [];

        // Remove from categories no longer applied
        const removedFrom = oldCategories.filter(
          (c) => !newCategories.includes(c)
        );
        // Add to new categories
        const addedTo = newCategories.filter((c) => !oldCategories.includes(c));

        categories = state.categories.map((cat) => {
          if (removedFrom.includes(cat.id)) {
            return {
              ...cat,
              customAttributes: cat.customAttributes.filter(
                (a) => a.attributeId !== attributeId
              ),
            };
          }

          if (addedTo.includes(cat.id)) {
            return {
              ...cat,
              customAttributes: [
                ...cat.customAttributes,
                {
                  attributeId,
                  isEnabled: true,
                  order: cat.customAttributes.length,
                },
              ],
            };
          }

          return cat;
        });
      }

      return { attributeLibrary, categories };
    });
  },

  // Delete attribute from library
  deleteAttribute: (attributeId) => {
    set((state) => {
      const attributeLibrary = state.attributeLibrary.filter(
        (attr) => attr.id !== attributeId
      );

      const categories = state.categories.map((cat) => ({
        ...cat,
        customAttributes: cat.customAttributes.filter(
          (a) => a.attributeId !== attributeId
        ),
      }));

      return { attributeLibrary, categories };
    });
  },

  // Apply existing attribute to a category
  applyAttributeToCategory: (attributeId, categoryId) => {
    set((state) => {
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        // Check if already applied
        const alreadyApplied = cat.customAttributes.some(
          (a) => a.attributeId === attributeId
        );
        if (alreadyApplied) return cat;

        return {
          ...cat,
          customAttributes: [
            ...cat.customAttributes,
            {
              attributeId,
              isEnabled: true,
              order: cat.customAttributes.length,
            },
          ],
        };
      });

      // Update attribute's appliedToCategories
      const attributeLibrary = state.attributeLibrary.map((attr) => {
        if (attr.id !== attributeId) return attr;

        return {
          ...attr,
          appliedToCategories: [
            ...new Set([...attr.appliedToCategories, categoryId]),
          ],
        };
      });

      return { categories, attributeLibrary };
    });
  },

  // Remove attribute from a category
  removeAttributeFromCategory: (attributeId, categoryId) => {
    set((state) => {
      const categories = state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        return {
          ...cat,
          customAttributes: cat.customAttributes.filter(
            (a) => a.attributeId !== attributeId
          ),
        };
      });

      // Update attribute's appliedToCategories
      const attributeLibrary = state.attributeLibrary.map((attr) => {
        if (attr.id !== attributeId) return attr;

        return {
          ...attr,
          appliedToCategories: attr.appliedToCategories.filter(
            (c) => c !== categoryId
          ),
        };
      });

      return { categories, attributeLibrary };
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
}));
