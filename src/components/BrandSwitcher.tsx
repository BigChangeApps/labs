import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";

type Brand = "bigchange" | "simpro";

export function BrandSwitcher() {
  const [brand, setBrand] = useState<Brand>(() => {
    // Load from localStorage or default to bigchange
    const stored = localStorage.getItem("brand");
    const initialBrand = (stored === "simpro" ? "simpro" : "bigchange") as Brand;

    // Set data-brand attribute immediately on initial load
    document.documentElement.setAttribute("data-brand", initialBrand);

    return initialBrand;
  });

  useEffect(() => {
    // Set data-brand attribute on html element when brand changes
    document.documentElement.setAttribute("data-brand", brand);
    // Save to localStorage
    localStorage.setItem("brand", brand);
  }, [brand]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Brand:</span>
      <Select value={brand} onValueChange={(value) => setBrand(value as Brand)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bigchange">BigChange</SelectItem>
          <SelectItem value="simpro">SimPro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
