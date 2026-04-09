import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { Tournament } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (isDemoMode()) {
		return { tournaments: demoState.getTournaments() };
	}

	const { data: tournaments } = await locals.supabase
		.from('tournaments')
		.select('*, teams(count)')
		.order('created_at', { ascending: false });

	return { tournaments: tournaments ?? [] };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const location = formData.get('location') as string;
		const eventDate = formData.get('event_date') as string;
		const registrationDeadline = formData.get('registration_deadline') as string;
		const maxTeams = parseInt(formData.get('max_teams') as string) || 64;
		const practicalInfo = formData.get('practical_info') as string;

		if (!name) return fail(400, { error: 'Navn er påkrevd' });

		if (isDemoMode()) {
			const { user } = await locals.safeGetSession();
			demoState.createTournament({
				name,
				description: description || null,
				location: location || null,
				event_date: eventDate || null,
				registration_deadline: registrationDeadline || null,
				max_teams: maxTeams,
				practical_info: practicalInfo || null,
				status: 'draft',
				created_by: user?.id ?? null
			});
			return { success: true };
		}

		const { user } = await locals.safeGetSession();

		const { error } = await locals.supabase.from('tournaments').insert({
			name,
			description: description || null,
			location: location || null,
			event_date: eventDate || null,
			registration_deadline: registrationDeadline || null,
			max_teams: maxTeams,
			practical_info: practicalInfo || null,
			status: 'draft',
			created_by: user?.id ?? null
		});

		if (error) return fail(500, { error: 'Kunne ikke opprette turneringen' });
		return { success: true };
	},
	updateStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const tournamentId = formData.get('tournament_id') as string;
		const status = formData.get('status') as string;

		if (isDemoMode()) {
			demoState.updateTournament(tournamentId, { status: status as Tournament['status'] });
			return { success: true };
		}

		await locals.supabase
			.from('tournaments')
			.update({ status })
			.eq('id', tournamentId);

		return { success: true };
	}
};
