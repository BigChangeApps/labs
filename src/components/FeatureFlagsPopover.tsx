import { useState, useEffect } from "react";
import { Flag, Link, Check } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Label } from "@/registry/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/ui/tooltip";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  defaultValue: boolean;
}

export interface PrototypeFlags {
  [prototypePathPrefix: string]: FeatureFlag[];
}

/**
 * Feature flags configuration for each prototype.
 * Add new flags here when needed for demos.
 */
export const prototypeFlags: PrototypeFlags = {
  "/group-invoicing/v2": [
    {
      id: "showApplyToAllCheckbox",
      name: "Apply to all checkbox",
      description: "Show 'Apply to all invoices' checkbox in settings",
      defaultValue: false,
    },
    {
      id: "showPerInvoiceSettings",
      name: "Per-invoice settings",
      description: "Show Settings button above each invoice",
      defaultValue: false,
    },
    {
      id: "showInlineSettings",
      name: "Inline settings panel",
      description: "Show settings panel on workspace without button",
      defaultValue: false,
    },
  ],
  "/asset-attributes/v2": [
    {
      id: "showCategoryAddButton",
      name: "Add categories",
      description: "Create new categories",
      defaultValue: true,
    },
    {
      id: "showParentInheritance",
      name: "Parent categories",
      description: "With inherited attributes",
      defaultValue: true,
    },
    {
      id: "showPreferredField",
      name: "Preferred attributes",
      description: "Mark attributes as preferred",
      defaultValue: true,
    },
    {
      id: "showCrowdsourcedAttributes",
      name: "Crowdsourced attributes",
      description: "Attributes added by us",
      defaultValue: true,
    },
    {
      id: "showManufacturers",
      name: "Manufacturers",
      description: "Manufacturer management section",
      defaultValue: true,
    },
  ],
};

/**
 * Get a flag value from URL query parameters.
 * Supports: ?flagId=true or ?flagId=false or ?flagId=1 or ?flagId=0
 */
function getFlagFromUrl(flagId: string): boolean | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(flagId);
  if (value === null) return null;
  return value === "true" || value === "1";
}

/**
 * Production URL for shareable links.
 */
const PRODUCTION_URL = "https://labs.poc.bigchange.com";

/**
 * Generate a shareable URL with the given flag values.
 */
export function generateFlagUrl(
  basePath: string,
  flagValues: Record<string, boolean>,
  flags: FeatureFlag[]
): string {
  const params = new URLSearchParams();

  // Only include flags that differ from defaults
  flags.forEach((flag) => {
    const currentValue = flagValues[flag.id];
    if (currentValue !== flag.defaultValue) {
      params.set(flag.id, currentValue ? "1" : "0");
    }
  });

  const queryString = params.toString();
  const baseUrl = PRODUCTION_URL + basePath;
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Apply URL flags to localStorage (called once on page load).
 * This allows URL params to override stored values.
 */
export function applyUrlFlagsToStorage(flags: FeatureFlag[]): void {
  if (typeof window === "undefined") return;

  flags.forEach((flag) => {
    const urlValue = getFlagFromUrl(flag.id);
    if (urlValue !== null) {
      localStorage.setItem(`flag_${flag.id}`, String(urlValue));
    }
  });

  // Notify listeners that flags may have changed
  window.dispatchEvent(new Event("featureFlagsChanged"));
}

/**
 * Hook to get a feature flag value.
 * Priority: URL params > localStorage > default value
 */
export function useFeatureFlag(flagId: string, defaultValue: boolean = true): boolean {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultValue;

    // Check URL first
    const urlValue = getFlagFromUrl(flagId);
    if (urlValue !== null) return urlValue;

    // Fall back to localStorage
    const stored = localStorage.getItem(`flag_${flagId}`);
    return stored === null ? defaultValue : stored === "true";
  });

  useEffect(() => {
    const handleChange = () => {
      // Check URL first
      const urlValue = getFlagFromUrl(flagId);
      if (urlValue !== null) {
        setValue(urlValue);
        return;
      }

      // Fall back to localStorage
      const stored = localStorage.getItem(`flag_${flagId}`);
      setValue(stored === null ? defaultValue : stored === "true");
    };

    window.addEventListener("featureFlagsChanged", handleChange);
    window.addEventListener("storage", (e) => {
      if (e.key === `flag_${flagId}`) handleChange();
    });

    return () => {
      window.removeEventListener("featureFlagsChanged", handleChange);
    };
  }, [flagId, defaultValue]);

  return value;
}

interface FeatureFlagsPopoverProps {
  currentPath: string;
}

export function FeatureFlagsPopover({ currentPath }: FeatureFlagsPopoverProps) {
  // Find flags for current prototype
  const flagEntry = Object.entries(prototypeFlags).find(([prefix]) =>
    currentPath.startsWith(prefix)
  );
  const flags = flagEntry?.[1];
  const prototypePath = flagEntry?.[0];

  const [copied, setCopied] = useState(false);

  // Track flag values in state
  const [flagValues, setFlagValues] = useState<Record<string, boolean>>(() => {
    if (!flags) return {};
    const initial: Record<string, boolean> = {};
    flags.forEach((flag) => {
      if (typeof window === "undefined") {
        initial[flag.id] = flag.defaultValue;
      } else {
        // URL params take priority over localStorage
        const urlValue = getFlagFromUrl(flag.id);
        if (urlValue !== null) {
          initial[flag.id] = urlValue;
        } else {
          const stored = localStorage.getItem(`flag_${flag.id}`);
          initial[flag.id] = stored === null ? flag.defaultValue : stored === "true";
        }
      }
    });
    return initial;
  });

  // Apply URL flags to localStorage on mount
  useEffect(() => {
    if (flags) {
      applyUrlFlagsToStorage(flags);
    }
  }, [flags]);

  // Don't render if no flags for this prototype
  if (!flags || flags.length === 0 || !prototypePath) return null;

  const handleToggle = (flagId: string) => {
    const newValue = !flagValues[flagId];
    setFlagValues((prev) => ({ ...prev, [flagId]: newValue }));
    localStorage.setItem(`flag_${flagId}`, String(newValue));
    window.dispatchEvent(new Event("featureFlagsChanged"));

    // Also dispatch legacy event for backward compatibility
    if (flagId === "showCategoryAddButton") {
      window.dispatchEvent(new Event("categoryAddButtonToggle"));
    }
  };

  const handleCopyLink = async () => {
    const url = generateFlagUrl(prototypePath, flagValues, flags);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enabledCount = Object.values(flagValues).filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-2"
          aria-label="Toggle feature flags"
        >
          <Flag className="h-4 w-4" />
          <span className="text-xs font-medium">
            {enabledCount}/{flags.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" side="top" sideOffset={8}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Feature Flags</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5" />
                      Copy link
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Copy shareable link with current flags</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5 flex-1">
                  <Label
                    htmlFor={flag.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {flag.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {flag.description}
                  </p>
                </div>
                <Switch
                  id={flag.id}
                  checked={flagValues[flag.id]}
                  onCheckedChange={() => handleToggle(flag.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
