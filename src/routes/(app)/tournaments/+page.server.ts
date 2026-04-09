import type { PageServerLoad } from './$types';
import { isDemoMode, demoState } from '$lib/demo';

export const load: PageServerLoad = async ({ locals }) => {
	if (isDemoMode()) {
		return { tournaments: demoState.getTournaments({ excludeDraft: true }) };
	}

	const { data: tournaments } = await locals.supabase
		.from('tournaments')
		.select('*, teams(count)')
		.neq('status', 'draft')
		.order('event_date', { ascending: true });

	return { tournaments: tournaments ?? [] };
};
