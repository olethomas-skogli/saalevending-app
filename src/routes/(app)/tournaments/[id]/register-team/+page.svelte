<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { teamRegistrationSchema, AGE_GROUPS, ALLERGY_OPTIONS, CLUB_PLAYER_OPTIONS } from '$lib/schemas/team';
	import { OSLO_DISTRICTS } from '$lib/schemas/profile';
	import Header from '$lib/components/layout/Header.svelte';
	import StepIndicator from '$lib/components/forms/StepIndicator.svelte';
	import PillRadio from '$lib/components/forms/PillRadio.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { data } = $props();

	const steps = ['Laginfo', 'Detaljer', 'Send inn'];
	let currentStep = $state(0);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, message: formMessage } = superForm(data.form, {
		validators: zodClient(teamRegistrationSchema),
		dataType: 'json'
	});

	const ageGroupLabels: Record<string, string> = {
		'2012': '2012 (13-14 år)',
		'2011': '2011 (14-15 år)',
		'2010': '2010 (15-16 år)',
		'2009': '2009 (16-17 år)',
		'2008': '2008 (17-18 år)',
		'2007': '2007 (18-19 år)'
	};

	const allergyLabels: Record<string, string> = {
		gluten: 'Gluten',
		laktose: 'Laktose',
		nøtter: 'Nøtter',
		vegan: 'Vegan',
		ingen: 'Ingen allergier'
	};

	const clubPlayerLabels: Record<string, string> = {
		alle: 'Alle',
		noen: 'Noen',
		ingen: 'Ingen'
	};

	type AllergyOption = (typeof ALLERGY_OPTIONS)[number];

	function toggleAllergy(allergy: AllergyOption) {
		if (allergy === 'ingen') {
			$form.allergies = ['ingen'];
			return;
		}
		const filtered = $form.allergies.filter((a) => a !== 'ingen');
		if (filtered.includes(allergy)) {
			$form.allergies = filtered.filter((a) => a !== allergy);
		} else {
			$form.allergies = [...filtered, allergy];
		}
	}

	function canAdvance(): boolean {
		if (currentStep === 0) {
			return !!$form.team_name && !!$form.team_type && !!$form.age_group;
		}
		if (currentStep === 1) {
			return (
				$form.previous_participation !== undefined &&
				!!$form.bydel &&
				!!$form.schools &&
				!!$form.club_players
			);
		}
		return true;
	}
</script>

<svelte:head>
	<title>Meld på lag — {data.tournament.name}</title>
</svelte:head>

<Header title="Meld på lag" showBack />

