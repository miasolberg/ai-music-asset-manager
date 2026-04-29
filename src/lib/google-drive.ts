// Google Drive API Integration
// Docs: https://developers.google.com/drive/api/v3/reference

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
	// eslint-disable-next-line no-var
	var gapi: any;
}

const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.PUBLIC_GOOGLE_API_KEY || '';
const GOOGLE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Types
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
}

interface SyncConfig {
  folderId: string;
  syncDirection: 'upload' | 'download' | 'both';
  autoSync: boolean;
  syncInterval: number; // minutes
}

// Load Google API Script
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-api-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
}

// Initialize Google API
export async function initGoogleDrive(): Promise<boolean> {
  try {
    await loadGoogleScript();
    
    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: GOOGLE_DISCOVERY_DOCS,
            scope: GOOGLE_SCOPES
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    return gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (err) {
    console.error('Failed to init Google Drive:', err);
    return false;
  }
}

// Sign in
export async function signIn(): Promise<boolean> {
  try {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    return authInstance.isSignedIn.get();
  } catch (err) {
    console.error('Google sign in failed:', err);
    return false;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await gapi.auth2.getAuthInstance().signOut();
  } catch (err) {
    console.error('Google sign out failed:', err);
  }
}

// Create folder
export async function createFolder(name: string, parentId?: string): Promise<string | null> {
  try {
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const response = await gapi.client.drive.files.create({
      resource: metadata,
      fields: 'id, name'
    });

    return response.result.id;
  } catch (err) {
    console.error('Failed to create folder:', err);
    return null;
  }
}

// List files in folder
export async function listFiles(folderId: string): Promise<DriveFile[]> {
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
      orderBy: 'name'
    });

    return response.result.files || [];
  } catch (err) {
    console.error('Failed to list files:', err);
    return [];
  }
}

// Upload file
export async function uploadFile(
  file: File, 
  folderId: string, 
  onProgress?: (progress: number) => void
): Promise<DriveFile | null> {
  try {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId]
    };

    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.send(form);
    });
  } catch (err) {
    console.error('Failed to upload file:', err);
    return null;
  }
}

// Download file
export async function downloadFile(fileId: string): Promise<Blob | null> {
  try {
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: 'media'
    });

    return new Blob([response.body]);
  } catch (err) {
    console.error('Failed to download file:', err);
    return null;
  }
}

// Delete file
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    await gapi.client.drive.files.delete({ fileId });
    return true;
  } catch (err) {
    console.error('Failed to delete file:', err);
    return false;
  }
}

// Sync project to Google Drive
export async function syncProjectToDrive(
  projectId: string,
  projectName: string,
  files: File[],
  config: SyncConfig
): Promise<{ success: boolean; uploaded: number; errors: string[] }> {
  const result = { success: false, uploaded: 0, errors: [] as string[] };

  try {
    // Create project folder if not exists
    let projectFolderId = config.folderId;
    
    if (!projectFolderId) {
      projectFolderId = await createFolder(`AI Music - ${projectName}`);
      if (!projectFolderId) {
        result.errors.push('Failed to create project folder');
        return result;
      }
    }

    // Upload each file
    for (const file of files) {
      try {
        const uploaded = await uploadFile(file, projectFolderId);
        if (uploaded) {
          result.uploaded++;
        } else {
          result.errors.push(`Failed to upload: ${file.name}`);
        }
      } catch (err) {
        result.errors.push(`Error uploading ${file.name}: ${err.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;

  } catch (err) {
    result.errors.push(`Sync failed: ${err.message}`);
    return result;
  }
}

// Auto-sync settings
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

// Check if Google Drive is connected
export function isDriveConnected(): boolean {
  try {
    return gapi?.auth2?.getAuthInstance()?.isSignedIn.get() || false;
  } catch {
    return false;
  }
}

export { type DriveFile, type SyncConfig };
