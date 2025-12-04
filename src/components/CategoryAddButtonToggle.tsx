import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/registry/ui/button";

export function CategoryAddButtonToggle() {
  const [showButton, setShowButton] = useState<boolean>(() => {
    // Load from localStorage or default to true (button visible)
    const stored = localStorage.getItem("showCategoryAddButton");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    // Save to localStorage when toggle changes
    localStorage.setItem("showCategoryAddButton", String(showButton));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("categoryAddButtonToggle"));
  }, [showButton]);

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setShowButton(!showButton)}
      className="fixed bottom-4 left-24 z-50 rounded-full h-9 w-9 shadow-md hover:shadow-lg transition-all"
      aria-label="Toggle category add button visibility"
    >
      {showButton ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </Button>
  );
}

