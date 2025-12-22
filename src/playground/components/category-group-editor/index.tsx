import { useState } from "react";
import { Plus, X, Pencil, ChevronLeft, Search, Grid3X3, CircleCheck } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card } from "@/registry/ui/card";
import { Checkbox } from "@/registry/ui/checkbox";
import { Input } from "@/registry/ui/input";
import { Badge } from "@/registry/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/registry/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import { cn } from "@/registry/lib/utils";

type TargetType = "all" | "selected";
type ModalStep = "target" | "choose-assets";

interface Asset {
  id: string;
  assetId: string;
  reference: string;
  site: string;
  location: string;
}

interface CategoryGroup {
  id: string;
  targetType: TargetType;
  selectedAssetIds: string[];
}

interface CategoryCard {
  id: string;
  name: string;
  assets: Asset[];
  groups: CategoryGroup[];
}

// Mock categories with detailed assets
const availableCategories = [
  {
    id: "access-control-doors",
    name: "Access Control Doors",
    assets: [
      { id: "acd-1", assetId: "9102", reference: "UI/1234", site: "John Lewis Sheffield", location: "-" },
      { id: "acd-2", assetId: "9103", reference: "UI/1235", site: "John Lewis Sheffield", location: "Floor 1" },
      { id: "acd-3", assetId: "9104", reference: "UI/1236", site: "John Lewis Leeds", location: "Main Entrance" },
      { id: "acd-4", assetId: "9105", reference: "UI/1237", site: "John Lewis Leeds", location: "-" },
      { id: "acd-5", assetId: "9106", reference: "UI/1238", site: "John Lewis Sheffield", location: "Loading Bay" },
      { id: "acd-6", assetId: "9107", reference: "UI/1239", site: "John Lewis Manchester", location: "-" },
      { id: "acd-7", assetId: "9108", reference: "UI/1240", site: "John Lewis Manchester", location: "Floor 2" },
    ],
  },
  {
    id: "hvac-units",
    name: "HVAC Units",
    assets: [
      { id: "hvac-1", assetId: "8001", reference: "HV/001", site: "John Lewis Sheffield", location: "Roof" },
      { id: "hvac-2", assetId: "8002", reference: "HV/002", site: "John Lewis Sheffield", location: "Basement" },
      { id: "hvac-3", assetId: "8003", reference: "HV/003", site: "John Lewis Leeds", location: "Roof" },
      { id: "hvac-4", assetId: "8004", reference: "HV/004", site: "John Lewis Leeds", location: "Floor 1" },
      { id: "hvac-5", assetId: "8005", reference: "HV/005", site: "John Lewis Manchester", location: "Roof" },
    ],
  },
  {
    id: "fire-alarms",
    name: "Fire Alarms",
    assets: [
      { id: "fa-1", assetId: "7001", reference: "FA/001", site: "John Lewis Sheffield", location: "Panel A" },
      { id: "fa-2", assetId: "7002", reference: "FA/002", site: "John Lewis Leeds", location: "Panel B" },
      { id: "fa-3", assetId: "7003", reference: "FA/003", site: "John Lewis Manchester", location: "Panel C" },
    ],
  },
];

// Get unique sites from assets
function getUniqueSites(assets: Asset[]): string[] {
  return [...new Set(assets.map((a) => a.site))];
}

// Get unique locations from assets
function getUniqueLocations(assets: Asset[]): string[] {
  return [...new Set(assets.map((a) => a.location).filter((l) => l !== "-"))];
}

