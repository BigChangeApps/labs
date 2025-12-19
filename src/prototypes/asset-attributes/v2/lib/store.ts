import { create } from "zustand";
import type {
  Attribute,
  Category,
  Manufacturer,
  CategoryAttributeConfig,
  GlobalAttribute,
  GlobalAttributeSection,
} from "../types";
// TODO-HANDOFF: Replace mock data imports with API fetch hooks (React Query or similar)
// These should be fetched on app initialization, not imported statically
// API endpoints from docs/asset-api.md:
//   - Categories: GET /v1/categories → ReadCategoryModel[]
//   - Assets: GET /v1/assets → ReadAssetModel[]
//   - Manufacturers: External API (not in Asset Management API)
//   - Attributes: Custom extension (not in Asset Management API)
import {
  predefinedCategoryAttributes as initialPredefinedCategoryAttributes,
  categories as initialCategories,
  manufacturers as initialManufacturers,
  globalAttributes as initialGlobalAttributes,
} from "./mock-data";
import { mockAssetList as initialAssetList, type AssetListItem } from "./mock-asset-list-data";

interface AttributeStore {
  // State
  currentCategoryId: string;
  selectedCategoryView: string | null; // null = category list view, categoryId = category detail view
  currentSettingsTab: "categories" | "library";
  predefinedCategoryAttributes: Record<string, Attribute[]>;
  customCategoryAttributes: Record<string, Attribute[]>; // User-created category-specific attributes
  categories: Category[];
  manufacturers: Manufacturer[];
  globalAttributes: GlobalAttribute[];
  assets: AssetListItem[];

  // Navigation actions
  setCurrentCategory: (categoryId: string) => void;
  setSelectedCategoryView: (categoryId: string | null) => void;
  setCurrentSettingsTab: (tab: "categories" | "library") => void;

  // Helper functions
  getCategoryPath: (categoryId: string) => Category[];
  getInheritedAttributes: (categoryId: string) => Array<{
    attributeId: string;
    isEnabled: boolean;
    order: number;
    attribute: Attribute;
    source: "system" | "custom";
    parentCategoryId: string;
    parentCategoryName: string;
  }>;

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

  // Global attribute actions
  toggleGlobalAttribute: (attributeId: string) => void;
  addGlobalAttribute: (attribute: Omit<GlobalAttribute, "id">, section?: GlobalAttributeSection) => string;
  editGlobalAttribute: (attributeId: string, updates: Partial<GlobalAttribute>) => void;
  deleteGlobalAttribute: (attributeId: string) => void;
  reorderGlobalAttributes: (section: GlobalAttributeSection, attributeIds: string[]) => void;

  // Category actions
  addCategory: (name: string, parentId?: string) => string;
  editCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;

  // Asset actions
  addAsset: (asset: AssetListItem) => void;
  updateAsset: (assetId: string, updates: Partial<AssetListItem>) => void;
  deleteAsset: (assetId: string) => void;
}

