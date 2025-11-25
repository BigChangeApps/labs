import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/registry/ui/button";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        className="w-full justify-between !p-0 !px-0 h-auto font-bold text-base hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>
      {isExpanded && <div className="flex flex-col gap-4">{children}</div>}
    </div>
  );
}


