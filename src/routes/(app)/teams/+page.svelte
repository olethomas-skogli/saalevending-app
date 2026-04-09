<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	const statusLabels: Record<string, string> = {
		pending: 'Venter',
		qualified: 'Kvalifisert',
		waitlist: 'Venteliste',
		rejected: 'Avvist'
	};
</script>

<svelte:head>
	<title>Mine lag — Sålevending</title>
</svelte:head>

<Header title="Mine lag" />

<main class="mx-auto max-w-lg space-y-4 px-4 py-6">
	{#if data.memberships.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-center">
			<svg class="size-12 text-muted-foreground/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			<p class="text-muted-foreground">Du er ikke med på noe lag ennå</p>
			<p class="text-sm text-muted-foreground">Bli med via en invitasjonslenke eller meld på et lag i en turnering.</p>
		</div>
	{:else}
		{#each data.memberships as membership}
			{@const team = membership.teams}
			{#if team}
			<a href="/teams/{team.id}">
				<Card.Root class="transition-colors hover:bg-card/80">
					<Card.Content class="p-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<h3 class="font-semibold">{team.team_name}</h3>
									{#if membership.role === 'captain'}
										<Badge variant="outline" class="text-xs">Kaptein</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">
									{team.team_type === 'guttelag' ? 'Guttelag' : 'Jentelag'} · {team.age_group}
								</p>
								<p class="text-xs text-muted-foreground">{team.tournaments?.name ?? ''}</p>
							</div>
							<Badge
								variant={team.status === 'qualified' ? 'default' : 'secondary'}
							>
								{statusLabels[team.status] ?? team.status}
							</Badge>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
			{/if}
		{/each}
	{/if}
</main>
