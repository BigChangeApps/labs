import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
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
import { WorkspaceHeader } from "../WorkspaceHeader";
import { useAgreementStore } from "../../lib/store";

export function Sites() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { sites, assets } = useAgreementStore();

  const filteredSites = useMemo(() => {
    const filtered = sites.filter((site) =>
      [site.name, site.address]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [sites, searchQuery]);

  const handleCreateSite = () => {
    // Placeholder
  };

  const handleSiteClick = (siteId: string) => {
    // Navigate to site detail (placeholder for now)
    navigate(`/asset-service-agreements/v1/sites/${siteId}`);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <WorkspaceHeader />

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Search and Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button size="sm" onClick={handleCreateSite} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add site
            </Button>
          </div>

          {/* Sites Table */}
          <Card>
            <CardContent className="p-0">
              {filteredSites.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "No sites found matching your search"
                      : "No sites yet. Create one to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Name</TableHead>
                        <TableHead className="min-w-[300px]">Address</TableHead>
                        <TableHead className="w-[120px] text-right">Assets</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSites.map((site) => {
                        const assetCount = assets.filter((asset) => asset.siteId === site.id).length;
                        return (
                          <TableRow
                            key={site.id}
                            className="cursor-pointer"
                            onClick={() => handleSiteClick(site.id)}
                          >
                            <TableCell className="font-medium">
                              {site.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {site.address}
                            </TableCell>
                            <TableCell className="text-right">
                              {assetCount}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
