import { useMemo, useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useAttributeStore } from "../../../lib/store";
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
import { Input } from "@/registry/ui/input";

interface ManufacturerCreatableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ManufacturerCreatableSelect({
  value,
  onValueChange,
  placeholder = "Select manufacturer",
  disabled = false,
}: ManufacturerCreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { manufacturers, addManufacturer } = useAttributeStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get manufacturer options
  const manufacturerOptions = useMemo(() => {
    return manufacturers.map((m) => ({ id: m.id, name: m.name }));
  }, [manufacturers]);

  // Find selected manufacturer
  const selectedManufacturer = useMemo(() => {
    if (!value) return null;
    return manufacturerOptions.find((m) => m.id === value) || null;
  }, [value, manufacturerOptions]);

  // Filter manufacturers based on search
  const filteredManufacturers = useMemo(() => {
    if (!searchValue.trim()) return manufacturerOptions;
    const query = searchValue.toLowerCase();
    return manufacturerOptions.filter((m) =>
      m.name.toLowerCase().includes(query)
    );
  }, [searchValue, manufacturerOptions]);

  // Check if search value matches an existing manufacturer (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchValue.trim()) return false;
    const query = searchValue.trim().toLowerCase();
    return manufacturerOptions.some(
      (m) => m.name.toLowerCase() === query
    );
  }, [searchValue, manufacturerOptions]);

  // Check if we should show create option
  // Show create option when search value doesn't exactly match any existing manufacturer
  const shouldShowCreate = useMemo(() => {
    return (
      searchValue.trim().length > 0 &&
      !searchMatchesExisting
    );
  }, [searchValue, searchMatchesExisting]);

  // Restore focus to input when popover closes
  useEffect(() => {
    if (!open && inputRef.current) {
      // Use requestAnimationFrame to ensure the popover has fully closed
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    // Check if this is a create action (value starts with "create:")
    if (selectedValue.startsWith("create:")) {
      const newManufacturerName = searchValue.trim();
      if (newManufacturerName) {
        const newId = addManufacturer(newManufacturerName);
        onValueChange(newId);
        setSearchValue("");
        setOpen(false);
      }
    } else {
      // Normal selection
      onValueChange(selectedValue);
      setSearchValue("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!open && !disabled) {
              setOpen(true);
            }
          }}
          role="combobox"
          aria-expanded={open}
        >
          <Input
            ref={inputRef}
            type="text"
            value={selectedManufacturer ? selectedManufacturer.name : ""}
            onChange={() => {
              // Input is read-only, clicking opens popover
            }}
            onKeyDown={(e) => {
              // Handle keyboard navigation - open on Enter, Space, or ArrowDown
              if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                if (!open && !disabled) {
                  setOpen(true);
                }
              } else if (e.key === "Escape" && open) {
                e.preventDefault();
                setOpen(false);
                inputRef.current?.focus();
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!open && !disabled) {
                setOpen(true);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!open && !disabled) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className="h-9 pr-8 cursor-pointer select-none"
            disabled={disabled}
            readOnly
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? "manufacturer-select-listbox" : undefined}
            role="combobox"
          />
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onEscapeKeyDown={(e) => {
          // Prevent default escape handling, we'll handle it in the input
          e.preventDefault();
          setOpen(false);
          inputRef.current?.focus();
        }}
        onInteractOutside={() => {
          // When clicking outside, restore focus to input
          if (inputRef.current) {
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
          }
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search manufacturers..."
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              // Handle Escape key in search input
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                inputRef.current?.focus();
              }
            }}
          />
          <CommandList id="manufacturer-select-listbox">
            {filteredManufacturers.length === 0 && !shouldShowCreate && (
              <CommandEmpty>No manufacturer found. Type to add a new one.</CommandEmpty>
            )}
            <CommandGroup className="p-1.5">
              {filteredManufacturers.map((manufacturer) => (
                <CommandItem
                  key={manufacturer.id}
                  value={manufacturer.id}
                  onSelect={() => handleSelect(manufacturer.id)}
                >
                  {manufacturer.name}
                  {value === manufacturer.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
              {shouldShowCreate && (
                <CommandItem
                  value={`create:${searchValue.trim()}`}
                  onSelect={() => handleSelect(`create:${searchValue.trim()}`)}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{searchValue.trim()}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

