<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { data, form: actionData } = $props();

	let loading = $state(false);
	const formMessage = $derived(actionData?.form?.message);
</script>

<svelte:head>
	<title>Logg inn — Sålevending</title>
</svelte:head>

<form method="POST" action="?/login" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="space-y-4">
	<div class="space-y-1.5 text-center">
		<h2 class="text-xl font-semibold">Logg inn</h2>
		<p class="text-sm text-muted-foreground">Velkommen tilbake</p>
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
		<Input id="password" name="password" type="password" placeholder="Ditt passord" autocomplete="current-password" required />
	</div>

	<Button type="submit" class="w-full" size="lg" disabled={loading}>
		{loading ? 'Logger inn...' : 'Logg inn'}
	</Button>

	<p class="text-center text-sm text-muted-foreground">
		Har du ikke en konto?
		<a href="/register" class="text-primary hover:underline">Opprett konto</a>
	</p>
</form>

{#if data.isDemo}
	<div class="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-wider text-foreground">Demo-modus</p>
			<p class="mt-1 text-xs text-muted-foreground">Logg inn som en av demobrukerne</p>
		</div>
		<div class="space-y-2">
			<form method="POST" action="?/demoLogin" use:enhance>
				<input type="hidden" name="role" value="captain" />
				<Button type="submit" variant="outline" class="w-full justify-start gap-6 px-4 py-5 h-auto" size="lg">
					<span class="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">S</span>
					<span class="text-left">
						<span class="block text-sm font-medium">Sara Ahmed</span>
						<span class="block text-xs text-muted-foreground">Lagkaptein · Stovner</span>
					</span>
				</Button>
			</form>
			<form method="POST" action="?/demoLogin" use:enhance>
				<input type="hidden" name="role" value="player" />
				<Button type="submit" variant="outline" class="w-full justify-start gap-6 px-4 py-5 h-auto" size="lg">
					<span class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">A</span>
					<span class="text-left">
						<span class="block text-sm font-medium">Ali Hassan</span>
						<span class="block text-xs text-muted-foreground">Spiller · Grorud</span>
					</span>
				</Button>
			</form>
			<form method="POST" action="?/demoLogin" use:enhance>
				<input type="hidden" name="role" value="admin" />
				<Button type="submit" variant="outline" class="w-full justify-start gap-6 px-4 py-5 h-auto" size="lg">
					<span class="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">E</span>
					<span class="text-left">
						<span class="block text-sm font-medium">Erik Rosland</span>
						<span class="block text-xs text-muted-foreground">Admin · Arrangør</span>
					</span>
				</Button>
			</form>
		</div>
	</div>
{/if}
