import { NavLink } from "react-router-dom";
import { Folder, Library, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
  const navItems = [
    {
      path: "/",
      label: "Category Management",
      icon: Folder,
    },
    {
      path: "/library",
      label: "Attribute Library",
      icon: Library,
    },
    {
      path: "/manufacturers",
      label: "Manufacturers & Models",
      icon: Factory,
    },
  ];

  return (
    <aside className="w-60 border-r bg-background flex flex-col">
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
