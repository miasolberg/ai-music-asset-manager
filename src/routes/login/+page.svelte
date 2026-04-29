<script>
	import { pb, login, register } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let email = '';
	let password = '';
	let name = '';
	let confirmPassword = '';
	let isRegistering = false;
	let loading = false;
	let error = '';
	
	onMount(() => {
		// Redirect if already logged in
		if (pb.authStore.isValid) {
			goto('/');
		}
	});
	
	async function handleLogin() {
		loading = true;
		error = '';
		
		try {
			await login(email, password);
			goto('/');
		} catch (err) {
			error = 'Invalid email or password';
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	async function handleRegister() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			await register(email, password, confirmPassword, name);
			goto('/');
		} catch (err) {
			error = err.message || 'Registration failed';
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	function toggleMode() {
		isRegistering = !isRegistering;
		error = '';
	}
</script>

<svelte:head>
	<title>{isRegistering ? 'Register' : 'Login'} - AI Music Manager</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<div class="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-white">AI Music Manager</h1>
			<p class="text-gray-400 mt-1">{isRegistering ? 'Create your account' : 'Sign in to your account'}</p>
		</div>
		
		<!-- Form -->
		<div class="bg-surface rounded-xl p-6 space-y-4">
			{#if error}
				<div class="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
					{error}
				</div>
			{/if}
			
			<form on:submit|preventDefault={isRegistering ? handleRegister : handleLogin} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
					<input
						type="email"
						bind:value={email}
						required
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="you@example.com"
					/>
				</div>
				
				{#if isRegistering}
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
						<input
							type="text"
							bind:value={name}
							required
							class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
							placeholder="Your name"
						/>
					</div>
				{/if}
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
					<input
						type="password"
						bind:value={password}
						required
						minlength="8"
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="Min. 8 characters"
					/>
				</div>
				
				{#if isRegistering}
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
						<input
							type="password"
							bind:value={confirmPassword}
							required
							minlength="8"
							class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
							placeholder="Repeat password"
						/>
					</div>
				{/if}
				
				<button
					type="submit"
					disabled={loading}
					class="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
				>
					{#if loading}
						<span class="flex items-center justify-center gap-2">
							<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Loading...
						</span>
					{:else}
						{isRegistering ? 'Create Account' : 'Sign In'}
					{/if}
				</button>
			</form>
			
			<div class="text-center pt-4 border-t border-gray-800">
				<p class="text-gray-400 text-sm">
					{isRegistering ? 'Already have an account?' : "Don't have an account?"}
					<button 
						on:click={toggleMode}
						class="text-primary hover:text-white transition-colors font-medium"
					>
						{isRegistering ? 'Sign in' : 'Register'}
					</button>
				</p>
			</div>
		</div>
	</div>
</div>
