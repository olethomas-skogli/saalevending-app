import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { profileSchema } from '$lib/schemas/profile';
import { fail, redirect, json } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { OsloDistrict } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user, profile } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const profileData = {
		full_name: profile?.full_name ?? '',
		snapchat_username: profile?.snapchat_username ?? undefined,
		phone: profile?.phone ?? '',
		birth_date: profile?.birth_date ?? '',
		bydel: (profile?.bydel ?? undefined) as OsloDistrict | undefined
	};
	const form = await superValidate(profileData, zod(profileSchema));

	return { form, profile, email: user.email };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const form = await superValidate(request, zod(profileSchema));

		if (!form.valid) return fail(400, { form });

		const { session } = await locals.safeGetSession();
		if (!session) redirect(303, '/login');

		if (isDemoMode()) {
			demoState.updateProfile(session.user.id, {
				full_name: form.data.full_name,
				snapchat_username: form.data.snapchat_username || null,
				phone: form.data.phone,
				birth_date: form.data.birth_date,
				bydel: form.data.bydel
			});
			return message(form, 'Profil oppdatert!');
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({
				full_name: form.data.full_name,
				snapchat_username: form.data.snapchat_username || null,
				phone: form.data.phone,
				birth_date: form.data.birth_date,
				bydel: form.data.bydel
			})
			.eq('id', session.user.id);

		if (error) return message(form, 'Noe gikk galt. Prøv igjen.', { status: 500 });

		return message(form, 'Profil oppdatert!');
	},

	exportData: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		if (isDemoMode()) {
			const data = demoState.exportUserData(user.id);
			return { exportData: JSON.stringify(data, null, 2) };
		}

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		const { data: teams } = await locals.supabase
			.from('teams')
			.select('*')
			.eq('captain_id', user.id);

		const { data: memberships } = await locals.supabase
			.from('team_members')
			.select('*')
			.eq('user_id', user.id);

		const { data: messages } = await locals.supabase
			.from('messages')
			.select('*')
			.eq('recipient_id', user.id);

		const exportPayload = { profile, teams, memberships, messages };
		return { exportData: JSON.stringify(exportPayload, null, 2) };
	},

	deleteAccount: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		if (isDemoMode()) {
			demoState.deleteUser(user.id);
			redirect(303, '/login');
		}

		// Delete auth user — CASCADE will remove profile, teams, team_members
		const { error } = await locals.supabase.auth.admin.deleteUser(user.id);
		if (error) {
			// Fallback: delete profile directly (CASCADE handles the rest)
			await locals.supabase.from('profiles').delete().eq('id', user.id);
		}

		await locals.supabase.auth.signOut();
		redirect(303, '/login');
	},

	signOut: async ({ locals }) => {
		if (isDemoMode()) {
			demoState.setCurrentUser('');
			redirect(303, '/login');
		}

		await locals.supabase.auth.signOut();
		redirect(303, '/login');
	}
};
