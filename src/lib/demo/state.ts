// In-memory state for demo mode — persists during the server process lifetime
import {
	DEMO_USERS,
	DEMO_ALL_PROFILES,
	DEMO_TOURNAMENTS,
	DEMO_TEAMS,
	DEMO_TEAM_MEMBERS,
	DEMO_MESSAGES
} from './data';
import type { Profile, Tournament, Team, TeamMember, TeamMemberWithProfile, Message, MessageWithRelations, ProfileSummary } from '$lib/types';

// Mutable copies of demo data
let profiles: Profile[] = [...DEMO_ALL_PROFILES.map((p) => ({ ...p }))];
let tournaments: Tournament[] = [...DEMO_TOURNAMENTS.map((t) => ({ ...t }))] as Tournament[];
let teams: Team[] = [...DEMO_TEAMS.map((t) => ({ ...t }))] as Team[];
let teamMembers: (TeamMember & { profiles: ProfileSummary | null })[] = [...DEMO_TEAM_MEMBERS.map((m) => ({ ...m }))] as (TeamMember & { profiles: ProfileSummary | null })[];
let messages: (Message & { profiles: { full_name: string } | null; tournaments: { name: string } | null })[] = [...DEMO_MESSAGES.map((m) => ({ ...m }))];

// Current demo user (switchable)
let currentUserId: string = DEMO_USERS.captain.id;

