<script lang="ts">
	import './layout.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase/client';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();

	const supabase = createSupabaseBrowserClient();

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, _session) => {
			invalidate('supabase:auth');
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Sålevending</title>
</svelte:head>

<ModeWatcher defaultMode="dark" />
{@render children()}
<Toaster richColors position="top-center" />
