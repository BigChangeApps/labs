import { useMemo } from "react";
import { useAttributeStore } from "../../../lib/store";
import { Combobox, type ComboboxGroup } from "@/registry/ui/combobox";
import type { Category } from "../../../types";

interface CategorySearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySearchableSelect({
  value,
  onValueChange,
  placeholder = "Select category",
}: CategorySearchableSelectProps) {
  const { categories } = useAttributeStore();

  // Organize categories into combobox groups
  const comboboxGroups = useMemo(() => {
    // Get parent categories
    const parentCategories = categories.filter((c: Category) => !c.parentId);
    
    // Sort parents alphabetically, but put "Other" at the end
    const sortedParents = parentCategories.sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return a.name.localeCompare(b.name);
    });

    return sortedParents
      .map((parent: Category) => {
        const children = categories
          .filter((c: Category) => c.parentId === parent.id)
          .sort((a, b) => a.name.localeCompare(b.name));

        // Only include groups that have children
        if (children.length === 0) return null;

        return {
          label: parent.name,
          options: children.map((child: Category) => ({
            value: child.id,
            label: child.name,
          })),
        };
      })
      .filter((group): group is ComboboxGroup => group !== null);
  }, [categories]);

  return (
    <Combobox
      options={comboboxGroups}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search categories..."
      emptyText="No category found."
      triggerClassName="h-9"
      useInput={true}
    />
  );
}

