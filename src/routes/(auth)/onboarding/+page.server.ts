import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from '$lib/schemas/auth';
import { profileSchema } from '$lib/schemas/profile';
import { teamRegistrationSchema } from '$lib/schemas/team';
import { fail, redirect } from '@sveltejs/kit';
import { isDemoMode, demoState } from '$lib/demo';
import type { TournamentWithCount } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	// In demo mode, reset to no user so onboarding starts fresh
	if (isDemoMode()) {
		demoState.setCurrentUser('');
	}

	const { session, profile } = await locals.safeGetSession();
	const pendingInvite = cookies.get('pending_invite') ?? null;

	// Get open tournaments
	let tournaments: TournamentWithCount[] = [];
	if (isDemoMode()) {
		tournaments = demoState.getTournaments({ statusIn: ['registration_open'] });
	} else {
		const { data } = await locals.supabase
			.from('tournaments')
			.select('id, name, event_date, location, max_teams, teams(count)')
			.eq('status', 'registration_open')
			.order('event_date', { ascending: true });
		tournaments = (data ?? []) as TournamentWithCount[];
	}

	// Auto-select if only one tournament
	const selectedTournament = tournaments.length === 1 ? tournaments[0] : null;

	return {
		tournaments,
		selectedTournament,
		isLoggedIn: !!session,
		isDemo: isDemoMode(),
		pendingInvite
	};
};

export const actions: Actions = {
	createAccount: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const consentGiven = formData.get('consent') === 'on';
		const parentalConsentGiven = formData.get('parental_consent') === 'on';

		if (!email || !email.includes('@')) {
			return fail(400, { step: 0, error: 'Ugyldig e-postadresse' });
		}
		if (!password || password.length < 8) {
			return fail(400, { step: 0, error: 'Passordet må ha minst 8 tegn' });
		}
		if (!consentGiven) {
			return fail(400, { step: 0, error: 'Du må godta personvernerklæringen' });
		}

		if (isDemoMode()) {
			const result = demoState.createUser(email);
			if (result.error) {
				return fail(400, { step: 0, error: 'Denne e-postadressen er allerede registrert' });
			}
			if (result.user) {
				demoState.updateProfile(result.user.id, {
					consent_given_at: new Date().toISOString(),
					parental_consent: parentalConsentGiven
				});
			}
			return { step: 0, success: true, userId: result.user?.id };
		}

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/onboarding`
			}
		});

		if (error) {
			if (error.message.includes('already registered')) {
				return fail(400, { step: 0, error: 'Denne e-postadressen er allerede registrert' });
			}
			return fail(500, { step: 0, error: 'Noe gikk galt. Prøv igjen.' });
		}

		return { step: 0, success: true };
	},

	completeProfile: async ({ request, locals }) => {
		const formData = await request.formData();
		const full_name = formData.get('full_name') as string;
		const snapchat_username = formData.get('snapchat_username') as string;
		const phone = formData.get('phone') as string;
		const birth_date = formData.get('birth_date') as string;
		const bydel = formData.get('bydel') as string;

		const errors: Record<string, string> = {};
		if (!full_name || full_name.length < 2) errors.full_name = 'Navn må ha minst 2 tegn';
		if (!phone || phone.length < 8) errors.phone = 'Telefonnummer må ha minst 8 siffer';
		if (!birth_date) errors.birth_date = 'Fødselsdato er påkrevd';
		if (!bydel) errors.bydel = 'Velg bydel';

		if (Object.keys(errors).length > 0) {
			return fail(400, { step: 1, errors });
		}

		const { session } = await locals.safeGetSession();
		if (!session) {
			return fail(401, { step: 1, error: 'Ikke innlogget' });
		}

		if (isDemoMode()) {
			demoState.updateProfile(session.user.id, {
				full_name,
				snapchat_username: snapchat_username || null,
				phone,
				birth_date,
				bydel,
				profile_completed: true
			});
			return { step: 1, success: true };
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({
				full_name,
				snapchat_username: snapchat_username || null,
				phone,
				birth_date,
				bydel,
				profile_completed: true
			})
			.eq('id', session.user.id);

		if (error) {
			return fail(500, { step: 1, error: 'Noe gikk galt. Prøv igjen.' });
		}

		return { step: 1, success: true };
	},

	registerTeam: async ({ request, locals }) => {
		const formData = await request.formData();
		const tournament_id = formData.get('tournament_id') as string;
		const team_name = formData.get('team_name') as string;
		const team_type = formData.get('team_type') as string;
		const age_group = formData.get('age_group') as string;
		const previous_participation = formData.get('previous_participation') === 'true';
		const bydel = formData.get('bydel') as string;
		const schools = formData.get('schools') as string;
		const club_players = formData.get('club_players') as string;
		const allergiesRaw = formData.get('allergies') as string;
		const allergies = allergiesRaw ? allergiesRaw.split(',').filter(Boolean) : [];
		const motivation = formData.get('motivation') as string;

		const errors: Record<string, string> = {};
		if (!team_name || team_name.length < 2) errors.team_name = 'Lagnavn må ha minst 2 tegn';
		if (!team_type) errors.team_type = 'Velg lagtype';
		if (!age_group) errors.age_group = 'Velg aldersgruppe';
		if (!bydel) errors.bydel = 'Velg bydel';
		if (!schools) errors.schools = 'Skriv inn skole(r)';
		if (!club_players) errors.club_players = 'Velg et alternativ';
		if (!tournament_id) errors.tournament_id = 'Ingen turnering valgt';

		if (Object.keys(errors).length > 0) {
			return fail(400, { step: 4, errors });
		}

		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { step: 4, error: 'Ikke innlogget' });
		}

		if (isDemoMode()) {
			const team = demoState.createTeam({
				tournament_id,
				captain_id: user.id,
				team_name,
				team_type: team_type as 'guttelag' | 'jentelag',
				age_group,
				previous_participation,
				bydel,
				schools,
				club_players: club_players as 'alle' | 'noen' | 'ingen',
				allergies,
				motivation: motivation || null
			});
			redirect(303, `/teams/${team.id}`);
		}

		const { data: team, error: insertError } = await locals.supabase
			.from('teams')
			.insert({
				tournament_id,
				captain_id: user.id,
				team_name,
				team_type: team_type as 'guttelag' | 'jentelag',
				age_group,
				previous_participation,
				bydel,
				schools,
				club_players: club_players as 'alle' | 'noen' | 'ingen',
				allergies,
				motivation: motivation || null
			})
			.select('id')
			.single();

		if (insertError) {
			if (insertError.code === '23505') {
				return fail(400, { step: 4, error: 'Du har allerede meldt på et lag' });
			}
			return fail(500, { step: 4, error: 'Noe gikk galt. Prøv igjen.' });
		}

		redirect(303, `/teams/${team.id}`);
	}
};
