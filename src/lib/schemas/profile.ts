import { z } from 'zod';

const OSLO_DISTRICTS = [
	'Alna',
	'Bjerke',
	'Frogner',
	'Gamle Oslo',
	'Grunerløkka',
	'Grorud',
	'Nordre Aker',
	'Nordstrand',
	'Sagene',
	'St. Hanshaugen',
	'Stovner',
	'Søndre Nordstrand',
	'Ullern',
	'Vestre Aker',
	'Østensjø'
] as const;

export { OSLO_DISTRICTS };

export const profileSchema = z.object({
	full_name: z
		.string({ error: 'Navn er påkrevd' })
		.min(2, 'Navn må ha minst 2 tegn')
		.max(100, 'Navn kan ikke ha mer enn 100 tegn'),
	snapchat_username: z
		.string()
		.max(30, 'Snapchat-brukernavn kan ikke ha mer enn 30 tegn')
		.optional(),
	phone: z
		.string({ error: 'Telefonnummer er påkrevd' })
		.min(8, 'Telefonnummer må ha minst 8 siffer')
		.max(15, 'Ugyldig telefonnummer')
		.regex(/^[+\d\s-]+$/, 'Ugyldig telefonnummer'),
	birth_date: z
		.string({ error: 'Fødselsdato er påkrevd' })
		.min(1, 'Fødselsdato er påkrevd')
		.refine(
			(val) => {
				if (!val) return false;
				const date = new Date(val);
				if (isNaN(date.getTime())) return false;
				const now = new Date();
				const age = now.getFullYear() - date.getFullYear();
				return age >= 6 && age <= 25;
			},
			{ message: 'Du må være mellom 6 og 25 år' }
		),
	bydel: z.enum(OSLO_DISTRICTS, { error: 'Velg bydel' })
});

export type ProfileSchema = typeof profileSchema;
