import { type MouseEvent } from "react";
import { Badge } from "@/registry/ui/badge";
import { Switch } from "@/registry/ui/switch";
import { Separator } from "@/registry/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/ui/tooltip";
import { GripVertical, BadgeCheck, Check } from "lucide-react";
import type { Attribute, CoreAttribute } from "../../../types";
import { getAttributeIcon } from "../../../lib/utils";

type AttributeCardData = Attribute | CoreAttribute;

export type AttributeCardVariant = "system" | "predefined" | "custom";

export interface AttributeCardProps {
  attribute: AttributeCardData;
  variant: AttributeCardVariant;
  isEnabled: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  isDeleting?: boolean;
  showSeparator?: boolean;
  isDraggable?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function AttributeCard({
  attribute,
  variant,
  isEnabled,
  onToggle,
  onClick,
  isDeleting = false,
  showSeparator = true,
  isDraggable = false,
  dragHandleProps,
}: AttributeCardProps) {
  const IconComponent = getAttributeIcon(attribute.type);

  // All variants can be clicked to open side panel
  const isClickable = !!onClick;

  // Determine if toggle should be shown (system attributes don't have toggles)
  const showToggle = variant !== "system" && !!onToggle;

  // Handle card click
  const handleCardClick = (e: MouseEvent) => {
    if (!isClickable) return;
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="switch"]') ||
      target.closest('[data-badge]') ||
      target.closest('[data-drag-handle]')
    ) {
      return;
    }
    onClick?.();
  };

  return (
    <>
      <div
        className={`flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 transition-all duration-300 ease-out ${
          isDeleting ? "opacity-0 scale-[0.98]" : ""
        } ${
          isClickable ? "hover:bg-muted/50 cursor-pointer" : ""
        } ${
          variant === "custom" ? "bg-muted/30" : ""
        }`}
        onClick={handleCardClick}
      >
        {/* Drag Handle - only shown for draggable items */}
        {isDraggable && (
          <div
            {...dragHandleProps}
            data-drag-handle
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Type Icon - hidden on mobile */}
          <div className="hidden sm:block">
            <div className="w-8 h-8 rounded-md bg-hw-surface-subtle border border-hw-border/50 flex items-center justify-center p-1.5">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-medium text-sm">{attribute.label}</span>
            </div>
            {attribute.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {attribute.description}
              </p>
            )}
            {attribute.dropdownOptions &&
              attribute.dropdownOptions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {attribute.dropdownOptions.map((option) => (
                    <Badge
                      key={option}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 sm:gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Custom badge for user-created attributes */}
          {variant === "custom" && (
            <Badge
              variant="secondary"
              className="text-xs"
              data-badge
            >
              Custom
            </Badge>
          )}

          {/* Preferred indicator - only for category attributes */}
          {"isPreferred" in attribute && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {attribute.isPreferred ? (
                    <span className="relative inline-flex items-center justify-center h-6 w-6">
                      <BadgeCheck
                        className="h-6 w-6 text-green-600 absolute"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <Check
                        className="h-3.5 w-3.5 text-white relative z-10"
                        strokeWidth="3"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Preferred</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center h-6 w-6">
                      <BadgeCheck
                        className="h-6 w-6 text-muted-foreground opacity-50"
                        aria-disabled
                      />
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {attribute.isPreferred
                      ? "This attribute is preferred"
                      : "This attribute isn't preferred"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Toggle switch (system attributes have no toggle or badge) */}
          {showToggle && (
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}

