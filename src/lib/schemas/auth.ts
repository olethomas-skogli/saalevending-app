import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string({ error: 'E-post er påkrevd' }).email('Ugyldig e-postadresse'),
	password: z
		.string({ error: 'Passord er påkrevd' })
		.min(8, 'Passordet må ha minst 8 tegn')
		.max(72, 'Passordet kan ikke ha mer enn 72 tegn')
});

export const loginSchema = z.object({
	email: z.string({ error: 'E-post er påkrevd' }).email('Ugyldig e-postadresse'),
	password: z.string({ error: 'Passord er påkrevd' }).min(1, 'Passord er påkrevd')
});

export const verifyOtpSchema = z.object({
	token: z
		.string({ error: 'Kode er påkrevd' })
		.length(6, 'Koden må være 6 siffer')
		.regex(/^\d+$/, 'Koden må kun inneholde tall')
});

export type RegisterSchema = typeof registerSchema;
export type LoginSchema = typeof loginSchema;
export type VerifyOtpSchema = typeof verifyOtpSchema;
