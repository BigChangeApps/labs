import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/registry/ui/button";
import type { InteractionPanelProps } from "../types/interactions";

export function InteractionPanel<TState extends Record<string, unknown>>({
  scenario,
  currentStep,
  onStepChange,
}: InteractionPanelProps<TState>) {
  const currentStepData = scenario.steps[currentStep];
  const progress = ((currentStep + 1) / scenario.steps.length) * 100;

  return (
    <div className="border rounded-lg bg-muted/50 p-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{scenario.name}</span>
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {scenario.steps.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-background border rounded-md p-3">
        <p className="text-sm text-muted-foreground mb-1">Current Step:</p>
        <p className="text-sm font-medium">{currentStepData?.description || "No step"}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStepChange(0)}
          disabled={currentStep === 0}
          title="Reset to beginning"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStepChange(currentStep + 1)}
          disabled={currentStep >= scenario.steps.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

