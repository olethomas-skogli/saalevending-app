import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { TeamMembership } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user, profile } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/login');
	}

	if (profile && !profile.profile_completed) {
		redirect(303, '/complete-profile');
	}

	if (isDemoMode()) {
		const tournaments = demoState.getTournaments({ statusIn: ['registration_open', 'in_progress'] });
		const myTeams = demoState.getUserMemberships(user.id);
		const unreadMessages = demoState.getUnreadCount(user.id);

		return {
			tournaments,
			myTeams,
			unreadMessages,
			profile
		};
	}

	const { data: tournaments } = await locals.supabase
		.from('tournaments')
		.select('*')
		.in('status', ['registration_open', 'in_progress'])
		.order('event_date', { ascending: true });

	const { data: myTeams } = await locals.supabase
		.from('team_members')
		.select(`
			team_id,
			role,
			teams (
				id,
				team_name,
				team_type,
				status,
				tournament_id,
				tournaments (
					name,
					event_date
				)
			)
		`)
		.eq('user_id', user.id);

	const { count: unreadMessages } = await locals.supabase
		.from('messages')
		.select('*', { count: 'exact', head: true })
		.eq('recipient_id', user.id)
		.eq('is_read', false);

	return {
		tournaments: tournaments ?? [],
		myTeams: (myTeams ?? []) as unknown as TeamMembership[],
		unreadMessages: unreadMessages ?? 0,
		profile
	};
};
