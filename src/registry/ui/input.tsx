import * as React from "react"

import { cn } from "@/registry/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // #region agent log
    const baseClasses = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
    const finalClassName = cn(baseClasses, className);
    fetch('http://127.0.0.1:7242/ingest/cf7df69f-f856-4874-ac6a-b53ffb85f438',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'input.tsx:14',message:'Input className composition',data:{baseClasses,passedClassName:className,finalClassName,type,hasHwTokens:baseClasses.includes('hw-') || (className?.includes('hw-') ?? false)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return (
      <input
        type={type}
        className={finalClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
