import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Card, CardContent } from "@/registry/ui/card";
import { Badge } from "@/registry/ui/badge";
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

export function Agreements() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { agreements, sites } = useAgreementStore();

  const filteredAgreements = useMemo(() => {
    const filtered = agreements.filter((agreement) =>
      [agreement.name, agreement.reference, agreement.billingContact, agreement.id]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [agreements, searchQuery]);

  const handleCreateAgreement = () => {
    // Placeholder
  };

  const handleAgreementClick = (agreementId: string) => {
    const agreement = agreements.find((a) => a.id === agreementId);
    if (!agreement) return;

    // Draft → Edit page, Active/Ended → View page
    if (agreement.status === "draft") {
      navigate(`/asset-service-agreements/v1/agreements/edit/${agreementId}`);
    } else {
      navigate(`/asset-service-agreements/v1/agreements/view/${agreementId}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getSiteNames = (siteIds: string[]) => {
    return siteIds
      .map((id) => sites.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
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
                placeholder="Search agreements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button size="sm" onClick={handleCreateAgreement} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create agreement
            </Button>
          </div>

          {/* Agreements Table */}
          <Card>
            <CardContent className="p-0">
              {filteredAgreements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "No agreements found matching your search"
                      : "No agreements yet. Create one to get started."}
                  </p>
                  {!searchQuery && (
                    <Button size="sm" onClick={handleCreateAgreement} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create agreement
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] whitespace-nowrap">Agreement ID</TableHead>
                        <TableHead className="w-[130px] whitespace-nowrap">Reference</TableHead>
                        <TableHead className="whitespace-nowrap">Billing Contact</TableHead>
                        <TableHead>Sites</TableHead>
                        <TableHead className="w-[90px]">Status</TableHead>
                        <TableHead className="w-[110px] whitespace-nowrap">End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgreements.map((agreement) => {
                        const statusVariant =
                          agreement.status === "active"
                            ? "default"
                            : agreement.status === "draft"
                              ? "secondary"
                              : "outline";

                        return (
                          <TableRow
                            key={agreement.id}
                            className="cursor-pointer"
                            onClick={() => handleAgreementClick(agreement.id)}
                          >
                            <TableCell className="font-mono text-xs">
                              {agreement.id.toUpperCase()}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {agreement.reference || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {agreement.billingContact}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm truncate">
                              {getSiteNames(agreement.siteIds)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariant} className="capitalize">
                                {agreement.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {formatDate(agreement.endDate)}
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
