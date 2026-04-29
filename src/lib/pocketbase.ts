import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const POCKETBASE_URL = env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

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
}

// Get auth token for requests
export function getAuthToken(): string {
	return pb.authStore.token || '';
}

// Helper to create authenticated request options
export function authOptions(): Record<string, string> {
	return {
		'Authorization': pb.authStore.token || ''
	};
}
