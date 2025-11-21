import { useState, useEffect } from "react";

/**
 * Hook to read the category add button visibility state from localStorage.
 * Returns true if the button should be shown, false otherwise.
 * Defaults to true if no value is stored.
 */
export function useCategoryAddButton(): boolean {
  const [showButton, setShowButton] = useState<boolean>(() => {
    // SSR-safe: check if we're in the browser
    if (typeof window === "undefined") {
      return true; // Default to showing button during SSR
    }
    
    // Load from localStorage or default to true (button visible)
    const stored = localStorage.getItem("showCategoryAddButton");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    // Listen for storage changes (in case toggle is changed in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "showCategoryAddButton") {
        setShowButton(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      const stored = localStorage.getItem("showCategoryAddButton");
      setShowButton(stored === null ? true : stored === "true");
    };

    window.addEventListener("categoryAddButtonToggle", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("categoryAddButtonToggle", handleCustomStorageChange);
    };
  }, []);

  return showButton;
}


