/**
 * Interaction system types for component demos
 * Enables Storybook-like state management and step-through scenarios
 */

/**
 * Represents a single step in an interaction scenario
 */
export interface InteractionStep<TState = Record<string, unknown>> {
  /** Human-readable description of what this step demonstrates */
  description: string;
  /** State values to apply when this step is active */
  state: TState;
  /** Optional callback to execute when step is activated */
  onActivate?: (state: TState) => void;
}

/**
 * A complete interaction scenario with multiple steps
 */
export interface InteractionScenario<TState = Record<string, unknown>> {
  /** Name of the scenario */
  name: string;
  /** Steps to execute in order */
  steps: InteractionStep<TState>[];
  /** Initial state before any steps */
  initialState?: TState;
}

/**
 * Props for manual interaction controls
 */
export interface InteractionControl<TValue = unknown> {
  /** Label for the control */
  label: string;
  /** Current value */
  value: TValue;
  /** Callback when value changes */
  onChange: (value: TValue) => void;
  /** Type of control (for rendering) */
  type?: "switch" | "select" | "input" | "button";
  /** Options for select/button types */
  options?: Array<{ label: string; value: TValue }>;
}

/**
 * Props for InteractionPanel component
 */
export interface InteractionPanelProps<TState = Record<string, unknown>> {
  /** Current scenario being used */
  scenario: InteractionScenario<TState>;
  /** Current step index */
  currentStep: number;
  /** Callback when step changes */
  onStepChange: (stepIndex: number) => void;
}

/**
 * Return type for useInteractionScenario hook
 */
export interface UseInteractionScenarioReturn<TState = Record<string, unknown>> {
  /** Current step index */
  currentStep: number;
  /** Current state based on active step */
  state: TState;
  /** Navigate to a specific step */
  goToStep: (stepIndex: number) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Reset to initial step */
  reset: () => void;
  /** Whether there is a next step */
  hasNext: boolean;
  /** Whether there is a previous step */
  hasPrevious: boolean;
  /** Total number of steps */
  totalSteps: number;
}

