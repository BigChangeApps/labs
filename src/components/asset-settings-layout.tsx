import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttributeStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function AssetSettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { categories } = useAttributeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if we're in a detail view (hide sidebar)
  const isDetailView =
    location.pathname.includes("/category/") ||
    location.pathname === "/core-attributes";

  // Get the current page title
  const getPageTitle = () => {
    if (location.pathname === "/core-attributes") return "Core attributes";
    if (location.pathname.includes("/category/") && categoryId) {
      // Find the category by ID and return its name
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : "Category Details";
    }
    return "Asset Settings";
  };

  // Handle back button navigation
  const handleBackClick = () => {
    if (location.pathname === "/core-attributes") {
      navigate("/categories");
    } else if (location.pathname.includes("/category/")) {
      navigate("/categories");
    } else {
      // For main pages, go to a default location or close the app
      navigate("/");
    }
  };

  // Handle close button
  const handleCloseClick = () => {
    // Navigate back to the main categories page
    navigate("/categories");
  };

  // Navigation component (reused for both sidebar and mobile menu)
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <NavLink
        to="/categories"
        onClick={onClick}
        className={({ isActive }) =>
          `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-primary/10 text-primary font-bold"
              : "text-foreground hover:bg-accent font-normal"
          }`
        }
      >
        Attributes
      </NavLink>
      <NavLink
        to="/manufacturers"
        onClick={onClick}
        className={({ isActive }) =>
          `px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-primary/10 text-primary font-bold"
              : "text-foreground hover:bg-accent font-normal"
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

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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

            {/* Reserved space for sidebar in detail views - only on desktop */}
            {isDetailView && <div className="hidden md:block w-[267px]"></div>}

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
