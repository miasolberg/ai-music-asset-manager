/**
 * Google Drive Sync Integration
 *
 * Uses Google Identity Services (GIS) for OAuth2 + Drive API v3 REST endpoints.
 * This replaces the old gapi-based approach with a cleaner, more modern implementation.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Types
export interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	size?: number;
	modifiedTime?: string;
	webViewLink?: string;
	webContentLink?: string;
	thumbnailLink?: string;
}

export interface SyncConfig {
	folderId: string;
	folderName: string;
	syncDirection: 'upload' | 'download' | 'both';
	autoSync: boolean;
	syncInterval: number; // minutes
	lastSynced?: string;
}

export interface SyncResult {
	success: boolean;
	uploaded: number;
	downloaded: number;
	errors: string[];
	folderId?: string;
}

interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
}

// State
let accessToken: string | null = null;
let tokenExpiry = 0;

// ============= OAuth2 Flow =============

/**
 * Initiate Google OAuth2 sign-in using popup flow.
 * Uses the newer Google Identity Services token client.
 */
export async function signInWithGoogle(): Promise<boolean> {
	if (!GOOGLE_CLIENT_ID) {
		console.error('Google Drive: PUBLIC_GOOGLE_CLIENT_ID not configured');
		return false;
	}

	try {
		const token = await requestAccessToken();
		if (token) {
			accessToken = token.access_token;
			tokenExpiry = Date.now() + (token.expires_in - 60) * 1000;
			return true;
		}
		return false;
	} catch (err) {
		console.error('Google sign in failed:', err);
		return false;
	}
}

/**
 * Request access token via popup OAuth flow.
 * Falls back to manual popup if google.accounts.oauth2 is not available.
 */
function requestAccessToken(): Promise<TokenResponse | null> {
	return new Promise((resolve) => {
		// Check if Google Identity Services is loaded
		if ((window as any).google?.accounts?.oauth2) {
			const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CLIENT_ID,
				scope: GOOGLE_SCOPES,
				callback: (response: any) => {
					if (response.error) {
						console.error('OAuth error:', response.error);
						resolve(null);
					} else {
						resolve({
							access_token: response.access_token,
							expires_in: response.expires_in || 3600,
							token_type: 'Bearer',
							scope: response.scope || GOOGLE_SCOPES,
						});
					}
				},
				error_callback: (error: any) => {
					console.error('OAuth error callback:', error);
					resolve(null);
				},
			});
			tokenClient.requestAccessToken();
		} else {
			// Fallback: manual popup OAuth flow
			oauthPopupFlow().then(resolve).catch(() => resolve(null));
		}
	});
}

/**
 * Manual popup-based OAuth2 flow (fallback when GIS is not loaded).
 */
async function oauthPopupFlow(): Promise<TokenResponse | null> {
	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', window.location.origin + '/');
	authUrl.searchParams.set('response_type', 'token');
	authUrl.searchParams.set('scope', GOOGLE_SCOPES);
	authUrl.searchParams.set('prompt', 'consent');

	const width = 500;
	const height = 600;
	const left = window.screenX + (window.outerWidth - width) / 2;
	const top = window.screenY + (window.outerHeight - height) / 2;

	const popup = window.open(
		authUrl.toString(),
		'google-signin',
		`width=${width},height=${height},left=${left},top=${top}`
	);

	if (!popup) {
		console.error('Popup blocked. Please allow popups for this site.');
		return null;
	}

	return new Promise((resolve) => {
		const checkInterval = setInterval(() => {
			try {
				if (popup.closed) {
					clearInterval(checkInterval);
					resolve(null);
					return;
				}

				const url = popup.location.href;
				if (url) {
					const hash = new URL(url).hash.substring(1);
					const params = new URLSearchParams(hash);
					const token = params.get('access_token');
					const expiresIn = params.get('expires_in');

					if (token) {
						popup.close();
						clearInterval(checkInterval);
						resolve({
							access_token: token,
							expires_in: parseInt(expiresIn || '3600'),
							token_type: 'Bearer',
							scope: GOOGLE_SCOPES,
						});
					}
				}
			} catch (e) {
				// Cross-origin error means popup hasn't redirected back yet
			}
		}, 500);

		// Timeout after 5 minutes
		setTimeout(() => {
			clearInterval(checkInterval);
			if (!popup.closed) popup.close();
			resolve(null);
		}, 300000);
	});
}

