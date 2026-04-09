import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from '$lib/schemas/auth';
import { fail, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(registerSchema));
	return { form, isDemo: isDemoMode() };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email } = form.data;

		if (isDemoMode()) {
			const result = demoState.createUser(email);
			if (result.error) {
				return message(form, 'Denne e-postadressen er allerede registrert', { status: 400 });
			}
			// Skip verify step in demo — go straight to profile completion
			redirect(303, '/complete-profile');
		}

		const { error } = await locals.supabase.auth.signUp({
			email,
			password: form.data.password,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/verify`
			}
		});

		if (error) {
			if (error.message.includes('already registered')) {
				return message(form, 'Denne e-postadressen er allerede registrert', { status: 400 });
			}
			return message(form, 'Noe gikk galt. Prøv igjen.', { status: 500 });
		}

		redirect(303, '/verify');
	}
};
