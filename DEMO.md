# Demo Mode

Demo mode runs the entire application with in-memory mock data — no Supabase account, database, or internet connection needed.

## Quick Start

```bash
npm install
npm run dev
```

The `.env` file is pre-configured with `PUBLIC_DEMO_MODE=true`. Open [http://localhost:5173/login](http://localhost:5173/login).

## Important: State Resets on Restart

All demo data lives in memory. When you restart the dev server (`Ctrl+C` then `npm run dev`), everything resets:

- Any users you created are gone
- Any teams you registered are gone
- Any messages you sent are gone
- You start back as Sara Ahmed (the default user)

This is useful for presentations — you always start with a clean, predictable state.

## Demo Users

Three pre-made users are available via one-click buttons on the login page:

| User | Role | Redirects to | What You See |
|------|------|-------------|-------------|
| **Sara Ahmed** | Lagkaptein | `/` (home) | Team "Stovner Gutta" (qualified), 1 unread message, invite link |
| **Ali Hassan** | Spiller | `/` (home) | Team member view, can join teams via invite links |
| **Erik Rosland** | Admin | `/admin` | Full admin panel: dashboard, users, team qualification, messaging |

## Demo Walkthrough: Full Registration Flow

Go to `/onboarding` to see the complete user journey in 5 steps:

### Step 1 — Opprett konto
Enter any email and password (min 8 characters). Account is created instantly (no email verification in demo).

### Step 2 — Om deg
Fill in profile: full name, Snapchat (optional), phone, birth date, and bydel (Oslo district).

### Step 3 — Ditt lag
Name your team, choose Guttelag/Jentelag, and select age group (2007-2012). Vallhall Cup 2026 is auto-selected (only open tournament).

### Step 4 — Lagdetaljer
Fill team details: previous participation, bydel (auto-filled from profile), schools, club player count, and allergies (tappable multi-select).

### Step 5 — Bekreft og send inn
Review all entered data in a summary card. Add optional motivation text. Click "Meld pa lag" to submit.

After submission you land on the team page with an invite link ready to share.

## Demo Walkthrough: Admin Flow

1. Go to `/login`, click **Erik Rosland** (Admin) — redirects straight to `/admin`
2. See the dashboard: 7 users, 4 teams, 1 active tournament
3. Click **Turneringer** in bottom nav (mobile) or sidebar (desktop)
4. Click **Vallhall Cup 2026**
5. See all registered teams with checkboxes
6. Select teams > click **Kvalifiser** to mark as qualified
7. Click **Melding** to send a message to selected captains
8. Go to `/login`, switch to **Sara Ahmed** (captain) to see the message in her inbox

## Demo Data

### Tournaments

| Tournament | Status | Teams | Date |
|-----------|--------|-------|------|
| Vallhall Cup 2026 | Registration open | 4/64 | June 20, 2026 |
| Stovner Sommerturnering | Draft (not visible) | 0/32 | Aug 22, 2026 |
| Vinter Cup 2026 | Completed | 0/16 | Feb 15, 2026 |

### Teams (Vallhall Cup 2026)

| Team | Type | Captain | Bydel | Status |
|------|------|---------|-------|--------|
| Stovner Gutta | Guttelag | Sara Ahmed | Stovner | Qualified |
| Sondre Stars | Jentelag | Fatima Khalid | Sondre Nordstrand | Pending |
| Bjerke Boys | Guttelag | Marcus Olsen | Bjerke | Pending |
| Lokka Queens | Jentelag | Linnea Berg | Grunerløkka | Waitlist |

### All Users (7)

| Name | Bydel | Role | Profile |
|------|-------|------|---------|
| Erik Rosland | Gamle Oslo | Admin | Complete |
| Sara Ahmed | Stovner | User | Complete |
| Ali Hassan | Grorud | User | Complete |
| Fatima Khalid | Sondre Nordstrand | User | Complete |
| Marcus Olsen | Bjerke | User | Complete |
| Linnea Berg | Grunerløkka | User | Complete |
| Omar Yousef | Alna | User | Incomplete |

### Messages

| Subject | From | To | Read |
|---------|------|-----|------|
| Gratulerer — dere er kvalifisert! | Erik | Sara | Unread |
| Viktig info om Vallhall Cup | Erik | All captains | Read |

## Key Demo Routes

| Route | Description |
|-------|------------|
| `/login` | Login page with demo user buttons |
| `/onboarding` | Combined registration + team signup (5 steps) |
| `/` | Home dashboard |
| `/tournaments` | Browse tournaments |
| `/tournaments/{id}` | Tournament details |
| `/tournaments/{id}/register-team` | Standalone team registration |
| `/teams` | My teams |
| `/teams/{id}` | Team details with invite link |
| `/join/{code}` | Join team via invite |
| `/messages` | Message inbox |
| `/profile` | Edit profile + sign out |
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/tournaments` | Tournament management |
| `/admin/tournaments/{id}` | Team qualification + messaging |
| `/admin/messages` | Broadcast messaging |

## Presenting to Client

Recommended demo order:

1. **Start fresh** — restart dev server for clean state
2. **Show onboarding** — go to `/onboarding`, walk through all 5 steps creating a new user + team
3. **Show team page** — after registration, show the invite link and team details
4. **Show admin** — go to `/login`, click Erik Rosland, show the admin dashboard with the new team visible
5. **Qualify the team** — select the new team, click Kvalifiser, send a congratulations message
6. **Show captain inbox** — go to `/login`, switch to the captain user, show the message in their inbox

## Switching to Production

```env
# .env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_DEMO_MODE=false
```

All application code works identically — demo mode only swaps the data layer.
