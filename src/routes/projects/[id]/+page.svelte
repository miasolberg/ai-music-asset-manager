<script>
	import { page } from '$app/stores';
	import { pb, getCurrentUser } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import AudioPlayer from '$components/AudioPlayer.svelte';
	import FileUpload from '$components/FileUpload.svelte';
	import GoogleDriveSync from '$components/GoogleDriveSync.svelte';
	import EditProjectModal from '$components/EditProjectModal.svelte';
	import DeleteConfirmModal from '$components/DeleteConfirmModal.svelte';
	
	let project = null;
	let audioFiles = [];
	let prompts = [];
	let lyrics = [];
	let visualAssets = [];
	let loading = true;
	let error = '';
	let showUploadAudio = false;
	let showUploadVisual = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let deleting = false;
	
	// Prompt form state
	let showPromptForm = false;
	let promptText = '';
	let promptService = '';
	let promptTags = '';
	let promptSaving = false;
	
	// Lyrics form state
	let showLyricsForm = false;
	let lyricsContent = '';
	let lyricsLanguage = '';
	let lyricsEditingId = null;
	let lyricsSaving = false;
	
	const statusFlow = ['draft', 'in_progress', 'mastering', 'released'];
	const statusLabels = {
		draft: 'Draft',
		in_progress: 'In Progress',
		mastering: 'Mastering',
		released: 'Released'
	};
	
	async function loadProject() {
		try {
			const id = $page.params.id;
			project = await pb.collection('projects').getOne(id);
			
			// Load sub-resources separately (more reliable than expand)
			const promises = [
				pb.collection('audio_files').getFullList({
					filter: `project = "${id}"`,
					sort: '-created'
				}).catch(() => []),
				pb.collection('prompts').getFullList({
					filter: `project = "${id}"`,
					sort: '-created'
				}).catch(() => []),
				pb.collection('lyrics').getFullList({
					filter: `project = "${id}"`,
					sort: '-created'
				}).catch(() => []),
				pb.collection('visual_assets').getFullList({
					filter: `project = "${id}"`,
					sort: '-created'
				}).catch(() => [])
			];
			
			[audioFiles, prompts, lyrics, visualAssets] = await Promise.all(promises);
		} catch (err) {
			error = 'Failed to load project';
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	onMount(loadProject);
	
	function handleProjectSaved(event) {
		project = { ...project, ...event.detail };
		showEditModal = false;
	}
	
	async function handleDelete() {
		deleting = true;
		try {
			// Delete sub-resources first
			for (const audio of audioFiles) {
				await pb.collection('audio_files').delete(audio.id).catch(() => {});
			}
			for (const prompt of prompts) {
				await pb.collection('prompts').delete(prompt.id).catch(() => {});
			}
			for (const lyric of lyrics) {
				await pb.collection('lyrics').delete(lyric.id).catch(() => {});
			}
			for (const visual of visualAssets) {
				await pb.collection('visual_assets').delete(visual.id).catch(() => {});
			}
			
			await pb.collection('projects').delete(project.id);
			window.location.href = '/';
		} catch (err) {
			console.error('Failed to delete project:', err);
		} finally {
			deleting = false;
		}
	}
	
	function handleAudioUpload() {
		showUploadAudio = false;
		loadProject();
	}
	
	function handleVisualUpload() {
		showUploadVisual = false;
		loadProject();
	}
	
	// Prompt CRUD
	async function savePrompt() {
		if (!promptText.trim()) return;
		promptSaving = true;
		try {
			await pb.collection('prompts').create({
				project: project.id,
				prompt_text: promptText.trim(),
				ai_service: promptService || undefined,
				tags: promptTags.trim() || undefined,
				owner: pb.authStore.model?.id
			});
			promptText = '';
			promptService = '';
			promptTags = '';
			showPromptForm = false;
			await loadProject();
		} catch (err) {
			console.error('Failed to save prompt:', err);
		} finally {
			promptSaving = false;
		}
	}
	
	async function deletePrompt(id) {
		try {
			await pb.collection('prompts').delete(id);
			await loadProject();
		} catch (err) {
			console.error('Failed to delete prompt:', err);
		}
	}
	
	// Lyrics CRUD
	async function saveLyrics() {
		if (!lyricsContent.trim()) return;
		lyricsSaving = true;
		try {
			if (lyricsEditingId) {
				await pb.collection('lyrics').update(lyricsEditingId, {
					content: lyricsContent.trim(),
					language: lyricsLanguage.trim() || undefined
				});
			} else {
				await pb.collection('lyrics').create({
					project: project.id,
					content: lyricsContent.trim(),
					language: lyricsLanguage.trim() || undefined,
					owner: pb.authStore.model?.id
				});
			}
			lyricsContent = '';
			lyricsLanguage = '';
			lyricsEditingId = null;
			showLyricsForm = false;
			await loadProject();
		} catch (err) {
			console.error('Failed to save lyrics:', err);
		} finally {
			lyricsSaving = false;
		}
	}
	
	function editLyrics(lyric) {
		lyricsEditingId = lyric.id;
		lyricsContent = lyric.content;
		lyricsLanguage = lyric.language || '';
		showLyricsForm = true;
	}
	
	async function deleteLyrics(id) {
		try {
			await pb.collection('lyrics').delete(id);
			await loadProject();
		} catch (err) {
			console.error('Failed to delete lyrics:', err);
		}
	}
	
	async function deleteAudio(id) {
		try {
			await pb.collection('audio_files').delete(id);
			await loadProject();
		} catch (err) {
			console.error('Failed to delete audio:', err);
		}
	}
	
	async function deleteVisual(id) {
		try {
			await pb.collection('visual_assets').delete(id);
			await loadProject();
		} catch (err) {
			console.error('Failed to delete visual:', err);
		}
	}
	
	function getStatusColor(status) {
		switch (status) {
			case 'draft': return 'bg-yellow-500/20 text-yellow-400';
			case 'in_progress': return 'bg-blue-500/20 text-blue-400';
			case 'mastering': return 'bg-purple-500/20 text-purple-400';
			case 'released': return 'bg-green-500/20 text-green-400';
			default: return 'bg-gray-500/20 text-gray-400';
		}
	}
	
	async function advanceStatus() {
		if (!project) return;
		const currentIndex = statusFlow.indexOf(project.status || 'draft');
		if (currentIndex < statusFlow.length - 1) {
			const nextStatus = statusFlow[currentIndex + 1];
			try {
				await pb.collection('projects').update(project.id, { status: nextStatus });
				project = { ...project, status: nextStatus };
			} catch (err) {
				console.error('Failed to update status:', err);
			}
		}
	}
	
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric', month: 'short', day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{project?.title || 'Project'} - AI Music Manager</title>
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center h-64">
		<div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
	</div>
{:else if error}
	<div class="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>
{:else if project}
	<div class="space-y-8">
		<!-- Project Header -->
		<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
			<div class="min-w-0">
				<h1 class="text-2xl sm:text-3xl font-bold text-white break-words">{project.title}</h1>
				{#if project.artist}
					<p class="text-lg sm:text-xl text-gray-400 mt-2">{project.artist}</p>
				{/if}
				<div class="flex items-center gap-2 mt-4 flex-wrap">
					<span class="px-3 py-1.5 rounded-full text-sm font-medium {getStatusColor(project.status)}">
						{statusLabels[project.status] || 'Draft'}
					</span>
					{#if project.genre}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">{project.genre}</span>
					{/if}
					{#if project.bpm}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">{project.bpm} BPM</span>
					{/if}
					{#if project.key}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">Key: {project.key}</span>
					{/if}
					<span class="text-xs text-gray-500">Created {formatDate(project.created)}</span>
				</div>
			</div>
			
			<div class="flex items-center gap-2 flex-wrap">
				{#if statusFlow.indexOf(project.status || 'draft') < statusFlow.length - 1}
					<button
						on:click={advanceStatus}
						class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
					>
						Advance → {statusLabels[statusFlow[statusFlow.indexOf(project.status || 'draft') + 1]]}
					</button>
				{/if}
				<button
					on:click={() => showEditModal = true}
					class="bg-surface hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
				>
					Edit
				</button>
				<button
					on:click={() => showDeleteModal = true}
					class="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					Delete
				</button>
			</div>
		</div>
		
		<!-- Description -->
		{#if project.description}
			<div class="bg-surface rounded-xl p-6">
				<h2 class="text-lg font-semibold text-white mb-3">Description</h2>
				<p class="text-gray-400 whitespace-pre-wrap">{project.description}</p>
			</div>
		{/if}
		
		<!-- Audio Files -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold text-white">Audio Files</h2>
					<span class="text-sm text-gray-500">{audioFiles.length} files</span>
				</div>
				<button 
					on:click={() => showUploadAudio = !showUploadAudio}
					class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					{showUploadAudio ? 'Cancel' : 'Upload Audio'}
				</button>
			</div>
			
			{#if showUploadAudio}
				<div class="mb-6">
					<FileUpload 
						collection="audio_files" 
						field="file"
						accept="audio/*"
						extraData={{ project: project.id }}
						on:upload={handleAudioUpload}
					/>
				</div>
			{/if}
			
			{#if audioFiles.length > 0}
				<div class="space-y-3">
					{#each audioFiles as audio}
						<div class="bg-darker rounded-lg p-4 group relative">
							{#if audio.file}
								<AudioPlayer 
									src={pb.files.getUrl(audio, audio.file)}
									title="{audio.version || 'v1'} - {audio.file_type || 'audio'}"
								/>
							{:else}
								<p class="text-gray-500">No audio file</p>
							{/if}
							{#if audio.notes}
								<p class="text-sm text-gray-500 mt-2">{audio.notes}</p>
							{/if}
							<button
								on:click={() => deleteAudio(audio.id)}
								class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
								title="Delete"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m4 0H5" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No audio files yet. Upload one to get started.</p>
			{/if}
		</div>
		
		<!-- Prompts -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold text-white">AI Prompts</h2>
					<span class="text-sm text-gray-500">{prompts.length} prompts</span>
				</div>
				<button 
					on:click={() => showPromptForm = !showPromptForm}
					class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					{showPromptForm ? 'Cancel' : 'Add Prompt'}
				</button>
			</div>
			
			{#if showPromptForm}
				<form on:submit|preventDefault={savePrompt} class="mb-4 bg-darker rounded-lg p-4 space-y-3">
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-1">Prompt Text *</label>
						<textarea
							bind:value={promptText}
							required
							rows="3"
							class="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none resize-none"
							placeholder="Enter the AI prompt used for generation..."
						></textarea>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-1">AI Service</label>
							<select
								bind:value={promptService}
								class="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
							>
								<option value="">None</option>
								<option value="Suno">Suno</option>
								<option value="Udio">Udio</option>
								<option value="AIVA">AIVA</option>
								<option value="Boomy">Boomy</option>
								<option value="Soundraw">Soundraw</option>
								<option value="Other">Other</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-1">Tags</label>
							<input
								type="text"
								bind:value={promptTags}
								class="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
								placeholder="electronic, chill, ambient"
							/>
						</div>
					</div>
					<div class="flex justify-end gap-2">
						<button
							type="button"
							on:click={() => { showPromptForm = false; promptText = ''; promptService = ''; promptTags = ''; }}
							class="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={promptSaving || !promptText.trim()}
							class="px-4 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
						>
							{promptSaving ? 'Saving...' : 'Save Prompt'}
						</button>
					</div>
				</form>
			{/if}
			
			{#if prompts.length > 0}
				<div class="space-y-3">
					{#each prompts as prompt}
						<div class="bg-darker rounded-lg p-4 group">
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										{#if prompt.ai_service}
											<span class="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-medium">{prompt.ai_service}</span>
										{/if}
										{#if prompt.tags}
											{#each prompt.tags.split(',').map(t => t.trim()) as tag}
												<span class="bg-surface px-2 py-1 rounded text-xs text-gray-400">{tag}</span>
											{/each}
										{/if}
									</div>
									<p class="text-gray-300 text-sm whitespace-pre-wrap">{prompt.prompt_text}</p>
									<p class="text-gray-600 text-xs mt-2">{formatDate(prompt.created)}</p>
								</div>
								<button
									on:click={() => deletePrompt(prompt.id)}
									class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
									title="Delete"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No prompts yet. Add one to track your AI generation inputs.</p>
			{/if}
		</div>
		
		<!-- Lyrics -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold text-white">Lyrics</h2>
					<span class="text-sm text-gray-500">{lyrics.length} versions</span>
				</div>
				<button 
					on:click={() => { showLyricsForm = true; lyricsEditingId = null; lyricsContent = ''; lyricsLanguage = ''; }}
					class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					Add Lyrics
				</button>
			</div>
			
			{#if showLyricsForm}
				<form on:submit|preventDefault={saveLyrics} class="mb-4 bg-darker rounded-lg p-4 space-y-3">
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-1">Lyrics Content *</label>
						<textarea
							bind:value={lyricsContent}
							required
							rows="8"
							class="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none resize-y font-mono"
							placeholder="Enter or paste your lyrics here..."
						></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-1">Language</label>
						<input
							type="text"
							bind:value={lyricsLanguage}
							class="w-full px-4 py-3 bg-surface border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
							placeholder="en, de, es, etc."
						/>
					</div>
					<div class="flex justify-end gap-2">
						<button
							type="button"
							on:click={() => { showLyricsForm = false; lyricsContent = ''; lyricsLanguage = ''; lyricsEditingId = null; }}
							class="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={lyricsSaving || !lyricsContent.trim()}
							class="px-4 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
						>
							{lyricsSaving ? 'Saving...' : (lyricsEditingId ? 'Update Lyrics' : 'Save Lyrics')}
						</button>
					</div>
				</form>
			{/if}
			
			{#if lyrics.length > 0}
				<div class="space-y-3">
					{#each lyrics as lyric}
						<div class="bg-darker rounded-lg p-4 group">
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-2">
										{#if lyric.language}
											<span class="bg-surface px-2 py-1 rounded text-xs text-gray-400">{lyric.language}</span>
										{/if}
										<span class="text-gray-600 text-xs">{formatDate(lyric.created)}</span>
									</div>
									<pre class="text-gray-300 whitespace-pre-wrap font-sans text-sm">{lyric.content}</pre>
								</div>
								<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										on:click={() => editLyrics(lyric)}
										class="text-gray-400 hover:text-white p-1"
										title="Edit"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button
										on:click={() => deleteLyrics(lyric.id)}
										class="text-red-400 hover:text-red-300 p-1"
										title="Delete"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No lyrics yet. Add your lyrics to keep track of different versions.</p>
			{/if}
		</div>
		
		<!-- Visual Assets -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold text-white">Visual Assets</h2>
					<span class="text-sm text-gray-500">{visualAssets.length} assets</span>
				</div>
				<button 
					on:click={() => showUploadVisual = !showUploadVisual}
					class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					{showUploadVisual ? 'Cancel' : 'Upload Visual'}
				</button>
			</div>
			
			{#if showUploadVisual}
				<div class="mb-6">
					<FileUpload 
						collection="visual_assets" 
						field="file"
						accept="image/*"
						extraData={{ project: project.id }}
						on:upload={handleVisualUpload}
					/>
				</div>
			{/if}
			
			{#if visualAssets.length > 0}
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{#each visualAssets as visual}
						<div class="bg-darker rounded-lg overflow-hidden group relative">
							{#if visual.file}
								<img src={pb.files.getUrl(visual, visual.file)} alt={visual.alt_text || visual.asset_type || 'Visual asset'} class="w-full aspect-square object-cover" />
							{:else}
								<div class="w-full aspect-square bg-gray-800 flex items-center justify-center">
									<svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
							{/if}
							<div class="p-3">
								<p class="text-white text-sm font-medium">{visual.asset_type || 'Asset'}</p>
								{#if visual.format}
									<p class="text-gray-500 text-xs">{visual.format}</p>
								{/if}
							</div>
							<button
								on:click={() => deleteVisual(visual.id)}
								class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full"
								title="Delete"
							>
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No visual assets yet. Upload covers, thumbnails, or promo images.</p>
			{/if}
		</div>
		
		<!-- Google Drive Sync -->
		<GoogleDriveSync {project} />
	</div>
{:else}
	<div class="text-center py-20">
		<p class="text-gray-500">Project not found.</p>
	</div>
{/if}

{#if showEditModal && project}
	<EditProjectModal {project} on:close={() => showEditModal = false} on:saved={handleProjectSaved} />
{/if}

{#if showDeleteModal && project}
	<DeleteConfirmModal 
		itemName="{project.title}"
		on:cancel={() => showDeleteModal = false}
		on:confirm={handleDelete}
	/>
{/if}