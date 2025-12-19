import { useState, useMemo } from "react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/registry/ui/drawer";
import { formatCurrency } from "../../../lib/mock-data";
import { cn } from "@/registry/lib/utils";
import type { LineItem as StateLineItem } from "../../../lib/invoice-state";

interface LineItem extends StateLineItem {
  jobRef?: string;
  jobDate?: string;
}

interface JobLineDetailModalProps {
  jobRef: string;
  jobDate?: string;
  lineItems: LineItem[];
  onLineItemsChange: (lineItems: LineItem[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Category dot indicator
function CategoryDot({ category }: { category: "labour" | "materials" | "other" | "blue" | "orange" | "purple" }) {
  const colors: Record<string, string> = {
    labour: "bg-sky-500",
    materials: "bg-orange-500",
    other: "bg-purple-500",
    blue: "bg-sky-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };
  return <div className={cn("w-2 h-2 rounded-full", colors[category] || "bg-gray-400")} />;
}

export function JobLineDetailModal({
  jobRef,
  jobDate,
  lineItems,
  onLineItemsChange,
  open,
  onOpenChange,
}: JobLineDetailModalProps) {
  // Local state for line selections while modal is open
  const [localLineItems, setLocalLineItems] = useState<LineItem[]>(lineItems);

  // Update local state when lineItems prop changes (e.g., when modal opens)
  useMemo(() => {
    if (open) {
      setLocalLineItems([...lineItems]);
    }
  }, [open, lineItems]);

  const handleLineToggle = (lineId: string) => {
    setLocalLineItems((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, selected: !line.selected } : line
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = localLineItems.every((line) => line.selected);
    setLocalLineItems((prev) =>
      prev.map((line) => ({ ...line, selected: !allSelected }))
    );
  };

  const handleDone = () => {
    onLineItemsChange(localLineItems);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original state
    setLocalLineItems([...lineItems]);
    onOpenChange(false);
  };

  const allSelected = localLineItems.every((line) => line.selected);
  const selectedCount = localLineItems.filter((line) => line.selected).length;
  const totalCount = localLineItems.length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-hw-border">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-bold text-hw-text">
                {jobRef}
              </DrawerTitle>
              {jobDate && (
                <p className="text-sm text-hw-text-secondary mt-1">{jobDate}</p>
              )}
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)] border border-[rgba(2,136,209,0.2)]">
              <span className="text-sm font-medium text-[#0288d1] tracking-[-0.14px]">
                {selectedCount} of {totalCount} lines
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="border border-hw-border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-hw-border">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              <span className="flex-1 text-sm font-medium text-hw-text tracking-[-0.14px]">
                Description
              </span>
              <span className="w-16 text-sm font-medium text-hw-text tracking-[-0.14px] text-center">
                Qty
              </span>
              <span className="w-24 text-sm font-medium text-hw-text tracking-[-0.14px] text-right">
                Unit price
              </span>
              <span className="w-24 text-sm font-medium text-hw-text tracking-[-0.14px] text-right">
                Total
              </span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[rgba(26,28,46,0.08)]">
              {localLineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-hw-surface-subtle transition-colors"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => handleLineToggle(item.id)}
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <CategoryDot category={item.category} />
                    <span className="text-sm font-normal text-hw-text tracking-[-0.14px]">
                      {item.description}
                    </span>
                  </div>
                  <span className="w-16 text-sm font-normal text-hw-text tracking-[-0.14px] text-center">
                    {item.quantity.toFixed(1)}
                  </span>
                  <span className="w-24 text-sm font-normal text-hw-text tracking-[-0.14px] text-right">
                    {formatCurrency(item.unitPrice)}
                  </span>
                  <span className="w-24 text-sm font-normal text-hw-text tracking-[-0.14px] text-right">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-hw-border">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleDone}>
              Done
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

