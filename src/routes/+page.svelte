<script>
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import ProjectCard from '$components/ProjectCard.svelte';
	import CreateProjectModal from '$components/CreateProjectModal.svelte';

	let projects = [];
	let loading = true;
	let showCreateModal = false;
	let error = '';
	let searchQuery = '';
	let statusFilter = '';

	$: filteredProjects = projects.filter(p => {
		const matchesSearch = !searchQuery ||
			p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.genre?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = !statusFilter || p.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	onMount(async () => {
		try {
			const result = await pb.collection('projects').getList(1, 50, {
				sort: '-created'
			});
			projects = result.items;
		} catch (err) {
			console.error('Failed to load projects:', err);
			if (err?.status === 403 || err?.status === 401) {
				error = 'Please log in to view your projects.';
				setTimeout(() => goto('/login'), 2000);
			} else {
				error = 'Failed to load projects. Please try again.';
			}
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

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold text-white">Projects</h1>
			<p class="text-gray-400 mt-1">Manage your AI-generated music projects</p>
		</div>

		<button
			on:click={() => showCreateModal = true}
			class="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center sm:justify-start"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Project
		</button>
	</div>

	<!-- Error State -->
	{#if error}
		<div class="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
			<button on:click={() => { error = ''; }} class="ml-auto text-red-300 hover:text-red-200">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/if}

	<!-- Filters (show when projects exist) -->
	{#if !loading && projects.length > 0}
		<div class="flex flex-col sm:flex-row gap-3">
			<div class="flex-1 relative">
				<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search projects..."
					class="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-700 rounded-lg text-white text-sm focus:border-primary focus:outline-none placeholder-gray-500"
				/>
			</div>
			<select
				bind:value={statusFilter}
				class="px-4 py-2.5 bg-surface border border-gray-700 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
			>
				<option value="">All Status</option>
				<option value="draft">Draft</option>
				<option value="in_progress">In Progress</option>
				<option value="mastering">Mastering</option>
				<option value="released">Released</option>
			</select>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each Array(6) as _}
				<div class="bg-surface rounded-xl h-64 animate-pulse" />
			{/each}
		</div>
	{:else if projects.length === 0}
		<!-- Empty State -->
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
	{:else if filteredProjects.length === 0}
		<!-- No results for filter -->
		<div class="text-center py-16">
			<svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<p class="text-gray-400">No projects match your search</p>
			<button
				on:click={() => { searchQuery = ''; statusFilter = ''; }}
				class="text-primary hover:text-blue-400 text-sm mt-2"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as project (project.id)}
				<ProjectCard {project} />
			{/each}
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