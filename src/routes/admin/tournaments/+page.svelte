<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data } = $props();

	let showCreate = $state(false);

	const statusLabels: Record<string, string> = {
		draft: 'Utkast',
		registration_open: 'Åpen',
		registration_closed: 'Stengt',
		in_progress: 'Pågår',
		completed: 'Ferdig'
	};

	const statusColors: Record<string, string> = {
		draft: 'bg-muted text-muted-foreground border-border',
		registration_open: 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]',
		registration_closed: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		in_progress: 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]',
		completed: 'bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]'
	};
</script>

<svelte:head>
	<title>Turneringer — Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-5 px-4 py-6">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-bold md:text-2xl">Turneringer</h1>
		<Button onclick={() => (showCreate = true)}>Opprett turnering</Button>
	</div>

	<!-- Tournaments list -->
	<div class="space-y-3">
		{#each data.tournaments as tournament}
			<a href="/admin/tournaments/{tournament.id}">
				<Card.Root class="transition-colors hover:bg-card/80 m-4">
					<Card.Content class="flex items-center justify-between p-4">
						<div class="space-y-1">
							<h3 class="font-medium">{tournament.name}</h3>
							<p class="text-sm text-muted-foreground">
								{tournament.teams?.[0]?.count ?? 0} / {tournament.max_teams} lag
							</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium {statusColors[tournament.status] ?? ''}">
								{statusLabels[tournament.status] ?? tournament.status}
							</span>
							<form method="POST" action="?/updateStatus">
								<input type="hidden" name="tournament_id" value={tournament.id} />
								{#if tournament.status === 'draft'}
									<input type="hidden" name="status" value="registration_open" />
									<Button type="submit" variant="outline" size="sm">Åpne</Button>
								{:else if tournament.status === 'registration_open'}
									<input type="hidden" name="status" value="registration_closed" />
									<Button type="submit" variant="outline" size="sm">Steng</Button>
								{/if}
							</form>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>

	<!-- Create Tournament Dialog -->
	<Dialog.Root bind:open={showCreate}>
		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Opprett ny turnering</Dialog.Title>
			</Dialog.Header>
			<form method="POST" action="?/create" class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Navn</Label>
					<Input id="name" name="name" required placeholder="F.eks. Vallhall Cup 2026" />
				</div>
				<div class="space-y-2">
					<Label for="description">Beskrivelse</Label>
					<Textarea id="description" name="description" placeholder="Kort beskrivelse..." />
				</div>
				<div class="space-y-2">
					<Label for="location">Sted</Label>
					<Input id="location" name="location" placeholder="F.eks. Vallhall Arena, Oslo" />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="event_date">Dato</Label>
						<Input id="event_date" name="event_date" type="datetime-local" />
					</div>
					<div class="space-y-2">
						<Label for="registration_deadline">Påmeldingsfrist</Label>
						<Input id="registration_deadline" name="registration_deadline" type="datetime-local" />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="max_teams">Maks antall lag</Label>
					<Input id="max_teams" name="max_teams" type="number" value="64" min="1" />
				</div>
				<div class="space-y-2">
					<Label for="practical_info">Praktisk info</Label>
					<Textarea id="practical_info" name="practical_info" rows={4} placeholder="Mat, drikke, regler..." />
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showCreate = false)}>Avbryt</Button>
					<Button type="submit">Opprett</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
