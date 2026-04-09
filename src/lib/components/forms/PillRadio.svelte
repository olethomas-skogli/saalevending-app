<script lang="ts">
	import { cn } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onchange: (value: string) => void;
		name: string;
		columns?: 2 | 3;
		error?: string;
	}

	let { options, value, onchange, name, columns = 2, error }: Props = $props();
</script>

<div
	class={cn(
		'grid gap-2',
		columns === 2 && 'grid-cols-2',
		columns === 3 && 'grid-cols-3'
	)}
>
	{#each options as option}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.value}
			class={cn(
				'flex min-h-12 items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]',
				value === option.value
					? 'border-primary bg-primary/10 text-primary'
					: 'border-border bg-card text-foreground hover:border-primary/50'
			)}
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
<input type="hidden" {name} {value} />
{#if error}
	<p class="mt-1 text-sm text-destructive">{error}</p>
{/if}
