export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
	id: string;
	name: string | null;
	content: string;
	status: CommentStatus;
	upvotes: number;
	downvotes: number;
	moderation_flags: Record<string, unknown> | null;
	submitter_hash: string;
	created_at: string;
}

export interface RankedComment extends Comment {
	hot_score: number;
	controversy_score: number;
}

export type SortKey = 'hot' | 'new' | 'top' | 'controversial';

export const SORT_LABELS: Record<SortKey, string> = {
	hot: 'Hot',
	new: 'New',
	top: 'Top',
	controversial: 'Controversial'
};
