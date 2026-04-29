<script lang="ts">
	import { toasts } from '$lib/stores/toast';

	function getTypeStyles(type: string) {
		switch (type) {
			case 'success': return 'bg-green-600 border-green-500';
			case 'error': return 'bg-red-600 border-red-500';
			case 'info': return 'bg-blue-600 border-blue-500';
			default: return 'bg-gray-600 border-gray-500';
		}
	}

	function getTypeIcon(type: string) {
		switch (type) {
			case 'success': return '✓';
			case 'error': return '✕';
			case 'info': return 'ℹ';
			default: return '•';
		}
	}
</script>

<div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
	{#each $toasts as toast (toast.id)}
		<div
			class="flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg border animate-slide-in {getTypeStyles(toast.type)}"
		>
			<span class="text-lg font-bold flex-shrink-0">{getTypeIcon(toast.type)}</span>
			<span class="text-sm flex-1">{toast.message}</span>
			<button
				on:click={() => toasts.dismiss(toast.id)}
				class="text-white/70 hover:text-white flex-shrink-0 ml-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	.animate-slide-in {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>