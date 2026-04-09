// Realistic mock data for demo mode — all Norwegian context

export const DEMO_USERS = {
	admin: {
		id: 'a0000000-0000-0000-0000-000000000001',
		email: 'erik@saalevending.no',
		full_name: 'Erik Rosland',
		snapchat_username: 'erik_saale',
		phone: '+47 926 15 771',
		birth_date: '1990-03-15',
		bydel: 'Gamle Oslo',
		role: 'admin' as const,
		profile_completed: true,
		consent_given_at: '2026-01-10T10:00:00Z',
		parental_consent: false,
		created_at: '2026-01-10T10:00:00Z',
		updated_at: '2026-01-10T10:00:00Z'
	},
	captain: {
		id: 'a0000000-0000-0000-0000-000000000002',
		email: 'sara@gmail.com',
		full_name: 'Sara Ahmed',
		snapchat_username: 'sara_fotball',
		phone: '+47 412 34 567',
		birth_date: '2010-06-22',
		bydel: 'Stovner',
		role: 'user' as const,
		profile_completed: true,
		consent_given_at: '2026-02-15T14:30:00Z',
		parental_consent: true,
		created_at: '2026-02-15T14:30:00Z',
		updated_at: '2026-02-15T14:30:00Z'
	},
	player: {
		id: 'a0000000-0000-0000-0000-000000000003',
		email: 'ali@gmail.com',
		full_name: 'Ali Hassan',
		snapchat_username: 'ali_h',
		phone: '+47 987 65 432',
		birth_date: '2010-09-11',
		bydel: 'Grorud',
		role: 'user' as const,
		profile_completed: true,
		consent_given_at: '2026-02-18T09:00:00Z',
		parental_consent: true,
		created_at: '2026-02-18T09:00:00Z',
		updated_at: '2026-02-18T09:00:00Z'
	}
};

export const DEMO_ALL_PROFILES = [
	DEMO_USERS.admin,
	DEMO_USERS.captain,
	DEMO_USERS.player,
	{
		id: 'a0000000-0000-0000-0000-000000000004',
		email: 'fatima@outlook.com',
		full_name: 'Fatima Khalid',
		snapchat_username: 'fatima_k',
		phone: '+47 922 11 334',
		birth_date: '2011-01-05',
		bydel: 'Søndre Nordstrand',
		role: 'user' as const,
		profile_completed: true,
		consent_given_at: '2026-02-20T11:00:00Z',
		parental_consent: true,
		created_at: '2026-02-20T11:00:00Z',
		updated_at: '2026-02-20T11:00:00Z'
	},
	{
		id: 'a0000000-0000-0000-0000-000000000005',
		email: 'marcus@hotmail.com',
		full_name: 'Marcus Olsen',
		snapchat_username: 'marcusooo',
		phone: '+47 411 22 333',
		birth_date: '2009-11-30',
		bydel: 'Bjerke',
		role: 'user' as const,
		profile_completed: true,
		consent_given_at: '2026-02-22T16:45:00Z',
		parental_consent: false,
		created_at: '2026-02-22T16:45:00Z',
		updated_at: '2026-02-22T16:45:00Z'
	},
	{
		id: 'a0000000-0000-0000-0000-000000000006',
		email: 'linnea@gmail.com',
		full_name: 'Linnea Berg',
		snapchat_username: 'linnea.b',
		phone: '+47 955 66 778',
		birth_date: '2010-04-17',
		bydel: 'Grunerløkka',
		role: 'user' as const,
		profile_completed: true,
		consent_given_at: '2026-03-01T08:20:00Z',
		parental_consent: true,
		created_at: '2026-03-01T08:20:00Z',
		updated_at: '2026-03-01T08:20:00Z'
	},
	{
		id: 'a0000000-0000-0000-0000-000000000007',
		email: 'omar@gmail.com',
		full_name: 'Omar Yousef',
		snapchat_username: '',
		phone: '+47 400 11 222',
		birth_date: '2012-07-09',
		bydel: 'Alna',
		role: 'user' as const,
		profile_completed: false,
		consent_given_at: null,
		parental_consent: false,
		created_at: '2026-03-28T19:00:00Z',
		updated_at: '2026-03-28T19:00:00Z'
	}
];

