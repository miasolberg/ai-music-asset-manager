import PocketBase from 'pocketbase';
import { browser } from '$app/environment';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Auth store helpers
export function isAuthenticated(): boolean {
	return pb.authStore.isValid;
}

export function getCurrentUser() {
	return pb.authStore.model;
}

export async function login(email: string, password: string) {
	return await pb.collection('users').authWithPassword(email, password);
}

export async function register(email: string, password: string, passwordConfirm: string, name: string) {
	return await pb.collection('users').create({
		email,
		password,
		passwordConfirm,
		name
	});
}

export function logout() {
	pb.authStore.clear();
	if (browser) {
		document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
	}
}

// Save auth to cookie
if (browser) {
	pb.authStore.onChange(() => {
		document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
	});
}
