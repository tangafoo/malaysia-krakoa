import { TMDB_API_KEY } from '$env/static/private';

export interface MCUSpotlight {
	title: string;
	overview: string;
	poster_url: string | null;
	release_date: string;
}

const MARVEL_STUDIOS_COMPANY_ID = 420;

/**
 * Returns the most recently released Marvel Studios film.
 * Falls back to a hardcoded Thunderbolts* card if TMDB is unreachable.
 */
export async function getLatestMCU(): Promise<MCUSpotlight> {
	const fallback: MCUSpotlight = {
		title: 'Thunderbolts*',
		overview:
			'A group of supervillains and anti-heroes are recruited for a black-ops mission. The reason this whole site exists.',
		poster_url: null,
		release_date: '2025-05-02'
	};
	if (!TMDB_API_KEY) return fallback;
	try {
		const url = new URL('https://api.themoviedb.org/3/discover/movie');
		url.searchParams.set('api_key', TMDB_API_KEY);
		url.searchParams.set('with_companies', String(MARVEL_STUDIOS_COMPANY_ID));
		url.searchParams.set('sort_by', 'release_date.desc');
		url.searchParams.set('release_date.lte', new Date().toISOString().slice(0, 10));
		url.searchParams.set('page', '1');
		const res = await fetch(url, { cf: { cacheTtl: 3600 } } as RequestInit);
		if (!res.ok) return fallback;
		const data = (await res.json()) as {
			results?: Array<{
				title: string;
				overview: string;
				poster_path: string | null;
				release_date: string;
			}>;
		};
		const movie = data.results?.[0];
		if (!movie) return fallback;
		return {
			title: movie.title,
			overview: movie.overview,
			poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : null,
			release_date: movie.release_date
		};
	} catch {
		return fallback;
	}
}
