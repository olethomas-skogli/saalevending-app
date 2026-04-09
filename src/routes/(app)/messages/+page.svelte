<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	let selectedMessageId = $state<string | null>(null);
	let markedReadIds = $state<Set<string>>(new Set());

	const selectedMessage = $derived(
		selectedMessageId ? data.messages.find((m) => m.id === selectedMessageId) ?? null : null
	);

	const unreadCount = $derived(
		data.messages.filter((m) => !m.is_read && !markedReadIds.has(m.id)).length
	);

	function isUnread(msgId: string, serverIsRead: boolean): boolean {
		return !serverIsRead && !markedReadIds.has(msgId);
	}

	// Auto-mark as read when opening an unread message
	$effect(() => {
		if (selectedMessage && !selectedMessage.is_read && !markedReadIds.has(selectedMessage.id)) {
			const msgId = selectedMessage.id;
			markedReadIds = new Set([...markedReadIds, msgId]);

			// Mark read on server, then refresh layout data for badge update
			const formData = new FormData();
			formData.set('message_id', msgId);
			fetch('?/markRead', {
				method: 'POST',
				body: formData
			}).then(() => {
				invalidate('app:messages');
			});
		}
	});

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
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function openMessage(msgId: string) {
		selectedMessageId = msgId;
	}

	function closeMessage() {
		selectedMessageId = null;
	}
</script>

<svelte:head>
	<title>Meldinger — Sålevending</title>
</svelte:head>

{#if selectedMessage}
	<!-- Detail View -->
	<Header title="Melding" showBack />
	<main class="mx-auto max-w-lg px-4 py-6">
		<div class="space-y-6">
			<div>
				<h2 class="text-xl font-bold leading-tight">{selectedMessage.subject}</h2>
			</div>

			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<div class="flex size-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
					{(selectedMessage.profiles?.full_name ?? 'A').charAt(0).toUpperCase()}
				</div>
				<div>
					<p class="font-medium text-foreground text-sm">{selectedMessage.profiles?.full_name ?? 'Arrangør'}</p>
					<p>{formatFullDate(selectedMessage.created_at)}{selectedMessage.tournaments?.name ? ` · ${selectedMessage.tournaments.name}` : ''}</p>
				</div>
			</div>

			<div class="border-t border-border"></div>

			<div class="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
				{selectedMessage.body}
			</div>
		</div>

		<div class="mt-8">
			<Button variant="outline" class="w-full" size="lg" onclick={closeMessage}>
				Tilbake til innboksen
			</Button>
		</div>
	</main>
{:else}
	<!-- List View -->
	<Header title={unreadCount > 0 ? `Meldinger (${unreadCount})` : 'Meldinger'} />

	<main class="mx-auto max-w-lg px-4 py-4">
		{#if data.messages.length === 0}
			<div class="flex flex-col items-center gap-3 py-20 text-center">
				<div class="flex size-14 items-center justify-center rounded-full bg-muted">
					<svg class="size-6 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium">Ingen meldinger</p>
					<p class="text-xs text-muted-foreground mt-0.5">Du vil se meldinger fra arrangøren her</p>
				</div>
			</div>
		{:else}
			<div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
				{#each data.messages as msg}
					{@const unread = isUnread(msg.id, msg.is_read)}
					<button
						type="button"
						class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 {unread ? 'bg-foreground/[0.03]' : ''}"
						onclick={() => openMessage(msg.id)}
					>
						<div class="pt-1.5 shrink-0">
							{#if unread}
								<div class="size-2 rounded-full bg-[var(--status-blue)]"></div>
							{:else}
								<div class="size-2"></div>
							{/if}
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex items-baseline justify-between gap-2">
								<p class="text-sm truncate {unread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}">
									{msg.subject}
								</p>
								<span class="text-xs text-muted-foreground shrink-0">{timeAgo(msg.created_at)}</span>
							</div>
							<p class="text-xs text-muted-foreground mt-0.5 truncate">
								{msg.profiles?.full_name ?? 'Arrangør'}{msg.tournaments?.name ? ` · ${msg.tournaments.name}` : ''}
							</p>
						</div>

						<svg class="size-4 text-muted-foreground/50 shrink-0 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				{/each}
			</div>
		{/if}
	</main>
{/if}
