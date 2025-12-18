/**
 * Shared mock sites data used across all prototypes
 * Based on John Lewis retail locations
 */

export interface Site {
  id: string;
  name: string;
  address: string;
}

export const sites: Site[] = [
  {
    id: "site-1",
    name: "John Lewis & Partners",
    address: "Victoria Gate, Harewood Street, Leeds, LS2 7AR",
  },
  {
    id: "site-2",
    name: "Manchester Store",
    address: "123 High Street, Manchester, M1 1AA",
  },
  {
    id: "site-3",
    name: "Birmingham Bullring",
    address: "Bullring Shopping Centre, Birmingham, B5 4BU",
  },
  {
    id: "site-4",
    name: "London Oxford Street",
    address: "300 Oxford Street, London, W1C 1DX",
  },
  {
    id: "site-5",
    name: "Edinburgh Princes Street",
    address: "48 Princes Street, Edinburgh, EH2 2YJ",
  },
  {
    id: "site-6",
    name: "Bristol Cribbs Causeway",
    address: "Cribbs Causeway, Bristol, BS34 5DG",
  },
  {
    id: "site-7",
    name: "Liverpool One",
    address: "Liverpool One Shopping Centre, Liverpool, L1 8JQ",
  },
];

// Helper function to get site by ID
export function getSiteById(siteId: string): Site | undefined {
  return sites.find((s) => s.id === siteId);
}

// Helper function to get site name from siteId
export function getSiteName(siteId: string): string {
  const site = getSiteById(siteId);
  return site?.name || "Unknown Site";
}
