import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { TeamMembership } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	if (isDemoMode()) {
		return { memberships: demoState.getUserMemberships(user.id) };
	}

	const { data: memberships } = await locals.supabase
		.from('team_members')
		.select(`
			role,
			teams (
				id,
				team_name,
				team_type,
				age_group,
				status,
				tournaments (
					name,
					event_date
				)
			)
		`)
		.eq('user_id', user.id)
		.order('joined_at', { ascending: false });

	return { memberships: (memberships ?? []) as unknown as TeamMembership[] };
};
