<script lang="ts">
	import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
</script>

<svelte:head>
	<title>Innstillinger — Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 px-4 py-6">
	<h1 class="text-xl font-bold">Innstillinger</h1>

	<section class="space-y-3">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Utseende</h2>
		<div class="rounded-lg border border-border p-4 space-y-3">
			<div>
				<p class="text-sm font-medium">Tema</p>
				<p class="text-xs text-muted-foreground mt-0.5">Velg mellom lyst, mørkt eller automatisk tema</p>
			</div>
			<ThemeToggle />
		</div>
	</section>
</div>
