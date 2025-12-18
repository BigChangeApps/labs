import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
import { Badge } from "@/registry/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { useAgreementStore } from "../../lib/store";
import type { AgreementCategory, ServicePlan } from "../../types";

// Available categories from asset data
const availableCategories = [
  { id: "cctv-camera", name: "CCTV Camera" },
  { id: "boiler", name: "Boiler" },
  { id: "fire-alarm-panel", name: "Fire Alarm Control Panel" },
  { id: "generator", name: "Generator (Diesel / Gas)" },
  { id: "ev-charger", name: "EV Charger" },
  { id: "fire-extinguisher", name: "Fire Extinguisher" },
  { id: "emergency-light", name: "Emergency Light" },
  { id: "escalator", name: "Escalator" },
  { id: "lift", name: "Lift" },
  { id: "hvac", name: "HVAC" },
];

// Available service plan frequencies
const frequencies = ["Annual", "Quarterly", "Monthly", "Weekly"];

export function EditAgreement() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const navigate = useNavigate();
  const {
    getAgreementById,
    updateAgreement,
    addCategoryToAgreement,
    removeCategoryFromAgreement,
    addServicePlanToCategory,
    removeServicePlanFromCategory,
    sites,
  } = useAgreementStore();

  const agreement = agreementId ? getAgreementById(agreementId) : undefined;

  // Form state
  const [reference, setReference] = useState(agreement?.reference || "");
  const [billingContact, setBillingContact] = useState(agreement?.billingContact || "");
  const [startDate, setStartDate] = useState(agreement?.startDate || "");
  const [endDate, setEndDate] = useState(agreement?.endDate || "");
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(agreement?.siteIds || []);

  // Dialog state
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [addServicePlanDialogOpen, setAddServicePlanDialogOpen] = useState(false);
  const [servicePlanCategoryId, setServicePlanCategoryId] = useState<string | null>(null);
  const [newServicePlanName, setNewServicePlanName] = useState("");
  const [newServicePlanFrequency, setNewServicePlanFrequency] = useState("");

  // Get categories not yet added to agreement
  const availableCategoriesFiltered = useMemo(() => {
    if (!agreement) return availableCategories;
    const usedCategoryIds = agreement.categories.map((c) => c.categoryId);
    return availableCategories.filter((cat) => !usedCategoryIds.includes(cat.id));
  }, [agreement]);

  if (!agreement) {
    return (
      <div className="w-full min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Agreement not found.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!agreementId) return;

    updateAgreement(agreementId, {
      reference: reference || undefined,
      billingContact,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      siteIds: selectedSiteIds,
    });

    toast.success("Agreement saved successfully");
    navigate("/asset-service-agreements/v1/agreements");
  };

  const handleAddCategory = () => {
    if (!agreementId || !newCategoryId) return;

    const categoryInfo = availableCategories.find((c) => c.id === newCategoryId);
    if (!categoryInfo) return;

    const newCategory: AgreementCategory = {
      id: `cat-${Date.now()}`,
      categoryId: newCategoryId,
      categoryName: categoryInfo.name,
      servicePlans: [],
    };

    addCategoryToAgreement(agreementId, newCategory);
    setAddCategoryDialogOpen(false);
    setNewCategoryId("");
    toast.success(`Added ${categoryInfo.name} category`);
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!agreementId) return;
    removeCategoryFromAgreement(agreementId, categoryId);
    toast.success("Category removed");
  };

  const handleOpenAddServicePlan = (categoryId: string) => {
    setServicePlanCategoryId(categoryId);
    setNewServicePlanName("");
    setNewServicePlanFrequency("");
    setAddServicePlanDialogOpen(true);
  };

  const handleAddServicePlan = () => {
    if (!agreementId || !servicePlanCategoryId || !newServicePlanName || !newServicePlanFrequency) {
      return;
    }

    const newPlan: ServicePlan = {
      id: `sp-${Date.now()}`,
      name: newServicePlanName,
      frequency: newServicePlanFrequency,
      coverage: "all",
    };

    addServicePlanToCategory(agreementId, servicePlanCategoryId, newPlan);
    setAddServicePlanDialogOpen(false);
    setServicePlanCategoryId(null);
    setNewServicePlanName("");
    setNewServicePlanFrequency("");
    toast.success("Service plan added");
  };

  const handleRemoveServicePlan = (categoryId: string, servicePlanId: string) => {
    if (!agreementId) return;
    removeServicePlanFromCategory(agreementId, categoryId, servicePlanId);
    toast.success("Service plan removed");
  };

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const statusVariant = agreement.status === "draft" ? "secondary" : "default";

  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
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
                  <h1 className="text-lg font-bold">Edit Agreement</h1>
                  <Badge variant={statusVariant} className="capitalize">
                    {agreement.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {agreement.id.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl space-y-6">
          {/* Agreement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agreement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="e.g. JLP-FIRE-2024"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingContact">Billing Contact</Label>
                  <Input
                    id="billingContact"
                    placeholder="Customer name or company"
                    value={billingContact}
                    onChange={(e) => setBillingContact(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sites Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Select sites this agreement applies to
              </p>
              <div className="flex flex-wrap gap-2">
                {sites.map((site) => {
                  const isSelected = selectedSiteIds.includes(site.id);
                  return (
                    <button
                      key={site.id}
                      onClick={() => toggleSite(site.id)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {site.name}
                    </button>
                  );
                })}
              </div>
              {selectedSiteIds.length === 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  No sites selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Categories & Service Plans */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">Categories & Service Plans</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddCategoryDialogOpen(true)}
                disabled={availableCategoriesFiltered.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {agreement.categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No categories added yet. Add a category to define service plans.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAddCategoryDialogOpen(true)}
                    disabled={availableCategoriesFiltered.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first category
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {agreement.categories.map((category) => (
                    <div
                      key={category.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                        <h3 className="font-medium">{category.categoryName}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAddServicePlan(category.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Service
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Service Plans */}
                      {category.servicePlans.length === 0 ? (
                        <div className="px-4 py-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            No service plans defined for this category.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {category.servicePlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm">{plan.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {plan.frequency}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {plan.coverage === "all" ? "All items" : "Selected"}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  handleRemoveServicePlan(category.id, plan.id)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
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

      {/* Footer */}
      <div className="sticky bottom-0 w-full bg-background border-t border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/asset-service-agreements/v1/agreements")}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Agreement</Button>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Select an asset category to add to this agreement.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newCategoryId} onValueChange={setNewCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategoriesFiltered.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryId}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Plan Dialog */}
      <Dialog
        open={addServicePlanDialogOpen}
        onOpenChange={setAddServicePlanDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Plan</DialogTitle>
            <DialogDescription>
              Define a new service plan for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="servicePlanName">Service Name</Label>
              <Input
                id="servicePlanName"
                placeholder="e.g. Annual Inspection"
                value={newServicePlanName}
                onChange={(e) => setNewServicePlanName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servicePlanFrequency">Frequency</Label>
              <Select
                value={newServicePlanFrequency}
                onValueChange={setNewServicePlanFrequency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddServicePlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddServicePlan}
              disabled={!newServicePlanName || !newServicePlanFrequency}
            >
              Add Service Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
