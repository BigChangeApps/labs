import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { useAttributeStore } from "../../../lib/store";
import { categoryFormSchema, type CategoryFormValues } from "../../../lib/validation";
import type { Category } from "../../../types";

interface CategoryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

export function CategoryAddDialog({
  open,
  onOpenChange,
  parentId: initialParentId,
}: CategoryAddDialogProps) {
  const { categories, addCategory } = useAttributeStore();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Zod v4 compatibility with react-hook-form resolver
    // @ts-ignore - Zod v4 compatibility with react-hook-form resolver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Zod resolver compatibility
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: "",
      parentId: initialParentId || "",
    },
  });

  // Update form when initialParentId changes
  useEffect(() => {
    if (initialParentId) {
      form.setValue("parentId", initialParentId);
    }
  }, [initialParentId, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        parentId: initialParentId || "",
      });
      setPopoverOpen(false);
    }
  }, [open, initialParentId, form]);

  // Get all parent categories (categories without a parent) and sort alphabetically
  const parentCategories = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const watchedParentId = form.watch("parentId");
  const watchedName = form.watch("name");
  const selectedCategory = parentCategories.find(
    (c) => c.id === watchedParentId
  );
  const displayValue = selectedCategory
    ? selectedCategory.name
    : "Choose a category group";

  const handleSubmit = (values: CategoryFormValues) => {
    addCategory(values.name.trim(), values.parentId);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPopoverOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      {...field}
                      autoComplete="off"
                      data-1p-ignore="true"
                      data-lpignore="true"
                      data-form-type="other"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.form) {
                          e.preventDefault();
                          form.handleSubmit(handleSubmit)();
                        }
                      }}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category group</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverOpen}
                          className="w-full justify-between"
                        >
                          {displayValue}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search asset category group..." />
                        <CommandList>
                          <CommandEmpty>No asset category group found.</CommandEmpty>
                          <CommandGroup>
                            {parentCategories.map((category: Category) => (
                              <CommandItem
                                key={category.id}
                                value={category.id}
                                onSelect={() => {
                                  field.onChange(category.id);
                                  setPopoverOpen(false);
                                }}
                              >
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!watchedName.trim() || !watchedParentId}
              >
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

