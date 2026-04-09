<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('no-NO', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const statusLabels: Record<string, string> = {
		pending: 'Venter',
		qualified: 'Kvalifisert',
		waitlist: 'Venteliste',
		rejected: 'Avvist'
	};

	const statusColors: Record<string, string> = {
		qualified: 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]',
		pending: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		waitlist: 'bg-[var(--status-yellow-light-bg)] text-[var(--status-yellow-light)] border-[var(--status-yellow-light-border)]',
		rejected: 'bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]'
	};
</script>

<svelte:head>
	<title>Admin — Sålevending</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 px-4 py-5">
	<h1 class="text-xl font-bold">Dashboard</h1>

	<!-- Stats -->
	<div class="grid grid-cols-3 gap-2">
		<div class="rounded-lg border border-border bg-card p-4 text-center">
			<p class="text-3xl font-bold">{data.totalUsers}</p>
			<p class="text-xs text-muted-foreground mt-1">Brukere</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4 text-center">
			<p class="text-3xl font-bold">{data.totalTeams}</p>
			<p class="text-xs text-muted-foreground mt-1">Lag totalt</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4 text-center">
			<p class="text-3xl font-bold">{data.activeTournaments.length}</p>
			<p class="text-xs text-muted-foreground mt-1">Aktive</p>
		</div>
	</div>

	<!-- Active Tournaments -->
	{#if data.activeTournaments.length > 0}
		<section class="space-y-2">
			<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aktive turneringer</h2>
			{#each data.activeTournaments as t}
				<a href="/admin/tournaments/{t.id}">
					<Card.Root class="transition-colors hover:bg-card/80">
						<Card.Content class="flex items-center justify-between p-3">
							<div>
								<h3 class="text-sm font-medium">{t.name}</h3>
								<p class="text-xs text-muted-foreground">
									{t.teams?.[0]?.count ?? 0} / {t.max_teams} lag
								</p>
							</div>
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {t.status === 'registration_open' ? 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]' : 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]'}">
									{t.status === 'registration_open' ? 'Åpen' : 'Pågår'}
								</span>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</section>
	{/if}

	<!-- Recent Teams (cards on mobile, table on desktop) -->
	<section class="space-y-2">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Siste påmeldinger</h2>

		<!-- Mobile: card list -->
		<div class="space-y-2 md:hidden">
			{#each data.recentTeams as team}
				<Card.Root>
					<Card.Content class="p-3">
						<div class="flex items-start justify-between">
							<div class="space-y-0.5">
								<p class="text-sm font-medium">{team.team_name}</p>
								<p class="text-xs text-muted-foreground">{(team.profiles as { full_name: string } | null)?.full_name ?? '-'}</p>
								<p class="text-xs text-muted-foreground">{formatDate(team.created_at)}</p>
							</div>
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {statusColors[team.status] ?? ''}">
								{statusLabels[team.status] ?? team.status}
							</span>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Desktop: table -->
		<Card.Root class="hidden md:block">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">Lag</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Kaptein</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Turnering</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Status</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Dato</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentTeams as team}
							<tr class="border-b border-border/50">
								<td class="px-4 py-3 font-medium">{team.team_name}</td>
								<td class="px-4 py-3 text-muted-foreground">{(team.profiles as { full_name: string } | null)?.full_name ?? '-'}</td>
								<td class="px-4 py-3 text-muted-foreground">{(team.tournaments as { name: string } | null)?.name ?? '-'}</td>
								<td class="px-4 py-3">
									<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {statusColors[team.status] ?? ''}">
										{statusLabels[team.status] ?? team.status}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(team.created_at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Root>
	</section>
</div>
