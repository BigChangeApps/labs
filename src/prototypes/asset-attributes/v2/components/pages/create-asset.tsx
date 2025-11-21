import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { AttributeFieldRenderer } from "../features/asset-form/AttributeFieldRenderer";
import { CollapsibleSection } from "../features/asset-form/CollapsibleSection";
import { MOCK_SITE } from "../../lib/mock-asset-list-data";

export function CreateAsset() {
  const { categoryId: urlCategoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const { categories } = useAttributeStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    urlCategoryId || null
  );
  const [photos] = useState<string[]>([]); // Default to no photos for create
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);

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

  // Initialize form
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Dynamic schema type
    resolver: zodResolver(formSchema),
    defaultValues: {
      "global-category": urlCategoryId || "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Watch category field and update selectedCategoryId when it changes
  const watchedCategory = form.watch("global-category");
  useEffect(() => {
    if (watchedCategory && watchedCategory !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategory as string);
      // Reset form fields except category when category changes
      const currentValues = form.getValues();
      const categoryValue = currentValues["global-category"];
      form.reset({
        "global-category": categoryValue,
      });
    }
  }, [watchedCategory, selectedCategoryId, form]);

  // Handle form submission
  const onSubmit = (data: Record<string, unknown>) => {
    console.log("Form data:", data);
    toast.success("Asset created successfully!");
    // In a real app, this would send data to an API
    // Navigate back to asset list after successful save
    navigate("/asset-attributes/v2");
  };

  // Handle back button click - always go back to asset list
  const handleBackClick = () => {
    navigate("/asset-attributes/v2");
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    // Check if form has unsaved changes
    if (form.formState.isDirty) {
      setShowUnsavedChangesDialog(true);
    } else {
      navigate("/asset-attributes/v2");
    }
  };

  // Confirm cancel with unsaved changes
  const handleConfirmCancel = () => {
    setShowUnsavedChangesDialog(false);
    navigate("/asset-attributes/v2");
  };

  // Cancel cancel (keep editing)
  const handleCancelCancel = () => {
    setShowUnsavedChangesDialog(false);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navigation Header - matches asset-list width, fixed to top */}
      <div className="sticky top-0 z-50 w-full bg-muted/50 border-b border-border">
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
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Create Asset
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
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
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Create asset
                </h2>
              </div>
            </div>
          </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
          {/* Left Column - Form (3/5 width) */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <Card className="w-full">
                  <CardContent className="p-5">
                    {/* Asset Info Section */}
                    {organizedAttributes.assetInfo.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 pb-5">
                          <h2 className="font-bold text-base">Asset Info</h2>
                          <div className="flex flex-col gap-3">
                            {organizedAttributes.assetInfo.map((attr) => (
                              <AttributeFieldRenderer
                                key={attr.id}
                                attribute={attr}
                                fieldName={attr.id}
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
                              <AttributeFieldRenderer
                                key={attr.id}
                                attribute={attr}
                                fieldName={attr.id}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="w-[calc(100%+2.5rem)] -ml-5">
                          <Separator />
                        </div>
                      </>
                    )}

                    {/* Manufacturer Section */}
                    {organizedAttributes.manufacturer.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 py-5">
                          <CollapsibleSection
                            title="Manufacturer"
                            defaultExpanded={true}
                          >
                            <div className="flex flex-col gap-4">
                              {organizedAttributes.manufacturer.map((attr) => (
                                <AttributeFieldRenderer
                                  key={attr.id}
                                  attribute={attr}
                                  fieldName={attr.id}
                                />
                              ))}
                            </div>
                          </CollapsibleSection>
                        </div>
                        <div className="w-[calc(100%+2.5rem)] -ml-5">
                          <Separator />
                        </div>
                      </>
                    )}

                    {/* Core Attributes Section */}
                    {coreAttributes.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 py-5">
                          <CollapsibleSection
                            title="Attributes"
                            defaultExpanded={false}
                          >
                            <div className="flex flex-col gap-4">
                              {coreAttributes.map((attr) => (
                                <AttributeFieldRenderer
                                  key={attr.id}
                                  attribute={attr}
                                  fieldName={attr.id}
                                />
                              ))}
                            </div>
                          </CollapsibleSection>
                        </div>
                        <div className="w-[calc(100%+2.5rem)] -ml-5">
                          <Separator />
                        </div>
                      </>
                    )}

                    {/* Installation Section */}
                    {organizedAttributes.installation.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 py-5">
                          <CollapsibleSection
                            title="Installation"
                            defaultExpanded={false}
                          >
                            <div className="flex flex-col gap-4">
                              {organizedAttributes.installation.map((attr) => (
                                <AttributeFieldRenderer
                                  key={attr.id}
                                  attribute={attr}
                                  fieldName={attr.id}
                                />
                              ))}
                            </div>
                          </CollapsibleSection>
                        </div>
                        <div className="w-[calc(100%+2.5rem)] -ml-5">
                          <Separator />
                        </div>
                      </>
                    )}

                    {/* Warranty Section */}
                    {organizedAttributes.warranty.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 pt-5">
                          <CollapsibleSection
                            title="Warranty"
                            defaultExpanded={false}
                          >
                            <div className="flex flex-col gap-4">
                              {organizedAttributes.warranty.map((attr) => (
                                <AttributeFieldRenderer
                                  key={attr.id}
                                  attribute={attr}
                                  fieldName={attr.id}
                                />
                              ))}
                            </div>
                          </CollapsibleSection>
                        </div>
                      </>
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
                            <AttributeFieldRenderer
                              key={attr.id}
                              attribute={attr}
                              fieldName={attr.id}
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
                        variant="outline"
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
                      variant="outline"
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
              <Button variant="outline" onClick={handleCancelCancel}>
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

