import type { LayoutServerLoad } from './$types';
import { isDemoMode, demoState } from '$lib/demo';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:messages');

	const { user } = await locals.safeGetSession();

	if (!user) return { unreadMessages: 0 };

	if (isDemoMode()) {
		return { unreadMessages: demoState.getUnreadCount(user.id) };
	}

	const { count } = await locals.supabase
		.from('messages')
		.select('*', { count: 'exact', head: true })
		.eq('recipient_id', user.id)
		.eq('is_read', false);

	return { unreadMessages: count ?? 0 };
};
