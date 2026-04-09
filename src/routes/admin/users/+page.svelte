<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let searchValue = $state('');
	$effect(() => { searchValue = data.search; });

	const totalPages = $derived(Math.ceil(data.totalCount / data.perPage));
	const completedCount = $derived(data.users.filter((u) => u.profile_completed).length);
	const incompleteCount = $derived(data.users.filter((u) => !u.profile_completed).length);

	let filterStatus = $state<'all' | 'complete' | 'incomplete'>('all');
	let expandedUserId = $state<string | null>(null);

	const filteredUsers = $derived(
		filterStatus === 'all'
			? data.users
			: filterStatus === 'complete'
				? data.users.filter((u) => u.profile_completed)
				: data.users.filter((u) => !u.profile_completed)
	);

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		goto(`/admin/users?${params.toString()}`);
	}

	function calculateAge(birthDate: string | null): string {
		if (!birthDate) return '—';
		const birth = new Date(birthDate);
		const now = new Date();
		let age = now.getFullYear() - birth.getFullYear();
		const m = now.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
		return `${age} år`;
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('no-NO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function getUserAllergies(userId: string): string[] {
		const memberships = data.userMemberships[userId] ?? [];
		const allAllergies = memberships.flatMap((m) => m.allergies);
		const unique = [...new Set(allAllergies)].filter((a) => a !== 'ingen');
		return unique;
	}

	const allergyLabels: Record<string, string> = {
		gluten: 'Gluten',
		laktose: 'Laktose',
		nøtter: 'Nøtter',
		vegan: 'Vegan'
	};

	const statusLabels: Record<string, string> = {
		pending: 'Venter',
		qualified: 'Kvalifisert',
		waitlist: 'Venteliste',
		rejected: 'Avvist'
	};

	const statusColors: Record<string, string> = {
		qualified: 'text-[var(--status-green)]',
		pending: 'text-[var(--status-yellow)]',
		waitlist: 'text-[var(--status-yellow-light)]',
		rejected: 'text-[var(--status-red)]'
	};
</script>

<svelte:head>
	<title>Brukere — Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-5 px-4 py-6">
	<div>
		<h1 class="text-xl font-bold">Brukere</h1>
		<p class="text-xs text-muted-foreground mt-0.5">
			{data.totalCount} registrert · {completedCount} verifisert · {incompleteCount} venter
		</p>
	</div>

	<!-- Search -->
	<form onsubmit={handleSearch} class="relative">
		<svg class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<Input placeholder="Søk etter navn eller telefon..." bind:value={searchValue} class="pl-10" />
	</form>

	<!-- Filter pills -->
	<div class="flex gap-2">
		<button
			class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filterStatus === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}"
			onclick={() => (filterStatus = 'all')}
		>Alle ({data.users.length})</button>
		<button
			class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filterStatus === 'complete' ? 'bg-[var(--status-green-bg)] text-[var(--status-green)]' : 'bg-muted text-muted-foreground hover:text-foreground'}"
			onclick={() => (filterStatus = 'complete')}
		>Verifisert ({completedCount})</button>
		<button
			class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filterStatus === 'incomplete' ? 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]' : 'bg-muted text-muted-foreground hover:text-foreground'}"
			onclick={() => (filterStatus = 'incomplete')}
		>Venter ({incompleteCount})</button>
	</div>

	<!-- User list -->
	{#if filteredUsers.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-center">
			<div class="flex size-14 items-center justify-center rounded-full bg-muted">
				<svg class="size-6 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<p class="text-sm text-muted-foreground">Ingen brukere funnet</p>
		</div>
	{:else}
		<div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
			{#each filteredUsers as user}
				{@const isExpanded = expandedUserId === user.id}
				{@const allergies = getUserAllergies(user.id)}
				{@const memberships = data.userMemberships[user.id] ?? []}
				<div>
					<!-- Row (clickable) -->
					<button
						type="button"
						class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors {!user.profile_completed ? 'bg-[var(--status-yellow-bg)]' : ''} {isExpanded ? 'bg-muted/20' : 'hover:bg-muted/10'}"
						onclick={() => (expandedUserId = isExpanded ? null : user.id)}
					>
						<!-- Status icon -->
						<div class="flex size-9 shrink-0 items-center justify-center rounded-full {user.profile_completed ? 'bg-[var(--status-green-bg)] text-[var(--status-green)]' : 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]'} text-xs font-bold">
							{#if user.profile_completed}
								<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
							{:else}
								<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							{/if}
						</div>

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<p class="text-sm font-medium truncate">{user.full_name || '—'}</p>
								<span class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium {user.profile_completed ? 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]' : 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]'}">
									{user.profile_completed ? 'Verifisert' : 'Ufullstendig'}
								</span>
								{#if user.role === 'admin'}
									<span class="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Admin</span>
								{/if}
							</div>
							<div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
								{#if user.bydel}<span class="flex items-center gap-1"><svg class="size-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{user.bydel}</span>{/if}
								{#if user.bydel && memberships.length > 0}<span class="text-border">·</span>{/if}
								{#if memberships.length > 0}<span>{memberships.length} lag</span>{/if}
							</div>
						</div>

						<!-- Expand arrow -->
						<svg
							class="size-4 text-muted-foreground/50 shrink-0 transition-transform {isExpanded ? 'rotate-90' : ''}"
							fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					<!-- Expanded detail panel -->
					{#if isExpanded}
						<div class="border-t border-border/50 bg-muted/10 px-4 py-4 space-y-5">
							<!-- Personal info grid -->
							<div class="space-y-1">
								<h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personlig info</h4>
								<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
									<div>
										<p class="text-xs text-muted-foreground">Navn</p>
										<p class="font-medium">{user.full_name || '—'}</p>
									</div>
									<div>
										<p class="text-xs text-muted-foreground">Telefon</p>
										<p class="font-medium">{user.phone || '—'}</p>
									</div>
									<div>
										<p class="text-xs text-muted-foreground">Fødselsdato</p>
										<p class="font-medium">{user.birth_date ? `${formatDate(user.birth_date)} (${calculateAge(user.birth_date)})` : '—'}</p>
									</div>
									<div>
										<p class="text-xs text-muted-foreground">Bydel</p>
										<p class="font-medium">{user.bydel || '—'}</p>
									</div>
									{#if user.snapchat_username}
										<div>
											<p class="text-xs text-muted-foreground">Snapchat</p>
											<p class="font-medium">@{user.snapchat_username}</p>
										</div>
									{/if}
									<div>
										<p class="text-xs text-muted-foreground">Registrert</p>
										<p class="font-medium">{formatDate(user.created_at)}</p>
									</div>
								</div>
							</div>

							<!-- Consent & status -->
							<div class="space-y-1">
								<h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status og samtykke</h4>
								<div class="flex flex-wrap gap-2">
									<span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium {user.profile_completed ? 'bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]' : 'bg-[var(--status-yellow-bg)] text-[var(--status-yellow)] border-[var(--status-yellow-border)]'}">
										{#if user.profile_completed}
											<svg class="size-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
											Verifisert
										{:else}
											Ufullstendig
										{/if}
									</span>
									{#if user.consent_given_at}
										<span class="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											<svg class="size-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
											Samtykke gitt
										</span>
									{/if}
									{#if user.parental_consent}
										<span class="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											<svg class="size-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
											Foreldresamtykke
										</span>
									{/if}
								</div>
							</div>

							<!-- Allergies -->
							{#if allergies.length > 0}
								<div class="space-y-1">
									<h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allergier</h4>
									<div class="flex flex-wrap gap-1.5">
										{#each allergies as allergy}
											<span class="inline-flex items-center gap-1 rounded-full border border-[var(--status-red-border)] bg-[var(--status-red-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-red)]">
												<svg class="size-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
												{allergyLabels[allergy] ?? allergy}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Team memberships -->
							{#if memberships.length > 0}
								<div class="space-y-2">
									<h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lag ({memberships.length})</h4>
									<div class="space-y-1.5">
										{#each memberships as membership}
											<div class="flex items-center justify-between rounded-lg bg-background border border-border px-3 py-2">
												<div>
													<p class="text-sm font-medium">{membership.team_name}</p>
													<p class="text-xs text-muted-foreground">
														{membership.tournament_name}
														<span class="text-border mx-1">·</span>
														{membership.role === 'captain' ? 'Kaptein' : 'Spiller'}
													</p>
												</div>
												<span class="text-xs font-medium {statusColors[membership.status] ?? 'text-muted-foreground'}">
													{statusLabels[membership.status] ?? membership.status}
												</span>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<div class="space-y-1">
									<h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lag</h4>
									<p class="text-xs text-muted-foreground">Ikke med på noe lag</p>
								</div>
							{/if}

							<!-- Actions -->
							{#if !user.profile_completed}
								<form method="POST" action="?/verify" use:enhance={() => {
									return async ({ update }) => {
										toast.success(`${user.full_name || 'Bruker'} verifisert`);
										expandedUserId = null;
										await update();
									};
								}}>
									<input type="hidden" name="user_id" value={user.id} />
									<button type="submit" class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--status-blue-border)] bg-[var(--status-blue-bg)] py-2.5 text-sm font-medium text-[var(--status-blue)] hover:bg-[var(--status-blue-bg)] transition-colors">
										<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Verifiser bruker
									</button>
								</form>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.currentPage > 1}
				<Button variant="outline" size="sm" href="/admin/users?page={data.currentPage - 1}{data.search ? `&search=${data.search}` : ''}">Forrige</Button>
			{/if}
			<span class="text-sm text-muted-foreground">Side {data.currentPage} av {totalPages}</span>
			{#if data.currentPage < totalPages}
				<Button variant="outline" size="sm" href="/admin/users?page={data.currentPage + 1}{data.search ? `&search=${data.search}` : ''}">Neste</Button>
			{/if}
		</div>
	{/if}
</div>
