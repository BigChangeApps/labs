import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-hw-brand shadow-xs ring-1 ring-hw-brand text-hw-brand-foreground hover:bg-hw-brand-hover focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50",
        destructive:
          "border border-transparent bg-hw-critical shadow-xs ring-1 ring-hw-critical text-hw-critical-foreground hover:bg-hw-critical-hover focus-visible:border-hw-critical/80 focus-visible:ring-hw-critical/30 focus-visible:ring-[4px] dark:focus-visible:ring-hw-critical/30 dark:bg-hw-critical/60",
        secondary:
          "border border-transparent ring-hw-border shadow-xs ring-1 bg-hw-interactive-secondary text-hw-interactive-secondary-foreground hover:bg-hw-interactive-secondary-hover focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50",
        outline:
          "border border-transparent ring-hw-border shadow-xs ring-1 bg-hw-interactive-secondary text-hw-interactive-secondary-foreground hover:bg-hw-interactive-secondary-hover focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50",
        ghost:
          "border border-transparent hover:bg-hw-surface-hover hover:text-hw-text dark:hover:bg-hw-surface-hover/50 focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50",
        link: "border border-transparent text-hw-interactive underline-offset-4 hover:underline focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
