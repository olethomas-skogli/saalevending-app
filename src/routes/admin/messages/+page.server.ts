import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ locals }) => {
	if (isDemoMode()) {
		const messages = demoState.getAllMessages();
		const tournaments = demoState.getTournaments().map((t) => ({ id: t.id, name: t.name }));
		return { messages, tournaments };
	}

	const { data: messages } = await locals.supabase
		.from('messages')
		.select(`
			*,
			sender:profiles!messages_sender_id_fkey (full_name),
			recipient:profiles!messages_recipient_id_fkey (full_name),
			tournaments (name)
		`)
		.order('created_at', { ascending: false })
		.limit(50);

	// Get tournaments for the send form
	const { data: tournaments } = await locals.supabase
		.from('tournaments')
		.select('id, name')
		.neq('status', 'completed')
		.order('created_at', { ascending: false });

	return {
		messages: messages ?? [],
		tournaments: tournaments ?? []
	};
};

export const actions: Actions = {
	broadcast: async ({ request, locals }) => {
		const formData = await request.formData();
		const tournamentId = formData.get('tournament_id') as string;
		const subject = formData.get('subject') as string;
		const body = formData.get('body') as string;

		if (!subject || !body) return fail(400, { error: 'Emne og melding er påkrevd' });

		const { user } = await locals.safeGetSession();

		if (isDemoMode()) {
			demoState.sendMessage({
				tournament_id: tournamentId || null,
				sender_id: user!.id,
				recipient_id: null,
				subject,
				body
			});
			return { success: true };
		}

		await locals.supabase.from('messages').insert({
			tournament_id: tournamentId || null,
			sender_id: user!.id,
			recipient_id: null,
			subject,
			body
		});

		return { success: true };
	}
};
