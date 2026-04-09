<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
	<div class="space-y-4">
		<div class="flex size-16 mx-auto items-center justify-center rounded-2xl bg-destructive/10">
			<span class="text-3xl font-bold text-destructive">{page.status}</span>
		</div>
		<h1 class="text-xl font-semibold">
			{#if page.status === 404}
				Siden ble ikke funnet
			{:else if page.status === 403}
				Du har ikke tilgang
			{:else}
				Noe gikk galt
			{/if}
		</h1>
		<p class="text-sm text-muted-foreground">
			{page.error?.message ?? 'En uventet feil oppstod'}
		</p>
		<Button href="/" variant="outline">Tilbake til forsiden</Button>
	</div>
</div>
