<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();

	const tournament = $derived(data.team.tournaments as { name: string; event_date: string | null } | null);
</script>

<svelte:head>
	<title>Bli med — {data.team.team_name}</title>
</svelte:head>

<Header title="Bli med på lag" showBack />

<main class="mx-auto max-w-lg px-4 py-6">
	<div class="flex flex-col items-center gap-6 py-8">
		<div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
			<svg class="size-8 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</div>

		<div class="text-center space-y-1">
			<h2 class="text-xl font-semibold">Du er invitert!</h2>
			<p class="text-muted-foreground">Du er invitert til å bli med på:</p>
		</div>

		<Card.Root class="w-full">
			<Card.Content class="space-y-2 p-4 text-center">
				<h3 class="text-lg font-semibold">{data.team.team_name}</h3>
				<p class="text-sm text-muted-foreground">
					{data.team.team_type === 'guttelag' ? 'Guttelag' : 'Jentelag'} · Årskull {data.team.age_group}
				</p>
				{#if tournament}
					<p class="text-sm text-muted-foreground">{tournament.name}</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<form method="POST" action="?/join" class="w-full">
			<Button type="submit" class="w-full" size="lg">
				Bli med på laget
			</Button>
		</form>
	</div>
</main>
