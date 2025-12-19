import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Badge } from "@/registry/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Label } from "@/registry/ui/label";
import { Plus, X, Trash2 } from "lucide-react";
import type { GlobalAttribute, AttributeType } from "../../../types";
import { attributeTypeConfigs, measurementCategories, currencies, numberFormatConfigs } from "../../../lib/utils";

const inlineFormSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  type: z.string(),
  description: z.string().optional(),
  dropdownOptions: z.array(z.string()).optional(),
  numberFormat: z.string().optional(),
  measurementCategory: z.string().optional(),
  measurementUnit: z.string().optional(),
  currency: z.string().optional(),
});

type InlineFormData = z.infer<typeof inlineFormSchema>;

interface InlineAttributeEditCardProps {
  attribute: GlobalAttribute;
  onSave: (data: {
    label: string;
    type: AttributeType;
    description?: string;
    dropdownOptions?: string[];
    measurementCategory?: string;
    measurementUnit?: string;
    currency?: string;
  }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function InlineAttributeEditCard({
  attribute,
  onSave,
  onDelete,
  onCancel,
}: InlineAttributeEditCardProps) {
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const form = useForm<InlineFormData>({
    resolver: zodResolver(inlineFormSchema),
    defaultValues: {
      label: attribute.label,
      type: attribute.type,
      description: attribute.description || "",
      dropdownOptions: attribute.dropdownOptions?.length ? attribute.dropdownOptions : ["", "", ""],
      numberFormat: attribute.measurementConfig ? "measurement" : attribute.currencyConfig ? "currency" : "",
      measurementCategory: attribute.measurementConfig?.category || "length",
      measurementUnit: attribute.measurementConfig?.unit || "cm",
      currency: attribute.currencyConfig?.currency || "GBP",
    },
  });

  const watchedType = form.watch("type") as AttributeType;
  const watchedNumberFormat = form.watch("numberFormat");
  const watchedMeasurementCategory = form.watch("measurementCategory");
  const typeConfig = attributeTypeConfigs[watchedType];

  // Get available units for selected measurement category
  const availableUnits = measurementCategories.find(
    c => c.value === watchedMeasurementCategory
  )?.units || [];

  // Auto-focus label input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      labelInputRef.current?.focus();
      labelInputRef.current?.select();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (data: InlineFormData) => {
    const filteredOptions = data.dropdownOptions
      ?.map(opt => opt.trim())
      .filter(opt => opt.length > 0);

    onSave({
      label: data.label.trim(),
      type: data.type as AttributeType,
      description: data.description?.trim() || undefined,
      dropdownOptions: watchedType === "dropdown" ? filteredOptions : undefined,
      measurementCategory: data.numberFormat === "measurement" ? data.measurementCategory : undefined,
      measurementUnit: data.numberFormat === "measurement" ? data.measurementUnit : undefined,
      currency: data.numberFormat === "currency" ? data.currency : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmText("");
    onDelete();
  };

  return (
    <>
      <div
        className="border-t border-dashed border-hw-border bg-hw-surface-subtle/50 animate-in slide-in-from-top-2 fade-in duration-200"
        onKeyDown={handleKeyDown}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Label</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={labelInputRef}
                      placeholder="e.g. Warranty Provider"
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground flex items-center gap-2">
                    Description
                    <Badge variant="secondary" className="text-[10px] font-medium rounded-none px-1 py-0">
                      Optional
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-9" placeholder="Brief description of this attribute" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(attributeTypeConfigs).map((config) => (
                        <SelectItem key={config.value} value={config.value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number format options */}
            {typeConfig?.supportsNumberFormat && (
              <FormField
                control={form.control}
                name="numberFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground flex items-center gap-2">
                      Format
                      <Badge variant="secondary" className="text-[10px] font-medium rounded-none px-1 py-0">
                        Optional
                      </Badge>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {numberFormatConfigs.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Measurement config */}
            {watchedNumberFormat === "measurement" && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="measurementCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const newCategory = measurementCategories.find(c => c.value === value);
                          if (newCategory?.units[0]) {
                            form.setValue("measurementUnit", newCategory.units[0].value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {measurementCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="measurementUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Currency config */}
            {watchedNumberFormat === "currency" && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.symbol} - {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Dropdown options */}
            {typeConfig?.supportsDropdownOptions && (
              <FormField
                control={form.control}
                name="dropdownOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Dropdown options</FormLabel>
                    <div className="space-y-2">
                      {field.value?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(field.value || [])];
                              newOptions[index] = e.target.value;
                              field.onChange(newOptions);
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="h-9"
                          />
                          {field.value && field.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => {
                                const newOptions = field.value?.filter((_, i) => i !== index);
                                field.onChange(newOptions);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          field.onChange([...(field.value || []), ""]);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add option
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {attribute.label}</DialogTitle>
            <DialogDescription>
              This will permanently delete the attribute and any associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="delete-confirm" className="text-sm text-muted-foreground">
              Type <span className="font-semibold text-foreground">{attribute.label}</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={attribute.label}
              className="mt-2"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmText !== attribute.label}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
