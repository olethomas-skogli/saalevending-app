import { z } from 'zod';
import { OSLO_DISTRICTS } from './profile';

export const AGE_GROUPS = ['2007', '2008', '2009', '2010', '2011', '2012'] as const;

export const ALLERGY_OPTIONS = ['gluten', 'laktose', 'nøtter', 'vegan', 'ingen'] as const;

export const CLUB_PLAYER_OPTIONS = ['alle', 'noen', 'ingen'] as const;

export const teamRegistrationSchema = z.object({
	team_name: z
		.string({ error: 'Lagnavn er påkrevd' })
		.min(2, 'Lagnavn må ha minst 2 tegn')
		.max(50, 'Lagnavn kan ikke ha mer enn 50 tegn'),
	team_type: z.enum(['guttelag', 'jentelag'], {
		error: 'Velg lagtype'
	}),
	age_group: z.enum(AGE_GROUPS, {
		error: 'Velg aldersgruppe'
	}),
	previous_participation: z.boolean({ error: 'Velg et alternativ' }),
	bydel: z.enum(OSLO_DISTRICTS, {
		error: 'Velg bydel'
	}),
	schools: z
		.string({ error: 'Skriv inn skole(r)' })
		.min(1, 'Skriv inn skole(r)')
		.max(200, 'Maks 200 tegn'),
	club_players: z.enum(CLUB_PLAYER_OPTIONS, {
		error: 'Velg et alternativ'
	}),
	allergies: z.array(z.enum(ALLERGY_OPTIONS)).default([]),
	motivation: z
		.string()
		.max(500, 'Maks 500 tegn')
		.optional()
});

export type TeamRegistrationSchema = typeof teamRegistrationSchema;
