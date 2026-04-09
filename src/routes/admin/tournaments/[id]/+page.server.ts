import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (isDemoMode()) {
		const tournament = demoState.getTournament(params.id);
		if (!tournament) error(404, 'Turneringen ble ikke funnet');

		const teams = demoState.getTeams(params.id);
		return { tournament, teams };
	}

	const { data: tournament } = await locals.supabase
		.from('tournaments')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!tournament) error(404, 'Turneringen ble ikke funnet');

	const { data: teams } = await locals.supabase
		.from('teams')
		.select(`
			*,
			profiles!teams_captain_id_fkey (
				full_name,
				phone,
				snapchat_username
			),
			team_members (count)
		`)
		.eq('tournament_id', params.id)
		.order('created_at', { ascending: true });

	return {
		tournament,
		teams: teams ?? []
	};
};

export const actions: Actions = {
	qualify: async ({ request, locals }) => {
		const formData = await request.formData();
		const teamIds = formData.getAll('team_ids') as string[];

		if (teamIds.length === 0) return fail(400, { error: 'Velg minst ett lag' });

		if (isDemoMode()) {
			for (const id of teamIds) {
				demoState.updateTeamStatus(id, 'qualified');
			}
			return { success: true, action: 'qualify' };
		}

		for (const id of teamIds) {
			await locals.supabase
				.from('teams')
				.update({ status: 'qualified' })
				.eq('id', id);
		}

		return { success: true, action: 'qualify' };
	},
	reject: async ({ request, locals }) => {
		const formData = await request.formData();
		const teamIds = formData.getAll('team_ids') as string[];

		if (isDemoMode()) {
			for (const id of teamIds) {
				demoState.updateTeamStatus(id, 'rejected');
			}
			return { success: true, action: 'reject' };
		}

		for (const id of teamIds) {
			await locals.supabase
				.from('teams')
				.update({ status: 'rejected' })
				.eq('id', id);
		}

		return { success: true, action: 'reject' };
	},
	waitlist: async ({ request, locals }) => {
		const formData = await request.formData();
		const teamIds = formData.getAll('team_ids') as string[];

		if (isDemoMode()) {
			for (const id of teamIds) {
				demoState.updateTeamStatus(id, 'waitlist');
			}
			return { success: true, action: 'waitlist' };
		}

		for (const id of teamIds) {
			await locals.supabase
				.from('teams')
				.update({ status: 'waitlist' })
				.eq('id', id);
		}

		return { success: true, action: 'waitlist' };
	},
	sendMessage: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const subject = formData.get('subject') as string;
		const body = formData.get('body') as string;
		const recipientIds = formData.getAll('recipient_ids') as string[];
		const broadcast = formData.get('broadcast') === 'true';

		if (!subject || !body) return fail(400, { error: 'Emne og melding er påkrevd' });

		const { user } = await locals.safeGetSession();

		if (isDemoMode()) {
			if (broadcast) {
				demoState.sendMessage({
					tournament_id: params.id,
					sender_id: user!.id,
					recipient_id: null,
					subject,
					body
				});
			} else {
				for (const recipientId of recipientIds) {
					demoState.sendMessage({
						tournament_id: params.id,
						sender_id: user!.id,
						recipient_id: recipientId,
						subject,
						body
					});
				}
			}
			return { success: true, action: 'message' };
		}

		if (broadcast) {
			await locals.supabase.from('messages').insert({
				tournament_id: params.id,
				sender_id: user!.id,
				recipient_id: null,
				subject,
				body
			});
		} else {
			for (const recipientId of recipientIds) {
				await locals.supabase.from('messages').insert({
					tournament_id: params.id,
					sender_id: user!.id,
					recipient_id: recipientId,
					subject,
					body
				});
			}
		}

		return { success: true, action: 'message' };
	}
};
