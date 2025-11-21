import { useMemo } from "react";
import { Combobox, type ComboboxOption } from "@/registry/ui/combobox";

interface Site {
  id: string;
  name: string;
  address: string;
}

interface SiteSearchableSelectProps {
  sites: Site[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SiteSearchableSelect({
  sites,
  value,
  onValueChange,
  placeholder = "Select site",
}: SiteSearchableSelectProps) {
  // Convert sites to combobox options format
  // Use site name as value to make search work properly (cmdk searches by value prop)
  // We'll map back to ID when selecting
  const comboboxOptions = useMemo(() => {
    return sites
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((site) => ({
        value: site.name, // Use name as value for searchability
        label: site.name,
        description: site.address, // Include address as description
        siteId: site.id, // Store original ID for mapping
      }));
  }, [sites]);

  // Map site name back to site ID when value changes
  const handleValueChange = (selectedName: string) => {
    const selectedSite = sites.find((s) => s.name === selectedName);
    if (selectedSite) {
      onValueChange(selectedSite.id);
    }
  };

  // Find the site name for the current value (ID)
  const currentSiteName = useMemo(() => {
    if (!value) return "";
    const site = sites.find((s) => s.id === value);
    return site?.name || "";
  }, [value, sites]);

  return (
    <Combobox
      options={comboboxOptions as ComboboxOption[]}
      value={currentSiteName}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search sites..."
      emptyText="No site found."
      triggerClassName="h-9"
      useInput={true}
    />
  );
}

