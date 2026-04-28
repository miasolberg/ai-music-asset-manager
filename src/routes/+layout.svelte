<script>
	import '../app.css';
	import Navigation from '$components/Navigation.svelte';
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	onMount(() => {
		if (browser) {
			// Check auth status
			pb.authStore.loadFromCookie(document.cookie);
		}
	});
</script>

<div class="min-h-screen bg-darker">
	<Navigation />
	
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>
