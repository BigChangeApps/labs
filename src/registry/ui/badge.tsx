import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/registry/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-hw-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-hw-brand text-hw-brand-foreground hover:bg-hw-brand-hover",
        secondary:
          "border-transparent bg-hw-surface-subtle text-hw-interactive-secondary-foreground hover:bg-hw-interactive-secondary-hover",
        destructive:
          "border-transparent bg-hw-critical text-hw-critical-foreground hover:bg-hw-critical/80",
        outline: "text-hw-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
