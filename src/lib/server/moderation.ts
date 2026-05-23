import { OPENAI_API_KEY } from '$env/static/private';

export interface ModerationResult {
	flagged: boolean;
	categories: Record<string, boolean>;
	category_scores: Record<string, number>;
}

/**
 * Calls OpenAI moderation (free endpoint). Returns `flagged: false`
 * if the API errors so we degrade gracefully (comment still gets
 * stored as pending via the caller's fallback logic).
 */
export async function moderate(content: string): Promise<ModerationResult> {
	if (!OPENAI_API_KEY) {
		return { flagged: false, categories: {}, category_scores: {} };
	}
	try {
		const res = await fetch('https://api.openai.com/v1/moderations', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${OPENAI_API_KEY}`
			},
			body: JSON.stringify({ model: 'omni-moderation-latest', input: content })
		});
		if (!res.ok) return { flagged: false, categories: {}, category_scores: {} };
		const data = (await res.json()) as {
			results: Array<{
				flagged: boolean;
				categories: Record<string, boolean>;
				category_scores: Record<string, number>;
			}>;
		};
		const r = data.results?.[0];
		return r
			? { flagged: r.flagged, categories: r.categories, category_scores: r.category_scores }
			: { flagged: false, categories: {}, category_scores: {} };
	} catch {
		return { flagged: false, categories: {}, category_scores: {} };
	}
}
