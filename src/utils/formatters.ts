/**
 * Formatting helpers shared across the dashboard.
 */

/** 225000 -> "3:45" */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** 9000000 -> "2h 30m" */
export function formatHoursMinutes(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/** "2024-01-15T..." -> "Jan 15, 2024" in the user's locale. */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/** "Just now", "5 min ago", "3 hours ago", "Yesterday", "4 days ago", or a date. */
export function formatRelativeTime(dateString: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(dateString).getTime();
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

export function truncateString(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}...`;
}

/** "1 track", "28 tracks". */
export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function joinArtistNames(artists: { name: string }[]): string {
  return artists.map((a) => a.name).join(', ');
}

/** Quotes a CSV field when it contains a delimiter, quote, or line break. */
export function escapeCSVValue(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function createCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCSVValue).join(',')).join('\n');
}

export function downloadFile(content: string, filename: string, mimeType = 'text/csv'): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Spotify playlist descriptions contain HTML entities (e.g. "&amp;"); return plain text. */
export function decodeHtmlEntities(text: string): string {
  return new DOMParser().parseFromString(text, 'text/html').documentElement.textContent ?? '';
}
