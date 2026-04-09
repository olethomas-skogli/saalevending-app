<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	const tournamentColors: Record<string, string> = {
		registration_open: 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]',
		in_progress: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]'
	};

	const teamColors: Record<string, string> = {
		qualified: 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]',
		pending: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		waitlist: 'bg-[var(--status-yellow-light-bg)] text-[var(--status-yellow-light)] border-[var(--status-yellow-light-border)]',
		rejected: 'bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]'
	};

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('no-NO', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Hjem — Sålevending</title>
</svelte:head>

<Header />

<main class="mx-auto max-w-lg space-y-6 px-4 py-6">
	<!-- Welcome -->
	<div>
		<h2 class="text-2xl font-bold">
			Hei, {data.profile?.full_name?.split(' ')[0] ?? 'der'}!
		</h2>
		<p class="text-sm text-muted-foreground">Klar for neste turnering?</p>
	</div>

	<!-- Unread messages -->
	{#if data.unreadMessages > 0}
		<a href="/messages">
			<Card.Root class="border-primary/30 bg-primary/5 mb-4">
				<Card.Content class="flex items-center gap-3 m-2">
					<div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
						<svg class="size-5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<div class="flex-1">
						<p class="text-sm font-medium">
							{data.unreadMessages} ulest{data.unreadMessages === 1 ? '' : 'e'} melding{data.unreadMessages === 1 ? '' : 'er'}
						</p>
					</div>
					<svg class="size-4 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</Card.Content>
			</Card.Root>
		</a>
	{/if}

	<!-- Active Tournaments -->
	<section class="space-y-3">
		<h3 class="text-lg font-semibold">Aktive turneringer</h3>
		{#if data.tournaments.length === 0}
			<Card.Root>
				<Card.Content class="flex flex-col items-center gap-2 py-8 text-center">
					<svg class="size-10 text-muted-foreground/50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v1a4 4 0 01-4 4m-4 0a4 4 0 01-4-4V6a2 2 0 012-2h2m4 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0H8" />
					</svg>
					<p class="text-sm text-muted-foreground">Ingen aktive turneringer akkurat nå</p>
				</Card.Content>
			</Card.Root>
		{:else}
			{#each data.tournaments as tournament}
				<a href="/tournaments/{tournament.id}">
					<Card.Root class="transition-colors hover:bg-card/80">
						<Card.Content class="p-4">
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<h4 class="font-medium">{tournament.name}</h4>
									{#if tournament.event_date}
										<p class="text-sm text-muted-foreground">{formatDate(tournament.event_date)}</p>
									{/if}
									{#if tournament.location}
										<p class="text-xs text-muted-foreground">{tournament.location}</p>
									{/if}
								</div>
								<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 {tournamentColors[tournament.status] ?? ''}">
									{tournament.status === 'registration_open' ? 'Påmelding åpen' : 'Pågår'}
								</span>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		{/if}
	</section>

	<!-- My Teams -->
	<section class="space-y-3">
		<h3 class="text-lg font-semibold">Mine lag</h3>
		{#if data.myTeams.length === 0}
			<Card.Root>
				<Card.Content class="flex flex-col items-center gap-3 py-8 text-center">
					<svg class="size-10 text-muted-foreground/50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<p class="text-sm text-muted-foreground">Du er ikke med på noe lag ennå</p>
					{#if data.tournaments.some((t) => t.status === 'registration_open')}
						<Button href="/tournaments" variant="outline" size="sm">Se turneringer</Button>
					{/if}
				</Card.Content>
			</Card.Root>
		{:else}
			{#each data.myTeams as membership}
				{@const team = membership.teams}
				{#if team}
				<a href="/teams/{team.id}">
					<Card.Root class="transition-colors hover:bg-card/80">
						<Card.Content class="flex items-center justify-between p-4">
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<h4 class="font-medium">{team.team_name}</h4>
									{#if membership.role === 'captain'}
										<Badge variant="outline" class="text-xs">Kaptein</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">{team.tournaments?.name ?? ''}</p>
							</div>
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 {teamColors[team.status] ?? ''}">
								{team.status === 'qualified' ? 'Kvalifisert' : team.status === 'pending' ? 'Venter' : team.status === 'waitlist' ? 'Venteliste' : 'Avvist'}
							</span>
						</Card.Content>
					</Card.Root>
				</a>
				{/if}
			{/each}
		{/if}
	</section>
</main>