export function CategoryGroupEditorDemo() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("target");
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Filters for asset picker
  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const addCategory = (cat: (typeof availableCategories)[0]) => {
    if (categories.find((c) => c.id === cat.id)) return;
    setCategories([
      ...categories,
      {
        id: cat.id,
        name: cat.name,
        assets: cat.assets,
        groups: [],
      },
    ]);
  };

  const removeCategory = (categoryId: string) => {
    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  const openAddGroupModal = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const categoryHasAllGroup = category?.groups.some((g) => g.targetType === "all") ?? false;

    setActiveCategoryId(categoryId);
    setActiveGroupId(null);
    setIsEditing(false);
    // Default to "selected" if "all" already exists
    setTargetType(categoryHasAllGroup ? "selected" : "all");
    setSelectedAssetIds([]);
    setModalStep("target");
    resetFilters();
    setShowGroupModal(true);
  };

  const openEditGroupModal = (categoryId: string, groupId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const group = category?.groups.find((g) => g.id === groupId);
    if (group) {
      setActiveCategoryId(categoryId);
      setActiveGroupId(groupId);
      setIsEditing(true);
      setTargetType(group.targetType);
      setSelectedAssetIds(group.selectedAssetIds);
      // "Selected" → go straight to picker (common case: tweak selection)
      // "All" → show type selector (only action is to switch to Selected)
      setModalStep(group.targetType === "selected" ? "choose-assets" : "target");
      resetFilters();
      setShowGroupModal(true);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSiteFilter("all");
    setLocationFilter("all");
  };

  const saveGroup = (overrideTargetType?: TargetType) => {
    if (!activeCategoryId) return;
    const finalTargetType = overrideTargetType ?? targetType;

    setCategories(
      categories.map((cat) => {
        if (cat.id !== activeCategoryId) return cat;

        if (isEditing && activeGroupId) {
          return {
            ...cat,
            groups: cat.groups.map((g) => {
              if (g.id !== activeGroupId) return g;
              return {
                ...g,
                targetType: finalTargetType,
                selectedAssetIds: finalTargetType === "selected" ? selectedAssetIds : [],
              };
            }),
          };
        } else {
          return {
            ...cat,
            groups: [
              ...cat.groups,
              {
                id: `group-${Date.now()}`,
                targetType: finalTargetType,
                selectedAssetIds: finalTargetType === "selected" ? selectedAssetIds : [],
              },
            ],
          };
        }
      })
    );

    setShowGroupModal(false);
    setActiveCategoryId(null);
    setActiveGroupId(null);
  };

  const removeGroup = (categoryId: string, groupId: string) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          groups: cat.groups.filter((g) => g.id !== groupId),
        };
      })
    );
  };

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleAllAssets = (assets: Asset[]) => {
    const filteredIds = assets.map((a) => a.id);
    const allSelected = filteredIds.every((id) => selectedAssetIds.includes(id));

    if (allSelected) {
      setSelectedAssetIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedAssetIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  // Filter assets based on search and filters
  const filteredAssets = activeCategory?.assets.filter((asset) => {
    const matchesSearch =
      searchQuery === "" ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = siteFilter === "all" || asset.site === siteFilter;
    const matchesLocation = locationFilter === "all" || asset.location === locationFilter;
    return matchesSearch && matchesSite && matchesLocation;
  }) || [];

  const sites = activeCategory ? getUniqueSites(activeCategory.assets) : [];
  const locations = activeCategory ? getUniqueLocations(activeCategory.assets) : [];

  // Check if "All" group already exists (can only have one)
  const hasAllGroup = activeCategory?.groups.some(
    (g) => g.targetType === "all" && g.id !== activeGroupId
  ) ?? false;

  const handleTargetSelect = (type: TargetType) => {
    if (type === "all" && hasAllGroup) return;
    setTargetType(type);
  };

  const handlePrimaryAction = () => {
    if (targetType === "all") {
      saveGroup();
    } else {
      setModalStep("choose-assets");
    }
  };

  const handleBack = () => {
    setModalStep("target");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">
          Category Group Editor
        </h1>
        <p className="text-sm text-muted-foreground">
          Add categories, create groups targeting all or selected assets.
          Edit "All" can switch to "Selected". Edit "Selected" only edits selection.
        </p>
      </div>

      {/* Add Category */}
      <div className="flex flex-wrap gap-2">
        {availableCategories
          .filter((cat) => !categories.find((c) => c.id === cat.id))
          .map((cat) => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              onClick={() => addCategory(cat)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {cat.name}
            </Button>
          ))}
        {availableCategories.every((cat) =>
          categories.find((c) => c.id === cat.id)
        ) && (
          <span className="text-sm text-muted-foreground">
            All categories added
          </span>
        )}
      </div>

      {/* Category Cards */}
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.assets.length} total assets
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCategory(category.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Groups */}
            <div className="space-y-2">
              {category.groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {group.targetType === "all" ? (
                        <>All {category.assets.length} assets</>
                      ) : (
                        <>
                          {group.selectedAssetIds.length} of {category.assets.length}{" "}
                          assets
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditGroupModal(category.id, group.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeGroup(category.id, group.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openAddGroupModal(category.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Group
              </Button>
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
            Add a category above to get started
          </div>
        )}
      </div>

      {/* Group Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className={cn(
          "gap-0 p-0",
          modalStep === "choose-assets" ? "max-w-2xl" : "max-w-lg"
        )}>
          {modalStep === "target" ? (
            <>
              {/* Target Selection Step */}
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold">
                  {isEditing ? "Edit group" : "Add group"}
                </DialogTitle>
                <DialogDescription className="text-base text-foreground pt-2">
                  Select how to group your assets
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Include All Card */}
                  <button
                    type="button"
                    onClick={() => handleTargetSelect("all")}
                    disabled={hasAllGroup}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 transition-colors text-center",
                      hasAllGroup
                        ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                        : targetType === "all"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                    )}
                  >
                    <Grid3X3 className={cn(
                      "h-8 w-8",
                      hasAllGroup
                        ? "text-muted-foreground"
                        : targetType === "all"
                          ? "text-primary"
                          : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      hasAllGroup
                        ? "text-muted-foreground"
                        : targetType === "all"
                          ? "text-primary"
                          : "text-foreground"
                    )}>
                      Include all<br />{activeCategory?.name}
                    </span>
                    {hasAllGroup && (
                      <span className="text-xs text-muted-foreground">
                        Already added
                      </span>
                    )}
                  </button>

                  {/* Choose Selection Card */}
                  <button
                    type="button"
                    onClick={() => handleTargetSelect("selected")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 transition-colors text-center",
                      targetType === "selected"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                    )}
                  >
                    <CircleCheck className={cn(
                      "h-8 w-8",
                      targetType === "selected" ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      targetType === "selected" ? "text-primary" : "text-foreground"
                    )}>
                      Choose a selection<br />of assets
                    </span>
                  </button>
                </div>
              </div>

              <DialogFooter className="p-6 pt-2">
                <Button variant="outline" onClick={() => setShowGroupModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePrimaryAction}>
                  {targetType === "all" ? "Include all" : "Choose assets"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Choose Assets Step */}
              <DialogHeader className="p-4 pb-4 border-b space-y-0">
                <div className="flex items-center gap-3">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={handleBack}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <DialogTitle className="text-lg font-semibold">
                    {isEditing ? "Edit selection" : "Choose assets"}
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="p-4 space-y-4">
                {/* Search and Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ID or reference"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={siteFilter} onValueChange={setSiteFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset Table */}
                <div className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_80px_100px_1fr_100px] gap-2 px-4 py-2.5 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                    <div className="flex items-center">
                      <Checkbox
                        checked={
                          filteredAssets.length > 0 &&
                          filteredAssets.every((a) => selectedAssetIds.includes(a.id))
                        }
                        onCheckedChange={() => toggleAllAssets(filteredAssets)}
                      />
                    </div>
                    <div>Asset ID</div>
                    <div>Reference</div>
                    <div>Site</div>
                    <div>Location</div>
                  </div>

                  {/* Rows */}
                  <div className="max-h-[280px] overflow-y-auto divide-y">
                    {filteredAssets.map((asset) => (
                      <label
                        key={asset.id}
                        className="grid grid-cols-[40px_80px_100px_1fr_100px] gap-2 px-4 py-3 hover:bg-muted/30 cursor-pointer items-center"
                      >
                        <div>
                          <Checkbox
                            checked={selectedAssetIds.includes(asset.id)}
                            onCheckedChange={() => toggleAsset(asset.id)}
                          />
                        </div>
                        <div className="text-sm font-medium">{asset.assetId}</div>
                        <div>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {asset.reference}
                          </Badge>
                        </div>
                        <div className="text-sm truncate">{asset.site}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {asset.location}
                        </div>
                      </label>
                    ))}
                    {filteredAssets.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No assets match your filters
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-row justify-between sm:justify-between p-4 pt-0">
                <span className="text-sm text-primary">
                  {selectedAssetIds.length} assets selected
                </span>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button variant="outline" onClick={() => setShowGroupModal(false)}>
                      Cancel
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={() => saveGroup()}
                    disabled={selectedAssetIds.length === 0}
                  >
                    {isEditing ? "Save changes" : "Add group"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
