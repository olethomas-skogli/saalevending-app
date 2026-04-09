<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { form: actionData } = $props();

	let loading = $state(false);
	const formMessage = $derived(actionData?.form?.message);
</script>

<svelte:head>
	<title>Opprett konto — Sålevending</title>
</svelte:head>

<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="space-y-4">
	<div class="space-y-1.5 text-center">
		<h2 class="text-xl font-semibold">Opprett konto</h2>
		<p class="text-sm text-muted-foreground">Registrer deg for å melde på lag</p>
	</div>

	{#if formMessage}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			{formMessage}
		</div>
	{/if}

	<div class="space-y-2">
		<Label for="email">E-post</Label>
		<Input id="email" name="email" type="email" placeholder="din@epost.no" autocomplete="email" required />
	</div>

	<div class="space-y-2">
		<Label for="password">Passord</Label>
		<Input id="password" name="password" type="password" placeholder="Minst 8 tegn" autocomplete="new-password" required minlength={8} />
	</div>

	<Button type="submit" class="w-full" size="lg" disabled={loading}>
		{loading ? 'Registrerer...' : 'Opprett konto'}
	</Button>

	<p class="text-center text-sm text-muted-foreground">
		Har du allerede en konto?
		<a href="/login" class="text-primary hover:underline">Logg inn</a>
	</p>
</form>
