<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let showCompose = $state(false);
	let expandedId = $state<string | null>(null);
	let sendSuccess = $state(false);

	function timeAgo(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'Nå';
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}t`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d`;
		return new Date(dateStr).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' });
	}

	function formatFullDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('no-NO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function openCompose() {
		sendSuccess = false;
		showCompose = true;
	}
</script>

<svelte:head>
	<title>Meldinger — Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-5 px-4 py-6">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-xl font-bold">Meldinger</h1>
			<p class="text-xs text-muted-foreground">{data.messages.length} sendt totalt</p>
		</div>
		<Button onclick={openCompose} size="sm">
			<svg class="size-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			Ny melding
		</Button>
	</div>

	<!-- Sent messages list -->
	{#if data.messages.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-center">
			<div class="flex size-14 items-center justify-center rounded-full bg-muted">
				<svg class="size-6 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>
			<div>
				<p class="text-sm font-medium">Ingen meldinger sendt</p>
				<p class="text-xs text-muted-foreground mt-0.5">Send din første melding til lagkapteiner</p>
			</div>
		</div>
	{:else}
		<div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
			{#each data.messages as msg}
				<div>
					<button
						type="button"
						class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
						onclick={() => (expandedId = expandedId === msg.id ? null : msg.id)}
					>
						<div class="flex-1 min-w-0">
							<div class="flex items-baseline justify-between gap-2">
								<p class="text-sm font-medium truncate">{msg.subject}</p>
								<span class="text-xs text-muted-foreground shrink-0">{timeAgo(msg.created_at)}</span>
							</div>
							<p class="text-xs text-muted-foreground mt-0.5">
								{#if msg.recipient_id}
									Til: {msg.recipient?.full_name ?? '—'}
								{:else}
									Alle kapteiner
								{/if}
								{#if msg.tournaments?.name}
									 · {msg.tournaments.name}
								{/if}
							</p>
						</div>
						<svg
							class="size-4 text-muted-foreground/50 shrink-0 mt-1 transition-transform {expandedId === msg.id ? 'rotate-90' : ''}"
							fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{#if expandedId === msg.id}
						<div class="px-4 pb-4 space-y-3 border-t border-border/50 bg-muted/10">
							<div class="pt-3 text-xs text-muted-foreground">
								{formatFullDate(msg.created_at)} · Fra: {msg.sender?.full_name ?? '—'}
							</div>
							<p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{msg.body}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Compose Dialog -->
	<Dialog.Root bind:open={showCompose}>
		<Dialog.Content class="max-w-lg">
			{#if sendSuccess}
				<!-- Success state -->
				<div class="flex flex-col items-center gap-4 py-8">
					<div class="flex size-14 items-center justify-center rounded-full bg-[var(--status-green-bg)]">
						<svg class="size-7 text-[var(--status-green)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<div class="text-center">
						<p class="font-semibold">Melding sendt!</p>
						<p class="text-sm text-muted-foreground mt-1">Meldingen er levert til alle kapteiner.</p>
					</div>
					<Button variant="outline" onclick={() => (showCompose = false)}>Lukk</Button>
				</div>
			{:else}
				<!-- Compose form -->
				<Dialog.Header>
					<Dialog.Title>Ny melding</Dialog.Title>
					<Dialog.Description>
						Send melding til alle lagkapteiner i en turnering.
					</Dialog.Description>
				</Dialog.Header>
				<form method="POST" action="?/broadcast" use:enhance={() => {
					return async ({ update }) => {
						sendSuccess = true;
						await update();
					};
				}}>
					<div class="space-y-4 mt-2">
						<div class="space-y-2">
							<Label for="bc_tournament">Turnering</Label>
							<select
								id="bc_tournament"
								name="tournament_id"
								class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
							>
								<option value="">Alle turneringer</option>
								{#each data.tournaments as t}
									<option value={t.id}>{t.name}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="bc_subject">Emne</Label>
							<Input id="bc_subject" name="subject" required placeholder="Emne for meldingen" />
						</div>
						<div class="space-y-2">
							<Label for="bc_body">Melding</Label>
							<Textarea id="bc_body" name="body" required rows={8} placeholder="Skriv meldingen her..." />
						</div>
					</div>
					<Dialog.Footer class="mt-4">
						<Button type="button" variant="outline" onclick={() => (showCompose = false)}>Avbryt</Button>
						<Button type="submit">Send melding</Button>
					</Dialog.Footer>
				</form>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
