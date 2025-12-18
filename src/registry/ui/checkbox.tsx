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
      "peer h-4 w-4 shrink-0 rounded-[3px] border border-transparent ring-1 ring-hw-border shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] focus-visible:outline-none focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#086dff] data-[state=checked]:text-white data-[state=checked]:shadow-[0_0_0_1px_rgba(1,101,246,1)] data-[state=unchecked]:bg-white",
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
