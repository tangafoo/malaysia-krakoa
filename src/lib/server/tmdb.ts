import { TMDB_API_KEY } from '$env/static/private';

export interface MCUSpotlight {
	tmdb_id: number | null;
	title: string;
	overview: string;
	poster_url: string | null;
	release_date: string;
	status: 'released' | 'upcoming';
}

const MARVEL_STUDIOS_COMPANY_ID = 420;

const FALLBACK_LATEST: MCUSpotlight = {
	tmdb_id: null,
	title: 'Thunderbolts*',
	overview:
		'A group of supervillains and anti-heroes are recruited for a black-ops mission. The reason this whole site exists.',
	poster_url: null,
	release_date: '2025-05-02',
	status: 'released'
};

const FALLBACK_UPCOMING: MCUSpotlight = {
	tmdb_id: null,
	title: 'Spider-Man: Brand New Day',
	overview:
		'Peter Parker swings into a new chapter as the friendly neighborhood Spider-Man faces fresh threats — and an identity-shattering reset.',
	poster_url: null,
	release_date: '2026-07-31',
	status: 'upcoming'
};

type TMDBMovie = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date: string;
};

async function fetchMarvel(extraParams: Record<string, string>): Promise<TMDBMovie | null> {
	const url = new URL('https://api.themoviedb.org/3/discover/movie');
	url.searchParams.set('api_key', TMDB_API_KEY);
	url.searchParams.set('with_companies', String(MARVEL_STUDIOS_COMPANY_ID));
	url.searchParams.set('page', '1');
	for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);
	const res = await fetch(url, { cf: { cacheTtl: 3600 } } as RequestInit);
	if (!res.ok) return null;
	const data = (await res.json()) as { results?: TMDBMovie[] };
	return data.results?.[0] ?? null;
}

function toSpotlight(movie: TMDBMovie, status: 'released' | 'upcoming'): MCUSpotlight {
	return {
		tmdb_id: movie.id,
		title: movie.title,
		overview: movie.overview,
		poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : null,
		release_date: movie.release_date,
		status
	};
}

/**
 * Returns [next upcoming, latest released] Marvel Studios films — upcoming first
 * so the home page features it.
 * Falls back to hardcoded entries if TMDB is unreachable.
 */
export async function getMCUSpotlights(): Promise<MCUSpotlight[]> {
	if (!TMDB_API_KEY) return [FALLBACK_UPCOMING, FALLBACK_LATEST];
	const today = new Date().toISOString().slice(0, 10);
	try {
		const [latest, upcoming] = await Promise.all([
			fetchMarvel({
				'primary_release_date.lte': today,
				sort_by: 'primary_release_date.desc'
			}),
			fetchMarvel({
				'primary_release_date.gte': today,
				sort_by: 'primary_release_date.asc'
			})
		]);
		// Sanity check: TMDB occasionally returns junk rows whose actual
		// release_date doesn't match the filter. Drop anything mismatched.
		const validLatest = latest && latest.release_date && latest.release_date <= today ? latest : null;
		const validUpcoming =
			upcoming && upcoming.release_date && upcoming.release_date >= today ? upcoming : null;
		return [
			validUpcoming ? toSpotlight(validUpcoming, 'upcoming') : FALLBACK_UPCOMING,
			validLatest ? toSpotlight(validLatest, 'released') : FALLBACK_LATEST
		];
	} catch {
		return [FALLBACK_UPCOMING, FALLBACK_LATEST];
	}
}
