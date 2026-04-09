<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { profileSchema, OSLO_DISTRICTS } from '$lib/schemas/profile';
	import { enhance } from '$app/forms';
	import Header from '$lib/components/layout/Header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';

	let { data, form: actionData } = $props();

	const profile = $derived(data.profile);
	const email = $derived(data.email);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance: superEnhance, delayed, message } = superForm(data.form, {
		validators: zodClient(profileSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Profil oppdatert!');
			}
		}
	});

	let showDeleteConfirm = $state(false);
	let showExport = $state(false);
	const exportData = $derived(actionData?.exportData as string | undefined);
</script>

<svelte:head>
	<title>Min profil — Sålevending</title>
</svelte:head>

<Header title="Min profil" />

<main class="mx-auto max-w-lg space-y-6 px-4 py-6">
	<!-- Profile info -->
	<div class="flex items-center gap-4">
		<div class="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
			{profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
		</div>
		<div>
			<h2 class="font-semibold">{profile?.full_name ?? ''}</h2>
			<p class="text-sm text-muted-foreground">{email}</p>
		</div>
	</div>

	<Separator />

	<!-- Edit form -->
	<form method="POST" action="?/updateProfile" use:superEnhance class="space-y-4">
		<div class="space-y-2">
			<Label for="full_name">Fullt navn</Label>
			<Input id="full_name" name="full_name" bind:value={$form.full_name} />
			{#if $errors.full_name}
				<p class="text-sm text-destructive">{$errors.full_name[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="snapchat_username">Snapchat</Label>
			<Input id="snapchat_username" name="snapchat_username" bind:value={$form.snapchat_username} />
		</div>

		<div class="space-y-2">
			<Label for="phone">Telefonnummer</Label>
			<Input id="phone" name="phone" type="tel" bind:value={$form.phone} />
			{#if $errors.phone}
				<p class="text-sm text-destructive">{$errors.phone[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="birth_date">Fødselsdato</Label>
			<Input id="birth_date" name="birth_date" type="date" bind:value={$form.birth_date} />
			{#if $errors.birth_date}
				<p class="text-sm text-destructive">{$errors.birth_date[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="bydel">Bydel</Label>
			<select
				id="bydel"
				name="bydel"
				bind:value={$form.bydel}
				class="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="" disabled>Velg bydel</option>
				{#each OSLO_DISTRICTS as district}
					<option value={district}>{district}</option>
				{/each}
			</select>
			{#if $errors.bydel}
				<p class="text-sm text-destructive">{$errors.bydel[0]}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full" size="lg" disabled={$delayed}>
			{$delayed ? 'Lagrer...' : 'Lagre endringer'}
		</Button>
	</form>

	<Separator />

	<!-- Settings -->
	<section class="space-y-3">
		<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Innstillinger</h3>
		<div class="space-y-2">
			<p class="text-sm">Utseende</p>
			<ThemeToggle />
		</div>
	</section>

	<Separator />

	<!-- Data rights -->
	<section class="space-y-3">
		<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personvern og data</h3>

		<a href="/personvern" class="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-card transition-colors">
			<span class="text-sm">Personvernerklæring</span>
			<svg class="size-4 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</a>

		<!-- Export data -->
		<form method="POST" action="?/exportData" use:enhance={() => {
			return async ({ update }) => {
				showExport = true;
				await update({ reset: false });
			};
		}}>
			<button type="submit" class="flex w-full items-center justify-between rounded-lg border border-border p-3 hover:bg-card transition-colors text-left">
				<span class="text-sm">Eksporter mine data</span>
				<svg class="size-4 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</button>
		</form>

		{#if showExport && exportData}
			<div class="rounded-lg border border-border bg-card p-3 space-y-2">
				<p class="text-xs font-medium">Dine data (JSON)</p>
				<pre class="text-xs text-muted-foreground bg-background rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">{exportData}</pre>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						navigator.clipboard.writeText(exportData);
						toast.success('Data kopiert!');
					}}
				>
					Kopier til utklippstavle
				</Button>
			</div>
		{/if}
	</section>

	<Separator />

	<!-- Sign out -->
	<form method="POST" action="?/signOut">
		<Button type="submit" variant="outline" class="w-full" size="lg">
			Logg ut
		</Button>
	</form>

	<!-- Delete account -->
	<div class="space-y-2">
		{#if !showDeleteConfirm}
			<button
				type="button"
				class="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors py-2"
				onclick={() => (showDeleteConfirm = true)}
			>
				Slett kontoen min
			</button>
		{:else}
			<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
				<p class="text-sm font-medium text-destructive">Er du sikker?</p>
				<p class="text-xs text-muted-foreground">
					Dette sletter kontoen din, alle lag du er kaptein for, og all tilknyttet data permanent. Denne handlingen kan ikke angres.
				</p>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={() => (showDeleteConfirm = false)}>
						Avbryt
					</Button>
					<form method="POST" action="?/deleteAccount" use:enhance>
						<Button type="submit" variant="destructive" size="sm">
							Ja, slett kontoen min
						</Button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</main>
