/**
 * Mock data for service agreements prototype
 * Uses shared sites and assets, defines agreements locally
 */
import {
  sites as sharedSites,
  assets as sharedAssets,
  getSiteName,
} from "@/lib/mock-data";
import type { Asset, ServiceAgreement } from "../types";

// Re-export shared sites
export const sites = sharedSites;

// Map shared assets to simplified local Asset type
export const assets: Asset[] = sharedAssets.map((asset) => ({
  id: asset.id,
  name: asset.name,
  category: asset.categoryName,
  siteId: asset.siteId,
  siteName: getSiteName(asset.siteId),
}));

// Service agreements with categories and service plans
export const agreements: ServiceAgreement[] = [
  {
    id: "sa-001",
    name: "Fire Safety Annual Service",
    reference: "JLP-FIRE-2024",
    status: "active",
    billingContact: "John Lewis Partnership",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    siteIds: ["site-1", "site-2", "site-5"],
    categories: [
      {
        id: "cat-1",
        categoryId: "fire-alarm-panel",
        categoryName: "Fire Alarm Control Panel",
        servicePlans: [
          {
            id: "sp-1",
            name: "Annual Inspection",
            frequency: "Annual",
            coverage: "all",
          },
          {
            id: "sp-2",
            name: "Quarterly Testing",
            frequency: "Quarterly",
            coverage: "all",
          },
        ],
      },
      {
        id: "cat-2",
        categoryId: "fire-extinguisher",
        categoryName: "Fire Extinguisher",
        servicePlans: [
          {
            id: "sp-3",
            name: "Annual Service",
            frequency: "Annual",
            coverage: "all",
          },
        ],
      },
    ],
    assetIds: ["0003", "0007", "0014"],
  },
  {
    id: "sa-002",
    name: "Heating Systems Maintenance",
    reference: "JLP-HEAT-2024",
    status: "active",
    billingContact: "JLP Facilities Management",
    startDate: "2024-01-01",
    endDate: "2025-06-30",
    siteIds: ["site-1", "site-2", "site-5"],
    categories: [
      {
        id: "cat-3",
        categoryId: "boiler",
        categoryName: "Boiler",
        servicePlans: [
          {
            id: "sp-4",
            name: "Annual Gas Safety Check",
            frequency: "Annual",
            coverage: "all",
          },
          {
            id: "sp-5",
            name: "Quarterly Maintenance",
            frequency: "Quarterly",
            coverage: "all",
          },
        ],
      },
    ],
    assetIds: ["0002", "0006", "0013"],
  },
  {
    id: "sa-003",
    name: "Security Systems Contract",
    reference: "JLP-SEC-2024",
    status: "active",
    billingContact: "John Lewis Security Ltd",
    startDate: "2024-03-01",
    endDate: "2026-03-31",
    siteIds: ["site-1", "site-3", "site-7"],
    categories: [
      {
        id: "cat-4",
        categoryId: "cctv-camera",
        categoryName: "CCTV Camera",
        servicePlans: [
          {
            id: "sp-6",
            name: "Monthly Health Check",
            frequency: "Monthly",
            coverage: "all",
          },
          {
            id: "sp-7",
            name: "Annual Deep Clean",
            frequency: "Annual",
            coverage: "all",
          },
        ],
      },
    ],
    assetIds: ["0001", "0009", "0016"],
  },
  {
    id: "sa-004",
    name: "Emergency Power Systems",
    reference: "JLP-PWR-2025",
    status: "draft",
    billingContact: "JLP Emergency Services",
    siteIds: ["site-1", "site-7"],
    categories: [],
    assetIds: ["0004", "0017"],
  },
  {
    id: "sa-005",
    name: "Vertical Transport Maintenance",
    reference: "OTIS-VT-2024",
    status: "active",
    billingContact: "Otis Elevator Company",
    startDate: "2024-06-01",
    endDate: "2027-01-15",
    siteIds: ["site-3", "site-4"],
    categories: [
      {
        id: "cat-5",
        categoryId: "escalator",
        categoryName: "Escalator",
        servicePlans: [
          {
            id: "sp-8",
            name: "Monthly Maintenance",
            frequency: "Monthly",
            coverage: "all",
          },
        ],
      },
      {
        id: "cat-6",
        categoryId: "lift",
        categoryName: "Lift",
        servicePlans: [
          {
            id: "sp-9",
            name: "Monthly Maintenance",
            frequency: "Monthly",
            coverage: "all",
          },
          {
            id: "sp-10",
            name: "Annual LOLER Inspection",
            frequency: "Annual",
            coverage: "all",
          },
        ],
      },
    ],
    assetIds: ["0010", "0012"],
  },
  {
    id: "sa-006",
    name: "HVAC Service Contract",
    reference: "JLP-HVAC-2023",
    status: "ended",
    billingContact: "JLP Property Services",
    startDate: "2023-01-01",
    endDate: "2024-09-30",
    siteIds: ["site-6"],
    categories: [
      {
        id: "cat-7",
        categoryId: "hvac",
        categoryName: "HVAC",
        servicePlans: [
          {
            id: "sp-11",
            name: "Quarterly Service",
            frequency: "Quarterly",
            coverage: "all",
          },
        ],
      },
    ],
    assetIds: ["0015"],
  },
];
