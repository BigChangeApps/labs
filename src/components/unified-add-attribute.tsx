import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateAttributeDrawer } from "./create-attribute-drawer";

interface UnifiedAddAttributeProps {
  categoryId: string;
}

export function UnifiedAddAttribute({ categoryId }: UnifiedAddAttributeProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCreateDrawerOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add attribute
      </Button>

      <CreateAttributeDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        categoryId={categoryId}
      />
    </>
  );
}