export const DEMO_TOURNAMENTS = [
	{
		id: 't0000000-0000-0000-0000-000000000001',
		name: 'Vallhall Cup 2026',
		description:
			'Årets største gatafotball-turnering for ungdom! Kom og vis hva dere er gode for. Gratis mat og drikke til alle deltakere.',
		location: 'Vallhall Arena, Dronning Margretes Vei 11, 0663 Oslo',
		event_date: '2026-06-20T13:00:00Z',
		registration_deadline: '2026-06-15T23:59:00Z',
		max_teams: 64,
		status: 'registration_open',
		practical_info:
			'Oppmøte kl. 12:30\nTurneringen starter kl. 13:00\nFerdig ca. kl. 22:00\n\nMat: Gratis pølser, pizza og drikke hele dagen.\nRegler: 5 mot 5, 10 min kamper.\nHusk: Legg igjen verdisaker hjemme.',
		created_by: DEMO_USERS.admin.id,
		created_at: '2026-03-01T10:00:00Z',
		updated_at: '2026-03-01T10:00:00Z'
	},
	{
		id: 't0000000-0000-0000-0000-000000000002',
		name: 'Stovner Sommerturnering',
		description: 'Lokal sommerturnering på Stovner. Åpen for alle bydeler!',
		location: 'Stovner Idrettspark, Oslo',
		event_date: '2026-08-22T11:00:00Z',
		registration_deadline: '2026-08-15T23:59:00Z',
		max_teams: 32,
		status: 'draft',
		practical_info: 'Mer info kommer.',
		created_by: DEMO_USERS.admin.id,
		created_at: '2026-03-15T12:00:00Z',
		updated_at: '2026-03-15T12:00:00Z'
	},
	{
		id: 't0000000-0000-0000-0000-000000000003',
		name: 'Vinter Cup 2026',
		description: 'Innendørs turnering i vinterferien.',
		location: 'Grorud Idrettshall, Oslo',
		event_date: '2026-02-15T10:00:00Z',
		registration_deadline: '2026-02-10T23:59:00Z',
		max_teams: 16,
		status: 'completed',
		practical_info: null,
		created_by: DEMO_USERS.admin.id,
		created_at: '2026-01-20T09:00:00Z',
		updated_at: '2026-02-15T22:00:00Z'
	}
];

export const DEMO_TEAMS = [
	{
		id: 'tm000000-0000-0000-0000-000000000001',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		captain_id: DEMO_USERS.captain.id,
		team_name: 'Stovner Gutta',
		team_type: 'guttelag',
		age_group: '2010',
		previous_participation: true,
		bydel: 'Stovner',
		schools: 'Stovner skole, Haugenstua skole',
		club_players: 'noen',
		allergies: ['nøtter'],
		motivation: 'Vi har spilt sammen siden barneskolen og drømmer om å vinne!',
		invite_code: 'abc12345',
		status: 'qualified',
		created_at: '2026-03-10T15:00:00Z',
		updated_at: '2026-03-20T10:00:00Z'
	},
	{
		id: 'tm000000-0000-0000-0000-000000000002',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		captain_id: DEMO_ALL_PROFILES[3].id,
		team_name: 'Søndre Stars',
		team_type: 'jentelag',
		age_group: '2011',
		previous_participation: false,
		bydel: 'Søndre Nordstrand',
		schools: 'Holmlia skole',
		club_players: 'ingen',
		allergies: ['ingen'],
		motivation: 'Vi er nye, men vi er klare for å vise hva vi kan!',
		invite_code: 'def67890',
		status: 'pending',
		created_at: '2026-03-12T18:30:00Z',
		updated_at: '2026-03-12T18:30:00Z'
	},
	{
		id: 'tm000000-0000-0000-0000-000000000003',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		captain_id: DEMO_ALL_PROFILES[4].id,
		team_name: 'Bjerke Boys',
		team_type: 'guttelag',
		age_group: '2009',
		previous_participation: true,
		bydel: 'Bjerke',
		schools: 'Tveita skole',
		club_players: 'alle',
		allergies: ['gluten', 'laktose'],
		motivation: '',
		invite_code: 'ghi11223',
		status: 'pending',
		created_at: '2026-03-14T09:15:00Z',
		updated_at: '2026-03-14T09:15:00Z'
	},
	{
		id: 'tm000000-0000-0000-0000-000000000004',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		captain_id: DEMO_ALL_PROFILES[5].id,
		team_name: 'Løkka Queens',
		team_type: 'jentelag',
		age_group: '2010',
		previous_participation: false,
		bydel: 'Grunerløkka',
		schools: 'Grünerløkka skole, Sinsen skole',
		club_players: 'noen',
		allergies: ['vegan'],
		motivation: 'Vi elsker fotball og vil gjerne være med!',
		invite_code: 'jkl44556',
		status: 'waitlist',
		created_at: '2026-03-18T20:00:00Z',
		updated_at: '2026-03-25T14:00:00Z'
	}
];

