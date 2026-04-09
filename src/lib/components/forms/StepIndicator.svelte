<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		steps: string[];
		currentStep: number;
	}

	let { steps, currentStep }: Props = $props();
</script>

<div class="flex items-center justify-center gap-2 py-4">
	{#each steps as step, i}
		<div class="flex items-center gap-2">
			<div
				class={cn(
					'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
					i < currentStep && 'bg-primary text-primary-foreground',
					i === currentStep && 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
					i > currentStep && 'bg-muted text-muted-foreground'
				)}
			>
				{#if i < currentStep}
					<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				{:else}
					{i + 1}
				{/if}
			</div>
			{#if i < steps.length - 1}
				<div
					class={cn(
						'h-0.5 w-8 transition-colors',
						i < currentStep ? 'bg-primary' : 'bg-muted'
					)}
				></div>
			{/if}
		</div>
	{/each}
</div>
<p class="text-center text-sm text-muted-foreground">{steps[currentStep]}</p>
