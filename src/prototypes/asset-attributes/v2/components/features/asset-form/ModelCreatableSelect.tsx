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

interface ModelCreatableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  manufacturerId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ModelCreatableSelect({
  value,
  onValueChange,
  manufacturerId,
  placeholder = "Select model",
  disabled = false,
}: ModelCreatableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { manufacturers, addModel } = useAttributeStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get model options based on selected manufacturer
  const modelOptions = useMemo(() => {
    if (!manufacturerId) return [];
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    if (!manufacturer) return [];
    return manufacturer.models.map((model) => ({
      id: model.id,
      name: model.name,
    }));
  }, [manufacturerId, manufacturers]);

  // Find selected model
  const selectedModel = useMemo(() => {
    if (!value) return null;
    return modelOptions.find((m) => m.id === value) || null;
  }, [value, modelOptions]);

  // Filter models based on search
  const filteredModels = useMemo(() => {
    if (!searchValue.trim()) return modelOptions;
    const query = searchValue.toLowerCase();
    return modelOptions.filter((m) => m.name.toLowerCase().includes(query));
  }, [searchValue, modelOptions]);

  // Check if search value matches an existing model (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchValue.trim()) return false;
    const query = searchValue.trim().toLowerCase();
    return modelOptions.some((m) => m.name.toLowerCase() === query);
  }, [searchValue, modelOptions]);

  // Check if we should show create option
  // Show create option when search value doesn't exactly match any existing model
  const shouldShowCreate = useMemo(() => {
    return (
      manufacturerId &&
      searchValue.trim().length > 0 &&
      !searchMatchesExisting
    );
  }, [manufacturerId, searchValue, searchMatchesExisting]);

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
    if (selectedValue.startsWith("create:") && manufacturerId) {
      const newModelName = searchValue.trim();
      if (newModelName) {
        addModel(manufacturerId, newModelName);
        // Get the latest state synchronously after adding
        // Zustand updates are synchronous, so getState() will have the new model
        const latestState = useAttributeStore.getState();
        const manufacturer = latestState.manufacturers.find(
          (m) => m.id === manufacturerId
        );
        if (manufacturer) {
          // Find the newly created model by name (should be the last one with this name)
          const newModel = manufacturer.models.find(
            (m) => m.name === newModelName
          );
          if (newModel) {
            onValueChange(newModel.id);
          }
        }
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

  const effectiveDisabled = disabled || !manufacturerId;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!open && !effectiveDisabled) {
              setOpen(true);
            }
          }}
          role="combobox"
          aria-expanded={open}
        >
          <Input
            ref={inputRef}
            type="text"
            value={selectedModel ? selectedModel.name : ""}
            onChange={() => {
              // Input is read-only, clicking opens popover
            }}
            onKeyDown={(e) => {
              // Handle keyboard navigation - open on Enter, Space, or ArrowDown
              if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                if (!open && !effectiveDisabled) {
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
              if (!open && !effectiveDisabled) {
                setOpen(true);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!open && !effectiveDisabled) {
                setOpen(true);
              }
            }}
            placeholder={
              !manufacturerId
                ? "Select manufacturer first"
                : placeholder
            }
            className="h-9 pr-8 cursor-pointer select-none"
            disabled={effectiveDisabled}
            readOnly
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? "model-select-listbox" : undefined}
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
            placeholder="Search models..."
            value={searchValue}
            onValueChange={setSearchValue}
            disabled={effectiveDisabled}
            onKeyDown={(e) => {
              // Handle Escape key in search input
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                inputRef.current?.focus();
              }
            }}
          />
          <CommandList id="model-select-listbox">
            {filteredModels.length === 0 && !shouldShowCreate && (
              <CommandEmpty>
                {!manufacturerId
                  ? "Select a manufacturer first"
                  : "No model found. Type to add a new one."}
              </CommandEmpty>
            )}
            <CommandGroup className="p-1.5">
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleSelect(model.id)}
                >
                  {model.name}
                  {value === model.id && (
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

