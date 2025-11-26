/**
 * Date utility functions for DD/MM/YYYY input masking and validation
 */

/**
 * Apply DD/MM/YYYY masking to input string
 * Strips all non-digits and inserts slashes at positions 3 and 6
 *
 * @param input - Raw input string (may contain digits, slashes, or other characters)
 * @returns Masked string in DD/MM/YYYY format (or partial if incomplete)
 *
 * @example
 * applyDateMask("25122025") // "25/12/2025"
 * applyDateMask("25/12/2025") // "25/12/2025"
 * applyDateMask("251") // "25/1"
 */
export function applyDateMask(input: string): string {
  // Extract only digits
  const digitsOnly = input.replace(/\D/g, '');

  // Limit to 8 digits (DDMMYYYY)
  const limitedDigits = digitsOnly.slice(0, 8);

  // Apply format: DD/MM/YYYY
  let masked = '';
  for (let i = 0; i < limitedDigits.length; i++) {
    if (i === 2 || i === 4) {
      masked += '/';
    }
    masked += limitedDigits[i];
  }

  return masked;
}

/**
 * Parse DD/MM/YYYY string to Date object
 * Validates that the date is semantically correct (e.g., no 31/02)
 *
 * @param input - Date string in DD/MM/YYYY format
 * @returns Date object if valid, null otherwise
 *
 * @example
 * parseDDMMYYYY("25/12/2025") // Date object for December 25, 2025
 * parseDDMMYYYY("31/02/2025") // null (invalid date)
 * parseDDMMYYYY("29/02/2024") // Date object (valid leap year)
 */
export function parseDDMMYYYY(input: string): Date | null {
  const cleaned = input.replace(/\D/g, '');

  // Must have exactly 8 digits
  if (cleaned.length !== 8) return null;

  const day = parseInt(cleaned.substring(0, 2), 10);
  const month = parseInt(cleaned.substring(2, 4), 10);
  const year = parseInt(cleaned.substring(4, 8), 10);

  // Create date (month is 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day);

  // Validate by checking if components match
  // This catches invalid dates like 31/02/2025 which would roll over
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  return date;
}

/**
 * Format Date object to DD/MM/YYYY string
 *
 * @param date - Date object to format
 * @returns Formatted string in DD/MM/YYYY format, or empty string if invalid
 *
 * @example
 * formatDDMMYYYY(new Date(2025, 11, 25)) // "25/12/2025"
 * formatDDMMYYYY(undefined) // ""
 */
export function formatDDMMYYYY(date: Date | undefined | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format Date object to ISO date string (YYYY-MM-DD) using local time components
 * This avoids timezone issues that occur with toISOString() which converts to UTC
 *
 * @param date - Date object to format
 * @returns ISO format string (YYYY-MM-DD), or empty string if invalid
 *
 * @example
 * formatDateToISO(new Date(2008, 4, 1)) // "2008-05-01" (May 1st, 2008)
 * formatDateToISO(undefined) // ""
 */
export function formatDateToISO(date: Date | undefined | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Convert ISO date string (YYYY-MM-DD) to DD/MM/YYYY display format
 *
 * @param isoDate - ISO format date string
 * @returns Display format string, or empty string if invalid
 *
 * @example
 * isoToDisplay("2025-12-25") // "25/12/2025"
 * isoToDisplay("") // ""
 */
export function isoToDisplay(isoDate: string | undefined): string {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  return formatDDMMYYYY(date);
}

/**
 * Convert DD/MM/YYYY display format to ISO date string (YYYY-MM-DD)
 *
 * @param displayDate - Date string in DD/MM/YYYY format
 * @returns ISO format string, or null if invalid
 *
 * @example
 * displayToISO("25/12/2025") // "2025-12-25"
 * displayToISO("31/02/2025") // null (invalid date)
 */
export function displayToISO(displayDate: string): string | null {
  const parsed = parseDDMMYYYY(displayDate);
  if (!parsed) return null;

  return formatDateToISO(parsed);
}

/**
 * Validate DD/MM/YYYY date input
 * Returns error message or null if valid
 *
 * @param input - Date string to validate
 * @returns Error message string if invalid, null if valid
 *
 * @example
 * validateDateInput("25/12/2025") // null (valid)
 * validateDateInput("31/02/2025") // "Please enter a valid date"
 * validateDateInput("25/12") // "Please enter date as DD/MM/YYYY"
 * validateDateInput("") // null (empty is allowed for optional fields)
 */
export function validateDateInput(input: string): string | null {
  // Empty input is valid (field is optional)
  if (!input || input.trim() === '') return null;

  // Check format
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    return "Please enter date as DD/MM/YYYY";
  }

  // Parse and validate date
  const date = parseDDMMYYYY(input);
  if (!date) {
    return "Please enter a valid date";
  }

  // Check year range
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    return "Year must be between 1900 and 2100";
  }

  return null;
}

/**
 * Check if date is valid
 *
 * @param date - Date object to check
 * @returns true if valid, false otherwise
 */
export function isValidDate(date: Date | undefined): boolean {
  if (!date) return false;
  return !isNaN(date.getTime());
}
