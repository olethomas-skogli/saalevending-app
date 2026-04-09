<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="flex flex-col items-center gap-3">
			<img src="/logo.svg" alt="Sålevending" class="h-10 dark:invert" />
		</div>
		{@render children()}
	</div>
</div>