/**
 * Sign out by revoking and clearing the access token.
 */
export async function signOutGoogle(): Promise<void> {
	if (accessToken) {
		try {
			await fetch(
				`https://oauth2.googleapis.com/revoke?token=${accessToken}`,
				{ method: 'POST' }
			);
		} catch {
			// Ignore revocation errors
		}
	}
	accessToken = null;
	tokenExpiry = 0;
}

/**
 * Check if currently connected to Google Drive.
 */
export function isDriveConnected(): boolean {
	return !!accessToken && Date.now() < tokenExpiry;
}

/**
 * Get a valid access token, refreshing if necessary.
 */
async function getAccessToken(): Promise<string | null> {
	if (!accessToken || Date.now() >= tokenExpiry) {
		const result = await signInWithGoogle();
		if (!result) return null;
	}
	return accessToken;
}

// ============= Google Drive API =============

/**
 * Create a folder in Google Drive.
 */
export async function createFolder(name: string, parentId?: string): Promise<string | null> {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		const metadata: any = {
			name,
			mimeType: 'application/vnd.google-apps.folder',
		};
		if (parentId) {
			metadata.parents = [parentId];
		}

		const response = await fetch('https://www.googleapis.com/drive/v3/files', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(metadata),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error('Failed to create folder:', error);
			return null;
		}

		const data = await response.json();
		return data.id;
	} catch (err) {
		console.error('Failed to create folder:', err);
		return null;
	}
}

/**
 * Find a folder by name in Google Drive.
 */
export async function findFolder(name: string, parentId?: string): Promise<DriveFile | null> {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
		if (parentId) {
			query += ` and '${parentId}' in parents`;
		}

		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name,mimeType)`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (!response.ok) return null;

		const data = await response.json();
		return data.files?.[0] || null;
	} catch (err) {
		console.error('Failed to find folder:', err);
		return null;
	}
}

/**
 * Create or find a folder for a project.
 * Naming convention: "AI Music - {projectTitle}"
 */
export async function ensureProjectFolder(projectTitle: string): Promise<string | null> {
	const folderName = `AI Music - ${projectTitle}`;

	// Try to find existing folder
	const existing = await findFolder(folderName);
	if (existing) {
		return existing.id;
	}

	// Create new folder
	return createFolder(folderName);
}

/**
 * List files in a Google Drive folder.
 */
export async function listFiles(folderId: string): Promise<DriveFile[]> {
	const token = await getAccessToken();
	if (!token) return [];

	try {
		const query = `'${folderId}' in parents and trashed=false`;
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,thumbnailLink)&orderBy=name&spaces=drive&pageSize=100`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (!response.ok) return [];

		const data = await response.json();
		return data.files || [];
	} catch (err) {
		console.error('Failed to list files:', err);
		return [];
	}
}

/**
 * Upload a file to Google Drive.
 */
export async function uploadFile(
	file: File,
	folderId: string,
	onProgress?: (progress: number) => void
): Promise<DriveFile | null> {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		// Use multipart upload for files
		const metadata = {
			name: file.name,
			mimeType: file.type,
			parents: [folderId],
		};

		// Check if file with same name exists and update it
		const existing = await findFile(file.name, folderId);

		if (existing) {
			// Update existing file
			return updateFile(existing.id, file, onProgress);
		}

		// Create new file via multipart upload
		const form = new FormData();
		form.append(
			'metadata',
			new Blob([JSON.stringify(metadata)], { type: 'application/json' })
		);
		form.append('file', file);

		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable && onProgress) {
					onProgress(Math.round((event.loaded / event.total) * 100));
				}
			});

			xhr.addEventListener('load', () => {
				if (xhr.status === 200) {
					resolve(JSON.parse(xhr.responseText));
				} else {
					console.error('Upload failed:', xhr.statusText);
					resolve(null);
				}
			});

			xhr.addEventListener('error', () => {
				console.error('Upload failed');
				resolve(null);
			});

			xhr.open(
				'POST',
				'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink'
			);
			xhr.setRequestHeader('Authorization', `Bearer ${token}`);
			xhr.send(form);
		});
	} catch (err) {
		console.error('Failed to upload file:', err);
		return null;
	}
}

