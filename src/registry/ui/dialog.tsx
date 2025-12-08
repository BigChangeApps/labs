import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/registry/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-hw-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{
      transition: "opacity 250ms cubic-bezier(0.16, 1, 0.3, 1)",
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
  }
>(({ className, overlayClassName, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 ring-1 ring-hw-border border-transparent bg-hw-surface p-6 shadow-modal data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-modal",
        className
      )}
      style={{
        transition: "opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const childrenArray = React.Children.toArray(children);
  
  // Find title - check for DialogTitle or ResponsiveModalTitle
  // Also check if first child looks like a title element
  const titleIndex = childrenArray.findIndex((child: React.ReactNode) => {
    if (!React.isValidElement(child)) return false;
    const type = child.type;
    const displayName = typeof type === "object" && type !== null && "displayName" in type
      ? (type as { displayName?: string }).displayName
      : undefined;
    // Check for DialogTitle directly or ResponsiveModalTitle (which wraps DialogTitle)
    if (displayName === "DialogTitle" || displayName === "ResponsiveModalTitle") {
      return true;
    }
    // Check if it's the first child and might be a title (common pattern)
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
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          className
        )}
        {...props}
      >
        {beforeTitle}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">{title}</div>
          <DialogPrimitive.Close className="border border-transparent rounded-sm opacity-70 ring-offset-hw-background transition-opacity hover:opacity-100 hover:bg-hw-surface-hover hover:text-hw-text cursor-pointer focus:outline-hidden focus:border-hw-focus focus:ring-hw-focus/50 focus:ring-(--ring-width-focus) dark:focus:ring-hw-focus/50 focus:ring-offset-2 disabled:pointer-events-none shrink-0">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        {afterTitle}
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-hw-text-secondary", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
