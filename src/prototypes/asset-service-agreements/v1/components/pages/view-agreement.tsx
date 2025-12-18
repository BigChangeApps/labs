import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Pencil } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/ui/card";
import { Badge } from "@/registry/ui/badge";
import { useAgreementStore } from "../../lib/store";

export function ViewAgreement() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const navigate = useNavigate();
  const { getAgreementById, sites } = useAgreementStore();

  const agreement = agreementId ? getAgreementById(agreementId) : undefined;

  if (!agreement) {
    return (
      <div className="w-full min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Agreement not found.</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getSiteNames = () => {
    return agreement.siteIds
      .map((id) => sites.find((s) => s.id === id)?.name)
      .filter(Boolean);
  };

  const statusVariant =
    agreement.status === "active"
      ? "default"
      : agreement.status === "ended"
        ? "outline"
        : "secondary";

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full bg-muted/50 border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/asset-service-agreements/v1/agreements")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold">{agreement.name}</h1>
                  <Badge variant={statusVariant} className="capitalize">
                    {agreement.status}
                  </Badge>
                </div>
                {agreement.reference && (
                  <p className="text-sm text-muted-foreground">
                    {agreement.reference}
                  </p>
                )}
              </div>
            </div>
            {agreement.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/asset-service-agreements/v1/agreements/edit/${agreement.id}`)
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agreement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Billing Contact */}
              <div>
                <p className="text-sm text-muted-foreground">Billing Contact</p>
                <p className="font-medium">{agreement.billingContact}</p>
              </div>

              {/* Dates */}
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(agreement.startDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(agreement.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Sites */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Sites</p>
                <div className="flex flex-wrap gap-2">
                  {getSiteNames().map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Service Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories & Service Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories configured.
                </p>
              ) : (
                <div className="space-y-4">
                  {agreement.categories.map((category) => (
                    <div
                      key={category.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <h3 className="font-medium">{category.categoryName}</h3>
                      {category.servicePlans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No service plans.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {category.servicePlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
                            >
                              <span className="text-sm">{plan.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {plan.frequency}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {plan.coverage === "all" ? "All items" : "Selected"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
