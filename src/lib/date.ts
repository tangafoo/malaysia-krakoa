import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

/**
 * "May 12, 2026" — used for fixed events (movie release dates etc.)
 */
export function formatReleaseDate(input: string | Date): string {
	const d = typeof input === 'string' ? parseISO(input) : input;
	return format(d, 'MMMM d, yyyy');
}

/**
 * "3 hours ago" for recent (< 7d), else "May 12, 2026 · 4:32 PM".
 * Used for comment timestamps where freshness matters.
 */
export function formatCommentDate(input: string | Date): string {
	const d = typeof input === 'string' ? parseISO(input) : input;
	if (differenceInDays(new Date(), d) < 7) {
		return `${formatDistanceToNow(d, { addSuffix: true })}`;
	}
	return format(d, 'MMM d, yyyy · h:mm a');
}
