<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import StepIndicator from '$lib/components/forms/StepIndicator.svelte';
	import PillRadio from '$lib/components/forms/PillRadio.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { OSLO_DISTRICTS } from '$lib/schemas/profile';
	import { AGE_GROUPS, ALLERGY_OPTIONS, CLUB_PLAYER_OPTIONS } from '$lib/schemas/team';

	let { data } = $props();

	const tournaments = $derived(data.tournaments);
	const selectedTournament = $derived(data.selectedTournament);

	let started = $state(false);
	const isInviteFlow = $derived(!!data.pendingInvite);

	const steps = $derived(isInviteFlow ? ['Konto', 'Om deg'] : ['Konto', 'Om deg', 'Ditt lag', 'Lagdetaljer', 'Bekreft']);
	let currentStep = $state(0);
	let loading = $state(false);
	let stepError = $state('');
	let fieldErrors = $state<Record<string, string>>({});

	$effect(() => {
		if (data.isLoggedIn) currentStep = 1;
		if (selectedTournament?.id) selectedTournamentId = selectedTournament.id;
	});

	// Step 1: Account
	let email = $state('');
	let password = $state('');

	// Step 2: Profile
	let consent = $state(false);
	let parentalConsent = $state(false);

	let full_name = $state('');
	let snapchat_username = $state('');
	let phone = $state('');
	let birth_date = $state('');
	let bydel = $state('');

	// Step 3-4: Team
	let selectedTournamentId = $state('');
	let team_name = $state('');
	let team_type = $state('');
	let age_group = $state('');
	let previous_participation = $state('');
	let team_bydel = $state('');
	let schools = $state('');
	let club_players = $state('');
	let allergies = $state<string[]>([]);
	let motivation = $state('');

	const ageGroupLabels: Record<string, string> = {
		'2012': '2012', '2011': '2011', '2010': '2010',
		'2009': '2009', '2008': '2008', '2007': '2007'
	};

	const allergyLabels: Record<string, string> = {
		gluten: 'Gluten', laktose: 'Laktose', nøtter: 'Nøtter', vegan: 'Vegan', ingen: 'Ingen'
	};

	const clubPlayerLabels: Record<string, string> = {
		alle: 'Alle', noen: 'Noen', ingen: 'Ingen'
	};

	function toggleAllergy(allergy: string) {
		if (allergy === 'ingen') {
			allergies = ['ingen'];
			return;
		}
		const filtered = allergies.filter((a) => a !== 'ingen');
		if (filtered.includes(allergy)) {
			allergies = filtered.filter((a) => a !== allergy);
		} else {
			allergies = [...filtered, allergy];
		}
	}

	function handleStepResult(result: Record<string, unknown>) {
		loading = false;
		stepError = '';
		fieldErrors = {};

		const r = result as { type: string; data?: { error?: string; errors?: Record<string, string>; success?: boolean }; location?: string };

		if (r.type === 'failure') {
			stepError = r.data?.error ?? '';
			fieldErrors = r.data?.errors ?? {};
			return;
		}

		if (r.type === 'success' && r.data?.success) {
			// After profile completion in invite flow, redirect to home (hooks will handle invite cookie)
			if (currentStep === 1 && isInviteFlow) {
				window.location.href = '/';
				return;
			}
			if (currentStep === 1 && !team_bydel && bydel) {
				team_bydel = bydel;
			}
			currentStep += 1;
		}

		if (r.type === 'redirect' && r.location) {
			goto(r.location);
		}
	}

	function goBack() {
		if (currentStep > 0) {
			stepError = '';
			fieldErrors = {};
			currentStep -= 1;
		}
	}

	function canAdvanceStep3(): boolean {
		return !!team_name && !!team_type && !!age_group;
	}

	function canAdvanceStep4(): boolean {
		return previous_participation !== '' && !!team_bydel && !!schools && !!club_players;
	}
</script>

<svelte:head>
	<title>Registrering — Sålevending</title>
</svelte:head>

