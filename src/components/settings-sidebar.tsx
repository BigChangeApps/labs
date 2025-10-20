import { NavLink } from "react-router-dom";
import { Folder, Library, Factory, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttributeStore } from "@/lib/store";

export function SettingsSidebar() {
  const { enableParentInheritance } = useAttributeStore();

  const navItems = [
    {
      path: "/",
      label: "Attributes",
      icon: Folder,
    },
    {
      path: "/library",
      label: "Attributes",
      icon: Library,
      hidden: enableParentInheritance,
    },
    {
      path: "/manufacturers",
      label: "Manufacturers",
      icon: Factory,
    },
    {
      path: "/core-attributes",
      label: "Core Attributes",
      icon: Settings,
    },
  ];

  return (
    <div className="border-b bg-background">
      <nav className="container max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-1">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => {
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
