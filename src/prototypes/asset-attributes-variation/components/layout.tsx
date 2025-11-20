import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
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

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation component (reused for both sidebar and mobile menu)
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <NavLink
        to="/asset-attributes-variation/global-attributes"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          const pathname = location.pathname;
          const isGlobalAttributesRoute =
            isActive ||
            pathname === "/asset-attributes-variation/global-attributes" ||
            pathname === "/asset-attributes-variation/global-attributes/";
          
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
        to="/asset-attributes-variation/categories"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          // Check if we're on categories or category detail routes
          const pathname = location.pathname;
          const isCategoriesRoute =
            isActive ||
            pathname.startsWith("/asset-attributes-variation/category/");
          
          return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isCategoriesRoute
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`;
        }}
      >
        Categories
      </NavLink>
      <NavLink
        to="/asset-attributes-variation/manufacturers"
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
      <NavLink
        to="/asset-attributes-variation/create-asset"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          const pathname = location.pathname;
          const isCreateAssetRoute =
            isActive ||
            pathname.startsWith("/asset-attributes-variation/create-asset");
          
          return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isCreateAssetRoute
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`;
        }}
      >
        Create Asset
      </NavLink>
      <NavLink
        to="/asset-attributes-variation/edit-asset/0001"
        state={location.state}
        onClick={onClick}
        className={({ isActive }) => {
          const pathname = location.pathname;
          const isEditAssetRoute =
            isActive ||
            pathname.startsWith("/asset-attributes-variation/edit-asset/");
          
          return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isEditAssetRoute
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`;
        }}
      >
        Edit Asset
      </NavLink>
    </nav>
  );

  return (
    <div className="h-full bg-background flex">
      {/* Fixed Left Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] md:fixed md:top-[61px] md:bottom-0 md:left-0 md:border-r md:bg-background">
        <div className="flex flex-col h-full p-6">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Settings
            </h2>
            <NavigationLinks />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] h-full flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="md:hidden border-b bg-background shrink-0">
          <div className="flex items-center px-3 sm:px-5 py-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
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
          </div>
        </div>

        {/* Page Content - Centered */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex justify-center">
            <div className={`w-full px-3 sm:px-6 py-4 sm:py-8 ${
              location.pathname.includes("create-asset") ||
              location.pathname.includes("edit-asset")
                ? "max-w-[1050px]"
                : "max-w-[700px]"
            }`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

