<script lang="ts">
	import BottomNav from '$lib/components/layout/BottomNav.svelte';

	let { data, children } = $props();
</script>

<div class="min-h-screen pb-20">
	{@render children()}
</div>
<BottomNav unreadMessages={data.unreadMessages} />
