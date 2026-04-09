import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user, profile } = await locals.safeGetSession();
	return { session, user, profile };
};
