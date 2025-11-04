import { type MouseEvent } from "react";
import { MoreVertical, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { Switch } from "@/registry/ui/switch";
import { Separator } from "@/registry/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
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
  onDelete?: () => void;
  onFeedback?: () => void;
  isDeleting?: boolean;
  showSeparator?: boolean;
}

export function AttributeCard({
  attribute,
  variant,
  isEnabled,
  onToggle,
  onClick,
  onDelete,
  onFeedback,
  isDeleting = false,
  showSeparator = true,
}: AttributeCardProps) {
  const IconComponent = getAttributeIcon(attribute.type);

  // Determine if card is clickable (predefined and custom can be clicked)
  const isClickable = (variant === "predefined" || variant === "custom") && !!onClick;
  
  // Determine if toggle should be shown
  const showToggle = variant !== "system" && !!onToggle;
  
  // Determine if toggle should be interactive (predefined/custom can toggle)
  const toggleDisabled = variant === "system";

  // Handle card click
  const handleCardClick = (e: MouseEvent) => {
    if (!isClickable) return;
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="switch"]') ||
      target.closest('[data-badge]') ||
      target.closest('[role="dialog"]') ||
      target.closest('[data-radix-popper-content-wrapper]')
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
        }`}
        onClick={handleCardClick}
      >
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
          className="flex items-center gap-1 sm:gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toggle switch or System badge */}
          {variant === "system" ? (
            <Badge
              variant="secondary"
              className="text-xs"
              data-badge
            >
              System
            </Badge>
          ) : (
            showToggle && (
              <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                disabled={toggleDisabled}
                onClick={(e) => e.stopPropagation()}
              />
            )
          )}

          {/* 3-dot menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              {variant === "custom" ? (
                onDelete && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )
              ) : (
                onFeedback && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedback();
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Give feedback
                  </Button>
                )
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}

