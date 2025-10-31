import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { useAttributeStore } from "../lib/store";
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
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { categories } = useAttributeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if we're in a detail view (hide sidebar)
  const prototypeBasePath = "/asset-attributes";
  const isDetailView =
    location.pathname.includes(`${prototypeBasePath}/category/`) ||
    location.pathname === `${prototypeBasePath}/core-attributes`;

  // Get the current page title
  const getPageTitle = () => {
    const prototypeBasePath = "/asset-attributes";
    if (location.pathname === `${prototypeBasePath}/core-attributes`)
      return "Core attributes";
    if (
      location.pathname.includes(`${prototypeBasePath}/category/`) &&
      categoryId
    ) {
      // Find the category by ID and return its name
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : "Category Details";
    }
    return "Asset Attributes";
  };

  // Handle back button navigation
  const handleBackClick = () => {
    if (location.pathname.includes("/core-attributes")) {
      navigate("/asset-attributes/categories");
    } else if (location.pathname.includes("/category/")) {
      navigate("/asset-attributes/categories");
    } else {
      // For main pages, go back to labs
      navigate("/");
    }
  };

  // Handle close button - return to labs
  const handleCloseClick = () => {
    navigate("/");
  };

  // Navigation component (reused for both sidebar and mobile menu)
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <NavLink
        to="/asset-attributes/categories"
        onClick={onClick}
        className={({ isActive }) =>
          `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-hw-surface-subtle text-hw-text font-bold"
              : "text-hw-text hover:bg-accent font-normal"
          }`
        }
      >
        Attributes
      </NavLink>
      <NavLink
        to="/asset-attributes/manufacturers"
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
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-3 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button - Only show on mobile and when not in detail view */}
            {!isDetailView && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[267px] p-6">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <NavigationLinks onClick={() => setMobileMenuOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Back Button - Only show in detail views */}
            {isDetailView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBackClick}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-base sm:text-lg font-extrabold truncate">
              {getPageTitle()}
            </h1>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCloseClick}>
            Close
          </Button>
        </div>
      </header>

      {/* Main Content with Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-center">
          <div className="flex w-full max-w-7xl">
            {/* Left Navigation - Hidden on mobile, visible on desktop when not in detail view */}
            {!isDetailView && (
              <aside className="hidden md:block w-[267px] p-6">
                <NavigationLinks />
              </aside>
            )}

            {/* Page Content */}
            <section className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-8">
              <Outlet />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
