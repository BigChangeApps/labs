import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/registry/lib/utils";

const conditionBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      condition: {
        excellent:
          "border-hw-success bg-hw-success-muted text-hw-success",
        good:
          "border-hw-informative bg-hw-informative-muted text-hw-informative",
        fair:
          "border-hw-warning bg-hw-warning-muted text-hw-warning",
        poor:
          "border-hw-critical bg-hw-critical-muted text-hw-critical",
      },
    },
    defaultVariants: {
      condition: "good",
    },
  }
);

export type ConditionType = "Excellent" | "Good" | "Fair" | "Poor";

interface ConditionBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof conditionBadgeVariants> {
  value?: ConditionType;
}

function ConditionBadge({ className, condition, value, ...props }: ConditionBadgeProps) {
  // Allow passing either condition variant or value string
  const resolvedCondition = condition ?? (value?.toLowerCase() as ConditionBadgeProps["condition"]);

  return (
    <div
      className={cn(conditionBadgeVariants({ condition: resolvedCondition }), className)}
      {...props}
    >
      {value ?? condition}
    </div>
  );
}

export { ConditionBadge, conditionBadgeVariants };
