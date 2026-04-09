<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let selectedTeams = $state<Set<string>>(new Set());
	let showMessage = $state(false);
	let filterStatus = $state('all');

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

	const statusIcons: Record<string, string> = {
		qualified: 'M5 13l4 4L19 7',
		pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		waitlist: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
		rejected: 'M6 18L18 6M6 6l12 12'
	};

	function toggleTeam(id: string) {
		const next = new Set(selectedTeams);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedTeams = next;
	}

	function selectAll() {
		selectedTeams = new Set(filteredTeams.map((t) => t.id));
	}

	function clearSelection() {
		selectedTeams = new Set();
	}

	$effect(() => {
		selectedTeams = new Set();
	});

	let filteredTeams = $derived(
		filterStatus === 'all'
			? data.teams
			: data.teams.filter((t) => t.status === filterStatus)
	);

	const qualifiedCount = $derived(data.teams.filter((t) => t.status === 'qualified').length);
	const pendingCount = $derived(data.teams.filter((t) => t.status === 'pending').length);
	const allSelected = $derived(filteredTeams.length > 0 && filteredTeams.every((t) => selectedTeams.has(t.id)));
</script>

<svelte:head>
	<title>{data.tournament.name} — Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-5 px-4 py-6">
	<!-- Header -->
	<div>
		<a href="/admin/tournaments" class="text-xs text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1">
			<svg class="size-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
			Tilbake
		</a>
		<h1 class="text-xl font-bold">{data.tournament.name}</h1>
		<div class="flex items-center gap-3 mt-1">
			<span class="text-xs text-muted-foreground">{data.teams.length} lag påmeldt</span>
			<span class="text-xs text-muted-foreground">·</span>
			<span class="text-xs text-[var(--status-green)]">{qualifiedCount} kvalifisert</span>
			<span class="text-xs text-muted-foreground">·</span>
			<span class="text-xs text-[var(--status-yellow)]">{pendingCount} venter</span>
			<span class="text-xs text-muted-foreground">·</span>
			<span class="text-xs text-muted-foreground">maks {data.tournament.max_teams}</span>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="space-y-1">
		<div class="h-2 rounded-full bg-muted overflow-hidden">
			<div
				class="h-full bg-green-500 transition-all"
				style="width: {Math.min(100, (qualifiedCount / data.tournament.max_teams) * 100)}%"
			></div>
		</div>
		<p class="text-xs text-muted-foreground text-right">{qualifiedCount} / {data.tournament.max_teams} plasser fylt</p>
	</div>

	<!-- Filter tabs -->
	<div class="flex gap-1.5 overflow-x-auto no-scrollbar">
		{#each [
			{ key: 'all', label: 'Alle', count: data.teams.length, color: '' },
			{ key: 'pending', label: 'Venter', count: data.teams.filter((t) => t.status === 'pending').length, color: 'text-[var(--status-yellow)]' },
			{ key: 'qualified', label: 'Kvalifisert', count: data.teams.filter((t) => t.status === 'qualified').length, color: 'text-[var(--status-green)]' },
			{ key: 'waitlist', label: 'Venteliste', count: data.teams.filter((t) => t.status === 'waitlist').length, color: 'text-[var(--status-yellow-light)]' },
			{ key: 'rejected', label: 'Avvist', count: data.teams.filter((t) => t.status === 'rejected').length, color: 'text-[var(--status-red)]' }
		] as tab}
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap {filterStatus === tab.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}"
				onclick={() => (filterStatus = tab.key)}
			>
				{tab.label}
				<span class="{filterStatus === tab.key ? 'text-background/60' : tab.color || 'text-muted-foreground'}">{tab.count}</span>
			</button>
		{/each}
	</div>

	<!-- Batch action bar (sticky) -->
	{#if selectedTeams.size > 0}
		<div class="sticky top-12 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium">{selectedTeams.size} lag valgt</p>
				<button class="text-xs text-muted-foreground hover:text-foreground" aria-label="Fjern valg" onclick={clearSelection}>
					Avbryt
				</button>
			</div>
			<div class="grid grid-cols-4 gap-1.5">
				<form method="POST" action="?/qualify" use:enhance={() => {
					return async ({ update }) => { toast.success('Kvalifisert!'); clearSelection(); await update(); };
				}}>
					{#each [...selectedTeams] as id}<input type="hidden" name="team_ids" value={id} />{/each}
					<button type="submit" class="flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--status-green-bg)] border border-[var(--status-green-border)] py-2 text-xs font-medium text-[var(--status-green)] hover:bg-[var(--status-green-bg)] transition-colors">
						<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
						Godkjenn
					</button>
				</form>
				<form method="POST" action="?/waitlist" use:enhance={() => {
					return async ({ update }) => { toast.info('Satt på venteliste'); clearSelection(); await update(); };
				}}>
					{#each [...selectedTeams] as id}<input type="hidden" name="team_ids" value={id} />{/each}
					<button type="submit" class="flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--status-yellow-light-bg)] border border-[var(--status-yellow-border)] py-2 text-xs font-medium text-[var(--status-yellow)] hover:bg-[var(--status-yellow-bg)] transition-colors">
						<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						Vent
					</button>
				</form>
				<form method="POST" action="?/reject" use:enhance={() => {
					return async ({ update }) => { toast.info('Avvist'); clearSelection(); await update(); };
				}}>
					{#each [...selectedTeams] as id}<input type="hidden" name="team_ids" value={id} />{/each}
					<button type="submit" class="flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--status-red-bg)] border border-[var(--status-red-border)] py-2 text-xs font-medium text-[var(--status-red)] hover:bg-[var(--status-red-bg)] transition-colors">
						<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
						Avvis
					</button>
				</form>
				<button
					class="flex w-full items-center justify-center gap-1 rounded-lg bg-muted py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => (showMessage = true)}
				>
					<svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
					Melding
				</button>
			</div>
		</div>
	{/if}

	<!-- Select all toggle -->
	<div class="flex items-center gap-2">
		<button
			class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
			onclick={() => allSelected ? clearSelection() : selectAll()}
		>
			<div class="flex size-4 items-center justify-center rounded border {allSelected ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'}">
				{#if allSelected}
					<svg class="size-3 text-background" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
				{/if}
			</div>
			{allSelected ? 'Fjern alle' : 'Velg alle'} ({filteredTeams.length})
		</button>
	</div>

	<!-- Team list -->
	{#if filteredTeams.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-center">
			<div class="flex size-14 items-center justify-center rounded-full bg-muted">
				<svg class="size-6 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<p class="text-sm text-muted-foreground">Ingen lag med denne statusen</p>
		</div>
	{:else}
		<div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
			{#each filteredTeams as team}
				{@const captain = team.profiles}
				{@const isSelected = selectedTeams.has(team.id)}
				<button
					type="button"
					class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors {isSelected ? 'bg-foreground/[0.04]' : 'hover:bg-muted/30'}"
					onclick={() => toggleTeam(team.id)}
				>
					<!-- Checkbox -->
					<div class="pt-0.5 shrink-0">
						<div class="flex size-5 items-center justify-center rounded border transition-colors {isSelected ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'}">
							{#if isSelected}
								<svg class="size-3 text-background" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
							{/if}
						</div>
					</div>

					<!-- Status icon -->
					<div class="shrink-0 pt-0.5">
						<div class="flex size-5 items-center justify-center rounded-full {statusColors[team.status]?.split(' ')[0] ?? 'bg-muted'}">
							<svg class="size-3 {statusColors[team.status]?.split(' ')[1] ?? 'text-muted-foreground'}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d={statusIcons[team.status] ?? ''} />
							</svg>
						</div>
					</div>

					<!-- Team info -->
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between gap-2">
							<p class="text-sm font-medium truncate">{team.team_name}</p>
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 {statusColors[team.status] ?? ''}">
								{statusLabels[team.status]}
							</span>
						</div>
						<div class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
							<span>{team.team_type === 'guttelag' ? 'G' : 'J'}</span>
							<span class="text-border">·</span>
							<span>{team.age_group}</span>
							<span class="text-border">·</span>
							<span>{team.bydel}</span>
							<span class="text-border">·</span>
							<span>{team.team_members?.[0]?.count ?? 0} spl.</span>
						</div>
						<div class="mt-0.5 flex items-center gap-1.5 text-xs">
							<svg class="size-3 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
							<span class="text-foreground/70">{captain?.full_name ?? '—'}</span>
							{#if captain?.phone}
								<span class="text-muted-foreground">{captain.phone}</span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Message Dialog -->
	<Dialog.Root bind:open={showMessage}>
		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Send melding</Dialog.Title>
				<Dialog.Description>
					Sendes til {selectedTeams.size} lagkaptein{selectedTeams.size === 1 ? '' : 'er'}
				</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/sendMessage" use:enhance={() => {
				return async ({ update }) => {
					showMessage = false;
					toast.success('Melding sendt!');
					clearSelection();
					await update();
				};
			}}>
				{#each [...selectedTeams] as teamId}
					{@const team = data.teams.find((t) => t.id === teamId)}
					{#if team}
						<input type="hidden" name="recipient_ids" value={team.captain_id} />
					{/if}
				{/each}
				<div class="space-y-4 mt-2">
					<div class="space-y-1.5">
						<p class="text-xs font-medium text-muted-foreground">Hurtigmaler</p>
						<div class="flex gap-2 flex-wrap">
							<button type="button" class="rounded-full border border-[var(--status-green-border)] bg-[var(--status-green-bg)] px-3 py-1 text-xs font-medium text-[var(--status-green)] hover:bg-[var(--status-green-bg)] transition-colors"
								onclick={() => {
									const s = document.getElementById('msg_subject') as HTMLInputElement;
									const b = document.getElementById('msg_body') as HTMLTextAreaElement;
									if (s) s.value = 'Gratulerer — dere er kvalifisert!';
									if (b) b.value = `Hei!\n\nGratulerer! Laget deres er kvalifisert til ${data.tournament.name}.\n\nVi gleder oss til å se dere!\n\nMvh\nSålevending`;
								}}
							>Kvalifisert</button>
							<button type="button" class="rounded-full border border-[var(--status-yellow-border)] bg-[var(--status-yellow-light-bg)] px-3 py-1 text-xs font-medium text-[var(--status-yellow)] hover:bg-[var(--status-yellow-bg)] transition-colors"
								onclick={() => {
									const s = document.getElementById('msg_subject') as HTMLInputElement;
									const b = document.getElementById('msg_body') as HTMLTextAreaElement;
									if (s) s.value = 'Dere er satt på venteliste';
									if (b) b.value = `Hei!\n\nTakk for påmeldingen. Laget deres er satt på venteliste til ${data.tournament.name}.\n\nVi gir beskjed dersom det åpner seg en plass.\n\nMvh\nSålevending`;
								}}
							>Venteliste</button>
							<button type="button" class="rounded-full border border-[var(--status-red-border)] bg-[var(--status-red-bg)] px-3 py-1 text-xs font-medium text-[var(--status-red)] hover:bg-[var(--status-red-bg)] transition-colors"
								onclick={() => {
									const s = document.getElementById('msg_subject') as HTMLInputElement;
									const b = document.getElementById('msg_body') as HTMLTextAreaElement;
									if (s) s.value = 'Avslag på påmelding';
									if (b) b.value = `Hei!\n\nDessverre har vi ikke plass til laget deres i ${data.tournament.name} denne gangen.\n\nVi håper å se dere på neste turnering!\n\nMvh\nSålevending`;
								}}
							>Avslag</button>
						</div>
					</div>
					<div class="space-y-2">
						<Label for="msg_subject">Emne</Label>
						<Input id="msg_subject" name="subject" required placeholder="Emne for meldingen" />
					</div>
					<div class="space-y-2">
						<Label for="msg_body">Melding</Label>
						<Textarea id="msg_body" name="body" required rows={8} placeholder="Skriv meldingen her..." />
					</div>
				</div>
				<Dialog.Footer class="mt-4">
					<Button type="button" variant="outline" onclick={() => (showMessage = false)}>Avbryt</Button>
					<Button type="submit">Send melding</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
