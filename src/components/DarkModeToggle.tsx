import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/registry/ui/button";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Load from localStorage or default to false (light mode)
    const stored = localStorage.getItem("darkMode");
    const initialDarkMode = stored === "true";

    // Set dark class immediately on initial load
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return initialDarkMode;
  });

  useEffect(() => {
    // Toggle dark class on html element when dark mode changes
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save to localStorage
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-4 left-4 z-50 rounded-full h-9 w-9 shadow-md hover:shadow-lg transition-all"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
