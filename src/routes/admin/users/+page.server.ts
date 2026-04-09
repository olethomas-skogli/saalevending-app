import type { Actions, PageServerLoad } from './$types';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ locals, url }) => {
	const search = url.searchParams.get('search') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const perPage = 25;

	if (isDemoMode()) {
		const { data: users, count } = demoState.getProfiles({ search: search || undefined, page, perPage });

		// Build memberships map: userId → team memberships with allergies
		const userMemberships: Record<string, { team_name: string; team_type: string; tournament_name: string; role: string; status: string; allergies: string[] }[]> = {};
		for (const user of users) {
			const memberships = demoState.getUserMemberships(user.id);
			userMemberships[user.id] = memberships.map((m) => {
				const team = m.teams;
				return {
					team_name: team?.team_name ?? '',
					team_type: team?.team_type ?? '',
					tournament_name: (team as Record<string, unknown>)?.tournaments ? ((team as Record<string, unknown>).tournaments as { name: string })?.name ?? '' : '',
					role: m.role,
					status: (team as Record<string, unknown>)?.status as string ?? '',
					allergies: ((team as Record<string, unknown>)?.allergies as string[]) ?? []
				};
			});
		}

		return { users, totalCount: count, currentPage: page, perPage, search, userMemberships };
	}

	let query = locals.supabase
		.from('profiles')
		.select('*', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range((page - 1) * perPage, page * perPage - 1);

	if (search) {
		query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
	}

	const { data: users, count } = await query;
	const userList = users ?? [];

	// Fetch team memberships for all visible users
	const userIds = userList.map((u) => u.id);
	const userMemberships: Record<string, { team_name: string; team_type: string; tournament_name: string; role: string; status: string; allergies: string[] }[]> = {};

	if (userIds.length > 0) {
		const { data: memberships } = await locals.supabase
			.from('team_members')
			.select(`
				user_id,
				role,
				teams (
					team_name,
					team_type,
					status,
					allergies,
					tournaments (name)
				)
			`)
			.in('user_id', userIds);

		for (const m of memberships ?? []) {
			const team = m.teams as unknown as Record<string, unknown> | null;
			if (!userMemberships[m.user_id]) userMemberships[m.user_id] = [];
			userMemberships[m.user_id].push({
				team_name: (team?.team_name as string) ?? '',
				team_type: (team?.team_type as string) ?? '',
				tournament_name: (team?.tournaments as { name: string })?.name ?? '',
				role: m.role,
				status: (team?.status as string) ?? '',
				allergies: (team?.allergies as string[]) ?? []
			});
		}
	}

	return {
		users: userList,
		totalCount: count ?? 0,
		currentPage: page,
		perPage,
		search,
		userMemberships
	};
};

export const actions: Actions = {
	verify: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('user_id') as string;

		if (isDemoMode()) {
			demoState.updateProfile(userId, { profile_completed: true });
			return { success: true };
		}

		await locals.supabase
			.from('profiles')
			.update({ profile_completed: true })
			.eq('id', userId);

		return { success: true };
	}
};
