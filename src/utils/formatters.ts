/**
 * Centralized formatting utilities for consistent display across the app.
 */

/**
 * Formats a duration in milliseconds to "MM:SS" format.
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "3:45")
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration in milliseconds to "Xh Ym" format.
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2h 30m")
 */
export function formatDurationLong(ms: number): { hours: number; minutes: number } {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return { hours, minutes };
}

/**
 * Formats a date string to a localized date format.
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Formats a date to relative time (e.g., "2 hours ago", "Yesterday").
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDate(dateString);
}

/**
 * Truncates a string to a maximum length with ellipsis.
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Formats a number with commas for thousands separators.
 * @param num - Number to format
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Gets the decade from a release date string.
 * @param releaseDate - Release date string (e.g., "2023-05-15")
 * @returns Decade string (e.g., "2020s")
 */
export function getDecadeFromDate(releaseDate: string): string {
  const year = new Date(releaseDate).getFullYear();
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

/**
 * Escapes special characters for CSV export.
 * @param value - String value to escape
 * @returns Escaped string safe for CSV
 */
export function escapeCSVValue(value: string): string {
  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Creates a CSV string from an array of rows.
 * @param headers - Array of header strings
 * @param rows - Array of row arrays
 * @returns CSV string
 */
export function createCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(escapeCSVValue).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSVValue).join(','));
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads a string as a file.
 * @param content - File content
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/csv'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
