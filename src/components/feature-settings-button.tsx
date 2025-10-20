import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAttributeStore } from "@/lib/store";

export function FeatureSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    enableParentInheritance,
    toggleParentInheritance,
    showAlphabeticalCategories,
    toggleAlphabeticalCategories,
  } = useAttributeStore();

  return (
    <>
      {/* Floating button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Settings dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature Settings</DialogTitle>
            <DialogDescription>
              Configure feature flags and experimental settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Parent Inheritance Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="parent-inheritance" className="text-base">
                  Enable Parent Category Inheritance
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, child categories will inherit attributes from
                  their parent categories. When disabled, attributes can only be
                  applied at the category level.
                </p>
              </div>
              <Switch
                id="parent-inheritance"
                checked={enableParentInheritance}
                onCheckedChange={toggleParentInheritance}
              />
            </div>

            {/* Alphabetical Categories Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="alphabetical-categories" className="text-base">
                  Show Alphabetical Category List
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, categories are displayed in a flat alphabetical
                  list. When disabled, categories are grouped by parent.
                </p>
              </div>
              <Switch
                id="alphabetical-categories"
                checked={showAlphabeticalCategories}
                onCheckedChange={toggleAlphabeticalCategories}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