export const demoState = {
	// Auth
	getCurrentUser() {
		return profiles.find((p) => p.id === currentUserId) ?? null;
	},
	getCurrentUserId() {
		return currentUserId;
	},
	setCurrentUser(userId: string) {
		currentUserId = userId;
	},
	getSession() {
		const user = this.getCurrentUser();
		if (!user) return { session: null, user: null, profile: null };
		return {
			session: { user: { id: user.id, email: user.email }, access_token: 'demo-token' },
			user: { id: user.id, email: user.email },
			profile: user
		};
	},

	// User creation (demo registration)
	createUser(email: string) {
		const existing = profiles.find((p) => p.email === email);
		if (existing) return { error: 'already registered', user: null };

		const id = `u${Date.now()}`;
		const newProfile = {
			id,
			email,
			full_name: '',
			snapchat_username: null as string | null,
			phone: '',
			birth_date: null as string | null,
			bydel: '',
			role: 'user' as const,
			profile_completed: false,
			consent_given_at: null as string | null,
			parental_consent: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		profiles.push(newProfile);
		currentUserId = id;
		return { error: null, user: newProfile };
	},
	getProfileByEmail(email: string) {
		return profiles.find((p) => p.email === email) ?? null;
	},
	deleteUser(userId: string) {
		// Remove all related data (mirrors CASCADE behavior)
		const userTeamIds = teams.filter((t) => t.captain_id === userId).map((t) => t.id);
		teams = teams.filter((t) => t.captain_id !== userId);
		teamMembers = teamMembers.filter((m) => m.user_id !== userId && !userTeamIds.includes(m.team_id));
		messages = messages.filter((m) => m.sender_id !== userId && m.recipient_id !== userId);
		profiles = profiles.filter((p) => p.id !== userId);
		if (currentUserId === userId) currentUserId = '';
	},
	exportUserData(userId: string) {
		const profile = profiles.find((p) => p.id === userId);
		const userTeams = teams.filter((t) => t.captain_id === userId);
		const userMemberships = teamMembers.filter((m) => m.user_id === userId);
		const userMessages = messages.filter((m) => m.recipient_id === userId);
		return { profile, teams: userTeams, memberships: userMemberships, messages: userMessages };
	},

	// Profiles
	getProfiles(options?: { search?: string; page?: number; perPage?: number }) {
		let result = [...profiles];
		if (options?.search) {
			const s = options.search.toLowerCase();
			result = result.filter(
				(p) =>
					p.full_name.toLowerCase().includes(s) || p.phone.includes(s)
			);
		}
		const total = result.length;
		if (options?.page && options?.perPage) {
			const start = (options.page - 1) * options.perPage;
			result = result.slice(start, start + options.perPage);
		}
		return { data: result, count: total };
	},
	getProfile(id: string) {
		return profiles.find((p) => p.id === id) ?? null;
	},
	updateProfile(id: string, data: Partial<(typeof profiles)[0]>) {
		const idx = profiles.findIndex((p) => p.id === id);
		if (idx >= 0) {
			profiles[idx] = { ...profiles[idx], ...data, updated_at: new Date().toISOString() };
		}
		return profiles[idx] ?? null;
	},

	// Tournaments
	getTournaments(options?: { excludeDraft?: boolean; statusIn?: string[] }) {
		let result = [...tournaments];
		if (options?.excludeDraft) {
			result = result.filter((t) => t.status !== 'draft');
		}
		if (options?.statusIn) {
			result = result.filter((t) => options.statusIn!.includes(t.status));
		}
		return result.map((t) => ({
			...t,
			teams: [{ count: teams.filter((tm) => tm.tournament_id === t.id).length }]
		}));
	},
	getTournament(id: string) {
		return tournaments.find((t) => t.id === id) ?? null;
	},
	createTournament(data: Omit<Tournament, 'id' | 'created_at' | 'updated_at'> & { status?: Tournament['status'] }) {
		const t = {
			id: `t${Date.now()}`,
			...data,
			status: data.status ?? 'draft',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		tournaments.push(t);
		return t;
	},
	updateTournament(id: string, data: Partial<(typeof tournaments)[0]>) {
		const idx = tournaments.findIndex((t) => t.id === id);
		if (idx >= 0) {
			tournaments[idx] = { ...tournaments[idx], ...data, updated_at: new Date().toISOString() };
		}
		return tournaments[idx] ?? null;
	},

	// Teams
	getTeams(tournamentId?: string) {
		let result = [...teams];
		if (tournamentId) {
			result = result.filter((t) => t.tournament_id === tournamentId);
		}
		return result.map((t) => ({
			...t,
			profiles: profiles.find((p) => p.id === t.captain_id) ?? null,
			tournaments: tournaments.find((tr) => tr.id === t.tournament_id) ?? null,
			team_members: [{ count: teamMembers.filter((m) => m.team_id === t.id).length }]
		}));
	},
	getTeam(id: string) {
		const t = teams.find((t) => t.id === id);
		if (!t) return null;
		return {
			...t,
			tournaments: tournaments.find((tr) => tr.id === t.tournament_id) ?? null
		};
	},
	getTeamByInviteCode(code: string) {
		const t = teams.find((t) => t.invite_code === code);
		if (!t) return null;
		return {
			...t,
			tournaments: tournaments.find((tr) => tr.id === t.tournament_id) ?? null
		};
	},
	getTeamByCaptainAndTournament(captainId: string, tournamentId: string) {
		return teams.find((t) => t.captain_id === captainId && t.tournament_id === tournamentId) ?? null;
	},
	getTeamCount(tournamentId: string) {
		return teams.filter((t) => t.tournament_id === tournamentId).length;
	},
	createTeam(data: Omit<Team, 'id' | 'invite_code' | 'status' | 'created_at' | 'updated_at'>) {
		const inviteCode = Math.random().toString(36).substring(2, 10);
		const t: Team = {
			id: `tm${Date.now()}`,
			...data,
			invite_code: inviteCode,
			status: 'pending' as const,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		teams.push(t);
		// Auto-add captain
		const captainProfile = profiles.find((p) => p.id === data.captain_id);
		teamMembers.push({
			id: `mem${Date.now()}`,
			team_id: t.id,
			user_id: data.captain_id,
			role: 'captain',
			joined_at: new Date().toISOString(),
			profiles: captainProfile
				? { full_name: captainProfile.full_name, snapchat_username: captainProfile.snapchat_username, phone: captainProfile.phone }
				: null
		});
		return t;
	},
	updateTeamStatus(teamId: string, status: Team['status']) {
		const idx = teams.findIndex((t) => t.id === teamId);
		if (idx >= 0) {
			teams[idx] = { ...teams[idx], status, updated_at: new Date().toISOString() };
		}
	},
	deleteTeam(id: string) {
		teams = teams.filter((t) => t.id !== id);
		teamMembers = teamMembers.filter((m) => m.team_id !== id);
	},

	// Team Members
	getTeamMembers(teamId: string) {
		return teamMembers.filter((m) => m.team_id === teamId);
	},
	getUserMemberships(userId: string) {
		return teamMembers
			.filter((m) => m.user_id === userId)
			.map((m) => {
				const team = teams.find((t) => t.id === m.team_id);
				return {
					...m,
					teams: team
						? {
								...team,
								tournaments: tournaments.find((tr) => tr.id === team.tournament_id) ?? null
							}
						: null
				};
			});
	},
	addTeamMember(teamId: string, userId: string) {
		const profile = profiles.find((p) => p.id === userId);
		const m = {
			id: `mem${Date.now()}`,
			team_id: teamId,
			user_id: userId,
			role: 'player' as const,
			joined_at: new Date().toISOString(),
			profiles: profile
				? { full_name: profile.full_name, snapchat_username: profile.snapchat_username, phone: profile.phone }
				: null
		};
		teamMembers.push(m);
		return m;
	},
	removeTeamMember(memberId: string) {
		teamMembers = teamMembers.filter((m) => m.id !== memberId);
	},
	removeUserFromTeam(teamId: string, userId: string) {
		teamMembers = teamMembers.filter((m) => !(m.team_id === teamId && m.user_id === userId));
	},
	isTeamMember(teamId: string, userId: string) {
		return teamMembers.some((m) => m.team_id === teamId && m.user_id === userId);
	},

	// Messages
	getMessages(userId: string) {
		// Direct + broadcast for captain's tournaments
		const captainTournamentIds = teams
			.filter((t) => t.captain_id === userId)
			.map((t) => t.tournament_id);

		return messages
			.filter(
				(m) =>
					m.recipient_id === userId ||
					(m.recipient_id === null && m.tournament_id !== null && captainTournamentIds.includes(m.tournament_id))
			)
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	},
	getAllMessages() {
		return [...messages].sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
	},
	getUnreadCount(userId: string) {
		return this.getMessages(userId).filter((m) => !m.is_read).length;
	},
	markMessageRead(messageId: string) {
		const idx = messages.findIndex((m) => m.id === messageId);
		if (idx >= 0) messages[idx] = { ...messages[idx], is_read: true };
	},
	sendMessage(data: { tournament_id: string | null; sender_id: string; recipient_id: string | null; subject: string; body: string }) {
		const m = {
			id: `msg${Date.now()}`,
			...data,
			is_read: false,
			created_at: new Date().toISOString(),
			profiles: profiles.find((p) => p.id === data.sender_id)
				? { full_name: profiles.find((p) => p.id === data.sender_id)!.full_name }
				: null,
			tournaments: tournaments.find((t) => t.id === data.tournament_id)
				? { name: tournaments.find((t) => t.id === data.tournament_id)!.name }
				: null
		};
		messages.push(m);
		return m;
	},

	// Reset to initial state
	reset() {
		profiles = [...DEMO_ALL_PROFILES.map((p) => ({ ...p }))] as Profile[];
		tournaments = [...DEMO_TOURNAMENTS.map((t) => ({ ...t }))] as Tournament[];
		teams = [...DEMO_TEAMS.map((t) => ({ ...t }))] as Team[];
		teamMembers = [...DEMO_TEAM_MEMBERS.map((m) => ({ ...m }))] as (TeamMember & { profiles: ProfileSummary | null })[];
		messages = [...DEMO_MESSAGES.map((m) => ({ ...m }))] as (Message & { profiles: { full_name: string } | null; tournaments: { name: string } | null })[];
		currentUserId = DEMO_USERS.captain.id;
	}
};
