import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/registry/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[18px] w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:border-hw-focus focus-visible:ring-hw-focus/30 focus-visible:ring-4 dark:focus-visible:ring-hw-focus/30 focus-visible:ring-offset-2 focus-visible:ring-offset-hw-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-hw-brand data-[state=checked]:ring-1 data-[state=checked]:ring-hw-brand-hover data-[state=unchecked]:bg-hw-inactive/50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-1 transition-transform data-[state=checked]:translate-x-2.5 data-[state=checked]:ring-hw-brand-hover data-[state=unchecked]:translate-x-0 data-[state=unchecked]:ring-hw-border"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
