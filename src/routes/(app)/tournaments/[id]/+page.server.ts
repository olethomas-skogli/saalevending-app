import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	if (isDemoMode()) {
		const tournament = demoState.getTournament(params.id);
		if (!tournament) error(404, 'Turneringen ble ikke funnet');

		let existingTeam = null;
		if (user) {
			existingTeam = demoState.getTeamByCaptainAndTournament(user.id, params.id);
		}

		const teamCount = demoState.getTeamCount(params.id);

		return { tournament, existingTeam, teamCount };
	}

	const { data: tournament, error: tournamentError } = await locals.supabase
		.from('tournaments')
		.select('*')
		.eq('id', params.id)
		.single();

	if (tournamentError || !tournament) {
		error(404, 'Turneringen ble ikke funnet');
	}

	// Check if user already has a team in this tournament
	let existingTeam = null;
	if (user) {
		const { data } = await locals.supabase
			.from('teams')
			.select('id, team_name, status')
			.eq('tournament_id', params.id)
			.eq('captain_id', user.id)
			.single();
		existingTeam = data;
	}

	// Get registered teams count
	const { count: teamCount } = await locals.supabase
		.from('teams')
		.select('*', { count: 'exact', head: true })
		.eq('tournament_id', params.id);

	return {
		tournament,
		existingTeam,
		teamCount: teamCount ?? 0
	};
};
