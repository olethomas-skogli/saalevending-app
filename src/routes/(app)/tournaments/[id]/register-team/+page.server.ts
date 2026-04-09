import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { teamRegistrationSchema } from '$lib/schemas/team';
import { fail, redirect, error } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { OsloDistrict } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user, profile } = await locals.safeGetSession();

	if (!user) redirect(303, '/login');

	if (isDemoMode()) {
		const tournament = demoState.getTournament(params.id);
		if (!tournament) error(404, 'Turneringen ble ikke funnet');
		if (tournament.status !== 'registration_open') error(400, 'Påmelding er stengt');

		const deadlinePassed = tournament.registration_deadline
			? new Date(tournament.registration_deadline) < new Date()
			: false;
		if (deadlinePassed) error(400, 'Påmeldingsfristen er utløpt');

		const teamCount = demoState.getTeamCount(params.id);
		if (teamCount >= tournament.max_teams) error(400, 'Turneringen er full');

		const existing = demoState.getTeamByCaptainAndTournament(user.id, params.id);
		if (existing) redirect(303, `/teams/${existing.id}`);

		const form = await superValidate(zod(teamRegistrationSchema));
		if (profile?.bydel) {
			form.data.bydel = profile.bydel as OsloDistrict;
		}

		return {
			form,
			tournament,
			captainName: profile?.full_name ?? '',
			captainPhone: profile?.phone ?? ''
		};
	}

	// Check tournament exists and is open
	const { data: tournament } = await locals.supabase
		.from('tournaments')
		.select('id, name, status, max_teams, registration_deadline')
		.eq('id', params.id)
		.single();

	if (!tournament) error(404, 'Turneringen ble ikke funnet');
	if (tournament.status !== 'registration_open') error(400, 'Påmelding er stengt');

	const deadlinePassed = tournament.registration_deadline
		? new Date(tournament.registration_deadline) < new Date()
		: false;
	if (deadlinePassed) error(400, 'Påmeldingsfristen er utløpt');

	// Check team count
	const { count } = await locals.supabase
		.from('teams')
		.select('*', { count: 'exact', head: true })
		.eq('tournament_id', params.id);

	if ((count ?? 0) >= tournament.max_teams) error(400, 'Turneringen er full');

	// Check if captain already has a team
	const { data: existing } = await locals.supabase
		.from('teams')
		.select('id')
		.eq('tournament_id', params.id)
		.eq('captain_id', user.id)
		.single();

	if (existing) redirect(303, `/teams/${existing.id}`);

	const form = await superValidate(zod(teamRegistrationSchema));

	// Pre-fill bydel from profile
	if (profile?.bydel) {
		form.data.bydel = profile.bydel as OsloDistrict;
	}

	return {
		form,
		tournament,
		captainName: profile?.full_name ?? '',
		captainPhone: profile?.phone ?? ''
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod(teamRegistrationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		if (isDemoMode()) {
			const team = demoState.createTeam({
				tournament_id: params.id,
				captain_id: user.id,
				team_name: form.data.team_name,
				team_type: form.data.team_type,
				age_group: form.data.age_group,
				previous_participation: form.data.previous_participation,
				bydel: form.data.bydel,
				schools: form.data.schools,
				club_players: form.data.club_players,
				allergies: form.data.allergies,
				motivation: form.data.motivation || null
			});
			redirect(303, `/teams/${team.id}`);
		}

		const { data: team, error: insertError } = await locals.supabase
			.from('teams')
			.insert({
				tournament_id: params.id,
				captain_id: user.id,
				team_name: form.data.team_name,
				team_type: form.data.team_type,
				age_group: form.data.age_group,
				previous_participation: form.data.previous_participation,
				bydel: form.data.bydel,
				schools: form.data.schools,
				club_players: form.data.club_players,
				allergies: form.data.allergies,
				motivation: form.data.motivation || null
			})
			.select('id')
			.single();

		if (insertError) {
			if (insertError.message.includes('unique') || insertError.code === '23505') {
				return message(form, 'Du har allerede meldt på et lag i denne turneringen', {
					status: 400
				});
			}
			return message(form, 'Noe gikk galt. Prøv igjen.', { status: 500 });
		}

		redirect(303, `/teams/${team.id}`);
	}
};
