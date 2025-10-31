import { useEffect, useState } from "react";

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

export function BrandSwitcher() {
  const [brand, setBrand] = useState<Brand>(() => {
    // Load from localStorage or default to bigchange
    const stored = localStorage.getItem("brand");
    const initialBrand = (
      stored === "simpro" ? "simpro" : "bigchange"
    ) as Brand;

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

  const toggleBrand = () => {
    setBrand(brand === "bigchange" ? "simpro" : "bigchange");
  };

  const currentBrand = brandConfig[brand];

  return (
    <button
      onClick={toggleBrand}
      className="fixed bottom-4 left-14 z-50 rounded-full h-9 w-9 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white border border-border/40 hover:scale-105 p-1.5"
      aria-label={`Switch to ${brand === "bigchange" ? "SimPro" : "BigChange"} brand`}
    >
      <img
        src={currentBrand.logo}
        alt={`${currentBrand.name} logo`}
        className="h-full w-full object-contain rounded-full"
      />
    </button>
  );
}
