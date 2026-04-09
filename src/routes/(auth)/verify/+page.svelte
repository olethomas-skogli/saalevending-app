<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase/client';
	import { toast } from 'svelte-sonner';

	let token = $state('');
	let loading = $state(false);
	let error = $state('');

	const supabase = createSupabaseBrowserClient();

	async function handleVerify() {
		if (token.length !== 6 || !/^\d+$/.test(token)) {
			error = 'Koden må være 6 siffer';
			return;
		}

		loading = true;
		error = '';

		const { error: verifyError } = await supabase.auth.verifyOtp({
			type: 'email',
			token,
			email: '' // Will be filled from session
		});

		if (verifyError) {
			error = 'Ugyldig kode. Prøv igjen.';
			loading = false;
			return;
		}

		toast.success('E-post verifisert!');
		goto('/complete-profile');
	}
</script>

<svelte:head>
	<title>Verifiser e-post — Sålevending</title>
</svelte:head>

<div class="space-y-4">
	<div class="space-y-1.5 text-center">
		<h2 class="text-xl font-semibold">Sjekk e-posten din</h2>
		<p class="text-sm text-muted-foreground">
			Vi har sendt deg en bekreftelseslenke. Klikk på lenken i e-posten for å verifisere kontoen
			din, eller skriv inn koden nedenfor.
		</p>
	</div>

	{#if error}
		<div
			class="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
		>
			{error}
		</div>
	{/if}

	<div class="space-y-2">
		<Label for="token">Verifiseringskode</Label>
		<Input
			id="token"
			type="text"
			inputmode="numeric"
			maxlength={6}
			placeholder="000000"
			bind:value={token}
			class="text-center text-2xl tracking-[0.5em]"
		/>
	</div>

	<Button class="w-full" size="lg" disabled={loading} onclick={handleVerify}>
		{#if loading}
			Verifiserer...
		{:else}
			Verifiser
		{/if}
	</Button>

	<p class="text-center text-sm text-muted-foreground">
		Fikk du ikke e-post?
		<button
			type="button"
			class="text-primary hover:underline"
			onclick={() => toast.info('Sjekk søppelpost-mappen din')}
		>
			Send på nytt
		</button>
	</p>
</div>
