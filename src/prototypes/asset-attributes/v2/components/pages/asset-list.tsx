import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Settings } from "lucide-react";
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
import { mockAssetList, MOCK_SITE, type AssetListItem } from "../../lib/mock-asset-list-data";

export function AssetList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter assets based on search query
  const filteredAssets = mockAssetList.filter((asset) =>
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

  const handleAssetClick = (assetId: string) => {
    navigate(`edit-asset/${assetId}`);
  };

  const handleCreateAsset = () => {
    navigate("create-asset");
  };

  const handleOpenSettings = () => {
    navigate("settings/global-attributes");
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navigation Header - matches edit-asset/create-asset width, fixed to top */}
      <div className="sticky top-0 z-50 w-full bg-muted/50 border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                {MOCK_SITE.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSettings}
                className="shrink-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                onClick={handleCreateAsset}
                className="shrink-0"
              >
                Create Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">

          {/* Search and Asset count */}
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
            <div className="text-sm text-muted-foreground shrink-0">
              {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
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
                              variant="outline"
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
