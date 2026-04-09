import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	if (isDemoMode()) {
		const team = demoState.getTeamByInviteCode(params.code);
		if (!team) error(404, 'Ugyldig invitasjonslenke');

		if (demoState.isTeamMember(team.id, user.id)) {
			redirect(303, `/teams/${team.id}`);
		}

		return { team };
	}

	const { data: team, error: teamError } = await locals.supabase
		.from('teams')
		.select(`
			id,
			team_name,
			team_type,
			age_group,
			tournament_id,
			tournaments (
				name,
				event_date
			)
		`)
		.eq('invite_code', params.code)
		.single();

	if (teamError || !team) error(404, 'Ugyldig invitasjonslenke');

	// Check if already a member
	const { data: existing } = await locals.supabase
		.from('team_members')
		.select('id')
		.eq('team_id', team.id)
		.eq('user_id', user.id)
		.single();

	if (existing) redirect(303, `/teams/${team.id}`);

	return { team };
};

export const actions: Actions = {
	join: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		if (isDemoMode()) {
			const team = demoState.getTeamByInviteCode(params.code);
			if (!team) error(404, 'Ugyldig invitasjonslenke');

			demoState.addTeamMember(team.id, user.id);
			redirect(303, `/teams/${team.id}`);
		}

		const { data: team } = await locals.supabase
			.from('teams')
			.select('id')
			.eq('invite_code', params.code)
			.single();

		if (!team) error(404, 'Ugyldig invitasjonslenke');

		const { error: joinError } = await locals.supabase
			.from('team_members')
			.insert({
				team_id: team.id,
				user_id: user.id,
				role: 'player'
			});

		if (joinError) {
			if (joinError.message.includes('already a member of another team')) {
				error(400, 'Du er allerede med på et annet lag i denne turneringen');
			}
			error(500, 'Kunne ikke bli med på laget. Prøv igjen.');
		}

		redirect(303, `/teams/${team.id}`);
	}
};
