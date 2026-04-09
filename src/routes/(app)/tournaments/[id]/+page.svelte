<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	let { data } = $props();

	const tournament = $derived(data.tournament);
	const existingTeam = $derived(data.existingTeam);
	const teamCount = $derived(data.teamCount);
	const isFull = $derived(teamCount >= tournament.max_teams);
	const isOpen = $derived(tournament.status === 'registration_open');
	const deadlinePassed = $derived(
		tournament.registration_deadline
			? new Date(tournament.registration_deadline) < new Date()
			: false
	);
	const canRegister = $derived(isOpen && !isFull && !deadlinePassed && !existingTeam);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('no-NO', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatTime(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleTimeString('no-NO', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{tournament.name} — Sålevending</title>
</svelte:head>

<Header title={tournament.name} showBack />

<main class="mx-auto max-w-lg space-y-6 px-4 py-6">
	<!-- Status -->
	<div class="flex items-center gap-2">
		<Badge variant={isOpen ? 'default' : 'secondary'}>
			{isOpen ? 'Påmelding åpen' : tournament.status === 'in_progress' ? 'Pågår' : 'Stengt'}
		</Badge>
		<span class="text-sm text-muted-foreground">{teamCount} / {tournament.max_teams} lag</span>
	</div>

	<!-- Details -->
	<Card.Root>
		<Card.Content class="space-y-4 p-4">
			{#if tournament.event_date}
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-muted">
						<svg class="size-5 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium">{formatDate(tournament.event_date)}</p>
						<p class="text-xs text-muted-foreground">kl. {formatTime(tournament.event_date)}</p>
					</div>
				</div>
			{/if}

			{#if tournament.location}
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-muted">
						<svg class="size-5 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium">{tournament.location}</p>
					</div>
				</div>
			{/if}

			{#if tournament.registration_deadline}
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-muted">
						<svg class="size-5 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium">Påmeldingsfrist</p>
						<p class="text-xs text-muted-foreground">{formatDate(tournament.registration_deadline)}</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if tournament.description}
		<Card.Root>
			<Card.Content class="p-4">
				<h3 class="mb-2 text-sm font-semibold">Om turneringen</h3>
				<p class="text-sm text-muted-foreground whitespace-pre-wrap">{tournament.description}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if tournament.practical_info}
		<Card.Root>
			<Card.Content class="p-4">
				<h3 class="mb-2 text-sm font-semibold">Praktisk info</h3>
				<p class="text-sm text-muted-foreground whitespace-pre-wrap">{tournament.practical_info}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- CTA -->
	<div class="sticky bottom-20 pt-2">
		{#if existingTeam}
			<Button href="/teams/{existingTeam.id}" class="w-full" size="lg">
				Se laget ditt: {existingTeam.team_name}
			</Button>
		{:else if canRegister}
			<Button href="/tournaments/{tournament.id}/register-team" class="w-full" size="lg">
				Meld på lag
			</Button>
		{:else if isFull}
			<Button disabled class="w-full" size="lg">Turneringen er full</Button>
		{:else if deadlinePassed}
			<Button disabled class="w-full" size="lg">Påmeldingsfristen er utløpt</Button>
		{:else}
			<Button disabled class="w-full" size="lg">Påmelding er stengt</Button>
		{/if}
	</div>
</main>
