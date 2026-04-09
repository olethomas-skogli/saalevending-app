import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { TeamMemberWithProfile } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	if (isDemoMode()) {
		const team = demoState.getTeam(params.id);
		if (!team) error(404, 'Laget ble ikke funnet');

		const members = demoState.getTeamMembers(params.id);
		const isCaptain = team.captain_id === user.id;
		const isMember = members.some((m) => m.user_id === user.id);
		const inviteUrl = `${url.origin}/join/${team.invite_code}`;

		return { team, members, isCaptain, isMember, inviteUrl };
	}

	const { data: team, error: teamError } = await locals.supabase
		.from('teams')
		.select(`
			*,
			tournaments (
				name,
				event_date,
				status
			)
		`)
		.eq('id', params.id)
		.single();

	if (teamError || !team) error(404, 'Laget ble ikke funnet');

	const { data: members } = await locals.supabase
		.from('team_members')
		.select(`
			id,
			user_id,
			role,
			joined_at,
			profiles (
				full_name,
				snapchat_username,
				phone
			)
		`)
		.eq('team_id', params.id)
		.order('role', { ascending: true });

	const isCaptain = team.captain_id === user.id;
	const isMember = members?.some((m) => m.user_id === user.id) ?? false;
	const inviteUrl = `${url.origin}/join/${team.invite_code}`;

	return {
		team,
		members: (members ?? []) as unknown as TeamMemberWithProfile[],
		isCaptain,
		isMember,
		inviteUrl
	};
};

export const actions: Actions = {
	removeMember: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const memberId = formData.get('member_id') as string;

		if (isDemoMode()) {
			demoState.removeTeamMember(memberId);
			return { success: true };
		}

		const { error: deleteError } = await locals.supabase
			.from('team_members')
			.delete()
			.eq('id', memberId);

		if (deleteError) error(500, 'Kunne ikke fjerne spilleren');
		return { success: true };
	},
	leaveTeam: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		if (isDemoMode()) {
			demoState.removeUserFromTeam(params.id, user.id);
			redirect(303, '/teams');
		}

		await locals.supabase
			.from('team_members')
			.delete()
			.eq('team_id', params.id)
			.eq('user_id', user.id);

		redirect(303, '/teams');
	}
};
