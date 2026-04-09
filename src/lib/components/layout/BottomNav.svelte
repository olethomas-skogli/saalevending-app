<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	interface Props {
		unreadMessages?: number;
	}

	let { unreadMessages = 0 }: Props = $props();

	const navItems = [
		{ href: '/', label: 'Hjem', icon: 'home' },
		{ href: '/tournaments', label: 'Turneringer', icon: 'trophy' },
		{ href: '/teams', label: 'Mine lag', icon: 'users' },
		{ href: '/messages', label: 'Meldinger', icon: 'message' },
		{ href: '/profile', label: 'Profil', icon: 'user' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md supports-backdrop-filter:bg-card/80 safe-area-pb"
>
	<div class="mx-auto flex max-w-lg items-center justify-around">
		{#each navItems as item}
			<a
				href={item.href}
				class={cn(
					'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
					isActive(item.href)
						? 'text-primary font-medium'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				<div class="relative">
					<svg
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						{#if item.icon === 'home'}
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						{:else if item.icon === 'trophy'}
							<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v1a4 4 0 01-4 4m-4 0a4 4 0 01-4-4V6a2 2 0 012-2h2m4 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0H8m4 7v4m-2 4h4a1 1 0 001-1v-1H9v1a1 1 0 001 1z" />
						{:else if item.icon === 'users'}
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						{:else if item.icon === 'message'}
							<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						{:else if item.icon === 'user'}
							<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						{/if}
					</svg>
					{#if item.icon === 'message' && unreadMessages > 0}
						<span class="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
							{unreadMessages > 9 ? '9+' : unreadMessages}
						</span>
					{/if}
				</div>
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
