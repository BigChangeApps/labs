import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/registry/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/ui/sheet";
import { useState } from "react";
import { useManufacturers } from "../lib/use-category-add-button";

export function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showManufacturers = useManufacturers();

  // Only show banner when VITE_SHOW_INTERNAL is "false" (production/customer-facing mode)
  const showBanner = import.meta.env.VITE_SHOW_INTERNAL === "false";

  const handleBack = () => {
    navigate("..");
  };

  // Navigation component (reused for both sidebar and mobile menu)
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <NavLink
        to="global-attributes"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          const pathname = location.pathname;
          const isGlobalAttributesRoute =
            isActive ||
            pathname === "/asset-attributes/v2/settings/global-attributes" ||
            pathname === "/asset-attributes/v2/settings/global-attributes/";

          return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isGlobalAttributesRoute
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`;
        }}
      >
        Global Attributes
      </NavLink>
      <NavLink
        to="categories"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          // Check if we're on categories or category detail routes
          const pathname = location.pathname;
          const isCategoriesRoute =
            isActive || pathname.startsWith("/asset-attributes/v2/settings/category/");

          return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isCategoriesRoute
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`;
        }}
      >
        Categories
      </NavLink>
      {showManufacturers && (
        <NavLink
          to="manufacturers"
          state={location.state}
          onClick={onClick}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-hw-surface-subtle text-hw-text font-bold"
                : "text-hw-text hover:bg-accent font-normal"
            }`
          }
        >
          Manufacturers
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="h-full bg-background flex">
      {/* Navigation Header - matches other pages, fixed to top, spans full width above sidebar */}
      <div className={`fixed ${showBanner ? "top-[60px]" : "top-0"} left-0 right-0 z-50 w-full bg-muted/50 border-b border-border`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Asset Settings
              </h1>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBack}
              className="shrink-0"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Left Sidebar */}
      <aside className={`hidden md:flex md:flex-col md:w-[240px] md:fixed ${showBanner ? "md:top-[108px]" : "md:top-[48px]"} md:bottom-0 md:left-0 md:bg-background`}>
        <div className="flex flex-col h-full p-6 pt-8 border-r border-border">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Settings
            </h2>
            <NavigationLinks />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 md:ml-[240px] h-full flex flex-col overflow-hidden ${showBanner ? "md:pt-[72px]" : "md:pt-[48px]"}`}>

        {/* Mobile Menu Button */}
        <div className="md:hidden border-b bg-background shrink-0">
          <div className="flex items-center justify-between px-3 sm:px-5 py-3 gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-6">
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <NavigationLinks onClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBack}
              className="shrink-0 ml-auto"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Page Content - Centered */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex justify-center">
            <div className="w-full px-3 sm:px-6 py-4 sm:py-8 max-w-[700px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
