"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/registry/lib/utils";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

export interface ComboboxProps {
  options: ComboboxOption[] | ComboboxGroup[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  useInput?: boolean; // Use Input instead of Button for true combobox behavior
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
  triggerClassName,
  contentClassName,
  useInput = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Check if options are grouped
  const isGrouped = options.length > 0 && "options" in options[0];
  const groups = React.useMemo(
    () => (isGrouped ? (options as ComboboxGroup[]) : []),
    [isGrouped, options]
  );
  const flatOptions = React.useMemo(
    () => (!isGrouped ? (options as ComboboxOption[]) : []),
    [isGrouped, options]
  );

  // Find selected option
  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    
    if (isGrouped) {
      for (const group of groups) {
        const option = group.options.find((opt) => opt.value === value);
        if (option) return option;
      }
    } else {
      return flatOptions.find((opt) => opt.value === value) || null;
    }
    return null;
  }, [value, isGrouped, groups, flatOptions]);

  // Restore focus to trigger when popover closes
  React.useEffect(() => {
    if (!open) {
      // Use requestAnimationFrame to ensure the popover has fully closed
      requestAnimationFrame(() => {
        if (useInput && inputRef.current) {
          inputRef.current.focus();
        } else if (!useInput && buttonRef.current) {
          buttonRef.current.focus();
        }
      });
    }
  }, [open, useInput]);

  if (useInput) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div 
            className="relative w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!open) {
                setOpen(true);
              }
            }}
            role="combobox"
            aria-expanded={open}
          >
            <Input
              ref={inputRef}
              type="text"
              value={selectedOption ? selectedOption.label : ""}
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
                // Prevent default to avoid input focus and text selection
                e.preventDefault();
                if (!open && !disabled) {
                  setOpen(true);
                }
              }}
              placeholder={placeholder}
              className={cn("h-9 pr-8 cursor-pointer select-none", triggerClassName)}
              disabled={disabled}
              readOnly
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={open ? "combobox-listbox" : undefined}
              role="combobox"
            />
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
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
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder}
              onKeyDown={(e) => {
                // Handle Escape key in search input
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                  inputRef.current?.focus();
                }
              }}
            />
            <CommandList id="combobox-listbox">
              <CommandEmpty>{emptyText}</CommandEmpty>
              {isGrouped ? (
                groups.map((group, index) => (
                  <React.Fragment key={group.label}>
                    {index > 0 && <CommandSeparator />}
                    <CommandGroup 
                      heading={group.label} 
                      className={index === 0 ? "p-1.5" : "px-1.5 pb-1.5 pt-1.5"}
                    >
                      {group.options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          onSelect={(currentValue) => {
                            // Only close if a different value is selected
                            if (currentValue !== value) {
                              onValueChange?.(currentValue);
                              setOpen(false);
                              // Focus will be restored by useEffect when open becomes false
                            }
                          }}
                        >
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span>{option.label}</span>
                            {option.description && (
                              <span 
                                className="text-xs text-muted-foreground"
                                style={{ textWrap: 'balance' }}
                              >
                                {option.description}
                              </span>
                            )}
                          </div>
                          {value === option.value && (
                            <Check className="ml-auto h-4 w-4 shrink-0" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </React.Fragment>
                ))
              ) : (
                <CommandGroup className="p-1.5">
                  {flatOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={(currentValue) => {
                        // Only close if a different value is selected
                        if (currentValue !== value) {
                          onValueChange?.(currentValue);
                          setOpen(false);
                          // Focus will be restored by useEffect when open becomes false
                        }
                      }}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {value === option.value && (
                        <Check className="ml-auto h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? "combobox-listbox" : undefined}
          className={cn(
            "w-full justify-between h-9",
            !selectedOption && "text-muted-foreground",
            triggerClassName
          )}
          disabled={disabled}
          onKeyDown={(e) => {
            // Handle Escape key
            if (e.key === "Escape" && open) {
              e.preventDefault();
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
        align="start"
        onEscapeKeyDown={(e) => {
          // Prevent default escape handling, we'll handle it in the button
          e.preventDefault();
          setOpen(false);
          buttonRef.current?.focus();
        }}
        onInteractOutside={() => {
          // When clicking outside, restore focus to button
          if (buttonRef.current) {
            requestAnimationFrame(() => {
              buttonRef.current?.focus();
            });
          }
        }}
      >
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            onKeyDown={(e) => {
              // Handle Escape key in search input
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                buttonRef.current?.focus();
              }
            }}
          />
          <CommandList id="combobox-listbox">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {isGrouped ? (
              groups.map((group, index) => (
                <React.Fragment key={group.label}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup 
                    heading={group.label}
                    className={index === 0 ? "p-1.5" : "px-1.5 pb-1.5 pt-1.5"}
                  >
                    {group.options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        onSelect={() => {
                          onValueChange?.(option.value === value ? "" : option.value);
                          setOpen(false);
                          // Focus will be restored by useEffect when open becomes false
                        }}
                      >
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </div>
                        {value === option.value && (
                          <Check className="ml-auto h-4 w-4 shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))
            ) : (
              <CommandGroup>
                {flatOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {value === option.value && (
                      <Check className="ml-auto h-4 w-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

