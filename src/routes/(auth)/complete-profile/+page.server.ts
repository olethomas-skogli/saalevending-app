import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { profileSchema } from '$lib/schemas/profile';
import { fail, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { OsloDistrict } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();
	const profileData = profile ? {
		full_name: profile.full_name ?? '',
		snapchat_username: profile.snapchat_username ?? undefined,
		phone: profile.phone ?? '',
		birth_date: profile.birth_date ?? '',
		bydel: (profile.bydel ?? undefined) as OsloDistrict | undefined
	} : undefined;
	const form = await superValidate(profileData, zod(profileSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(profileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { session } = await locals.safeGetSession();
		if (!session) {
			redirect(303, '/login');
		}

		if (isDemoMode()) {
			demoState.updateProfile(session.user.id, {
				full_name: form.data.full_name,
				snapchat_username: form.data.snapchat_username || null,
				phone: form.data.phone,
				birth_date: form.data.birth_date,
				bydel: form.data.bydel,
				profile_completed: true
			});
			redirect(303, '/');
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({
				full_name: form.data.full_name,
				snapchat_username: form.data.snapchat_username || null,
				phone: form.data.phone,
				birth_date: form.data.birth_date,
				bydel: form.data.bydel,
				profile_completed: true
			})
			.eq('id', session.user.id);

		if (error) {
			return message(form, 'Noe gikk galt. Prøv igjen.', { status: 500 });
		}

		redirect(303, '/');
	}
};
