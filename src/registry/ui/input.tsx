import * as React from "react"

import { cn } from "@/registry/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-hw-text placeholder:text-hw-text-secondary selection:bg-hw-brand selection:text-hw-brand-foreground dark:bg-hw-surface-subtle/30 border border-transparent ring-1 ring-hw-border h-9 w-full min-w-0 rounded-input bg-hw-surface px-3 py-1 text-base shadow-input transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-hw-focus focus-visible:ring-hw-focus/50 focus-visible:ring-(--ring-width-focus) dark:focus-visible:ring-hw-focus/50",
          "aria-invalid:ring-hw-critical/20 dark:aria-invalid:ring-hw-critical/40 aria-invalid:border-hw-critical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
