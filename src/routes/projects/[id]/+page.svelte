<script>
	import { page } from '$app/stores';
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import AudioPlayer from '$components/AudioPlayer.svelte';
	import FileUpload from '$components/FileUpload.svelte';
	
	let project = null;
	let loading = true;
	let error = '';
	let showUploadAudio = false;
	let showUploadVisual = false;
	
	async function loadProject() {
		try {
			const id = $page.params.id;
			project = await pb.collection('projects').getOne(id, {
				expand: 'audio_files(project),prompts(project),lyrics(project),visual_assets(project)'
			});
		} catch (err) {
			error = 'Failed to load project';
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	onMount(loadProject);
	
	function handleAudioUpload(event) {
		showUploadAudio = false;
		loadProject(); // Reload to show new file
	}
	
	function handleVisualUpload(event) {
		showUploadVisual = false;
		loadProject(); // Reload to show new file
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
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-white">{project.title}</h1>
				{#if project.artist}
					<p class="text-xl text-gray-400 mt-2">{project.artist}</p>
				{/if}
				<div class="flex items-center gap-4 mt-4">
					{#if project.genre}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">{project.genre}</span>
					{/if}
					{#if project.bpm}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">{project.bpm} BPM</span>
					{/if}
					{#if project.key}
						<span class="bg-surface px-3 py-1 rounded-full text-sm text-gray-300">{project.key}</span>
					{/if}
				</div>
			</div>
			
			<span class="px-4 py-2 rounded-full text-sm font-medium capitalize
				{project.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
				 project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
				 project.status === 'mastering' ? 'bg-purple-500/20 text-purple-400' :
				 'bg-green-500/20 text-green-400'}"
			>
				{project.status || 'draft'}
			</span>
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
					<span class="text-sm text-gray-500">{project.expand?.['audio_files(project)']?.length || 0} files</span>
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
						on:upload={handleAudioUpload}
					/>
				</div>
			{/if}
			
			{#if project.expand?.['audio_files(project)']?.length > 0}
				<div class="space-y-3">
					{#each project.expand['audio_files(project)'] as audio}
						<div class="bg-darker rounded-lg p-4">
							{#if audio.file}
								<AudioPlayer 
									src={pb.files.getUrl(audio, audio.file)}
									title="{audio.version || 'v1'} - {audio.file_type}"
								/>
							{:else}
								<p class="text-gray-500">No audio file</p>
							{/if}
							{#if audio.notes}
								<p class="text-sm text-gray-500 mt-2">{audio.notes}</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No audio files yet.</p>
			{/if}
		</div>
		
		<!-- Prompts -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-white">AI Prompts</h2>
				<span class="text-sm text-gray-500">{project.expand?.['prompts(project)']?.length || 0} prompts</span>
			</div>
			
			{#if project.expand?.['prompts(project)']?.length > 0}
				<div class="space-y-3">
					{#each project.expand['prompts(project)'] as prompt}
						<div class="bg-darker rounded-lg p-4">
							<div class="flex items-center gap-2 mb-2">
								{#if prompt.ai_service}
									<span class="bg-accent/20 text-accent px-2 py-1 rounded text-xs">{prompt.ai_service}</span>
								{/if}
								{#if prompt.tags}
									<span class="text-gray-500 text-xs">{prompt.tags}</span>
								{/if}
							</div>
							<p class="text-gray-300 text-sm">{prompt.prompt_text}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No prompts yet.</p>
			{/if}
		</div>
		
		<!-- Lyrics -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-white">Lyrics</h2>
				<span class="text-sm text-gray-500">{project.expand?.['lyrics(project)']?.length || 0} versions</span>
			</div>
			
			{#if project.expand?.['lyrics(project)']?.length > 0}
				<div class="space-y-3">
					{#each project.expand['lyrics(project)'] as lyric}
						<div class="bg-darker rounded-lg p-4">
							<pre class="text-gray-300 whitespace-pre-wrap font-sans text-sm">{lyric.content}</pre>
							{#if lyric.language}
								<p class="text-gray-500 text-xs mt-2">Language: {lyric.language}</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No lyrics yet.</p>
			{/if}
		</div>
		
		<!-- Visual Assets -->
		<div class="bg-surface rounded-xl p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-white">Visual Assets</h2>
				<span class="text-sm text-gray-500">{project.expand?.['visual_assets(project)']?.length || 0} assets</span>
			</div>
			
			{#if project.expand?.['visual_assets(project)']?.length > 0}
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{#each project.expand['visual_assets(project)'] as visual}
						<div class="bg-darker rounded-lg overflow-hidden">
							<img src="{pb.files.getUrl(visual, visual.file)}" alt="{visual.alt_text || visual.asset_type}" class="w-full aspect-square object-cover" />
							<div class="p-3">
								<p class="text-white text-sm font-medium">{visual.asset_type}</p>
								{#if visual.format}
									<p class="text-gray-500 text-xs">{visual.format}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No visual assets yet.</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="text-center py-20">
		<p class="text-gray-500">Project not found.</p>
	</div>
{/if}
