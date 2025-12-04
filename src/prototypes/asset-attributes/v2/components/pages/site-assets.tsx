import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { Badge } from "@/registry/ui/badge";
import { SiteWorkspaceHeader } from "../SiteWorkspaceHeader";
import { type AssetListItem } from "../../lib/mock-asset-list-data";
import { useAttributeStore } from "../../lib/store";

export function SiteAssets() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [bannerAssetId, setBannerAssetId] = useState<string | null>(null);
  const [bannerAssetReference, setBannerAssetReference] = useState<string | null>(null);
  const assets = useAttributeStore((state) => state.assets);

  // Filter assets for this specific site
  const filteredAssets = useMemo(() => {
    if (!siteId) return [];
    let filtered = assets.filter((asset) => asset.siteId === siteId);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((asset) =>
        [
          asset.id,
          asset.reference,
          asset.name,
          asset.manufacturer,
          asset.model,
          asset.categoryName,
          asset.location,
          asset.condition,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [siteId, searchQuery, assets]);

  // Check for success banner in location state
  useEffect(() => {
    if (location.state?.showSuccessBanner) {
      setShowSuccessBanner(true);
      setBannerAssetId(location.state.assetId || null);
      setBannerAssetReference(location.state.assetReference || null);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({ ...location.state, showSuccessBanner: false }, '');
    }
  }, [location.state]);

  if (!siteId) return null;

  const handleAssetClick = (assetId: string) => {
    const pathname = window.location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    navigate(`${basePath}/edit-asset/${assetId}`, { state: { returnTo: 'site-assets', siteId } });
  };

  const handleCreateAsset = () => {
    const pathname = window.location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    navigate(`${basePath}/create-asset`, { state: { siteId } });
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <SiteWorkspaceHeader siteId={siteId} />

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="w-full bg-blue-50 border-b border-blue-200">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-900">
                {bannerAssetReference
                  ? `Asset ${bannerAssetId} (${bannerAssetReference}) was updated`
                  : `Asset ${bannerAssetId} was updated`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowSuccessBanner(false)}
                className="h-6 w-6 text-blue-900 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Search and Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button size="sm" onClick={handleCreateAsset} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add asset
            </Button>
          </div>

          {/* Assets Table */}
          <Card>
            <CardContent className="p-0">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "No assets found matching your search"
                      : "No assets yet. Create one to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead className="min-w-[200px]">Reference</TableHead>
                        <TableHead className="min-w-[150px]">Manufacturer</TableHead>
                        <TableHead className="min-w-[120px]">Model</TableHead>
                        <TableHead className="min-w-[150px]">Category</TableHead>
                        <TableHead className="min-w-[200px]">Location</TableHead>
                        <TableHead className="w-[120px]">Condition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset: AssetListItem) => (
                        <TableRow
                          key={asset.id}
                          className="cursor-pointer"
                          onClick={() => handleAssetClick(asset.id)}
                        >
                          <TableCell className="font-medium">
                            {asset.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {asset.reference}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.manufacturer}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.model}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.categoryName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {asset.location}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                asset.condition === "Excellent"
                                  ? "border-green-600 text-green-700"
                                  : asset.condition === "Good"
                                    ? "border-blue-600 text-blue-700"
                                    : asset.condition === "Fair"
                                      ? "border-yellow-600 text-yellow-700"
                                      : "border-red-600 text-red-700"
                              }
                            >
                              {asset.condition}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

