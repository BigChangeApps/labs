import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { FeatureFlagsPopover } from "./FeatureFlagsPopover";
import { Button } from "@/registry/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import { prototypes } from "@/data/prototypes";

type Brand = "bigchange" | "simpro";

const brandConfig = {
  bigchange: {
    name: "BigChange",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRys2CtiMKu5V6vRMoM7NkiQBOshUQLZqjqNgFKRo2xAuTuWx-0tyR-C7wWF0bGKmW_-k&usqp=CAU",
  },
  simpro: {
    name: "SimPro",
    logo: "https://www.simprogroup.com/favicon.png",
  },
};

/**
 * Consolidated developer toolbar along the bottom of the screen.
 * Includes dark mode toggle, brand switcher, and version selector.
 * Only visible when VITE_SHOW_INTERNAL is not set to false.
 */
export function DevBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    const initialDarkMode = stored === "true";
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return initialDarkMode;
  });

  // Brand state
  const [brand, setBrand] = useState<Brand>(() => {
    const stored = localStorage.getItem("brand");
    const initialBrand = (stored === "simpro" ? "simpro" : "bigchange") as Brand;
    document.documentElement.setAttribute("data-brand", initialBrand);
    return initialBrand;
  });


  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  // Brand effect
  useEffect(() => {
    document.documentElement.setAttribute("data-brand", brand);
    localStorage.setItem("brand", brand);
  }, [brand]);


  // Find current prototype and version
  const currentPrototype = prototypes.find((prototype) =>
    prototype.versions.some((v) => location.pathname.startsWith(v.path))
  );

  const currentVersion = currentPrototype?.versions.find((v) =>
    location.pathname.startsWith(v.path)
  );

  const handleVersionChange = (versionId: string) => {
    const version = currentPrototype?.versions.find((v) => v.id === versionId);
    if (version) {
      navigate(version.path);
    }
  };

  const toggleBrand = () => {
    setBrand(brand === "bigchange" ? "simpro" : "bigchange");
  };

  const currentBrand = brandConfig[brand];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 z-40 bg-background/95 backdrop-blur-sm border-t border-border/40 flex items-center justify-between px-4 gap-4">
      {/* Left section: global toggles */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="h-8 w-8"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Brand switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBrand}
          className="h-8 w-8"
          aria-label={`Switch to ${brand === "bigchange" ? "SimPro" : "BigChange"} brand`}
        >
          <img
            src={currentBrand.logo}
            alt={`${currentBrand.name} logo`}
            className="h-4 w-4 object-contain"
          />
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-border/40 mx-1" />

        {/* Feature flags popover - shows flags relevant to current prototype */}
        <FeatureFlagsPopover currentPath={location.pathname} />
      </div>

      {/* Right section: version selector */}
      {currentPrototype && currentPrototype.versions.length > 1 && (
        <Select
          value={currentVersion?.id}
          onValueChange={handleVersionChange}
        >
          <SelectTrigger className="h-7 w-16 text-xs gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentPrototype.versions.map((version) => (
              <SelectItem key={version.id} value={version.id} className="text-xs">
                {version.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
