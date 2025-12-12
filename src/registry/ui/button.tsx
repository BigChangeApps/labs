import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-hw-critical/20 dark:aria-invalid:ring-hw-critical/40 aria-invalid:border-hw-critical",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-[#086dff] shadow-[0_0_0_1px_rgba(7,98,229,0.8)] text-white hover:bg-[#0752cc] focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 rounded-[var(--hw-radius-button,0.375rem)]",
        destructive:
          "border border-transparent bg-hw-critical shadow-[var(--hw-shadow-button,0_1px_2px_0_rgb(0_0_0_/_0.05))] ring-1 ring-hw-critical text-hw-critical-foreground hover:bg-hw-critical-hover focus-visible:border-hw-critical/80 focus-visible:ring-hw-critical/30 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-critical/30 dark:bg-hw-critical/60 rounded-[var(--hw-radius-button,0.375rem)]",
        secondary:
          "border border-[rgba(26,28,46,0.12)] bg-white shadow-[0_0_0_1px_rgba(11,38,66,0.08)] text-[#0b2642] hover:bg-gray-50 focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 rounded-[var(--hw-radius-button,0.375rem)]",
        outline:
          "border border-transparent ring-hw-border shadow-[var(--hw-shadow-button,0_1px_2px_0_rgb(0_0_0_/_0.05))] ring-1 bg-hw-interactive-secondary text-hw-interactive-secondary-foreground hover:bg-hw-interactive-secondary-hover focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 rounded-[var(--hw-radius-button,0.375rem)]",
        ghost:
          "border border-transparent hover:bg-hw-surface-hover hover:text-hw-text dark:hover:bg-hw-surface-hover/50 focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 rounded-[var(--hw-radius-button,0.375rem)]",
        link: "border border-transparent text-hw-interactive underline-offset-4 hover:underline focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50 rounded-[var(--hw-radius-button,0.375rem)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-[var(--hw-radius-button,0.375rem)]",
        lg: "h-10 px-6 has-[>svg]:px-4 rounded-[var(--hw-radius-button,0.375rem)]",
        icon: "size-9 rounded-[var(--hw-radius-button,0.375rem)]",
        "icon-sm": "size-8 rounded-[var(--hw-radius-button,0.375rem)]",
        "icon-lg": "size-10 rounded-[var(--hw-radius-button,0.375rem)]",
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
