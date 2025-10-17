import { NavLink } from "react-router-dom";
import { Folder, Library, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
  const navItems = [
    {
      path: "/",
      label: "Categories",
      icon: Folder,
    },
    {
      path: "/library",
      label: "Attributes",
      icon: Library,
    },
    {
      path: "/manufacturers",
      label: "Manufacturers",
      icon: Factory,
    },
  ];

  return (
    <div className="border-b bg-background">
      <nav className="container max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
