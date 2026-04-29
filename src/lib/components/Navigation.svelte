<script>
	import { pb, isAuthenticated, getCurrentUser } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	
	let user = getCurrentUser();
	let authenticated = isAuthenticated();
	let mobileMenuOpen = false;
	
	async function handleLogout() {
		pb.authStore.clear();
		user = null;
		authenticated = false;
		mobileMenuOpen = false;
		goto('/login');
	}
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<nav class="bg-surface border-b border-gray-800">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3" on:click={closeMobileMenu}>
				<div class="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
					</svg>
				</div>
				<span class="text-lg font-bold text-white">AI Music Manager</span>
			</a>
			
			<!-- Desktop Nav -->
			<div class="hidden sm:flex items-center gap-4">
				{#if authenticated}
					<div class="flex items-center gap-4">
						<span class="text-sm text-gray-400">{user?.name || user?.email}</span>
						<button
							on:click={handleLogout}
							class="text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] flex items-center"
						>
							Logout
						</button>
					</div>
				{:else}
					<a href="/login" class="text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] flex items-center">
						Login
					</a>
				{/if}
			</div>
			
			<!-- Mobile hamburger -->
			<button
				on:click={toggleMobileMenu}
				class="sm:hidden text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="sm:hidden border-t border-gray-800 px-4 pb-4">
			{#if authenticated}
				<div class="py-3 space-y-2">
					<p class="text-sm text-gray-400">{user?.name || user?.email}</p>
					<button
						on:click={handleLogout}
						class="block w-full text-left text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] flex items-center"
					>
						Logout
					</button>
				</div>
			{:else}
				<div class="py-3">
					<a href="/login" class="block text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] flex items-center" on:click={closeMobileMenu}>
						Login
					</a>
				</div>
			{/if}
		</div>
	{/if}
</nav>