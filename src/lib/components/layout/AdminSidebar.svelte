<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
		{ href: '/admin/users', label: 'Brukere', icon: 'users', exact: false },
		{ href: '/admin/tournaments', label: 'Turneringer', icon: 'trophy', exact: false },
		{ href: '/admin/messages', label: 'Meldinger', icon: 'message', exact: false },
		{ href: '/admin/settings', label: 'Innstillinger', icon: 'settings', exact: false }
	] as const;

	function isActive(href: string, exact = false): boolean {
		if (exact) return page.url.pathname === href;
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- Desktop sidebar (hidden on mobile) -->
<aside class="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-sidebar md:flex">
	<div class="flex h-14 items-center gap-3 border-b border-sidebar-border px-6">
		<img src="/logo.svg" alt="Sålevending" class="h-5 dark:invert" />
		<span class="font-semibold text-sidebar-foreground">Admin</span>
	</div>

	<nav class="flex-1 space-y-1 p-3">
		{#each navItems as item}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
					isActive(item.href, item.exact)
						? 'bg-sidebar-accent text-sidebar-primary font-medium'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
				)}
			>
				<svg
					class="size-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					{#if item.icon === 'dashboard'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
					{:else if item.icon === 'users'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					{:else if item.icon === 'trophy'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v1a4 4 0 01-4 4m-4 0a4 4 0 01-4-4V6a2 2 0 012-2h2m4 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0H8m4 7v4m-2 4h4a1 1 0 001-1v-1H9v1a1 1 0 001 1z" />
					{:else if item.icon === 'message'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					{:else if item.icon === 'settings'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					{/if}
				</svg>
				{item.label}
			</a>
		{/each}
	</nav>

</aside>

<!-- Mobile header (hidden on desktop) -->
<header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md md:hidden">
	<div class="flex h-12 items-center px-4">
		<span class="text-sm font-semibold tracking-tight">Admin</span>
	</div>
</header>

<!-- Mobile bottom nav (hidden on desktop) -->
<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
	<div class="mx-auto flex max-w-lg items-center justify-around">
		{#each navItems as item}
			<a
				href={item.href}
				class={cn(
					'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
					isActive(item.href, item.exact)
						? 'text-foreground font-medium'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					{#if item.icon === 'dashboard'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
					{:else if item.icon === 'users'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					{:else if item.icon === 'trophy'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v1a4 4 0 01-4 4m-4 0a4 4 0 01-4-4V6a2 2 0 012-2h2m4 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0H8m4 7v4m-2 4h4a1 1 0 001-1v-1H9v1a1 1 0 001 1z" />
					{:else if item.icon === 'message'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					{:else if item.icon === 'settings'}
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					{/if}
				</svg>
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
