<script lang="ts">
	import { enhance } from '$app/forms';
	import { OSLO_DISTRICTS } from '$lib/schemas/profile';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { form: actionData } = $props();

	let loading = $state(false);
	const errors = $derived(actionData?.form?.errors ?? {});
	const formMessage = $derived(actionData?.form?.message);
</script>

<svelte:head>
	<title>Fullfør profil — Sålevending</title>
</svelte:head>

<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="space-y-4">
	<div class="space-y-1.5 text-center">
		<h2 class="text-xl font-semibold">Fullfør profilen din</h2>
		<p class="text-sm text-muted-foreground">Vi trenger litt mer info om deg</p>
	</div>

	{#if formMessage}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			{formMessage}
		</div>
	{/if}

	<div class="space-y-2">
		<Label for="full_name">Fullt navn</Label>
		<Input id="full_name" name="full_name" type="text" placeholder="Ola Nordmann" autocomplete="name" required />
		{#if errors.full_name}
			<p class="text-sm text-destructive">{errors.full_name[0]}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<Label for="snapchat_username">Snapchat (valgfritt)</Label>
		<Input id="snapchat_username" name="snapchat_username" type="text" placeholder="ditt_snap" />
	</div>

	<div class="space-y-2">
		<Label for="phone">Telefonnummer</Label>
		<Input id="phone" name="phone" type="tel" placeholder="+47 XXX XX XXX" autocomplete="tel" required />
		{#if errors.phone}
			<p class="text-sm text-destructive">{errors.phone[0]}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<Label for="birth_date">Fødselsdato</Label>
		<Input id="birth_date" name="birth_date" type="date" required />
		{#if errors.birth_date}
			<p class="text-sm text-destructive">{errors.birth_date[0]}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<Label for="bydel">Bydel</Label>
		<select
			id="bydel"
			name="bydel"
			required
			class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<option value="" disabled selected>Velg bydel</option>
			{#each OSLO_DISTRICTS as district}
				<option value={district}>{district}</option>
			{/each}
		</select>
		{#if errors.bydel}
			<p class="text-sm text-destructive">{errors.bydel[0]}</p>
		{/if}
	</div>

	<Button type="submit" class="w-full" size="lg" disabled={loading}>
		{loading ? 'Lagrer...' : 'Fullfør registrering'}
	</Button>
</form>
