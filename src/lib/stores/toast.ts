import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
}

let counter = 0;

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,
		success(message: string) {
			const id = `toast-${++counter}`;
			update((toasts) => [...toasts, { id, message, type: 'success' }]);
			setTimeout(() => update((toasts) => toasts.filter((t) => t.id !== id)), 3000);
		},
		error(message: string) {
			const id = `toast-${++counter}`;
			update((toasts) => [...toasts, { id, message, type: 'error' }]);
			setTimeout(() => update((toasts) => toasts.filter((t) => t.id !== id)), 3000);
		},
		info(message: string) {
			const id = `toast-${++counter}`;
			update((toasts) => [...toasts, { id, message, type: 'info' }]);
			setTimeout(() => update((toasts) => toasts.filter((t) => t.id !== id)), 3000);
		},
		dismiss(id: string) {
			update((toasts) => toasts.filter((t) => t.id !== id));
		}
	};
}

export const toasts = createToastStore();