<script>
	import { formatDate } from '$lib/utils';

	export let project;

	function getStatusColor(status) {
		switch (status) {
			case 'draft': return 'bg-yellow-500/20 text-yellow-400';
			case 'in_progress': return 'bg-blue-500/20 text-blue-400';
			case 'mastering': return 'bg-purple-500/20 text-purple-400';
			case 'released': return 'bg-green-500/20 text-green-400';
			default: return 'bg-gray-500/20 text-gray-400';
		}
	}
</script>

<a href="/projects/{project.id}" class="block group">
	<div class="bg-surface rounded-xl p-6 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700">
		<!-- Header -->
		<div class="flex items-start justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold text-white group-hover:text-primary transition-colors">
					{project.title}
				</h3>
				{#if project.artist}
					<p class="text-sm text-gray-400 mt-1">{project.artist}</p>
				{/if}
			</div>
			
			<span class="px-3 py-1 rounded-full text-xs font-medium {getStatusColor(project.status)}">
				{project.status || 'draft'}
			</span>
		</div>
		
		<!-- Metadata -->
		<div class="grid grid-cols-2 gap-4 mb-4">
			{#if project.genre}
				<div>
					<p class="text-xs text-gray-500 uppercase tracking-wider">Genre</p>
					<p class="text-sm text-gray-300">{project.genre}</p>
				</div>
			{/if}
			{#if project.bpm}
				<div>
					<p class="text-xs text-gray-500 uppercase tracking-wider">BPM</p>
					<p class="text-sm text-gray-300">{project.bpm}</p>
				</div>
			{/if}
			{#if project.key}
				<div>
					<p class="text-xs text-gray-500 uppercase tracking-wider">Key</p>
					<p class="text-sm text-gray-300">{project.key}</p>
				</div>
			{/if}
		</div>
		
		<!-- Stats -->
		<div class="flex items-center gap-4 pt-4 border-t border-gray-800">
			<div class="flex items-center gap-2 text-sm text-gray-400">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
				</svg>
				<span>{project.audio_files?.length || 0} tracks</span>
			</div>
			
			<div class="flex items-center gap-2 text-sm text-gray-400">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<span>{project.visual_assets?.length || 0} visuals</span>
			</div>
			
			<div class="ml-auto text-xs text-gray-500">
				{formatDate(project.created)}
			</div>
		</div>
	</div>
</a>
