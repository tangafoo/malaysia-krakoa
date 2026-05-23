import quotes from './data/feige-quotes.json';

/**
 * Deterministic daily rotation — everyone sees the same quote on the same day,
 * so it's cacheable and consistent.
 */
export function quoteOfTheDay(now: Date = new Date()): { quote: string; source: string } {
	const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
	return quotes[dayIndex % quotes.length];
}
