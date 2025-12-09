"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/registry/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-transparent ring-1 ring-hw-border shadow focus-visible:outline-none focus-visible:border-hw-focus focus-visible:ring-hw-focus/30 focus-visible:ring-4 dark:focus-visible:ring-hw-focus/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-hw-brand data-[state=checked]:text-hw-brand-foreground data-[state=unchecked]:bg-hw-surface",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
