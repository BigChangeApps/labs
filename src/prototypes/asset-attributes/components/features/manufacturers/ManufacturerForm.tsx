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
}

export const ManufacturerForm = React.forwardRef<
  { submit: () => void },
  ManufacturerFormProps
>(({ initialData, onSubmit }, ref) => {
  const form = useForm({
    // @ts-expect-error - Zod version compatibility with react-hook-form resolver
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-1 space-y-6">
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
              <FormLabel>Models (Optional)</FormLabel>
              <div className="space-y-2">
                {field.value?.map((_, index) => {
                  const isLastInput = index === (field.value?.length || 0) - 1;
                  
                  return (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <FormControl>
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
                            onBlur={() => {
                              setFocusedIndex(null);
                              // Remove empty models on blur, but keep at least one input
                              const currentValue = field.value?.[index] || "";
                              if (!currentValue.trim() && field.value && field.value.length > 1) {
                                const newModels = field.value.filter((_, i) => i !== index);
                                field.onChange(newModels);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (isLastInput) {
                                  // Add new field and focus it
                                  const newIndex = (field.value?.length || 0);
                                  field.onChange([...(field.value || []), ""]);
                                  setTimeout(() => {
                                    inputRefs.current.get(newIndex)?.focus();
                                  }, 0);
                                } else {
                                  // Focus next input
                                  inputRefs.current.get(index + 1)?.focus();
                                }
                              }
                              // Handle Shift+Tab to navigate backwards
                              if (e.key === "Tab" && e.shiftKey && index > 0) {
                                e.preventDefault();
                                inputRefs.current.get(index - 1)?.focus();
                              }
                            }}
                            className="pr-12"
                          />
                        </FormControl>
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
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newModels = field.value?.filter((_, i) => i !== index);
                            field.onChange(newModels);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
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

