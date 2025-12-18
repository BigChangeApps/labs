import { create } from "zustand";
import type { Asset, Site, ServiceAgreement, AgreementCategory, ServicePlan } from "../types";
import {
  assets as initialAssets,
  sites as initialSites,
  agreements as initialAgreements,
} from "./mock-data";

interface AgreementStore {
  // State
  assets: Asset[];
  sites: Site[];
  agreements: ServiceAgreement[];

  // Agreement actions
  updateAgreement: (agreementId: string, updates: Partial<ServiceAgreement>) => void;
  addCategoryToAgreement: (agreementId: string, category: AgreementCategory) => void;
  removeCategoryFromAgreement: (agreementId: string, categoryId: string) => void;
  addServicePlanToCategory: (agreementId: string, categoryId: string, servicePlan: ServicePlan) => void;
  removeServicePlanFromCategory: (agreementId: string, categoryId: string, servicePlanId: string) => void;
  addAssetToAgreement: (agreementId: string, assetId: string) => void;
  removeAssetFromAgreement: (agreementId: string, assetId: string) => void;
  getAgreementById: (agreementId: string) => ServiceAgreement | undefined;
  getAssetsForAgreement: (agreementId: string) => Asset[];
  getAvailableAssetsForAgreement: (agreementId: string, siteId?: string) => Asset[];
}

export const useAgreementStore = create<AgreementStore>((set, get) => ({
  // Initial state from mock data
  assets: initialAssets,
  sites: initialSites,
  agreements: initialAgreements,

  // Update agreement fields
  updateAgreement: (agreementId, updates) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? { ...agreement, ...updates }
          : agreement
      ),
    }));
  },

  // Add a category to an agreement
  addCategoryToAgreement: (agreementId, category) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? { ...agreement, categories: [...agreement.categories, category] }
          : agreement
      ),
    }));
  },

  // Remove a category from an agreement
  removeCategoryFromAgreement: (agreementId, categoryId) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? {
              ...agreement,
              categories: agreement.categories.filter((c) => c.id !== categoryId),
            }
          : agreement
      ),
    }));
  },

  // Add a service plan to a category
  addServicePlanToCategory: (agreementId, categoryId, servicePlan) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? {
              ...agreement,
              categories: agreement.categories.map((cat) =>
                cat.id === categoryId
                  ? { ...cat, servicePlans: [...cat.servicePlans, servicePlan] }
                  : cat
              ),
            }
          : agreement
      ),
    }));
  },

  // Remove a service plan from a category
  removeServicePlanFromCategory: (agreementId, categoryId, servicePlanId) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? {
              ...agreement,
              categories: agreement.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      servicePlans: cat.servicePlans.filter((sp) => sp.id !== servicePlanId),
                    }
                  : cat
              ),
            }
          : agreement
      ),
    }));
  },

  // Add an asset to an agreement
  addAssetToAgreement: (agreementId, assetId) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? {
              ...agreement,
              assetIds: agreement.assetIds.includes(assetId)
                ? agreement.assetIds
                : [...agreement.assetIds, assetId],
            }
          : agreement
      ),
    }));
  },

  // Remove an asset from an agreement
  removeAssetFromAgreement: (agreementId, assetId) => {
    set((state) => ({
      agreements: state.agreements.map((agreement) =>
        agreement.id === agreementId
          ? {
              ...agreement,
              assetIds: agreement.assetIds.filter((id) => id !== assetId),
            }
          : agreement
      ),
    }));
  },

  // Get a single agreement by ID
  getAgreementById: (agreementId) => {
    return get().agreements.find((a) => a.id === agreementId);
  },

  // Get all assets for an agreement
  getAssetsForAgreement: (agreementId) => {
    const agreement = get().agreements.find((a) => a.id === agreementId);
    if (!agreement) return [];
    return get().assets.filter((asset) => agreement.assetIds.includes(asset.id));
  },

  // Get assets available to add (not already in agreement)
  getAvailableAssetsForAgreement: (agreementId, siteId) => {
    const agreement = get().agreements.find((a) => a.id === agreementId);
    if (!agreement) return [];

    return get().assets.filter((asset) => {
      // Must not already be in the agreement
      if (agreement.assetIds.includes(asset.id)) return false;
      // If siteId filter provided, must match
      if (siteId && asset.siteId !== siteId) return false;
      return true;
    });
  },
}));
