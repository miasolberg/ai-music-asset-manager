<script>
	import { pb, isAuthenticated, getCurrentUser } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	
	let user = getCurrentUser();
	let authenticated = isAuthenticated();
	
	async function handleLogout() {
		pb.authStore.clear();
		user = null;
		authenticated = false;
		goto('/login');
	}
</script>

<nav class="bg-surface border-b border-gray-800">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3">
				<div class="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
					</svg>
				</div>
				<span class="text-lg font-bold text-white">AI Music Manager</span>
			</a>
			
			<!-- Nav Links -->
			<div class="flex items-center gap-6">
				{#if authenticated}
					<div class="flex items-center gap-4">
						<span class="text-sm text-gray-400">{user?.name || user?.email}</span>
						<button
							on:click={handleLogout}
							class="text-sm text-gray-400 hover:text-white transition-colors"
						>
							Logout
						</button>
					</div>
				{:else}
					<a href="/login" class="text-sm text-gray-400 hover:text-white transition-colors">
						Login
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
