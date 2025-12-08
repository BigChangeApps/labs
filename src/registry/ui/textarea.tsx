import * as React from "react"

import { cn } from "@/registry/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-input border border-transparent ring-1 ring-hw-border bg-hw-surface px-3 py-2 text-base shadow-input ring-offset-hw-background placeholder:text-hw-text-secondary focus-visible:outline-none focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-[4px] dark:focus-visible:ring-hw-focus/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
