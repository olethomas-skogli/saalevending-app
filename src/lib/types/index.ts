import type { z } from 'zod';
import type { profileSchema } from '$lib/schemas/profile';
import type { teamRegistrationSchema } from '$lib/schemas/team';
import type { OSLO_DISTRICTS } from '$lib/schemas/profile';

// ============================================================
// Inferred from Zod schemas
// ============================================================

export type ProfileFormData = z.infer<typeof profileSchema>;
export type TeamFormData = z.infer<typeof teamRegistrationSchema>;
export type OsloDistrict = (typeof OSLO_DISTRICTS)[number];

// ============================================================
// Database row types (matching supabase/schema.sql)
// ============================================================

export interface Profile {
	id: string;
	full_name: string;
	snapchat_username: string | null;
	phone: string;
	birth_date: string | null;
	bydel: string;
	role: 'user' | 'admin';
	profile_completed: boolean;
	consent_given_at: string | null;
	parental_consent: boolean;
	created_at: string;
	updated_at: string;
	email?: string;
}

export interface Tournament {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	event_date: string | null;
	registration_deadline: string | null;
	max_teams: number;
	status: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed';
	practical_info: string | null;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface Team {
	id: string;
	tournament_id: string;
	captain_id: string;
	team_name: string;
	team_type: 'guttelag' | 'jentelag';
	age_group: string;
	previous_participation: boolean;
	bydel: string;
	schools: string;
	club_players: 'alle' | 'noen' | 'ingen';
	allergies: string[];
	motivation: string | null;
	invite_code: string;
	status: 'pending' | 'qualified' | 'waitlist' | 'rejected';
	created_at: string;
	updated_at: string;
}

export interface TeamMember {
	id: string;
	team_id: string;
	user_id: string;
	role: 'captain' | 'player';
	joined_at: string;
}

export interface Message {
	id: string;
	tournament_id: string | null;
	sender_id: string;
	recipient_id: string | null;
	subject: string;
	body: string;
	is_read: boolean;
	created_at: string;
}

// ============================================================
// Enriched types (with nested joins)
// ============================================================

export interface ProfileSummary {
	full_name: string;
	snapchat_username: string | null;
	phone: string;
}

export interface TournamentSummary {
	name: string;
	event_date: string | null;
}

export interface TournamentWithCount extends Tournament {
	teams: { count: number }[];
}

export interface TeamWithRelations extends Team {
	profiles: ProfileSummary | null;
	tournaments: TournamentSummary | null;
	team_members: [{ count: number }];
}

export interface TeamMemberWithProfile extends TeamMember {
	profiles: ProfileSummary | null;
}

export interface TeamMembership {
	role: 'captain' | 'player';
	team_id: string;
	teams: (Team & { tournaments: TournamentSummary | null }) | null;
}

export interface MessageWithRelations extends Message {
	profiles: { full_name: string } | null;
	tournaments: { name: string } | null;
}

export interface MessageWithSenderRecipient extends Message {
	sender: { full_name: string } | null;
	recipient: { full_name: string } | null;
	tournaments: { name: string } | null;
}
