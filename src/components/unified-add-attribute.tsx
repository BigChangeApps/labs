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
      <Button className="w-full" onClick={() => setIsCreateDrawerOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Attribute
      </Button>

      <CreateAttributeDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        categoryId={categoryId}
      />
    </>
  );
}
