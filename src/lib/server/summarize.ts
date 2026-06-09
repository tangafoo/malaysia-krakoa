import { OPENAI_API_KEY } from '$env/static/private';
import { getServerSupabase } from './supabase';
import type { RankedComment } from '$lib/types';

export interface SummarySet {
	top_summary: string;
	controversial_summary: string;
	overall_summary: string;
	comments_analyzed: number;
	model: string;
}

const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are the Supreme Intelligence, the cosmic Kree oracle synthesising the collective voice of Marvel fans writing letters to Kevin Feige.

Speak with calm, slightly mystical authority — like a wise alien hive-mind reporting back. Be specific about themes, sentiments, and tensions you see in the messages. Don't quote messages verbatim. Don't moralize. Reference Marvel projects/characters when fans do.

You will return STRICT JSON with three keys: top_summary, controversial_summary, overall_summary. Each value: 2-4 sentences, ~280 chars max. No markdown, no emojis, no preamble.`;

interface CommentBrief {
	id: string;
	content: string;
	upvotes: number;
	downvotes: number;
	primary_flair: string | null;
	secondary_flair: string | null;
}

function briefList(rows: CommentBrief[]): string {
	return rows
		.map((r, i) => {
			const score = `+${r.upvotes}/-${r.downvotes}`;
			const flair = [r.primary_flair, r.secondary_flair].filter(Boolean).join('+') || '—';
			return `${i + 1}. [${score} · ${flair}] ${r.content}`;
		})
		.join('\n');
}

function toBrief(c: RankedComment): CommentBrief {
	return {
		id: c.id,
		content: c.content,
		upvotes: c.upvotes,
		downvotes: c.downvotes,
		primary_flair: c.primary_flair,
		secondary_flair: c.secondary_flair
	};
}

export async function generateSummaries(): Promise<SummarySet | null> {
	if (!OPENAI_API_KEY) {
		console.warn('[summarize] OPENAI_API_KEY missing — skipping');
		return null;
	}

	const supabase = getServerSupabase();

	const [topRes, controversialRes, recentRes] = await Promise.all([
		supabase.from('ranked_comments').select('*').order('hot_score', { ascending: false }).limit(3),
		supabase
			.from('ranked_comments')
			.select('*')
			.order('controversy_score', { ascending: false })
			.limit(5),
		supabase.from('ranked_comments').select('*').order('created_at', { ascending: false }).limit(50)
	]);

	const top = ((topRes.data ?? []) as RankedComment[]).map(toBrief);
	const controversial = ((controversialRes.data ?? []) as RankedComment[]).map(toBrief);
	const recent = ((recentRes.data ?? []) as RankedComment[]).map(toBrief);

	if (recent.length === 0) {
		return null;
	}

	const userPrompt = [
		'TOP 3 (by hot score):',
		briefList(top) || '(none)',
		'',
		'MOST CONTROVERSIAL (by controversy score):',
		briefList(controversial) || '(none)',
		'',
		`OVERALL — RECENT ${recent.length} MESSAGES:`,
		briefList(recent)
	].join('\n');

	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: MODEL,
			temperature: 0.7,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt }
			]
		})
	});

	if (!res.ok) {
		console.error('[summarize] openai error', res.status, await res.text().catch(() => ''));
		return null;
	}

	const data = (await res.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const raw = data.choices?.[0]?.message?.content;
	if (!raw) return null;

	let parsed: { top_summary?: unknown; controversial_summary?: unknown; overall_summary?: unknown };
	try {
		parsed = JSON.parse(raw);
	} catch (e) {
		console.error('[summarize] bad json from openai', raw, e);
		return null;
	}

	const top_summary = typeof parsed.top_summary === 'string' ? parsed.top_summary.trim() : '';
	const controversial_summary =
		typeof parsed.controversial_summary === 'string' ? parsed.controversial_summary.trim() : '';
	const overall_summary =
		typeof parsed.overall_summary === 'string' ? parsed.overall_summary.trim() : '';

	if (!top_summary || !controversial_summary || !overall_summary) {
		console.error('[summarize] missing fields', parsed);
		return null;
	}

	return {
		top_summary,
		controversial_summary,
		overall_summary,
		comments_analyzed: recent.length,
		model: MODEL
	};
}

export interface StoredSummary {
	id: string;
	top_summary: string;
	controversial_summary: string;
	overall_summary: string;
	comments_analyzed: number;
	model: string;
	generated_at: string;
}

export async function getLatestSummary(): Promise<StoredSummary | null> {
	const supabase = getServerSupabase();
	const { data, error } = await supabase
		.from('comment_summaries')
		.select('*')
		.order('generated_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) {
		console.error('[summarize] fetch latest failed', error);
		return null;
	}
	return (data as StoredSummary | null) ?? null;
}
