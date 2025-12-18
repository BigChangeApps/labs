import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";
import { useAttributeStore } from "../../lib/store";
import { organizeAttributesForForm } from "../../lib/asset-form-utils";
import { createAssetFormSchema } from "../../lib/asset-form-validation";
import { Card, CardContent } from "@/registry/ui/card";
import { Separator } from "@/registry/ui/separator";
import { Button } from "@/registry/ui/button";
import { Form } from "@/registry/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { AttributeField } from "../features/asset-form/AttributeField";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
import { type AssetListItem } from "../../lib/mock-asset-list-data";
import { ATTRIBUTE_IDS } from "../features/asset-form/attribute-constants";

// TODO-HANDOFF: API integration points:
//   - Create asset: POST /v1/assets with CreateAssetModel
//     Request: { siteId, categoryId, reference?, location?, barcode?, manufacturer?, model?, etc. }
//     Response: StringPostResponse { id } (201 Created)
//   - Validate asset: POST /v1/assets/validate with CreateAssetModel (optional pre-validation)
//   - Site search: External Sites API (not in Asset Management API)
//   - Categories: GET /v1/categories → ReadCategoryModel[]

const SESSION_STORAGE_KEY = "asset-attributes-v2-create-asset-form-data";

export function CreateAsset() {
  const { categoryId: urlCategoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, manufacturers, addAsset } = useAttributeStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    urlCategoryId || null
  );
  const [photos] = useState<string[]>([]); // Default to no photos for create
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const isInitialMount = useRef(true);
  const isRestoringFromStorage = useRef(false);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Get selected category (for display purposes)
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  // Organize attributes for the form (including category field in Asset Info)
  const organizedAttributes = useMemo(() => {
    return organizeAttributesForForm(selectedCategoryId, true);
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

  // Site options for Site field (can be passed as props or use default in AttributeField)
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

  // Get all attributes for validation schema
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

  // Load saved form data from sessionStorage
  const loadSavedFormData = useCallback((): Record<string, unknown> => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if the category matches (if category was saved)
        if (!parsed["global-category"] || parsed["global-category"] === urlCategoryId || parsed["global-category"] === selectedCategoryId) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
    return {};
  }, [urlCategoryId, selectedCategoryId]);

  // Get siteId from location state (if coming from site page)
  const siteIdFromState = location.state?.siteId as string | undefined;

  // Initialize form with saved data or defaults
  const savedFormData = useMemo(() => loadSavedFormData(), [loadSavedFormData]);
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Dynamic schema type
    resolver: zodResolver(formSchema),
    defaultValues: {
      "global-category": urlCategoryId || savedFormData["global-category"] || "",
      ...savedFormData,
      // Pre-fill site if coming from site page (prioritize location state over saved data)
      ...(siteIdFromState && { [ATTRIBUTE_IDS.CONTACT]: siteIdFromState }),
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Watch category field and update selectedCategoryId when it changes
  const watchedCategory = form.watch("global-category");
  useEffect(() => {
    if (watchedCategory && watchedCategory !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategory as string);
      // Just update the category - don't reset the form
      // The attributes will swap out automatically based on the new category
    }
  }, [watchedCategory, selectedCategoryId]);

  // Save form data to sessionStorage whenever it changes (debounced)
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip saving when restoring from storage
    if (isRestoringFromStorage.current) {
      isRestoringFromStorage.current = false;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const subscription = form.watch((value) => {
      // Debounce saves to avoid too frequent writes
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          // Only save if form has been touched (user has interacted with it)
          if (form.formState.isDirty) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
          }
        } catch (error) {
          console.error("Error saving form data to sessionStorage:", error);
        }
      }, 500); // 500ms debounce
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [form]);

  // Restore form data from sessionStorage on mount (only once)
  useEffect(() => {
    if (Object.keys(savedFormData).length > 0) {
      // Only restore if we have saved data and it's not just the category
      const hasOtherData = Object.keys(savedFormData).some(
        (key) => key !== "global-category" && savedFormData[key] !== "" && savedFormData[key] != null
      );
      if (hasOtherData) {
        isRestoringFromStorage.current = true;
        // Use setTimeout to ensure form is fully initialized
        setTimeout(() => {
          // Preserve siteId from location state when restoring (prioritize location state)
          const dataToRestore = {
            ...savedFormData,
            ...(siteIdFromState && { [ATTRIBUTE_IDS.CONTACT]: siteIdFromState }),
          };
          form.reset(dataToRestore);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Focus h1 on mount for accessibility (programmatic focus doesn't show focus-visible)
  // Use double requestAnimationFrame to ensure this runs after all other focus management
  useEffect(() => {
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
  }, []);

  // Handle form submission
  const onSubmit = (data: Record<string, unknown>) => {
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
    
    // Generate a new asset ID (increment from highest existing ID)
    const store = useAttributeStore.getState();
    const existingIds = store.assets.map((a) => parseInt(a.id) || 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newAssetId = String(maxId + 1).padStart(4, "0");
    
    // Create the asset list item
    const newAsset: AssetListItem = {
      id: newAssetId,
      name: (data["global-name"] as string) || "Unnamed Asset",
      reference: (data["global-customer-reference"] as string) || `REF-${newAssetId}`,
      categoryId: categoryId,
      categoryName: categoryName,
      status: "Active",
      condition: (data["global-condition"] as "Excellent" | "Good" | "Fair" | "Poor") || "Good",
      location: (data["global-location"] as string) || "",
      manufacturer: manufacturerName,
      model: modelName,
      lastService: data["global-date-last-service"] as string | undefined,
      warrantyExpiry: data["global-warranty-expiry"] as string | undefined,
      siteId: (data["global-contact"] as string) || "",
    };
    
    // Add asset to store
    addAsset(newAsset);
    
    toast.success("Asset created successfully!");
    // Clear saved form data on successful submission
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    // In a real app, this would send data to an API
    // Navigate back - try to go back in history, or to asset list if no history
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    
    // Check if we have a siteId in the form data to navigate back to site assets
    const siteId = data["global-contact"] as string | undefined;
    if (siteId) {
      navigate(`${basePath}/site/${siteId}/assets`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`${basePath}/assets`);
    }
  };

  // Handle back button click - go back in history, or to asset list if no history
  const handleBackClick = () => {
    // Check if we came from a site page by looking at the referrer or location state
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    
    // Try to go back in browser history first
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to asset list if no history
      navigate(basePath);
    }
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    // Check if form has unsaved changes
    if (form.formState.isDirty) {
      setShowUnsavedChangesDialog(true);
    } else {
      const pathname = location.pathname;
      const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(basePath);
      }
    }
  };

  // Confirm cancel with unsaved changes
  const handleConfirmCancel = () => {
    setShowUnsavedChangesDialog(false);
    // Keep the form data in sessionStorage when canceling (user might come back)
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(basePath);
    }
  };

  // Cancel cancel (keep editing)
  const handleCancelCancel = () => {
    setShowUnsavedChangesDialog(false);
  };

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
                Create Asset
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelClick}
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
              {/* Title */}
              <div className="flex-1 flex flex-col gap-2">
                <h1 
                  ref={h1Ref}
                  tabIndex={0}
                  className="text-2xl sm:text-3xl font-bold tracking-tight outline-none focus-visible:outline-none"
                >
                  Create asset
                </h1>
              </div>
            </div>
          </div>

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
                          <h2 className="font-bold text-base">Asset Info</h2>
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

                    {/* Location Section */}
                    {organizedAttributes.location.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 py-5">
                          <h2 className="font-bold text-base">Location</h2>
                          <div className="flex flex-col gap-4">
                            {organizedAttributes.location.map((attr) => (
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
                          {selectedCategory?.name} Attributes
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
                          className="h-[60px] flex-1 rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center"
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
                        className="h-[60px] flex-1 rounded-lg border border-border p-0 flex items-center justify-center hover:bg-muted"
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
          </div>
        </div>

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
              <Button variant="secondary" onClick={handleCancelCancel}>
                Keep editing
              </Button>
              <Button variant="default" onClick={handleConfirmCancel}>
                Cancel without saving
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}

