<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		title?: string;
		showBack?: boolean;
		class?: string;
	}

	let { title = 'Sålevending', showBack = false, class: className }: Props = $props();
</script>

<header class={cn('sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md', className)}>
	<div class="mx-auto relative flex h-14 max-w-lg items-center px-4">
		<!-- Left: back button or logo -->
		{#if showBack}
			<button
				type="button"
				aria-label="Tilbake"
				class="text-muted-foreground hover:text-foreground z-10"
				onclick={() => history.back()}
			>
				<svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		{:else}
			<img src="/logo.svg" alt="Sålevending" class="h-5 dark:invert z-10" />
		{/if}

		<!-- Center: title -->
		<h1 class="absolute inset-0 flex items-center justify-center text-lg font-semibold tracking-tight pointer-events-none">
			{title}
		</h1>
	</div>
</header>
