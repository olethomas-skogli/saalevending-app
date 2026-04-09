import { createSupabaseServerClient } from '$lib/supabase/server';
import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { demoState } from '$lib/demo/state';

const isDemo = () => env.PUBLIC_DEMO_MODE === 'true';

export const handle: Handle = async ({ event, resolve }) => {
	if (isDemo()) {
		// Demo mode: use in-memory state instead of Supabase
		event.locals.supabase = null as any;
		event.locals.safeGetSession = async () => demoState.getSession() as Awaited<ReturnType<App.Locals['safeGetSession']>>;
	} else {
		const supabase = createSupabaseServerClient(event.cookies);
		event.locals.supabase = supabase;

		event.locals.safeGetSession = async () => {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (!session) {
				return { session: null, user: null, profile: null };
			}

			const {
				data: { user },
				error
			} = await supabase.auth.getUser();

			if (error || !user) {
				return { session: null, user: null, profile: null };
			}

			const { data: profile } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			return { session, user, profile };
		};
	}

	// Route protection
	const { session, user, profile } = await event.locals.safeGetSession();
	const path = event.url.pathname;

	// Demo mode: skip auth redirects for login/register/onboarding (they handle demo switching)
	if (isDemo() && (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/onboarding'))) {
		return resolve(event);
	}

	// Auth routes: redirect to home if already logged in
	if (path.startsWith('/register') || path.startsWith('/login') || path.startsWith('/verify')) {
		if (session && user) {
			if (profile && !profile.profile_completed) {
				if (!path.startsWith('/complete-profile')) {
					redirect(303, '/complete-profile');
				}
			} else if (!path.startsWith('/complete-profile')) {
				redirect(303, '/');
			}
		}
	}

	// Profile completion: redirect if not logged in
	if (path.startsWith('/complete-profile')) {
		if (!session || !user) {
			redirect(303, '/login');
		}
	}

	// Home page: redirect unauthenticated to onboarding
	if (path === '/') {
		if (!session || !user) {
			redirect(303, '/onboarding');
		}
		if (profile && !profile.profile_completed) {
			redirect(303, '/complete-profile');
		}
	}

	// Invite link: store code in cookie if not logged in, then redirect to onboarding
	if (path.startsWith('/join/')) {
		if (!session || !user) {
			const inviteCode = path.split('/join/')[1];
			if (inviteCode) {
				event.cookies.set('pending_invite', inviteCode, { path: '/', maxAge: 60 * 60 });
			}
			redirect(303, '/onboarding');
		}
		if (profile && !profile.profile_completed) {
			const inviteCode = path.split('/join/')[1];
			if (inviteCode) {
				event.cookies.set('pending_invite', inviteCode, { path: '/', maxAge: 60 * 60 });
			}
			redirect(303, '/complete-profile');
		}
	}

	// After login/register: check for pending invite and redirect
	if (path === '/' && session && user && profile?.profile_completed) {
		const pendingInvite = event.cookies.get('pending_invite');
		if (pendingInvite) {
			event.cookies.delete('pending_invite', { path: '/' });
			redirect(303, `/join/${pendingInvite}`);
		}
	}

	// Protected app routes: require auth + completed profile
	const protectedPaths = ['/tournaments', '/teams', '/join', '/messages', '/profile'];
	const isProtected = protectedPaths.some((p) => path.startsWith(p));

	if (isProtected) {
		if (!session || !user) {
			redirect(303, '/onboarding');
		}
		if (profile && !profile.profile_completed) {
			redirect(303, '/complete-profile');
		}
	}

	// Admin routes: require admin role
	if (path.startsWith('/admin')) {
		if (!session || !user) {
			redirect(303, '/login');
		}
		if (!profile || profile.role !== 'admin') {
			redirect(303, '/');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
