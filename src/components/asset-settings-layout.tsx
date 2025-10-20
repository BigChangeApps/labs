import { NavLink, Outlet } from "react-router-dom";
import { useAttributeStore } from "@/lib/store";

export function AssetSettingsLayout() {
  const { enableCategoriesListView } = useAttributeStore();

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr] bg-background">
      <aside className="border-r p-6">
        <h1 className="text-xl font-semibold mb-6">Asset settings</h1>
        <nav className="flex flex-col gap-1">
          {!enableCategoriesListView && (
            <NavLink
              to="/core-attributes"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground ${
                  isActive ? "bg-accent text-accent-foreground" : ""
                }`
              }
            >
              Core attributes
            </NavLink>
          )}
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground ${
                isActive ? "bg-accent text-accent-foreground" : ""
              }`
            }
          >
            Attributes
          </NavLink>
          <NavLink
            to="/manufacturers"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground ${
                isActive ? "bg-accent text-accent-foreground" : ""
              }`
            }
          >
            Manufacturers
          </NavLink>
        </nav>
      </aside>
      <section className="overflow-auto p-6">
        <Outlet />
      </section>
    </div>
  );
}
