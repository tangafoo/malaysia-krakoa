import type { RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';
import { PUBLIC_SITE_URL } from '$env/static/public';

const SITE = PUBLIC_SITE_URL || 'https://marvelfansforfeige.com';

const STATIC_PAGES = [
	{ path: '', priority: '1.0', changefreq: 'hourly' },
	{ path: 'comments', priority: '0.9', changefreq: 'hourly' },
	{ path: 'about', priority: '0.7', changefreq: 'monthly' }
];

export const GET: RequestHandler = async () => {
	const supabase = getServerSupabase();
	const { data } = await supabase
		.from('comments')
		.select('id, created_at')
		.eq('status', 'approved')
		.order('created_at', { ascending: false })
		.limit(5000);

	const now = new Date().toISOString();
	const urls: string[] = [];

	for (const p of STATIC_PAGES) {
		urls.push(
			`<url><loc>${SITE}${p.path ? '/' + p.path : '/'}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
		);
	}

	for (const c of data ?? []) {
		urls.push(
			`<url><loc>${SITE}/comment/${c.id}</loc><lastmod>${c.created_at}</lastmod><priority>0.6</priority></url>`
		);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600'
		}
	});
};
