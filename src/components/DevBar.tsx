import { Link, useLocation } from "react-router-dom";
import { prototypes } from "@/data/prototypes";

/**
 * Dev bar for quick navigation between prototype versions.
 * Only visible when VITE_SHOW_INTERNAL is true or in development mode.
 */
export function DevBar() {
  const location = useLocation();
  const showDevBar = import.meta.env.DEV || import.meta.env.VITE_SHOW_INTERNAL === "true";

  if (!showDevBar) return null;

  // Group prototypes by base name (e.g., "asset-attributes")
  const prototypeGroups = prototypes.reduce((groups, prototype) => {
    // Extract base name (everything before the version suffix)
    const match = prototype.id.match(/^(.+?)-v\d+$/);
    if (match) {
      const baseName = match[1];
      if (!groups[baseName]) {
        groups[baseName] = [];
      }
      groups[baseName].push(prototype);
    }
    return groups;
  }, {} as Record<string, typeof prototypes>);

  // Only show if there are versioned prototypes
  if (Object.keys(prototypeGroups).length === 0) return null;

  // Find which version group we're currently in
  const currentGroup = Object.entries(prototypeGroups).find(([, versions]) =>
    versions.some(v => location.pathname.startsWith(v.path))
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm">
      <div className="text-xs font-medium text-white/60 mb-2">Dev Tools</div>
      {currentGroup ? (
        <>
          <div className="text-sm font-medium mb-2">{currentGroup[0]}</div>
          <div className="flex flex-col gap-1">
            {currentGroup[1].map((prototype) => {
              const isActive = location.pathname.startsWith(prototype.path);
              return (
                <Link
                  key={prototype.id}
                  to={prototype.path}
                  className={`text-sm px-2 py-1 rounded transition-colors ${
                    isActive
                      ? "bg-white text-black font-medium"
                      : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  {prototype.title}
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-xs text-white/60">
          Navigate to a versioned prototype to see version switcher
        </div>
      )}
    </div>
  );
}
