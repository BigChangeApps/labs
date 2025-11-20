import { useState, useCallback, useMemo } from "react";
import type {
  InteractionScenario,
  UseInteractionScenarioReturn,
} from "../types/interactions";
import { getStateForStep } from "./interaction-utils";

/**
 * Hook for managing interaction scenarios
 * Provides step navigation and state management
 */
export function useInteractionScenario<TState extends Record<string, unknown>>(
  scenario: InteractionScenario<TState>
): UseInteractionScenarioReturn<TState> {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Calculate current state based on active step
  const state = useMemo(() => {
    return getStateForStep(scenario, currentStepIndex);
  }, [scenario, currentStepIndex]);

  // Navigation functions
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < scenario.steps.length) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [scenario.steps.length]
  );

  const nextStep = useCallback(() => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, scenario.steps.length]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
  }, []);

  // Computed values
  const hasNext = currentStepIndex < scenario.steps.length - 1;
  const hasPrevious = currentStepIndex > 0;
  const totalSteps = scenario.steps.length;

  return {
    currentStep: currentStepIndex,
    state,
    goToStep,
    nextStep,
    previousStep,
    reset,
    hasNext,
    hasPrevious,
    totalSteps,
  };
}