/**
 * Update an existing file in Google Drive.
 */
async function updateFile(
	fileId: string,
	file: File,
	onProgress?: (progress: number) => void
): Promise<DriveFile | null> {
	const token = await getAccessToken();
	if (!token) return null;

	return new Promise((resolve) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable && onProgress) {
				onProgress(Math.round((event.loaded / event.total) * 100));
			}
		});

		xhr.addEventListener('load', () => {
			if (xhr.status === 200) {
				resolve(JSON.parse(xhr.responseText));
			} else {
				console.error('Update failed:', xhr.statusText);
				resolve(null);
			}
		});

		xhr.addEventListener('error', () => {
			console.error('Update failed');
			resolve(null);
		});

		xhr.open(
			'PATCH',
			`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable&fields=id,name,mimeType,size,modifiedTime,webViewLink`
		);
		xhr.setRequestHeader('Authorization', `Bearer ${token}`);
		xhr.setRequestHeader('Content-Type', file.type);
		xhr.send(file);
	});
}

/**
 * Find a file by name in a folder.
 */
async function findFile(name: string, folderId: string): Promise<DriveFile | null> {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		const query = `name='${name}' and '${folderId}' in parents and trashed=false`;
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name,mimeType)`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (!response.ok) return null;

		const data = await response.json();
		return data.files?.[0] || null;
	} catch {
		return null;
	}
}

/**
 * Download a file from Google Drive.
 */
export async function downloadFile(fileId: string): Promise<Blob | null> {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (!response.ok) {
			console.error('Download failed:', response.statusText);
			return null;
		}

		return await response.blob();
	} catch (err) {
		console.error('Failed to download file:', err);
		return null;
	}
}

/**
 * Delete a file from Google Drive.
 */
export async function deleteFile(fileId: string): Promise<boolean> {
	const token = await getAccessToken();
	if (!token) return false;

	try {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${fileId}`,
			{
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return response.ok;
	} catch (err) {
		console.error('Failed to delete file:', err);
		return false;
	}
}

/**
 * Sync project files to Google Drive.
 * Creates a folder per project and uploads audio files and visual assets.
 */
export async function syncProjectToDrive(
	projectTitle: string,
	files: File[],
	config: SyncConfig
): Promise<SyncResult> {
	const result: SyncResult = {
		success: false,
		uploaded: 0,
		downloaded: 0,
		errors: [],
	};

	try {
		// Ensure we have a folder
		let folderId = config.folderId;

		if (!folderId) {
			folderId = await ensureProjectFolder(projectTitle);
			if (!folderId) {
				result.errors.push('Failed to create/find project folder');
				return result;
			}
			result.folderId = folderId;
		}

		// Upload each file
		for (const file of files) {
			try {
				const uploaded = await uploadFile(file, folderId!, (progress) => {
					// Progress callback — could be used for UI updates
					console.log(`Uploading ${file.name}: ${progress}%`);
				});

				if (uploaded) {
					result.uploaded++;
				} else {
					result.errors.push(`Failed to upload: ${file.name}`);
				}
			} catch (err: any) {
				result.errors.push(`Error uploading ${file.name}: ${err.message}`);
			}
		}

		result.success = result.errors.length === 0;
		return result;
	} catch (err: any) {
		result.errors.push(`Sync failed: ${err.message}`);
		return result;
	}
}

// ============= Sync Config Persistence =============

export function saveSyncConfig(config: SyncConfig): void {
	localStorage.setItem('google-drive-sync-config', JSON.stringify(config));
}

export function loadSyncConfig(): SyncConfig | null {
	try {
		const stored = localStorage.getItem('google-drive-sync-config');
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
}

/**
 * Load the Google Identity Services script dynamically.
 * Call this in onMount to avoid SSR issues.
 */
export function loadGoogleIdentityServices(): Promise<void> {
	return new Promise((resolve) => {
		if ((window as any).google?.accounts?.oauth2) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => {
			console.warn('Failed to load Google Identity Services, falling back to popup flow');
			resolve();
		};
		document.head.appendChild(script);
	});
}