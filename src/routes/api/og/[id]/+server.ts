import type { RequestHandler } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/server/supabase';

function escape(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const GET: RequestHandler = async ({ params }) => {
	const { ImageResponse } = await import('workers-og');
	const supabase = getServerSupabase();
	const { data } = await supabase
		.from('comments')
		.select('id, name, content, created_at')
		.eq('id', params.id!)
		.eq('status', 'approved')
		.maybeSingle();

	if (!data) {
		return new Response('Not found', { status: 404 });
	}

	const author = (data.name?.trim() || 'Anonymous Fan').slice(0, 60);
	const content = data.content.length > 240 ? data.content.slice(0, 237) + '…' : data.content;

	const html = `
		<div style="width: 1200px; height: 630px; display: flex; flex-direction: column; padding: 64px; background: linear-gradient(135deg, #050510 0%, #0a0a1f 50%, #1a0a1f 100%); position: relative; font-family: 'Inter', system-ui, sans-serif;">
			<div style="position: absolute; top: -150px; left: -150px; width: 500px; height: 500px; border-radius: 9999px; background: radial-gradient(circle, #dc2626 0%, transparent 70%); opacity: 0.6; filter: blur(80px);"></div>
			<div style="position: absolute; top: 100px; right: -100px; width: 400px; height: 400px; border-radius: 9999px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); opacity: 0.5; filter: blur(80px);"></div>
			<div style="position: absolute; bottom: -100px; left: 300px; width: 450px; height: 450px; border-radius: 9999px; background: radial-gradient(circle, #a855f7 0%, transparent 70%); opacity: 0.5; filter: blur(80px);"></div>

			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
				<div style="width: 32px; height: 32px; background: #dc2626; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px;">M</div>
				<div style="color: white; font-size: 22px; font-weight: 600; opacity: 0.9;">marvelfansforfeige.com</div>
			</div>

			<div style="display: flex; flex-direction: column; flex: 1; justify-content: center;">
				<div style="color: white; font-size: 56px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em;">
					“${escape(content)}”
				</div>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px;">
				<div style="color: #fbbf24; font-size: 28px; font-weight: 700;">— ${escape(author)}</div>
				<div style="color: rgba(255,255,255,0.6); font-size: 20px;">A fan letter for Kevin Feige</div>
			</div>
		</div>
	`;

	return new ImageResponse(html, {
		width: 1200,
		height: 630,
		headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400' }
	});
};
