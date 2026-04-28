<script>
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import ProjectCard from '$components/ProjectCard.svelte';
	import CreateProjectModal from '$components/CreateProjectModal.svelte';
	
	let projects = [];
	let loading = true;
	let showCreateModal = false;
	
	onMount(async () => {
		try {
			const result = await pb.collection('projects').getList(1, 50, {
				sort: '-created'
			});
			projects = result.items;
		} catch (err) {
			console.error('Failed to load projects:', err);
		} finally {
			loading = false;
		}
	});
	
	async function handleProjectCreated(event) {
		// Add owner field
		const user = pb.authStore.model;
		if (user) {
			try {
				await pb.collection('projects').update(event.detail.id, {
					owner: user.id
				});
			} catch (err) {
				console.error('Failed to set owner:', err);
			}
		}
		projects = [event.detail, ...projects];
		showCreateModal = false;
	}
</script>

<svelte:head>
	<title>AI Music Asset Manager</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Projects</h1>
			<p class="text-gray-400 mt-1">Manage your AI-generated music projects</p>
		</div>
		
		<button
			on:click={() => showCreateModal = true}
			class="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Project
		</button>
	</div>
	
	<!-- Projects Grid -->
	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each Array(6) as _}
				<div class="bg-surface rounded-xl h-64 animate-pulse" />
			{/each}
		</div>
	{:else if projects.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20">
			<div class="w-20 h-20 mx-auto mb-6 bg-surface rounded-full flex items-center justify-center">
				<svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
				</svg>
			</div>
			<h3 class="text-xl font-semibold text-white mb-2">No projects yet</h3>
			<p class="text-gray-400 mb-6">Create your first music project to get started</p>
			<button
				on:click={() => showCreateModal = true}
				class="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				Create First Project
			</button>
		</div>
	{/if}
</div>

<!-- Create Project Modal -->
{#if showCreateModal}
	<CreateProjectModal
		on:close={() => showCreateModal = false}
		on:created={handleProjectCreated}
	/>
{/if}