<main class="mx-auto max-w-lg px-4 py-4">
	<StepIndicator {steps} {currentStep} />

	{#if $formMessage}
		<div class="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			{$formMessage}
		</div>
	{/if}

	<form method="POST" use:enhance class="mt-6 space-y-5">
		<!-- Step 1: Team Info -->
		{#if currentStep === 0}
			<div class="space-y-5">
				<!-- Captain info (read-only) -->
				<div class="rounded-lg bg-muted/50 p-3 space-y-1">
					<p class="text-xs font-medium text-muted-foreground">Lagkaptein</p>
					<p class="text-sm font-medium">{data.captainName}</p>
					<p class="text-xs text-muted-foreground">{data.captainPhone}</p>
				</div>

				<div class="space-y-2">
					<Label for="team_name">Lagnavn</Label>
					<Input
						id="team_name"
						name="team_name"
						placeholder="Skriv lagnavnet her"
						bind:value={$form.team_name}
					/>
					{#if $errors.team_name}
						<p class="text-sm text-destructive">{$errors.team_name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label>Lagtype</Label>
					<PillRadio
						name="team_type"
						options={[
							{ value: 'guttelag', label: 'Guttelag' },
							{ value: 'jentelag', label: 'Jentelag' }
						]}
						value={$form.team_type}
						onchange={(v) => ($form.team_type = v as 'guttelag' | 'jentelag')}
						error={$errors.team_type?.[0]}
					/>
				</div>

				<div class="space-y-2">
					<Label>Aldersgruppe (årskull)</Label>
					<PillRadio
						name="age_group"
						options={AGE_GROUPS.map((g) => ({ value: g, label: ageGroupLabels[g] ?? g }))}
						value={$form.age_group}
						onchange={(v) => ($form.age_group = v as (typeof AGE_GROUPS)[number])}
						columns={3}
						error={$errors.age_group?.[0]}
					/>
				</div>
			</div>
		{/if}

		<!-- Step 2: Details -->
		{#if currentStep === 1}
			<div class="space-y-5">
				<div class="space-y-2">
					<Label>Har dere vært med på Sålevending sine turneringer før?</Label>
					<PillRadio
						name="previous_participation"
						options={[
							{ value: 'true', label: 'Ja' },
							{ value: 'false', label: 'Nei' }
						]}
						value={String($form.previous_participation)}
						onchange={(v) => ($form.previous_participation = v === 'true')}
						error={$errors.previous_participation?.[0]}
					/>
				</div>

				<div class="space-y-2">
					<Label for="bydel">Bydel</Label>
					<select
						id="bydel"
						name="bydel"
						bind:value={$form.bydel}
						class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="" disabled>Velg bydel</option>
						{#each OSLO_DISTRICTS as district}
							<option value={district}>{district}</option>
						{/each}
					</select>
					{#if $errors.bydel}
						<p class="text-sm text-destructive">{$errors.bydel[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="schools">Hvilke skoler går dere på?</Label>
					<Input
						id="schools"
						name="schools"
						placeholder="F.eks. Stovner skole, Haugenstua skole"
						bind:value={$form.schools}
					/>
					{#if $errors.schools}
						<p class="text-sm text-destructive">{$errors.schools[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label>Hvor mange spiller i en fotballklubb?</Label>
					<PillRadio
						name="club_players"
						options={CLUB_PLAYER_OPTIONS.map((o) => ({ value: o, label: clubPlayerLabels[o] ?? o }))}
						value={$form.club_players}
						onchange={(v) => ($form.club_players = v as 'alle' | 'noen' | 'ingen')}
						columns={3}
						error={$errors.club_players?.[0]}
					/>
				</div>

				<div class="space-y-2">
					<Label>Har noen på laget allergier?</Label>
					<div class="grid grid-cols-2 gap-2">
						{#each ALLERGY_OPTIONS as allergy}
							<button
								type="button"
								class="flex min-h-12 items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all active:scale-[0.98] {$form.allergies.includes(allergy) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'}"
								onclick={() => toggleAllergy(allergy)}
							>
								{allergyLabels[allergy]}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Step 3: Review & Submit -->
		{#if currentStep === 2}
			<div class="space-y-5">
				<div class="space-y-2">
					<Label for="motivation">Hvorfor skal akkurat ditt lag få plass? (valgfritt)</Label>
					<Textarea
						id="motivation"
						name="motivation"
						placeholder="Fortell oss litt om laget ditt..."
						rows={4}
						bind:value={$form.motivation}
					/>
					{#if $errors.motivation}
						<p class="text-sm text-destructive">{$errors.motivation[0]}</p>
					{/if}
				</div>

				<!-- Summary -->
				<div class="rounded-lg border border-border p-4 space-y-3">
					<h3 class="text-sm font-semibold">Oppsummering</h3>
					<div class="grid grid-cols-2 gap-y-2 text-sm">
						<span class="text-muted-foreground">Lag:</span>
						<span class="font-medium">{$form.team_name}</span>

						<span class="text-muted-foreground">Type:</span>
						<span class="font-medium">{$form.team_type === 'guttelag' ? 'Guttelag' : 'Jentelag'}</span>

						<span class="text-muted-foreground">Årskull:</span>
						<span class="font-medium">{ageGroupLabels[$form.age_group] ?? $form.age_group}</span>

						<span class="text-muted-foreground">Bydel:</span>
						<span class="font-medium">{$form.bydel}</span>

						<span class="text-muted-foreground">Skole(r):</span>
						<span class="font-medium">{$form.schools}</span>

						<span class="text-muted-foreground">Kaptein:</span>
						<span class="font-medium">{data.captainName}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Navigation -->
		<div class="flex gap-3 pt-2">
			{#if currentStep > 0}
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					size="lg"
					onclick={() => (currentStep -= 1)}
				>
					Tilbake
				</Button>
			{/if}

			{#if currentStep < steps.length - 1}
				<Button
					type="button"
					class="flex-1"
					size="lg"
					disabled={!canAdvance()}
					onclick={() => (currentStep += 1)}
				>
					Neste
				</Button>
			{:else}
				<Button type="submit" class="flex-1" size="lg" disabled={$delayed}>
					{#if $delayed}
						Sender...
					{:else}
						Meld på lag
					{/if}
				</Button>
			{/if}
		</div>
	</form>
</main>
