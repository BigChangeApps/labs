import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, ArrowLeft } from "lucide-react";
import { useAttributeStore } from "../../lib/store";
import { organizeAttributesForForm } from "../../lib/asset-form-utils";
import { createAssetFormSchema } from "../../lib/asset-form-validation";
// TODO-HANDOFF: Replace getMockAsset with useQuery hook to GET /api/assets/{id}
import { getMockAsset } from "../../lib/mock-asset-data";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { Form } from "@/registry/ui/form";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/ui/command";
import { AttributeField } from "../features/asset-form/AttributeField";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
import { SiteSearchableSelect } from "../features/asset-form/SiteSearchableSelect";
import { MOCK_SITE, type AssetListItem } from "../../lib/mock-asset-list-data";
import type { Category } from "../../types";

// TODO-HANDOFF: API integration points:
//   - Load asset: GET /v1/assets/{assetId} → ReadAssetModel
//   - Update asset: PATCH /v1/assets/{assetId} with UpdateAssetModel
//   - Asset images: GET /v1/assets/{assetId}/images → ReadAssetImageModel[]
//   - Upload image: POST /v1/assets/{assetId}/images (multipart/form-data)
//   - Delete image: DELETE /v1/assets/{assetId}/images/{imageId}

export function EditAsset() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, manufacturers, updateAsset, assets } = useAttributeStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [originalCategoryId, setOriginalCategoryId] = useState<string | null>(null);
  const [showCategoryChangeDialog, setShowCategoryChangeDialog] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [showSiteEditDialog, setShowSiteEditDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Get the asset from store
  const storeAsset = useMemo(() => {
    if (!assetId) return null;
    return assets.find((a) => a.id === assetId) || null;
  }, [assetId, assets]);

  // TODO-HANDOFF: Replace with API fetch - GET /api/assets/{assetId}
  // Should return asset with all attributes, category info, and site data
  const mockAsset = useMemo(() => {
    if (!assetId) return null;
    // Pass the store asset and manufacturers to getMockAsset so it uses the correct siteId and resolves IDs
    return getMockAsset(assetId, storeAsset || undefined, manufacturers);
  }, [assetId, storeAsset, manufacturers]);

  // Get photos from mock asset, default to empty array
  const photos = useMemo(() => {
    return mockAsset?.photos || [];
  }, [mockAsset]);

  // Initialize category from mock asset
  useEffect(() => {
    if (mockAsset?.categoryId) {
      setSelectedCategoryId(mockAsset.categoryId);
      setOriginalCategoryId(mockAsset.categoryId);
    }
  }, [mockAsset]);

  // Get selected category
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  // Organize attributes for the form (excluding category field since it's in the header)
  const organizedAttributes = useMemo(() => {
    return organizeAttributesForForm(selectedCategoryId, false);
  }, [selectedCategoryId]);

  // Separate core attributes from category-specific attributes
  const coreAttributes = useMemo(() => {
    return organizedAttributes.attributes.filter(
      (attr) => attr.source === "global"
    );
  }, [organizedAttributes.attributes]);

  const categorySpecificAttributes = useMemo(() => {
    return organizedAttributes.attributes.filter(
      (attr) => attr.source !== "global"
    );
  }, [organizedAttributes.attributes]);

  // Site options for location card
  const siteOptions = useMemo(() => [
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
  ], []);

  // Get site and location attributes separately
  const siteAttribute = useMemo(() => {
    return organizedAttributes.location.find((attr) => attr.id === "global-contact");
  }, [organizedAttributes.location]);

  const locationAttribute = useMemo(() => {
    return organizedAttributes.location.find((attr) => attr.id === "global-location");
  }, [organizedAttributes.location]);

  // Get all attributes for validation schema (excluding Asset ID)
  const allAttributes = useMemo(() => {
    return [
      ...organizedAttributes.assetInfo,
      ...organizedAttributes.location,
      ...organizedAttributes.manufacturer,
      ...organizedAttributes.attributes, // Includes both core and category-specific
      ...organizedAttributes.installation,
      ...organizedAttributes.warranty,
    ];
  }, [organizedAttributes]);

  // Create dynamic form schema
  const formSchema = useMemo(() => {
    return createAssetFormSchema(allAttributes);
  }, [allAttributes]);

  // Initialize form with mock asset data
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Dynamic schema type
    resolver: zodResolver(formSchema),
    defaultValues: mockAsset || {},
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Update form when mock asset loads
  // Only reset if the asset itself changed, not when manufacturers/models change
  const previousAssetIdRef = useRef<string | null>(null);
  const previousStoreAssetRef = useRef<AssetListItem | null>(null);
  
  useEffect(() => {
    if (mockAsset) {
      const assetChanged = 
        previousAssetIdRef.current !== assetId ||
        previousStoreAssetRef.current !== storeAsset;
      
      if (assetChanged) {
        form.reset(mockAsset);
        previousAssetIdRef.current = assetId || null;
        previousStoreAssetRef.current = storeAsset;
      }
      // If only manufacturers changed (e.g., new model added), don't reset the form
      // This preserves the user's current selections including newly created models
    }
  }, [mockAsset, form, assetId, storeAsset]);

  // Focus h1 on mount for accessibility (programmatic focus doesn't show focus-visible)
  // Use double requestAnimationFrame to ensure this runs after all other focus management
  useEffect(() => {
    if (!selectedCategoryId) return;
    
    const focusH1 = () => {
      if (h1Ref.current) {
        h1Ref.current.focus();
      }
    };
    // Double RAF ensures this runs after all other effects and focus management
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusH1();
      });
    });
  }, [selectedCategoryId]);

  // Focus h1 on mount for accessibility (programmatic focus doesn't show focus-visible)
  // Use double requestAnimationFrame to ensure this runs after all other focus management
  useEffect(() => {
    if (!selectedCategoryId) return;
    
    const focusH1 = () => {
      if (h1Ref.current) {
        h1Ref.current.focus();
      }
    };
    // Double RAF ensures this runs after all other effects and focus management
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusH1();
      });
    });
  }, [selectedCategoryId]);

  // Get selected site data
  const selectedSiteId = form.watch("global-contact");
  const selectedSiteData = useMemo(() => {
    if (!selectedSiteId) return null;
    return siteOptions.find((s) => s.id === selectedSiteId) || null;
  }, [selectedSiteId, siteOptions]);

  // Watch category field and update selectedCategoryId when it changes
  const watchedCategory = form.watch("global-category");
  useEffect(() => {
    if (watchedCategory && watchedCategory !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategory as string);
    }
  }, [watchedCategory, selectedCategoryId]);

  // Get siteId from form data, store asset, or mock asset
  const getSiteId = (): string | undefined => {
    const formSiteId = form.watch("global-contact") as string | undefined;
    const storeSiteId = storeAsset?.siteId;
    const mockSiteId = mockAsset?.["global-contact"] as string | undefined;
    return formSiteId || storeSiteId || mockSiteId;
  };

  // Handle form submission
  const onSubmit = (data: Record<string, unknown>) => {
    if (!assetId) return;
    
    // No category change check needed - dialog handles it before category changes
    console.log("Form data:", data);
    
    // Get category info
    const categoryId = (data["global-category"] as string) || selectedCategoryId || "";
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category?.name || "Unknown";
    
    // Get manufacturer and model info
    const manufacturerId = data["global-manufacturer"] as string | undefined;
    const manufacturer = manufacturerId
      ? manufacturers.find((m) => m.id === manufacturerId)
      : null;
    const manufacturerName = manufacturer?.name || "";
    
    const modelId = data["global-model"] as string | undefined;
    const model = manufacturer && modelId
      ? manufacturer.models.find((m) => m.id === modelId)
      : null;
    const modelName = model?.name || "";
    
    // Prepare updates for the asset
    const updates: Partial<AssetListItem> = {
      name: (data["global-name"] as string) || "Unnamed Asset",
      reference: (data["global-customer-reference"] as string) || "",
      categoryId: categoryId,
      categoryName: categoryName,
      condition: (data["global-condition"] as "Excellent" | "Good" | "Fair" | "Poor") || "Good",
      location: (data["global-location"] as string) || "",
      manufacturer: manufacturerName,
      model: modelName,
      lastService: data["global-date-last-service"] as string | undefined,
      warrantyExpiry: data["global-warranty-expiry"] as string | undefined,
      siteId: data["global-contact"] as string | undefined,
    };
    
    // Update asset in store
    updateAsset(assetId, updates);
    
    // Get the updated reference for the banner
    const updatedReference = updates.reference || "";
    
    // Navigate back based on where the user came from
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    const returnTo = location.state?.returnTo as string | undefined;
    
    const bannerState = {
      showSuccessBanner: true,
      assetId: assetId,
      assetReference: updatedReference,
    };
    
    if (returnTo === 'asset-list') {
      // Return to asset list page with success banner
      navigate(`${basePath}/assets`, { state: bannerState });
    } else if (returnTo === 'site-assets' && location.state?.siteId) {
      // Return to site assets page with success banner
      const siteId = location.state.siteId as string;
      navigate(`${basePath}/site/${siteId}/assets`, { state: bannerState });
    } else {
      // Fallback: check if we have a siteId to navigate back to site assets
      const siteId = (data["global-contact"] as string | undefined) || getSiteId();
      if (siteId) {
        navigate(`${basePath}/site/${siteId}/assets`, { state: bannerState });
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(`${basePath}/assets`, { state: bannerState });
      }
    }
  };

  // Handle back button click - go back in history, or to asset list if no history
  const handleBackClick = () => {
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    const returnTo = location.state?.returnTo as string | undefined;
    
    if (returnTo === 'asset-list') {
      // Return to asset list page
      navigate(`${basePath}/assets`);
    } else if (returnTo === 'site-assets' && location.state?.siteId) {
      // Return to site assets page
      const siteId = location.state.siteId as string;
      navigate(`${basePath}/site/${siteId}/assets`);
    } else if (window.history.length > 1) {
      // Try to go back in browser history
      navigate(-1);
    } else {
      // Fallback: check if we have a siteId and navigate to site assets
      const siteId = getSiteId();
      if (siteId) {
        navigate(`${basePath}/site/${siteId}/assets`);
      } else {
        navigate(`${basePath}/assets`);
      }
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    // Check if form has unsaved changes
    if (form.formState.isDirty) {
      setShowUnsavedChangesDialog(true);
    } else {
      const pathname = location.pathname;
      const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
      const returnTo = location.state?.returnTo as string | undefined;
      
      if (returnTo === 'asset-list') {
        // Return to asset list page
        navigate(`${basePath}/assets`);
      } else if (returnTo === 'site-assets' && location.state?.siteId) {
        // Return to site assets page
        const siteId = location.state.siteId as string;
        navigate(`${basePath}/site/${siteId}/assets`);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback: check if we have a siteId and navigate to site assets
        const siteId = getSiteId();
        if (siteId) {
          navigate(`${basePath}/site/${siteId}/assets`);
        } else {
          navigate(basePath);
        }
      }
    }
  };

  // Confirm close with unsaved changes
  const handleConfirmClose = () => {
    setShowUnsavedChangesDialog(false);
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    const returnTo = location.state?.returnTo as string | undefined;
    
    if (returnTo === 'asset-list') {
      // Return to asset list page
      navigate(basePath);
    } else if (returnTo === 'site-assets' && location.state?.siteId) {
      // Return to site assets page
      const siteId = location.state.siteId as string;
      navigate(`${basePath}/site/${siteId}/assets`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: check if we have a siteId and navigate to site assets
      const siteId = getSiteId();
      if (siteId) {
        navigate(`${basePath}/site/${siteId}/assets`);
      } else {
        navigate(`${basePath}/assets`);
      }
    }
  };

  // Cancel close
  const handleCancelClose = () => {
    setShowUnsavedChangesDialog(false);
  };

  // Handle category selection from popover
  const handleCategorySelect = (categoryId: string) => {
    // If selecting the same category, just close popover
    if (categoryId === selectedCategoryId) {
      setCategoryPopoverOpen(false);
      return;
    }

    // If switching back to original category, apply change directly without prompt
    if (originalCategoryId && categoryId === originalCategoryId) {
      form.setValue("global-category", categoryId);
      setSelectedCategoryId(categoryId);
      setCategoryPopoverOpen(false);
      return;
    }

    // If category is different from original, show confirmation dialog
    if (originalCategoryId && categoryId !== originalCategoryId) {
      setPendingCategoryId(categoryId);
      setShowCategoryChangeDialog(true);
      setCategoryPopoverOpen(false);
    } else {
      // If no original category (shouldn't happen in edit mode), just apply change
      form.setValue("global-category", categoryId);
      setSelectedCategoryId(categoryId);
      setCategoryPopoverOpen(false);
    }
  };

  // Confirm category change
  const handleConfirmCategoryChange = () => {
    if (pendingCategoryId) {
      // Update the category
      form.setValue("global-category", pendingCategoryId);
      setSelectedCategoryId(pendingCategoryId);
      setOriginalCategoryId(pendingCategoryId);
      
      // Reset form to trigger schema update with new category
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        "global-category": pendingCategoryId,
      });
      
      setShowCategoryChangeDialog(false);
      setPendingCategoryId(null);
    }
  };

  // Cancel category change
  const handleCancelCategoryChange = () => {
    setShowCategoryChangeDialog(false);
    setPendingCategoryId(null);
  };

  // Get pending category name for dialog
  const pendingCategoryName = useMemo(() => {
    if (!pendingCategoryId) return "";
    return categories.find((c) => c.id === pendingCategoryId)?.name || "";
  }, [pendingCategoryId, categories]);

  // Organize categories into parent-child structure for Command groups
  const categoryGroups = useMemo(() => {
    const parentCategories = categories.filter((c: Category) => !c.parentId);
    
    // Sort parents alphabetically, but put "Other" at the end
    const sortedParents = parentCategories.sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return a.name.localeCompare(b.name);
    });

    return sortedParents.map((parent: Category) => {
      const children = categories
        .filter((c: Category) => c.parentId === parent.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        parent,
        children,
      };
    }).filter(group => group.children.length > 0); // Only show groups with children
  }, [categories]);

  if (!assetId || !mockAsset) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-[700px]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-2xl font-bold">Asset not found</h1>
              <p className="text-muted-foreground text-center">
                The asset with ID "{assetId}" could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedCategoryId) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-[700px]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-y-auto pb-10">
      {/* Navigation Header - matches asset-list width, fixed to top */}
      <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-base sm:text-lg font-bold tracking-tight">
                Asset {assetId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCloseClick}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - narrower width */}
      <div className="max-w-[1050px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-4 w-full">
              {/* Title and Actions */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4 w-full">
                  <h1 
                    ref={h1Ref}
                    tabIndex={0}
                    className="text-2xl sm:text-3xl font-bold tracking-tight outline-none focus-visible:outline-none"
                  >
                    {selectedCategory?.name || "Asset"} at {selectedSiteData?.name || MOCK_SITE.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                        >
                          Change category
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            {categoryGroups.map((group, index) => (
                              <div key={group.parent.id}>
                                {index > 0 && <CommandSeparator />}
                                <CommandGroup heading={group.parent.name}>
                                  {group.children.map((child: Category) => (
                                    <CommandItem
                                      key={child.id}
                                      value={child.name}
                                      onSelect={() => handleCategorySelect(child.id)}
                                    >
                                      {child.name}
                                      {selectedCategoryId === child.id && (
                                        <Check className="ml-auto h-4 w-4" />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </div>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowSiteEditDialog(true)}
                    >
                      Change site
                    </Button>
                  </div>
                </div>
                {/* Site Address */}
                {selectedSiteData?.address && (
                  <p className="text-sm text-muted-foreground" style={{ textWrap: 'balance' }}>
                    {selectedSiteData.address}
                  </p>
                )}
              </div>
            </div>
          </div>

        {/* Category Change Confirmation Dialog */}
        <Dialog open={showCategoryChangeDialog} onOpenChange={setShowCategoryChangeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change category to {pendingCategoryName}</DialogTitle>
              <DialogDescription>
                Are you sure? This will overwrite any existing {selectedCategory?.name} attributes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={handleCancelCategoryChange}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleConfirmCategoryChange}>
                Change category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unsaved Changes Confirmation Dialog */}
        <Dialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Unsaved changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Are you sure you want to cancel without saving?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={handleCancelClose}>
                Keep editing
              </Button>
              <Button variant="default" onClick={handleConfirmClose}>
                Cancel without saving
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
          {/* Left Column - Form (3/5 width) */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-0"
                onKeyDown={(e) => {
                  // Prevent Enter key from submitting the form unless it's on a submit button or textarea
                  if (e.key === "Enter" && e.target instanceof HTMLElement) {
                    const target = e.target as HTMLElement & { type?: string };
                    const isSubmitButton = target.type === "submit" || e.target.closest('button[type="submit"]');
                    const isTextarea = e.target.tagName === "TEXTAREA";
                    if (!isSubmitButton && !isTextarea) {
                      e.preventDefault();
                    }
                  }
                }}
              >
                <Card className="w-full overflow-visible">
                  <CardContent className="p-5 overflow-visible">
                    {/* Asset Info Section */}
                    {organizedAttributes.assetInfo.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 pb-5">
                          <div className="flex items-center justify-between">
                            <h2 className="font-bold text-base">Asset info</h2>
                            {mockAsset && typeof mockAsset["global-asset-id"] === "string" && (
                              <Badge variant="secondary" className="text-xs font-semibold px-2 bg-muted text-muted-foreground">
                                {mockAsset["global-asset-id"]}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-3">
                            {organizedAttributes.assetInfo.map((attr) => (
                              <AttributeField
                                key={attr.id}
                                attribute={attr}
                                fieldName={attr.id}
                                siteOptions={siteOptions}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="w-[calc(100%+2.5rem)] -ml-5">
                          <Separator />
                        </div>
                      </>
                    )}


                    {/* Collapsible Sections - Manufacturer, Attributes, Installation, Warranty */}
                    {(organizedAttributes.manufacturer.length > 0 ||
                      coreAttributes.length > 0 ||
                      organizedAttributes.installation.length > 0 ||
                      organizedAttributes.warranty.length > 0) && (
                      <Accordion
                        type="multiple"
                        defaultValue={["manufacturer"]}
                        className="w-full"
                      >
                        {/* Manufacturer Section */}
                        {organizedAttributes.manufacturer.length > 0 && (
                          <>
                            <AccordionItem value="manufacturer" className="border-b-0">
                              <div className="flex flex-col py-5">
                                <AccordionTrigger className="!py-0 hover:no-underline font-bold text-base">
                                  Manufacturer
                                </AccordionTrigger>
                                <AccordionContent className="!pt-4 !pb-0 overflow-visible">
                                  <div className="flex flex-col gap-4 w-full">
                                    {organizedAttributes.manufacturer.map((attr) => (
                                      <AttributeField
                                        key={attr.id}
                                        attribute={attr}
                                        fieldName={attr.id}
                                        siteOptions={siteOptions}
                                      />
                                    ))}
                                  </div>
                                </AccordionContent>
                              </div>
                            </AccordionItem>
                            <div className="w-[calc(100%+2.5rem)] -ml-5">
                              <Separator />
                            </div>
                          </>
                        )}

                        {/* Core Attributes Section */}
                        {coreAttributes.length > 0 && (
                          <>
                            <AccordionItem value="attributes" className="border-b-0">
                              <div className="flex flex-col py-5">
                                <AccordionTrigger className="!py-0 hover:no-underline font-bold text-base">
                                  Attributes
                                </AccordionTrigger>
                                <AccordionContent className="!pt-4 !pb-0 overflow-visible">
                                  <div className="flex flex-col gap-4 w-full">
                                    {coreAttributes.map((attr) => (
                                      <AttributeField
                                        key={attr.id}
                                        attribute={attr}
                                        fieldName={attr.id}
                                        siteOptions={siteOptions}
                                      />
                                    ))}
                                  </div>
                                </AccordionContent>
                              </div>
                            </AccordionItem>
                            <div className="w-[calc(100%+2.5rem)] -ml-5">
                              <Separator />
                            </div>
                          </>
                        )}

                        {/* Installation Section */}
                        {organizedAttributes.installation.length > 0 && (
                          <>
                            <AccordionItem value="installation" className="border-b-0">
                              <div className="flex flex-col py-5">
                                <AccordionTrigger className="!py-0 hover:no-underline font-bold text-base">
                                  Installation
                                </AccordionTrigger>
                                <AccordionContent className="!pt-4 !pb-0 overflow-visible">
                                  <div className="flex flex-col gap-4 w-full">
                                    {organizedAttributes.installation.map((attr) => (
                                      <AttributeField
                                        key={attr.id}
                                        attribute={attr}
                                        fieldName={attr.id}
                                        siteOptions={siteOptions}
                                      />
                                    ))}
                                  </div>
                                </AccordionContent>
                              </div>
                            </AccordionItem>
                            <div className="w-[calc(100%+2.5rem)] -ml-5">
                              <Separator />
                            </div>
                          </>
                        )}

                        {/* Warranty Section */}
                        {organizedAttributes.warranty.length > 0 && (
                          <AccordionItem value="warranty" className="border-b-0">
                            <div className="flex flex-col pt-5">
                              <AccordionTrigger className="!py-0 hover:no-underline font-bold text-base">
                                Warranty
                              </AccordionTrigger>
                              <AccordionContent className="!pt-4 !pb-0 overflow-visible">
                                <div className="flex flex-col gap-4 w-full">
                                  {organizedAttributes.warranty.map((attr) => (
                                    <AttributeField
                                      key={attr.id}
                                      attribute={attr}
                                      fieldName={attr.id}
                                      siteOptions={siteOptions}
                                    />
                                  ))}
                                </div>
                              </AccordionContent>
                            </div>
                          </AccordionItem>
                        )}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>

                {/* Category-Specific Attributes Card */}
                {categorySpecificAttributes.length > 0 && (
                  <Card className="w-full mt-6">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-base">
                          {selectedCategory?.name} attributes
                        </h2>
                        <div className="flex flex-col gap-4">
                          {categorySpecificAttributes.map((attr) => (
                            <AttributeField
                              key={attr.id}
                              attribute={attr}
                              fieldName={attr.id}
                              siteOptions={siteOptions}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>

          {/* Right Column - Photos (2/5 width) */}
          <div className="lg:col-span-2">
            <Card className="w-full">
              <CardContent className="p-6">
                {photos.length > 0 ? (
                  <div className="flex flex-col gap-[10px]">
                    {/* Main Image */}
                    <div className="h-[185px] w-full rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
                      <img
                        src={photos[0]}
                        alt="Main asset image"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    {/* Thumbnails with Add button */}
                    <div className="flex gap-[10px] w-full">
                      {photos.slice(1).map((photo, index) => (
                        <div
                          key={index + 1}
                          className="h-[60px] w-[calc((100%-40px)/5)] rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center shrink-0"
                        >
                          <img
                            src={photo}
                            alt={`Asset photo ${index + 2}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ))}
                      {/* Add Photos Button as Thumbnail */}
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-[60px] w-[calc((100%-40px)/5)] rounded-lg border border-border p-0 flex items-center justify-center hover:bg-muted shrink-0"
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[10px]">
                    {/* Empty state - Main image area becomes Add Photo area */}
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-[185px] w-full rounded-lg border border-dashed border-border shrink-0 p-0 flex flex-col items-center justify-center gap-2 hover:bg-muted"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Add photos
                      </span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            {organizedAttributes.location.length > 0 && (
              <Card className="w-full mt-6">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    {/* Site Contact Card */}
                    {siteAttribute && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-foreground">
                                {selectedSiteData?.name || "No site selected"}
                              </p>
                              {selectedSiteData?.address && (
                                <p 
                                  className="text-sm text-muted-foreground"
                                  style={{ textWrap: 'balance' }}
                                >
                                  {selectedSiteData.address}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => setShowSiteEditDialog(true)}
                              className="text-sm text-primary h-auto p-0 self-start"
                            >
                              Change
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Location Field */}
                    {locationAttribute && (
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">
                          {locationAttribute.label}
                        </Label>
                        <Input
                          {...form.register("global-location")}
                          placeholder={locationAttribute.description}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Site Edit Dialog */}
            {siteAttribute && (
              <Dialog open={showSiteEditDialog} onOpenChange={setShowSiteEditDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit site</DialogTitle>
                    <DialogDescription>
                      Select a site for this asset.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <SiteSearchableSelect
                      sites={siteOptions}
                      value={typeof selectedSiteId === "string" ? selectedSiteId : ""}
                      onValueChange={(value) => {
                        form.setValue("global-contact", value);
                        setShowSiteEditDialog(false);
                      }}
                      placeholder="Select site"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setShowSiteEditDialog(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


