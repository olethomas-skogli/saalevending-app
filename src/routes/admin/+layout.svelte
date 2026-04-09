<script lang="ts">
	import AdminSidebar from '$lib/components/layout/AdminSidebar.svelte';

	let { children } = $props();
</script>

<!-- Desktop: sidebar + content -->
<div class="hidden md:flex min-h-screen">
	<AdminSidebar />
	<div class="flex-1 overflow-auto">
		{@render children()}
	</div>
</div>

<!-- Mobile: header + content + bottom nav -->
<div class="md:hidden min-h-screen">
	<AdminSidebar />
	<div class="pb-16">
		{@render children()}
	</div>
</div>
