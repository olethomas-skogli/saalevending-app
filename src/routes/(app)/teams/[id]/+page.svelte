<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const statusLabels: Record<string, string> = {
		pending: 'Venter på godkjenning',
		qualified: 'Kvalifisert',
		waitlist: 'Venteliste',
		rejected: 'Avvist'
	};

	const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		pending: 'secondary',
		qualified: 'default',
		waitlist: 'outline',
		rejected: 'destructive'
	};

	async function copyInviteLink() {
		await navigator.clipboard.writeText(data.inviteUrl);
		toast.success('Invitasjonslenke kopiert!');
	}
</script>

<svelte:head>
	<title>{data.team.team_name} — Sålevending</title>
</svelte:head>

<Header title={data.team.team_name} showBack />

<main class="mx-auto max-w-lg space-y-6 px-4 py-6">
	<!-- Team Status -->
	<div class="flex items-center gap-3">
		<Badge variant={statusVariants[data.team.status]}>
			{statusLabels[data.team.status]}
		</Badge>
		<span class="text-sm text-muted-foreground">
			{data.team.tournaments?.name}
		</span>
	</div>

	<!-- Team Info -->
	<Card.Root>
		<Card.Content class="space-y-3 p-4">
			<div class="grid grid-cols-2 gap-y-2 text-sm">
				<span class="text-muted-foreground">Type:</span>
				<span>{data.team.team_type === 'guttelag' ? 'Guttelag' : 'Jentelag'}</span>

				<span class="text-muted-foreground">Årskull:</span>
				<span>{data.team.age_group}</span>

				<span class="text-muted-foreground">Bydel:</span>
				<span>{data.team.bydel}</span>

				<span class="text-muted-foreground">Skole(r):</span>
				<span>{data.team.schools}</span>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Invite Link (Captain only) -->
	{#if data.isCaptain}
		<Card.Root class="border-primary/30 bg-primary/5">
			<Card.Content class="space-y-3 p-4">
				<h3 class="text-sm font-semibold">Inviter spillere</h3>
				<p class="text-xs text-muted-foreground">
					Del denne lenken med spillerne dine, f.eks. via Snapchat
				</p>
				<div class="flex gap-2">
					<input
						type="text"
						readonly
						value={data.inviteUrl}
						class="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-xs text-muted-foreground truncate"
					/>
					<Button size="sm" onclick={copyInviteLink}>Kopier</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Members -->
	<section class="space-y-3">
		<h3 class="text-sm font-semibold">Spillere ({data.members.length})</h3>
		{#each data.members as member}
			{@const profile = member.profiles}
			<Card.Root>
				<Card.Content class="flex items-center justify-between p-3">
					<div class="space-y-0.5">
						<div class="flex items-center gap-2">
							<p class="text-sm font-medium">{profile?.full_name ?? 'Ukjent'}</p>
							{#if member.role === 'captain'}
								<Badge variant="outline" class="text-xs">Kaptein</Badge>
							{/if}
						</div>
						{#if profile?.snapchat_username}
							<p class="text-xs text-muted-foreground">@{profile.snapchat_username}</p>
						{/if}
					</div>
					{#if data.isCaptain && member.role !== 'captain'}
						<form method="POST" action="?/removeMember">
							<input type="hidden" name="member_id" value={member.id} />
							<Button type="submit" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive">
								<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</Button>
						</form>
					{/if}
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<!-- Leave Team (non-captain members) -->
	{#if data.isMember && !data.isCaptain}
		<form method="POST" action="?/leaveTeam">
			<Button type="submit" variant="destructive" class="w-full" size="lg">
				Forlat laget
			</Button>
		</form>
	{/if}
</main>
