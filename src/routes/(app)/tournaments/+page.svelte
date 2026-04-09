<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	const statusLabels: Record<string, string> = {
		registration_open: 'Påmelding åpen',
		registration_closed: 'Påmelding stengt',
		in_progress: 'Pågår',
		completed: 'Avsluttet'
	};

	const statusColors: Record<string, string> = {
		registration_open: 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]',
		registration_closed: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		in_progress: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		completed: 'bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]'
	};

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('no-NO', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Turneringer — Sålevending</title>
</svelte:head>

<Header title="Turneringer" />

<main class="mx-auto max-w-lg space-y-4 px-4 py-6">
	{#if data.tournaments.length === 0}
		<div class="flex flex-col items-center gap-2 py-16 text-center">
			<svg class="size-12 text-muted-foreground/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v1a4 4 0 01-4 4m-4 0a4 4 0 01-4-4V6a2 2 0 012-2h2m4 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0H8" />
			</svg>
			<p class="text-muted-foreground">Ingen turneringer tilgjengelig</p>
		</div>
	{:else}
		{#each data.tournaments as tournament}
			<a href="/tournaments/{tournament.id}">
				<Card.Root class="transition-colors hover:bg-card/80 m-4">
					<Card.Content class="p-4 space-y-3">
						<div class="flex items-start justify-between gap-3">
							<h3 class="font-semibold">{tournament.name}</h3>
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 {statusColors[tournament.status] ?? ''}">
								{statusLabels[tournament.status] ?? tournament.status}
							</span>
						</div>

						{#if tournament.description}
							<p class="text-sm text-muted-foreground line-clamp-2">{tournament.description}</p>
						{/if}

						<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
							{#if tournament.event_date}
								<span class="flex items-center gap-1">
									<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									{formatDate(tournament.event_date)}
								</span>
							{/if}
							{#if tournament.location}
								<span class="flex items-center gap-1">
									<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									{tournament.location}
								</span>
							{/if}
							<span>
								{tournament.teams?.[0]?.count ?? 0} / {tournament.max_teams} lag
							</span>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	{/if}
</main>
