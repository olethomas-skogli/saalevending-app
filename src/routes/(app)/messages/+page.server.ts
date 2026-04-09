import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { MessageWithRelations } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	if (isDemoMode()) {
		return { messages: demoState.getMessages(user.id) };
	}

	// Get direct messages
	const { data: directMessages } = await locals.supabase
		.from('messages')
		.select(`
			*,
			profiles!messages_sender_id_fkey (full_name)
		`)
		.eq('recipient_id', user.id)
		.order('created_at', { ascending: false });

	// Get broadcast messages for tournaments where user is a captain
	const { data: myTeams } = await locals.supabase
		.from('teams')
		.select('tournament_id')
		.eq('captain_id', user.id);

	const tournamentIds = myTeams?.map((t) => t.tournament_id) ?? [];

	let broadcastMessages: MessageWithRelations[] = [];
	if (tournamentIds.length > 0) {
		const { data } = await locals.supabase
			.from('messages')
			.select(`
				*,
				profiles!messages_sender_id_fkey (full_name)
			`)
			.is('recipient_id', null)
			.in('tournament_id', tournamentIds)
			.order('created_at', { ascending: false });
		broadcastMessages = data ?? [];
	}

	// Combine and sort
	const allMessages = [...(directMessages ?? []), ...broadcastMessages].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	return { messages: allMessages };
};

export const actions: Actions = {
	markRead: async ({ request, locals }) => {
		const formData = await request.formData();
		const messageId = formData.get('message_id') as string;

		if (isDemoMode()) {
			demoState.markMessageRead(messageId);
			return { success: true };
		}

		await locals.supabase
			.from('messages')
			.update({ is_read: true })
			.eq('id', messageId);

		return { success: true };
	}
};
