import type { PageServerLoad } from './$types';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ locals }) => {
	if (isDemoMode()) {
		const { count: totalUsers } = demoState.getProfiles();
		const allTeams = demoState.getTeams();
		const activeTournaments = demoState.getTournaments({ statusIn: ['registration_open', 'in_progress'] });
		const recentTeams = allTeams.slice(0, 10);

		return {
			totalUsers,
			totalTeams: allTeams.length,
			activeTournaments,
			recentTeams
		};
	}

	// Total users
	const { count: totalUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true });

	// Total teams
	const { count: totalTeams } = await locals.supabase
		.from('teams')
		.select('*', { count: 'exact', head: true });

	// Active tournaments
	const { data: activeTournaments } = await locals.supabase
		.from('tournaments')
		.select('id, name, status, max_teams, teams(count)')
		.in('status', ['registration_open', 'in_progress']);

	// Recent registrations
	const { data: recentTeams } = await locals.supabase
		.from('teams')
		.select(`
			id,
			team_name,
			team_type,
			status,
			created_at,
			profiles!teams_captain_id_fkey (full_name),
			tournaments (name)
		`)
		.order('created_at', { ascending: false })
		.limit(10);

	return {
		totalUsers: totalUsers ?? 0,
		totalTeams: totalTeams ?? 0,
		activeTournaments: activeTournaments ?? [],
		recentTeams: recentTeams ?? []
	};
};
