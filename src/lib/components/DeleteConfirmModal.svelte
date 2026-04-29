<script>
	import { createEventDispatcher } from 'svelte';
	
	export let itemName = 'this item';
	export let warning = 'This action cannot be undone.';
	
	const dispatch = createEventDispatcher();
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click|self={() => dispatch('cancel')}>
	<div class="bg-surface rounded-2xl w-full max-w-md mx-4 overflow-hidden">
		<div class="p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
					<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-white">Delete {itemName}?</h3>
					<p class="text-sm text-gray-400 mt-1">{warning}</p>
				</div>
			</div>
			
			<div class="flex gap-3">
				<button
					on:click={() => dispatch('cancel')}
					class="flex-1 px-4 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
				>
					Cancel
				</button>
				<button
					on:click={() => dispatch('confirm')}
					class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
</div>