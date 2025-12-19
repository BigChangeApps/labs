import React, { useEffect, useImperativeHandle, useState, useRef } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, CornerDownLeft } from "lucide-react";
import { manufacturerFormSchema } from "../../../lib/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/ui/form";
import { Input } from "@/registry/ui/input";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { Kbd } from "@/registry/ui/kbd";

export interface ManufacturerFormData {
  name: string;
  models: string[];
}

interface ManufacturerFormProps {
  initialData?: Partial<ManufacturerFormData>;
  onSubmit?: (data: ManufacturerFormData) => void;
  onCancel?: () => void;
  formRef?: React.RefObject<{ submit: () => void }>;
  formId?: string;
}

export const ManufacturerForm = React.forwardRef<
  { submit: () => void },
  ManufacturerFormProps
>(({ initialData, onSubmit, formId = "manufacturer-form" }, ref) => {
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Zod v4 compatibility with react-hook-form resolver
    // @ts-ignore - Zod v4 compatibility with react-hook-form resolver (using @ts-ignore instead of @ts-expect-error to avoid unused directive error in some build environments)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod resolver compatibility
    resolver: zodResolver(manufacturerFormSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      models: initialData?.models && initialData.models.length > 0
        ? initialData.models
        : [""],
    },
  });

  // NOTE: Enter key functionality for model inputs
  // This state and ref management enables pressing Enter to add/focus next model
  // Similar implementation exists in AttributeForm.tsx - kept separate for simplicity
  // Consider extracting to shared component/hook if a third form needs this pattern
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const addModelButtonRef = useRef<HTMLButtonElement>(null);


  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        models: initialData.models && initialData.models.length > 0
          ? initialData.models
          : [""],
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = (data: FieldValues) => {
    if (!onSubmit) return;

    const formData: ManufacturerFormData = {
      name: data.name.trim(),
      models: (data.models || [])
        .map((model: string) => model.trim())
        .filter((model: string) => model.length > 0),
    };

    onSubmit(formData);
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit(handleFormSubmit)();
    },
  }));


  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Siemens" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="models"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Models
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium rounded-none px-1 py-0"
                >
                  Optional
                </Badge>
              </FormLabel>
              <div className="space-y-2">
                {field.value?.map((_, index) => {
                  const isLastInput = index === (field.value?.length || 0) - 1;
                  
                  return (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          ref={(el: HTMLInputElement | null) => {
                            if (el) {
                              inputRefs.current.set(index, el);
                            } else {
                              inputRefs.current.delete(index);
                            }
                          }}
                          placeholder={`Model ${index + 1}`}
                          value={field.value?.[index] || ""}
                          onChange={(e) => {
                            const newModels = [...(field.value || [])];
                            newModels[index] = e.target.value;
                            field.onChange(newModels);
                          }}
                          onFocus={() => setFocusedIndex(index)}
                          onBlur={() => setFocusedIndex(null)}
                          onKeyDown={(e) => {
                            // Handle Enter on the last input to add a new model
                            if (e.key === "Enter" && isLastInput) {
                              e.preventDefault();
                              // Add new field and focus it
                              const newIndex = (field.value?.length || 0);
                              field.onChange([...(field.value || []), ""]);
                              setTimeout(() => {
                                inputRefs.current.get(newIndex)?.focus();
                              }, 0);
                            }

                            // Handle Tab to manually move focus to remove button
                            if (e.key === "Tab" && !e.shiftKey && field.value && field.value.length > 1) {
                              e.preventDefault();
                              // Focus the remove button next to this input
                              const currentInput = e.currentTarget;
                              const removeButton = currentInput.parentElement?.nextElementSibling as HTMLElement;
                              if (removeButton && removeButton.tagName === "BUTTON") {
                                removeButton.focus();
                              }
                            }

                            // Handle Shift+Tab for backwards navigation
                            if (e.key === "Tab" && e.shiftKey && index > 0) {
                              e.preventDefault();
                              // Focus the previous input or button
                              const prevRemoveButton = inputRefs.current.get(index - 1)?.parentElement?.nextElementSibling as HTMLElement;
                              if (prevRemoveButton && prevRemoveButton.tagName === "BUTTON" && field.value && field.value.length > 1) {
                                prevRemoveButton.focus();
                              } else {
                                inputRefs.current.get(index - 1)?.focus();
                              }
                            }
                          }}
                          className="pr-12"
                        />
                        {focusedIndex === index && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Kbd>
                              <CornerDownLeft className="h-3 w-3" />
                            </Kbd>
                          </div>
                        )}
                      </div>
                      {field.value && field.value.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          tabIndex={0}
                          onClick={() => {
                            const newModels = field.value?.filter((_, i) => i !== index);
                            field.onChange(newModels);
                          }}
                          onKeyDown={(e) => {
                            // Handle Tab to move to next input or Add Model button
                            if (e.key === "Tab" && !e.shiftKey) {
                              e.preventDefault();
                              const nextIndex = index + 1;
                              if (nextIndex < (field.value?.length || 0)) {
                                inputRefs.current.get(nextIndex)?.focus();
                              } else {
                                // We're on the last remove button, focus the "Add Model" button
                                addModelButtonRef.current?.focus();
                              }
                            }

                            // Handle Shift+Tab to move back to current input
                            if (e.key === "Tab" && e.shiftKey) {
                              e.preventDefault();
                              inputRefs.current.get(index)?.focus();
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  ref={addModelButtonRef}
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    field.onChange([...(field.value || []), ""]);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});

ManufacturerForm.displayName = "ManufacturerForm";

