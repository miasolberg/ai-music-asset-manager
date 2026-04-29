/**
 * Format a date string gracefully, returning "—" for null/empty/invalid dates
 * instead of "Invalid Date".
 */
export function formatDate(date: string | Date | null | undefined): string {
	if (!date) return '—';

	const d = date instanceof Date ? date : new Date(date);

	if (isNaN(d.getTime())) return '—';

	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}