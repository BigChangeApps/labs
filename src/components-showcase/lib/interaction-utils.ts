import type { InteractionScenario, InteractionStep } from "../types/interactions";

/**
 * Creates a type-safe interaction scenario
 */
export function createScenario<TState extends Record<string, unknown>>(
  config: InteractionScenario<TState>
): InteractionScenario<TState> {
  return {
    initialState: {} as TState,
    ...config,
  };
}

/**
 * Executes a step and returns the merged state
 */
export function executeStep<TState extends Record<string, unknown>>(
  step: InteractionStep<TState>,
  previousState: TState
): TState {
  // Merge step state with previous state
  const newState = { ...previousState, ...step.state };

  // Execute step callback if provided
  if (step.onActivate) {
    step.onActivate(newState);
  }

  return newState;
}

/**
 * Gets the state for a specific step index
 */
export function getStateForStep<TState extends Record<string, unknown>>(
  scenario: InteractionScenario<TState>,
  stepIndex: number
): TState {
  if (stepIndex < 0 || stepIndex >= scenario.steps.length) {
    return scenario.initialState || ({} as TState);
  }

  let state = scenario.initialState || ({} as TState);

  // Apply all steps up to and including the target step
  for (let i = 0; i <= stepIndex; i++) {
    state = executeStep(scenario.steps[i], state);
  }

  return state;
}

/**
 * Validates that a scenario has at least one step
 */
export function validateScenario<TState extends Record<string, unknown>>(
  scenario: InteractionScenario<TState>
): boolean {
  return scenario.steps.length > 0;
}





