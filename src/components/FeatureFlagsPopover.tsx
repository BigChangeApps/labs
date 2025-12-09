import { useState, useEffect } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Label } from "@/registry/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";

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
 * Hook to get a feature flag value from localStorage.
 * Returns the current value and updates reactively.
 */
export function useFeatureFlag(flagId: string, defaultValue: boolean = true): boolean {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(`flag_${flagId}`);
    return stored === null ? defaultValue : stored === "true";
  });

  useEffect(() => {
    const handleChange = () => {
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
  const flags = Object.entries(prototypeFlags).find(([prefix]) =>
    currentPath.startsWith(prefix)
  )?.[1];

  // Track flag values in state
  const [flagValues, setFlagValues] = useState<Record<string, boolean>>(() => {
    if (!flags) return {};
    const initial: Record<string, boolean> = {};
    flags.forEach((flag) => {
      if (typeof window === "undefined") {
        initial[flag.id] = flag.defaultValue;
      } else {
        const stored = localStorage.getItem(`flag_${flag.id}`);
        initial[flag.id] = stored === null ? flag.defaultValue : stored === "true";
      }
    });
    return initial;
  });

  // Don't render if no flags for this prototype
  if (!flags || flags.length === 0) return null;

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
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Feature Flags</h4>
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