export const useAttributeStore = create<AttributeStore>((set) => ({
  // TODO-HANDOFF: Initial state should be empty, populated via API calls on app init
  // See docs/asset-api.md for schemas:
  //   - GET /v1/categories → categories (ReadCategoryModel[])
  //   - GET /v1/assets → assets (ReadAssetModel[])
  //   - Manufacturers/Attributes: Requires external APIs not in Asset Management API
  currentCategoryId: "boiler",
  selectedCategoryView: null, // Start at category list view
  currentSettingsTab: "categories",
  predefinedCategoryAttributes: initialPredefinedCategoryAttributes,
  customCategoryAttributes: {}, // Start empty - users create these
  categories: initialCategories,
  manufacturers: initialManufacturers,
  globalAttributes: initialGlobalAttributes,
  assets: initialAssetList,

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

  // Get inherited attributes from all parent categories
  getInheritedAttributes: (categoryId: string) => {
    const state = useAttributeStore.getState();
    const category = state.categories.find((c: Category) => c.id === categoryId);
    if (!category || !category.parentId) {
      return [];
    }

    const inheritedAttributes: Array<{
      attributeId: string;
      isEnabled: boolean;
      order: number;
      attribute: Attribute;
      source: "system" | "custom";
      parentCategoryId: string;
      parentCategoryName: string;
    }> = [];

    // Walk up the parent chain to collect all inherited attributes
    let currentParentId: string | undefined = category.parentId;
    while (currentParentId) {
      const parentCategory = state.categories.find(
        (c: Category) => c.id === currentParentId
      );
      if (!parentCategory) break;

      // Collect system attributes from parent
      parentCategory.systemAttributes.forEach((config: CategoryAttributeConfig) => {
        const predefinedAttrs = state.predefinedCategoryAttributes[currentParentId!] || [];
        const attribute = predefinedAttrs.find(
          (a: Attribute) => a.id === config.attributeId
        );
        if (attribute && config.isEnabled) {
          inheritedAttributes.push({
            ...config,
            attribute,
            source: "system",
            parentCategoryId: currentParentId!,
            parentCategoryName: parentCategory.name,
          });
        }
      });

      // Collect custom attributes from parent
      parentCategory.customAttributes.forEach((config: CategoryAttributeConfig) => {
        const customAttrs = state.customCategoryAttributes[currentParentId!] || [];
        const attribute = customAttrs.find(
          (a: Attribute) => a.id === config.attributeId
        );
        if (attribute && config.isEnabled) {
          inheritedAttributes.push({
            ...config,
            attribute,
            source: "custom",
            parentCategoryId: currentParentId!,
            parentCategoryName: parentCategory.name,
          });
        }
      });

      // Move to next parent level
      currentParentId = parentCategory.parentId;
    }

    // Sort by order
    inheritedAttributes.sort((a, b) => a.order - b.order);

    return inheritedAttributes;
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

        // Update both system and custom attributes with new order
        const updatedSystemAttrs = attributeIds
          .map((id, index) => {
            const existing = cat.systemAttributes.find(
              (a) => a.attributeId === id
            );
            return existing ? { ...existing, order: index } : null;
          })
          .filter(Boolean) as CategoryAttributeConfig[];

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
          systemAttributes: updatedSystemAttrs,
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

        // Calculate the maximum order from both system and custom attributes
        const maxSystemOrder = cat.systemAttributes.length > 0
          ? Math.max(...cat.systemAttributes.map(a => a.order))
          : -1;
        const maxCustomOrder = cat.customAttributes.length > 0
          ? Math.max(...cat.customAttributes.map(a => a.order))
          : -1;
        const newOrder = Math.max(maxSystemOrder, maxCustomOrder) + 1;

        return {
          ...cat,
          customAttributes: [
            ...cat.customAttributes,
            {
              attributeId: newId,
              isEnabled: true,
              order: newOrder,
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

  // TODO-HANDOFF: Manufacturers not in Asset Management API
  // Would need external Manufacturers API with CRUD endpoints
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

  // Toggle global attribute on/off
  toggleGlobalAttribute: (attributeId) => {
    set((state) => {
      const globalAttributes = state.globalAttributes.map((attr) =>
        attr.id === attributeId && !attr.isRequired
          ? { ...attr, isEnabled: !attr.isEnabled }
          : attr
      );

      return { globalAttributes };
    });
  },

  addGlobalAttribute: (attribute, section) => {
    const newId = `global-custom-${Date.now()}`;
    const newGlobalAttribute: GlobalAttribute = {
      ...attribute,
      id: newId,
      section: section || attribute.section || "your-attributes", // Use provided section or attribute's section, default to your-attributes
    };

    set((state) => {
      const globalAttributes = [...state.globalAttributes, newGlobalAttribute];
      return { globalAttributes };
    });

    return newId;
  },

  editGlobalAttribute: (attributeId, updates) => {
    set((state) => {
      const globalAttributes = state.globalAttributes.map((attr) =>
        attr.id === attributeId ? { ...attr, ...updates } : attr
      );

      return { globalAttributes };
    });
  },

  deleteGlobalAttribute: (attributeId) => {
    set((state) => {
      const globalAttributes = state.globalAttributes.filter(
        (attr) => attr.id !== attributeId
      );

      return { globalAttributes };
    });
  },

  reorderGlobalAttributes: (section, attributeIds) => {
    set((state) => {
      // Get all attributes not in this section (unchanged)
      const otherAttributes = state.globalAttributes.filter(
        (attr) => attr.section !== section
      );

      // Reorder attributes in this section based on provided IDs
      const sectionAttributes = attributeIds
        .map((id) => state.globalAttributes.find((attr) => attr.id === id))
        .filter(Boolean) as GlobalAttribute[];

      return { globalAttributes: [...otherAttributes, ...sectionAttributes] };
    });
  },

  // TODO-HANDOFF: POST /v1/categories
  // Request: CreateCategoryModel { name: string }
  // Response: ReadCategoryModel (201 Created)
  addCategory: (name, parentId) => {
    const newId = `category-${Date.now()}`;
    set((state) => {
      const newCategory: Category = {
        id: newId,
        name,
        parentId,
        children: [],
        systemAttributes: [],
        customAttributes: [],
      };

      // Update parent's children array if parent exists
      const updatedCategories = state.categories.map((cat) => {
        if (cat.id === parentId) {
          return {
            ...cat,
            children: [...(cat.children || []), newId],
          };
        }
        return cat;
      });

      return {
        categories: [...updatedCategories, newCategory],
      };
    });

    return newId;
  },

  // TODO-HANDOFF: PATCH /v1/categories/{categoryId}
  // Request: UpdateCategoryModel { name?: string }
  // Response: ReadCategoryModel (200 OK)
  editCategory: (categoryId, name) => {
    set((state) => {
      const categories = state.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name } : cat
      );

      return { categories };
    });
  },

  // TODO-HANDOFF: Category deletion not available in Asset Management API
  // Would need: DELETE /v1/categories/{categoryId} endpoint
  deleteCategory: (categoryId) => {
    set((state) => {
      const category = state.categories.find((c) => c.id === categoryId);
      if (!category) return {};

      // Remove from parent's children array
      const updatedCategories = state.categories
        .map((cat) => {
          if (cat.id === category.parentId) {
            return {
              ...cat,
              children: (cat.children || []).filter((id) => id !== categoryId),
            };
          }
          return cat;
        })
        .filter((cat) => cat.id !== categoryId); // Remove the category itself

      // Also remove any custom attributes associated with this category
      const customCategoryAttributes = { ...state.customCategoryAttributes };
      delete customCategoryAttributes[categoryId];

      return {
        categories: updatedCategories,
        customCategoryAttributes,
      };
    });
  },

  // TODO-HANDOFF: POST /v1/assets
  // Request: CreateAssetModel { siteId, categoryId, reference?, location?, barcode?, manufacturer?, model?, etc. }
  // Response: StringPostResponse { id } (201 Created)
  addAsset: (asset) => {
    set((state) => ({
      assets: [...state.assets, asset],
    }));
  },

  // TODO-HANDOFF: PATCH /v1/assets/{assetId}
  // Request: UpdateAssetModel { siteId?, categoryId?, reference?, location?, condition?, status?, etc. }
  // Response: 204 No Content
  updateAsset: (assetId, updates) => {
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...updates } : asset
      ),
    }));
  },

  // TODO-HANDOFF: DELETE /v1/assets/{assetId}
  // Response: 204 No Content (soft delete)
  deleteAsset: (assetId) => {
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== assetId),
    }));
  },
}));

