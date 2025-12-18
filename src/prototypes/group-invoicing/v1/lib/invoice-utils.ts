/**
 * Utility functions for managing invoiced jobs
 */

const INVOICED_JOBS_KEY = "bulk-invoicing-invoiced-jobs";

/**
 * Get list of invoiced job IDs from localStorage
 */
export function getInvoicedJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  
  try {
    const stored = localStorage.getItem(INVOICED_JOBS_KEY);
    if (!stored) return new Set();
    const ids = JSON.parse(stored) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

/**
 * Mark jobs as invoiced by storing their IDs in localStorage
 */
export function markJobsAsInvoiced(jobIds: string[]): void {
  if (typeof window === "undefined") return;
  
  try {
    const existing = getInvoicedJobIds();
    const updated = new Set([...existing, ...jobIds]);
    localStorage.setItem(INVOICED_JOBS_KEY, JSON.stringify([...updated]));
  } catch (error) {
    console.error("Failed to mark jobs as invoiced:", error);
  }
}

/**
 * Clear all invoiced job IDs (useful for testing/reset)
 */
export function clearInvoicedJobs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INVOICED_JOBS_KEY);
}

