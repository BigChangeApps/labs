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
import { getAllComponents } from "../lib/registry";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const components = getAllComponents();

  // Navigation component (reused for both sidebar and mobile menu)
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {components.map((component) => (
        <NavLink
          key={component.id}
          to={component.path}
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
          {component.title}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="h-full bg-background flex">
      {/* Fixed Left Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] md:fixed md:top-0 md:bottom-0 md:left-0 md:border-r md:bg-background">
        <div className="flex flex-col h-full p-6">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Components
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
                  <SheetTitle>Components</SheetTitle>
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
            <div className="w-full max-w-[700px] px-3 sm:px-6 py-4 sm:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
