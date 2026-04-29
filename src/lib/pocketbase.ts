import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { Project, AudioFile, Prompt, Lyrics, VisualAsset } from '$lib/types/pocketbase';

const POCKETBASE_URL = env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Configure PocketBase for better DX
pb.autoCancellation(false);

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
	await pb.collection('users').create({
		email,
		password,
		passwordConfirm,
		name
	});
	// Auto-login after registration
	return await pb.collection('users').authWithPassword(email, password);
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

// ============= Typed Collection Helpers =============

/** Projects */
export const projects = {
	list(page = 1, perPage = 50, sort = '-created') {
		return pb.collection('projects').getList<Project>(page, perPage, { sort });
	},
	getOne(id: string) {
		return pb.collection('projects').getOne<Project>(id);
	},
	create(data: Partial<Project>) {
		return pb.collection('projects').create<Project>(data);
	},
	update(id: string, data: Partial<Project>) {
		return pb.collection('projects').update<Project>(id, data);
	},
	delete(id: string) {
		return pb.collection('projects').delete(id);
	}
};

/** Audio Files */
export const audioFiles = {
	list(projectId: string) {
		return pb.collection('audio_files').getFullList<AudioFile>({
			filter: `project = "${projectId}"`,
			sort: '-created'
		});
	},
	create(data: Partial<AudioFile>) {
		return pb.collection('audio_files').create<AudioFile>(data);
	},
	delete(id: string) {
		return pb.collection('audio_files').delete(id);
	}
};

/** Prompts */
export const prompts = {
	list(projectId: string) {
		return pb.collection('prompts').getFullList<Prompt>({
			filter: `project = "${projectId}"`,
			sort: '-created'
		});
	},
	create(data: Partial<Prompt>) {
		return pb.collection('prompts').create<Prompt>(data);
	},
	delete(id: string) {
		return pb.collection('prompts').delete(id);
	}
};

/** Lyrics */
export const lyrics = {
	list(projectId: string) {
		return pb.collection('lyrics').getFullList<Lyrics>({
			filter: `project = "${projectId}"`,
			sort: '-created'
		});
	},
	create(data: Partial<Lyrics>) {
		return pb.collection('lyrics').create<Lyrics>(data);
	},
	update(id: string, data: Partial<Lyrics>) {
		return pb.collection('lyrics').update<Lyrics>(id, data);
	},
	delete(id: string) {
		return pb.collection('lyrics').delete(id);
	}
};

/** Visual Assets */
export const visualAssets = {
	list(projectId: string) {
		return pb.collection('visual_assets').getFullList<VisualAsset>({
			filter: `project = "${projectId}"`,
			sort: '-created'
		});
	},
	create(data: Partial<VisualAsset>) {
		return pb.collection('visual_assets').create<VisualAsset>(data);
	},
	delete(id: string) {
		return pb.collection('visual_assets').delete(id);
	}
};