import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";

import { cn } from "@/registry/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-hw-overlay", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] ring-1 ring-hw-border border-transparent bg-hw-surface",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-hw-border" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const childrenArray = React.Children.toArray(children);
  
  // Find title - check for DrawerTitle or ResponsiveModalTitle
  // Also check if first child looks like a title element
  const titleIndex = childrenArray.findIndex((child: React.ReactNode) => {
    if (!React.isValidElement(child)) return false;
    const type = child.type;
    const displayName = typeof type === "object" && type !== null && "displayName" in type
      ? (type as { displayName?: string }).displayName
      : undefined;
    // Check for DrawerTitle directly or ResponsiveModalTitle (which wraps DrawerTitle)
    if (displayName === "DrawerTitle" || displayName === "ResponsiveModalTitle") {
      return true;
    }
    return false;
  });
  
  // If no title found by displayName, check if first child exists (likely a title)
  const effectiveTitleIndex = titleIndex !== -1 ? titleIndex : (childrenArray.length > 0 ? 0 : -1);
  
  if (effectiveTitleIndex !== -1 && childrenArray.length > 0) {
    const title = childrenArray[effectiveTitleIndex];
    const beforeTitle = childrenArray.slice(0, effectiveTitleIndex);
    const afterTitle = childrenArray.slice(effectiveTitleIndex + 1);
    
    return (
      <div
        className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
        {...props}
      >
        {beforeTitle}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">{title}</div>
          <DrawerPrimitive.Close className="border border-transparent rounded-sm opacity-70 ring-offset-hw-background transition-opacity hover:opacity-100 hover:bg-hw-surface-hover hover:text-hw-text cursor-pointer focus:outline-hidden focus:border-hw-focus focus:ring-hw-focus/50 focus:ring-(--ring-width-focus) dark:focus:ring-hw-focus/50 focus:ring-offset-2 disabled:pointer-events-none shrink-0">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DrawerPrimitive.Close>
        </div>
        {afterTitle}
      </div>
    );
  }
  
  return (
    <div
      className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
};
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-hw-text-secondary", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