{#if !started}
	<!-- Welcome screen -->
	<div class="flex flex-col items-center justify-center gap-8 py-12">
		{#if data.pendingInvite}
			<div class="rounded-lg border border-border bg-card px-4 py-3 text-center">
				<p class="text-sm font-medium">Du har blitt invitert til et lag</p>
				<p class="text-xs text-muted-foreground mt-1">Opprett en konto for å bli med</p>
			</div>
		{/if}

		<div class="text-center space-y-2">
			<h2 class="text-2xl font-bold">{data.pendingInvite ? 'Opprett konto' : 'Bli med på turnering'}</h2>
			<p class="text-sm text-muted-foreground max-w-xs mx-auto">
				{data.pendingInvite
					? 'Registrer deg for å bli med på laget du er invitert til.'
					: 'Registrer deg og meld på laget ditt til Sålevending sine fotballturneringer.'}
			</p>
		</div>

		<Button class="w-full max-w-xs" size="lg" onclick={() => (started = true)}>
			{data.pendingInvite ? 'Opprett konto' : 'Registrer lag'}
		</Button>

		<p class="text-center text-sm text-muted-foreground">
			Har du allerede en konto?
			<a href="/login" class="text-primary hover:underline">Logg inn</a>
		</p>
	</div>
{:else}
<div class="w-full max-w-md mx-auto">
	<StepIndicator {steps} {currentStep} />

	{#if stepError}
		<div class="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			{stepError}
		</div>
	{/if}

	<!-- Tournament banner -->
	{#if selectedTournament && currentStep >= 2}
		<div class="mt-4 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-center">
			<p class="text-xs text-muted-foreground">Påmelding til</p>
			<p class="text-sm font-semibold text-primary">{selectedTournament.name}</p>
		</div>
	{/if}

	<div class="mt-6">
		<!-- STEP 0: Account -->
		{#if currentStep === 0}
			<form
				method="POST"
				action="?/createAccount"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						handleStepResult(result);
						if (result.type === 'failure') await update({ reset: false });
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="email">E-post</Label>
					<Input id="email" name="email" type="email" placeholder="din@epost.no" autocomplete="email" required bind:value={email} />
					{#if fieldErrors.email}<p class="text-sm text-destructive">{fieldErrors.email}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="password">Passord</Label>
					<Input id="password" name="password" type="password" placeholder="Minst 8 tegn" autocomplete="new-password" required bind:value={password} />
					{#if fieldErrors.password}<p class="text-sm text-destructive">{fieldErrors.password}</p>{/if}
				</div>

				<div class="space-y-3 rounded-lg border border-border bg-card p-3">
					<label class="flex items-start gap-3 cursor-pointer">
						<input type="checkbox" name="consent" bind:checked={consent} class="mt-1 size-4 rounded border-border accent-primary" />
						<span class="text-xs text-muted-foreground leading-relaxed">
							Jeg samtykker til at Sålevending samler inn og behandler mine personopplysninger
							i henhold til <a href="/personvern" target="_blank" class="text-primary hover:underline">personvernerklæringen</a>,
							inkludert helseopplysninger (allergier) for å sikre trygg mat under turneringer.
						</span>
					</label>
					<label class="flex items-start gap-3 cursor-pointer">
						<input type="checkbox" name="parental_consent" bind:checked={parentalConsent} class="mt-1 size-4 rounded border-border accent-primary" />
						<span class="text-xs text-muted-foreground leading-relaxed">
							Jeg bekrefter at mine foresatte har godkjent registreringen (påkrevd for under 16 år).
						</span>
					</label>
				</div>

				<Button type="submit" class="w-full" size="lg" disabled={loading || !consent}>
					{loading ? 'Oppretter...' : 'Neste'}
				</Button>

				<p class="text-center text-sm text-muted-foreground">
					Har du allerede en konto?
					<a href="/login" class="text-primary hover:underline">Logg inn</a>
				</p>
			</form>
		{/if}

		<!-- STEP 1: Profile -->
		{#if currentStep === 1}
			<form
				method="POST"
				action="?/completeProfile"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						handleStepResult(result);
						if (result.type === 'failure') await update({ reset: false });
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="full_name">Fullt navn</Label>
					<Input id="full_name" name="full_name" placeholder="Ola Nordmann" autocomplete="name" required bind:value={full_name} />
					{#if fieldErrors.full_name}<p class="text-sm text-destructive">{fieldErrors.full_name}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="snapchat_username">Snapchat (valgfritt)</Label>
					<Input id="snapchat_username" name="snapchat_username" placeholder="ditt_snap" bind:value={snapchat_username} />
				</div>

				<div class="space-y-2">
					<Label for="phone">Telefonnummer</Label>
					<Input id="phone" name="phone" type="tel" placeholder="+47 XXX XX XXX" autocomplete="tel" required bind:value={phone} />
					{#if fieldErrors.phone}<p class="text-sm text-destructive">{fieldErrors.phone}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="birth_date">Fødselsdato</Label>
					<Input id="birth_date" name="birth_date" type="date" required bind:value={birth_date} />
					{#if fieldErrors.birth_date}<p class="text-sm text-destructive">{fieldErrors.birth_date}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="bydel">Bydel</Label>
					<select
						id="bydel"
						name="bydel"
						required
						bind:value={bydel}
						class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="" disabled>Velg bydel</option>
						{#each OSLO_DISTRICTS as district}
							<option value={district}>{district}</option>
						{/each}
					</select>
					{#if fieldErrors.bydel}<p class="text-sm text-destructive">{fieldErrors.bydel}</p>{/if}
				</div>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" size="lg" onclick={goBack}>Tilbake</Button>
					<Button type="submit" class="flex-1" size="lg" disabled={loading}>
						{loading ? 'Lagrer...' : 'Neste'}
					</Button>
				</div>
			</form>
		{/if}

		<!-- STEP 2: Team Info -->
		{#if currentStep === 2}
			<div class="space-y-5">
				{#if tournaments.length > 1}
					<div class="space-y-2">
						<Label for="tournament">Velg turnering</Label>
						<select
							id="tournament"
							bind:value={selectedTournamentId}
							class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="" disabled>Velg turnering</option>
							{#each tournaments as t}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="space-y-2">
					<Label>Lagnavn</Label>
					<Input name="team_name" placeholder="Skriv lagnavnet her" bind:value={team_name} />
				</div>

				<div class="space-y-2">
					<Label>Lagtype</Label>
					<PillRadio
						name="team_type"
						options={[{ value: 'guttelag', label: 'Guttelag' }, { value: 'jentelag', label: 'Jentelag' }]}
						value={team_type}
						onchange={(v) => (team_type = v)}
					/>
				</div>

				<div class="space-y-2">
					<Label>Aldersgruppe (årskull)</Label>
					<PillRadio
						name="age_group"
						options={AGE_GROUPS.map((g) => ({ value: g, label: g }))}
						value={age_group}
						onchange={(v) => (age_group = v)}
						columns={3}
					/>
				</div>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" size="lg" onclick={goBack}>Tilbake</Button>
					<Button type="button" class="flex-1" size="lg" disabled={!canAdvanceStep3()} onclick={() => (currentStep = 3)}>
						Neste
					</Button>
				</div>
			</div>
		{/if}

		<!-- STEP 3: Team Details -->
		{#if currentStep === 3}
			<div class="space-y-5">
				<div class="space-y-2">
					<Label>Har dere vært med på Sålevending sine turneringer før?</Label>
					<PillRadio
						name="previous_participation"
						options={[{ value: 'true', label: 'Ja' }, { value: 'false', label: 'Nei' }]}
						value={previous_participation}
						onchange={(v) => (previous_participation = v)}
					/>
				</div>

				<div class="space-y-2">
					<Label for="team_bydel">Bydel (lagets)</Label>
					<select
						id="team_bydel"
						bind:value={team_bydel}
						class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="" disabled>Velg bydel</option>
						{#each OSLO_DISTRICTS as district}
							<option value={district}>{district}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="schools">Hvilke skoler går dere på?</Label>
					<Input id="schools" placeholder="F.eks. Stovner skole, Haugenstua skole" bind:value={schools} />
				</div>

				<div class="space-y-2">
					<Label>Hvor mange spiller i en fotballklubb?</Label>
					<PillRadio
						name="club_players"
						options={CLUB_PLAYER_OPTIONS.map((o) => ({ value: o, label: clubPlayerLabels[o] }))}
						value={club_players}
						onchange={(v) => (club_players = v)}
						columns={3}
					/>
				</div>

				<div class="space-y-2">
					<Label>Har noen på laget allergier?</Label>
					<div class="grid grid-cols-2 gap-2">
						{#each ALLERGY_OPTIONS as allergy}
							<button
								type="button"
								class="flex min-h-12 items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all active:scale-[0.98] {allergies.includes(allergy) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'}"
								onclick={() => toggleAllergy(allergy)}
							>
								{allergyLabels[allergy]}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" size="lg" onclick={goBack}>Tilbake</Button>
					<Button type="button" class="flex-1" size="lg" disabled={!canAdvanceStep4()} onclick={() => (currentStep = 4)}>
						Neste
					</Button>
				</div>
			</div>
		{/if}

		<!-- STEP 4: Review & Submit -->
		{#if currentStep === 4}
			<form
				method="POST"
				action="?/registerTeam"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						handleStepResult(result);
						if (result.type === 'failure') await update({ reset: false });
					};
				}}
				class="space-y-5"
			>
				<!-- Hidden fields for all team data -->
				<input type="hidden" name="tournament_id" value={selectedTournamentId} />
				<input type="hidden" name="team_name" value={team_name} />
				<input type="hidden" name="team_type" value={team_type} />
				<input type="hidden" name="age_group" value={age_group} />
				<input type="hidden" name="previous_participation" value={previous_participation} />
				<input type="hidden" name="bydel" value={team_bydel} />
				<input type="hidden" name="schools" value={schools} />
				<input type="hidden" name="club_players" value={club_players} />
				<input type="hidden" name="allergies" value={allergies.join(',')} />

				<div class="space-y-2">
					<Label for="motivation">Hvorfor skal akkurat ditt lag få plass? (valgfritt)</Label>
					<Textarea id="motivation" name="motivation" placeholder="Fortell oss litt om laget ditt..." rows={3} bind:value={motivation} />
				</div>

				<!-- Summary -->
				<Card.Root>
					<Card.Content class="p-4 space-y-3">
						<h3 class="text-sm font-semibold">Oppsummering</h3>
						<div class="grid grid-cols-2 gap-y-2 text-sm">
							<span class="text-muted-foreground">Kaptein:</span>
							<span class="font-medium">{full_name}</span>

							<span class="text-muted-foreground">Lag:</span>
							<span class="font-medium">{team_name}</span>

							<span class="text-muted-foreground">Type:</span>
							<span class="font-medium">{team_type === 'guttelag' ? 'Guttelag' : 'Jentelag'}</span>

							<span class="text-muted-foreground">Årskull:</span>
							<span class="font-medium">{age_group}</span>

							<span class="text-muted-foreground">Bydel:</span>
							<span class="font-medium">{team_bydel}</span>

							<span class="text-muted-foreground">Skole(r):</span>
							<span class="font-medium">{schools}</span>

							{#if allergies.length > 0 && !allergies.includes('ingen')}
								<span class="text-muted-foreground">Allergier:</span>
								<span class="font-medium">{allergies.map(a => allergyLabels[a]).join(', ')}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" size="lg" onclick={goBack}>Tilbake</Button>
					<Button type="submit" class="flex-1" size="lg" disabled={loading}>
						{loading ? 'Sender...' : 'Meld på lag'}
					</Button>
				</div>
			</form>
		{/if}
	</div>
</div>
{/if}
