/**
 * Invoice selection state management
 * Line items are the source of truth for all selections
 */

export type LineItemCategory = "labour" | "materials" | "other";
export type ViewMode = "summary" | "partial" | "detailed";

export interface LineItem {
  id: string;
  jobId: string;
  category: LineItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  selected: boolean; // Source of truth
}

export interface JobSelectionState {
  jobId: string;
  lineItems: LineItem[];
  lastSelectionState?: Set<string>; // Remember previous selections when job is excluded
}

export interface InvoiceSelectionState {
  invoiceId: string;
  jobSelections: Map<string, JobSelectionState>;
  groupLines?: LineItem[]; // For group invoices
  viewMode: ViewMode;
}

// Store for all invoice selections
const invoiceSelections = new Map<string, InvoiceSelectionState>();

/**
 * Initialize selection state for an invoice
 */
export function initializeInvoiceSelection(
  invoiceId: string,
  jobs: Array<{ id: string; lineItems?: LineItem[] }>,
  defaultViewMode: ViewMode = "partial"
): InvoiceSelectionState {
  const jobSelections = new Map<string, JobSelectionState>();

  jobs.forEach((job) => {
    // If line items are provided, use them; otherwise create default empty array
    const lineItems = job.lineItems || [];
    
    // Initialize all lines as selected by default
    const initializedLines = lineItems.map((line) => ({
      ...line,
      selected: line.selected !== undefined ? line.selected : true,
    }));

    jobSelections.set(job.id, {
      jobId: job.id,
      lineItems: initializedLines,
    });
  });

  const state: InvoiceSelectionState = {
    invoiceId,
    jobSelections,
    viewMode: defaultViewMode,
  };

  invoiceSelections.set(invoiceId, state);
  return state;
}

/**
 * Get selection state for an invoice
 */
export function getInvoiceSelection(invoiceId: string): InvoiceSelectionState | undefined {
  return invoiceSelections.get(invoiceId);
}

/**
 * Get selected line items for a job or all jobs in an invoice
 */
export function getSelectedLineItems(
  invoiceId: string,
  jobId?: string
): LineItem[] {
  const state = invoiceSelections.get(invoiceId);
  if (!state) return [];

  if (jobId) {
    const jobState = state.jobSelections.get(jobId);
    return jobState?.lineItems.filter((line) => line.selected) || [];
  }

  // Return all selected lines from all jobs
  const allSelected: LineItem[] = [];
  state.jobSelections.forEach((jobState) => {
    allSelected.push(...jobState.lineItems.filter((line) => line.selected));
  });

  if (state.groupLines) {
    allSelected.push(...state.groupLines.filter((line) => line.selected));
  }

  return allSelected;
}

/**
 * Toggle a single line item selection
 */
export function toggleLineItem(
  invoiceId: string,
  jobId: string,
  lineId: string
): void {
  const state = invoiceSelections.get(invoiceId);
  if (!state) return;

  const jobState = state.jobSelections.get(jobId);
  if (!jobState) return;

  const lineItem = jobState.lineItems.find((line) => line.id === lineId);
  if (lineItem) {
    lineItem.selected = !lineItem.selected;
  }
}

/**
 * Toggle an entire job (include/exclude all lines)
 */
export function toggleJob(
  invoiceId: string,
  jobId: string,
  include: boolean
): void {
  const state = invoiceSelections.get(invoiceId);
  if (!state) return;

  const jobState = state.jobSelections.get(jobId);
  if (!jobState) return;

  if (include) {
    // Restore previous selection state if available, otherwise select all
    if (jobState.lastSelectionState) {
      jobState.lineItems.forEach((line) => {
        line.selected = jobState.lastSelectionState!.has(line.id);
      });
      jobState.lastSelectionState = undefined;
    } else {
      // Default: select all lines
      jobState.lineItems.forEach((line) => {
        line.selected = true;
      });
    }
  } else {
    // Save current selection state before excluding
    const currentSelected = new Set<string>();
    jobState.lineItems.forEach((line) => {
      if (line.selected) {
        currentSelected.add(line.id);
      }
      line.selected = false;
    });
    jobState.lastSelectionState = currentSelected;
  }
}

/**
 * Toggle a category for a job (Partial view)
 */
export function toggleCategory(
  invoiceId: string,
  jobId: string,
  category: LineItemCategory
): void {
  const state = invoiceSelections.get(invoiceId);
  if (!state) return;

  const jobState = state.jobSelections.get(jobId);
  if (!jobState) return;

  // Find all lines in this category
  const categoryLines = jobState.lineItems.filter(
    (line) => line.category === category
  );

  if (categoryLines.length === 0) return;

  // Determine if all are selected (then deselect) or any are unselected (then select all)
  const allSelected = categoryLines.every((line) => line.selected);
  const newState = !allSelected;

  categoryLines.forEach((line) => {
    line.selected = newState;
  });
}

/**
 * Get line counts for a job (included vs total)
 */
export function getLineCounts(
  invoiceId: string,
  jobId: string
): { included: number; total: number } {
  const state = invoiceSelections.get(invoiceId);
  if (!state) {
    return { included: 0, total: 0 };
  }

  const jobState = state.jobSelections.get(jobId);
  if (!jobState) {
    return { included: 0, total: 0 };
  }

  const total = jobState.lineItems.length;
  const included = jobState.lineItems.filter((line) => line.selected).length;

  return { included, total };
}

/**
 * Calculate totals from selected line items
 */
export function calculateTotals(invoiceId: string): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const selectedLines = getSelectedLineItems(invoiceId);
  
  const subtotal = selectedLines.reduce((sum, line) => sum + line.total, 0);
  
  // TODO: Handle different VAT rates per line if needed
  const vatRate = 0.20; // 20% VAT
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
}

/**
 * Update line items for a job (used by modal/drawer)
 */
export function updateJobLineItems(
  invoiceId: string,
  jobId: string,
  lineItems: LineItem[]
): void {
  const state = invoiceSelections.get(invoiceId);
  if (!state) return;

  const jobState = state.jobSelections.get(jobId);
  if (!jobState) return;

  // Update line items while preserving selection state
  const existingSelections = new Map<string, boolean>();
  jobState.lineItems.forEach((line) => {
    existingSelections.set(line.id, line.selected);
  });

  // Merge new line items with existing selections
  jobState.lineItems = lineItems.map((line) => {
    const existingSelection = existingSelections.get(line.id);
    return {
      ...line,
      selected: existingSelection !== undefined ? existingSelection : line.selected,
    };
  });
}

/**
 * Set view mode for an invoice
 */
export function setViewMode(invoiceId: string, viewMode: ViewMode): void {
  const state = invoiceSelections.get(invoiceId);
  if (state) {
    state.viewMode = viewMode;
  }
}

/**
 * Get view mode for an invoice
 */
export function getViewMode(invoiceId: string): ViewMode {
  const state = invoiceSelections.get(invoiceId);
  return state?.viewMode || "partial";
}


