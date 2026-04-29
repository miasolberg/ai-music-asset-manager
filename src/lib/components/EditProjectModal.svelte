<script>
	import { createEventDispatcher } from 'svelte';
	import { pb } from '$lib/pocketbase';
	
	export let project;
	
	const dispatch = createEventDispatcher();
	
	let title = project.title || '';
	let artist = project.artist || '';
	let genre = project.genre || '';
	let bpm = project.bpm || '';
	let key = project.key || '';
	let description = project.description || '';
	let status = project.status || 'draft';
	let loading = false;
	let error = '';
	
	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'mastering', label: 'Mastering' },
		{ value: 'released', label: 'Released' }
	];
	
	async function handleSubmit() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const updated = await pb.collection('projects').update(project.id, {
				title: title.trim(),
				artist: artist.trim() || undefined,
				genre: genre.trim() || undefined,
				bpm: bpm ? parseInt(bpm) : undefined,
				key: key.trim() || undefined,
				description: description.trim() || undefined,
				status
			});
			dispatch('saved', updated);
		} catch (err) {
			console.error('Failed to update project:', err);
			error = err.message || 'Failed to update project';
		} finally {
			loading = false;
		}
	}
	
	function close() {
		dispatch('close');
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click|self={close}>
	<div class="bg-surface rounded-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-surface z-10">
			<h2 class="text-xl font-semibold text-white">Edit Project</h2>
			<button on:click={close} class="text-gray-400 hover:text-white">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<!-- Form -->
		<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
			{#if error}
				<div class="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
					{error}
				</div>
			{/if}
			
			<div>
				<label class="block text-sm font-medium text-gray-300 mb-2">Title *</label>
				<input
					type="text"
					bind:value={title}
					required
					class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
					placeholder="My Awesome Track"
				/>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Artist</label>
					<input
						type="text"
						bind:value={artist}
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="Artist Name"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Genre</label>
					<input
						type="text"
						bind:value={genre}
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="Pop, Rock, Electronic..."
					/>
				</div>
			</div>
			
			<div class="grid grid-cols-3 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">BPM</label>
					<input
						type="number"
						bind:value={bpm}
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="120"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Key</label>
					<input
						type="text"
						bind:value={key}
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
						placeholder="C Major"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
					<select
						bind:value={status}
						class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
					>
						{#each statusOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
				<textarea
					bind:value={description}
					rows="3"
					class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none resize-none"
					placeholder="Project notes..."
				></textarea>
			</div>
			
			<div class="flex gap-3 pt-4">
				<button
					type="button"
					on:click={close}
					class="flex-1 px-4 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={loading}
					class="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
				>
					{#if loading}
						<span class="flex items-center justify-center gap-2">
							<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Saving...
						</span>
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>