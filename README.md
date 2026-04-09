# Saalevending — Tournament Registration Platform

A professional web application for [Saalevending](https://www.saalevending.no/) to manage youth football tournament registrations in Oslo. Built for kids aged 13-18 with a mobile-first, Spond-inspired UX.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit (Svelte 5) + TypeScript |
| Forms | Superforms + Zod 4 |
| UI Components | shadcn-svelte |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Font | Outfit (via Fontsource) |

## Features

### User-Facing
- Account registration with email/password
- Email OTP verification (2FA)
- Profile management (name, Snapchat, phone, birth date, bydel)
- Browse tournaments with details, dates, and registration status
- **Combined onboarding** (`/onboarding`): register account + profile + team in one 5-step flow
- Multi-step team registration with all 11 form fields
- Team management with invite links (shareable via Snapchat)
- Join teams via invite link (`/join/{code}`)
- Message inbox for admin communications

### Admin
- Dashboard with user/team/tournament stats
- User management with search, pagination, and verification
- Tournament CRUD with status lifecycle (draft > open > closed > in progress > completed)
- Team qualification: batch select, qualify, waitlist, or reject
- Direct and broadcast messaging to team captains

### Security
- Supabase Row Level Security (RLS) on all tables
- Duplicate team registration prevention (per captain per tournament)
- Multi-team prevention (player can't join two teams in same tournament)
- Tournament capacity enforcement (default 64 teams)
- Registration deadline enforcement
- Role-based route guards (user vs admin)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte components
│   │   ├── layout/       # BottomNav, Header, AdminSidebar
│   │   └── forms/        # StepIndicator, PillRadio
│   ├── schemas/          # Zod validation (auth, profile, team)
│   ├── supabase/         # Server/client helpers
│   └── demo/             # Demo mode state and mock data
├── routes/
│   ├── (auth)/           # Login, register, verify, profile, onboarding
│   ├── (app)/            # Home, tournaments, teams, messages, profile
│   └── admin/            # Dashboard, users, tournaments, messages
└── hooks.server.ts       # Auth, session, route guards
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd saalevending-app
npm install
```

### Demo Mode (no Supabase needed)

```bash
# .env is pre-configured with PUBLIC_DEMO_MODE=true
npm run dev
```

Open [http://localhost:5173/login](http://localhost:5173/login) and click any demo user button.

See [DEMO.md](DEMO.md) for full demo documentation.

### Production Mode (with Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor
3. Enable Email auth in Authentication > Providers
4. Update `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_DEMO_MODE=false
```

5. Create an admin user:
```sql
-- After signing up normally, promote to admin:
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

6. Run:
```bash
npm run dev
```

## Database Schema

5 tables with full RLS policies:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `tournaments` | Tournament lifecycle management |
| `teams` | Team registrations with all form fields |
| `team_members` | Player-team memberships |
| `messages` | Admin-to-captain communications |

3 database triggers:
- Auto-create profile on user signup
- Auto-add captain as team member on team creation
- Prevent player from joining multiple teams per tournament

See `supabase/schema.sql` for the complete schema.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type checking |

## User Flows

### Captain: Register + Create Team

```
/ → /onboarding (welcome screen)
  → "Registrer lag"
  → Step 1: Konto (email, password, consent, parental consent)
  → Step 2: Om deg (name, snap, phone, birth date, bydel)
  → Step 3: Ditt lag (team name, type, age group)
  → Step 4: Lagdetaljer (school, bydel, club status, allergies)
  → Step 5: Bekreft (review + submit)
  → /teams/[id] (team page with invite link)
```

### Player: Join Team via Invite Link

```
/join/[code] → not logged in
  → Cookie: pending_invite = [code]
  → /onboarding (welcome: "Du har blitt invitert til et lag")
  → "Opprett konto"
  → Step 1: Konto (email, password, consent)
  → Step 2: Om deg (profile)
  → Redirect to /
  → Hooks read cookie → redirect to /join/[code]
  → "Bli med på laget" confirmation
  → Joined → /teams/[id]
```

### Player: Join via Invite (Already Has Account)

```
/join/[code] → not logged in
  → Cookie set → /onboarding
  → "Har du allerede en konto? Logg inn" → /login
  → Login → /
  → Hooks read cookie → /join/[code]
  → "Bli med på laget" → /teams/[id]
```

### Admin: Qualify Teams + Message Captains

```
/login → Erik Rosland (Admin) → /admin
  → Turneringer → Vallhall Cup 2026
  → Select teams → Kvalifiser / Venteliste / Avvis
  → Send melding to selected captains
```

## Design

- **Theme**: Dark mode (#0a0a0a) + Saalevending black/white/grey
- **Mobile-first**: Bottom navigation, large touch targets (48px+), card-based UI
- **Spond-inspired**: Few clicks, minimal text, tappable pill buttons, multi-step forms
- **Norwegian UI**: All user-facing text in Norwegian, all code in English
- **Target audience**: Youth 13-18, designed for phone usage

## Language Convention

- All code (files, variables, functions, comments): **English**
- All user-facing text (labels, buttons, errors, headings): **Norwegian**
