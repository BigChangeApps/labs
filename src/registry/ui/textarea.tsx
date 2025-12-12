import * as React from "react"

import { cn } from "@/registry/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
        className={cn(
          "flex min-h-[80px] w-full min-w-0 border border-transparent ring-1 ring-hw-border bg-hw-surface px-3 py-2 text-base text-hw-text transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "placeholder:text-hw-text-secondary",
          "selection:bg-hw-brand selection:text-hw-brand-foreground",
          "ring-offset-hw-background",
          "rounded-[var(--hw-radius-input,0.375rem)] shadow-[var(--hw-shadow-input,0_1px_2px_0_rgb(0_0_0_/_0.05))]",
          "focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50",
          "aria-invalid:ring-hw-critical/20 dark:aria-invalid:ring-hw-critical/40 aria-invalid:border-hw-critical",
          className
        )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