export const DEMO_TEAM_MEMBERS = [
	// Stovner Gutta
	{
		id: 'mem00000-0000-0000-0000-000000000001',
		team_id: DEMO_TEAMS[0].id,
		user_id: DEMO_USERS.captain.id,
		role: 'captain',
		joined_at: '2026-03-10T15:00:00Z',
		profiles: { full_name: 'Sara Ahmed', snapchat_username: 'sara_fotball', phone: '+47 412 34 567' }
	},
	{
		id: 'mem00000-0000-0000-0000-000000000002',
		team_id: DEMO_TEAMS[0].id,
		user_id: DEMO_USERS.player.id,
		role: 'player',
		joined_at: '2026-03-11T10:00:00Z',
		profiles: { full_name: 'Ali Hassan', snapchat_username: 'ali_h', phone: '+47 987 65 432' }
	},
	{
		id: 'mem00000-0000-0000-0000-000000000003',
		team_id: DEMO_TEAMS[0].id,
		user_id: DEMO_ALL_PROFILES[6].id,
		role: 'player',
		joined_at: '2026-03-11T14:00:00Z',
		profiles: { full_name: 'Omar Yousef', snapchat_username: '', phone: '+47 400 11 222' }
	},
	// Søndre Stars
	{
		id: 'mem00000-0000-0000-0000-000000000004',
		team_id: DEMO_TEAMS[1].id,
		user_id: DEMO_ALL_PROFILES[3].id,
		role: 'captain',
		joined_at: '2026-03-12T18:30:00Z',
		profiles: { full_name: 'Fatima Khalid', snapchat_username: 'fatima_k', phone: '+47 922 11 334' }
	},
	// Bjerke Boys
	{
		id: 'mem00000-0000-0000-0000-000000000005',
		team_id: DEMO_TEAMS[2].id,
		user_id: DEMO_ALL_PROFILES[4].id,
		role: 'captain',
		joined_at: '2026-03-14T09:15:00Z',
		profiles: { full_name: 'Marcus Olsen', snapchat_username: 'marcusooo', phone: '+47 411 22 333' }
	},
	// Løkka Queens
	{
		id: 'mem00000-0000-0000-0000-000000000006',
		team_id: DEMO_TEAMS[3].id,
		user_id: DEMO_ALL_PROFILES[5].id,
		role: 'captain',
		joined_at: '2026-03-18T20:00:00Z',
		profiles: { full_name: 'Linnea Berg', snapchat_username: 'linnea.b', phone: '+47 955 66 778' }
	}
];

export const DEMO_MESSAGES = [
	{
		id: 'msg00000-0000-0000-0000-000000000001',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		sender_id: DEMO_USERS.admin.id,
		recipient_id: DEMO_USERS.captain.id,
		subject: 'Gratulerer — dere er kvalifisert!',
		body: 'Hei Sara!\n\nGratulerer! Stovner Gutta er kvalifisert til Vallhall Cup 2026.\n\nOppmøte kl. 12:30 på Vallhall Arena. Husk å ha med alle spillerne.\n\nMvh\nErik, Sålevending',
		is_read: false,
		created_at: '2026-03-20T10:30:00Z',
		profiles: { full_name: 'Erik Johansen' },
		tournaments: { name: 'Vallhall Cup 2026' }
	},
	{
		id: 'msg00000-0000-0000-0000-000000000002',
		tournament_id: DEMO_TOURNAMENTS[0].id,
		sender_id: DEMO_USERS.admin.id,
		recipient_id: null,
		subject: 'Viktig info om Vallhall Cup',
		body: 'Hei alle lagkapteiner!\n\nVi minner om påmeldingsfristen 15. juni. Sørg for at alle spillere er registrert.\n\nVi gleder oss!\n\nMvh Sålevending',
		is_read: true,
		created_at: '2026-03-15T08:00:00Z',
		profiles: { full_name: 'Erik Johansen' },
		tournaments: { name: 'Vallhall Cup 2026' }
	}
];

// Helper to build enriched team objects (with nested tournament/profile data)
export function getEnrichedTeams(tournamentId?: string) {
	let teams = DEMO_TEAMS;
	if (tournamentId) {
		teams = teams.filter((t) => t.tournament_id === tournamentId);
	}
	return teams.map((team) => ({
		...team,
		profiles: DEMO_ALL_PROFILES.find((p) => p.id === team.captain_id) ?? null,
		tournaments: DEMO_TOURNAMENTS.find((t) => t.id === team.tournament_id) ?? null,
		team_members: [{ count: DEMO_TEAM_MEMBERS.filter((m) => m.team_id === team.id).length }]
	}));
}

export function getTeamMembers(teamId: string) {
	return DEMO_TEAM_MEMBERS.filter((m) => m.team_id === teamId);
}
