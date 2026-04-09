import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas/auth';
import { fail, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import { DEMO_USERS } from '$lib/demo/data';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(loginSchema));
	return { form, isDemo: isDemoMode() };
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (isDemoMode()) {
			const { email } = form.data;
			if (email === DEMO_USERS.admin.email) {
				demoState.setCurrentUser(DEMO_USERS.admin.id);
			} else if (email === DEMO_USERS.player.email) {
				demoState.setCurrentUser(DEMO_USERS.player.id);
			} else {
				demoState.setCurrentUser(DEMO_USERS.captain.id);
			}
			redirect(303, '/');
		}

		const { email, password } = form.data;

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return message(form, 'Feil e-post eller passord', { status: 400 });
		}

		redirect(303, '/');
	},
	demoLogin: async ({ request }) => {
		if (!isDemoMode()) return fail(400);
		const formData = await request.formData();
		const role = formData.get('role') as string;

		if (role === 'admin') {
			demoState.setCurrentUser(DEMO_USERS.admin.id);
			redirect(303, '/admin');
		} else if (role === 'player') {
			demoState.setCurrentUser(DEMO_USERS.player.id);
		} else {
			demoState.setCurrentUser(DEMO_USERS.captain.id);
		}

		redirect(303, '/');
	}
};
