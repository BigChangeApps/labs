import { Button } from "@/registry/ui/button";
import { Plus } from "lucide-react";

type WorkspaceType = "assets" | "sites" | "agreements" | "schedule";

interface PageContentToolbarProps {
  workspace: WorkspaceType;
  onCreate: () => void;
}

const createActions: Record<WorkspaceType, { label: string; icon?: React.ReactNode }> = {
  assets: { label: "Add asset", icon: <Plus className="h-4 w-4 mr-2" /> },
  sites: { label: "Add site", icon: <Plus className="h-4 w-4 mr-2" /> },
  agreements: { label: "Create agreement", icon: <Plus className="h-4 w-4 mr-2" /> },
  schedule: { label: "Add service task", icon: <Plus className="h-4 w-4 mr-2" /> },
};

export function PageContentToolbar({ workspace, onCreate }: PageContentToolbarProps) {
  const action = createActions[workspace];

  return (
    <div className="flex items-center justify-between gap-4">
      <Button size="sm" onClick={onCreate} className="shrink-0">
        {action.icon}
        {action.label}
      </Button>
    </div>
  );
}

