<script>
  import { onMount } from 'svelte';
  import { formatDate } from '$lib/utils';
  import {
    signInWithGoogle,
    signOutGoogle,
    isDriveConnected,
    syncProjectToDrive,
    createFolder,
    findFolder,
    ensureProjectFolder,
    listFiles,
    saveSyncConfig,
    loadSyncConfig,
    loadGoogleIdentityServices
  } from '$lib/google-drive';
  import { pb } from '$lib/pocketbase';

  export let project;

  let connected = false;
  let syncing = false;
  let syncResult = null;
  let showSettings = false;
  let folderName = '';
  let loading = false;
  let driveFiles = [];
  let config = loadSyncConfig();
  let checkingConnection = true;

  onMount(async () => {
    await loadGoogleIdentityServices();
    connected = isDriveConnected();
    checkingConnection = false;
  });

  async function handleConnect() {
    loading = true;
    const success = await signInWithGoogle();
    connected = success;

    if (success && config?.folderId) {
      driveFiles = await listFiles(config.folderId);
    }
    loading = false;
  }

  async function handleDisconnect() {
    await signOutGoogle();
    connected = false;
    driveFiles = [];
  }

  async function handleSync() {
    if (!project) return;

    syncing = true;
    syncResult = null;

    try {
      // Get project files from PocketBase
      const audioFiles = await pb.collection('audio_files').getFullList({
        filter: `project = "${project.id}"`
      });

      const visualFiles = await pb.collection('visual_assets').getFullList({
        filter: `project = "${project.id}"`
      });

      // Download files from PocketBase and prepare for upload
      const files = [];

      for (const audio of audioFiles) {
        if (audio.file) {
          try {
            const url = pb.files.getUrl(audio, audio.file);
            const response = await fetch(url);
            const blob = await response.blob();
            files.push(new File([blob], audio.file, { type: blob.type || 'audio/mpeg' }));
          } catch (err) {
            console.error(`Failed to download audio file ${audio.file}:`, err);
          }
        }
      }

      for (const visual of visualFiles) {
        if (visual.file) {
          try {
            const url = pb.files.getUrl(visual, visual.file);
            const response = await fetch(url);
            const blob = await response.blob();
            files.push(new File([blob], visual.file, { type: blob.type || 'image/png' }));
          } catch (err) {
            console.error(`Failed to download visual file ${visual.file}:`, err);
          }
        }
      }

      // Sync to Google Drive
      const result = await syncProjectToDrive(
        project.title,
        files,
        {
          folderId: config?.folderId || '',
          folderName: config?.folderName || '',
          syncDirection: config?.syncDirection || 'upload',
          autoSync: config?.autoSync || false,
          syncInterval: config?.syncInterval || 30,
        }
      );

      syncResult = result;

      if (result.folderId) {
        if (!config) config = {};
        config.folderId = result.folderId;
        config.folderName = `AI Music - ${project.title}`;
        saveSyncConfig(config);
      }

      // Refresh drive files list
      if (config?.folderId) {
        driveFiles = await listFiles(config.folderId);
      }

    } catch (err) {
      syncResult = { success: false, uploaded: 0, downloaded: 0, errors: [err.message] };
    } finally {
      syncing = false;
    }
  }

  async function handleCreateFolder() {
    if (!folderName.trim()) return;

    loading = true;
    const folderId = await createFolder(folderName.trim());
    if (folderId) {
      if (!config) config = {};
      config.folderId = folderId;
      config.folderName = folderName.trim();
      saveSyncConfig(config);
      folderName = '';
      driveFiles = await listFiles(folderId);
    }
    loading = false;
  }

  async function handleAutoFolder() {
    if (!project?.title) return;

    loading = true;
    const folderId = await ensureProjectFolder(project.title);
    if (folderId) {
      if (!config) config = {};
      config.folderId = folderId;
      config.folderName = `AI Music - ${project.title}`;
      saveSyncConfig(config);
      driveFiles = await listFiles(folderId);
    }
    loading = false;
  }

  function formatFileSize(bytes) {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }


</script>

<div class="bg-surface rounded-xl p-6 space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M7.71 3L1 15l3.43 6L12 9.71 7.71 3z" fill="#1AA260"/>
        <path d="M22.57 15L15.86 3h-4.72l6.71 12H22.57z" fill="#F4B400"/>
        <path d="M12 15.29L7.71 21h8.58L12 15.29z" fill="#E74536"/>
        <path d="M12 15.29L7.71 21h4.29L17.14 15.29H12z" fill="#547DBE"/>
        <path d="M17.86 15.29L13.57 21H22.57L17.86 15.29z" fill="#1AA260"/>
      </svg>
      <h3 class="text-lg font-semibold text-white">Google Drive Sync</h3>
    </div>

    {#if checkingConnection}
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Checking...
      </div>
    {:else if connected}
      <button
        on:click={handleDisconnect}
        class="text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        Disconnect
      </button>
    {:else}
      <button
        on:click={handleConnect}
        disabled={loading}
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        {#if loading}
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Connecting...
        {:else}
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.183l-9.426-.578z"/>
          </svg>
          Connect
        {/if}
      </button>
    {/if}
  </div>

  {#if connected}
    <div class="space-y-4">
      <!-- Connection Status -->
      <div class="flex items-center gap-2 text-sm text-green-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Connected to Google Drive
      </div>

      <!-- Folder Setup -->
      {#if !config?.folderId}
        <div class="space-y-3">
          <p class="text-sm text-gray-400">Set up a folder for this project:</p>

          <!-- Quick create button -->
          <button
            on:click={handleAutoFolder}
            disabled={loading}
            class="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {#if loading}
              Creating...
            {:else}
              📁 Auto-create "{project?.title ? `AI Music - ${project.title}` : 'AI Music'}" folder
            {/if}
          </button>

          <div class="text-center text-gray-500 text-xs">— or —</div>

          <!-- Manual folder name -->
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={folderName}
              placeholder="Custom folder name"
              class="flex-1 px-3 py-2 bg-darker border border-gray-700 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
            />
            <button
              on:click={handleCreateFolder}
              disabled={!folderName.trim() || loading}
              class="bg-surface hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
              Create
            </button>
          </div>
        </div>
      {:else}
        <!-- Folder Info -->
        <div class="bg-darker rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            <div>
              <p class="text-white text-sm font-medium">{config.folderName || 'Project folder'}</p>
              <p class="text-gray-500 text-xs">{driveFiles.length} files synced</p>
            </div>
          </div>
          <button
            on:click={() => { config = null; saveSyncConfig(null); driveFiles = []; }}
            class="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Remove folder link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      {/if}

      <!-- Sync Button -->
      <button
        on:click={handleSync}
        disabled={syncing || !config?.folderId}
        class="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
      >
        {#if syncing}
          <span class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Syncing...
          </span>
        {:else}
          ↗ Sync to Google Drive
        {/if}
      </button>

      <!-- Sync Result -->
      {#if syncResult}
        <div class={`p-3 rounded-lg text-sm ${syncResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {#if syncResult.success}
            ✅ Synced {syncResult.uploaded} file{syncResult.uploaded !== 1 ? 's' : ''} successfully
          {:else}
            ❌ Sync failed
            {#if syncResult.errors.length > 0}
              <ul class="mt-2 space-y-1">
                {#each syncResult.errors as error}
                  <li class="text-xs">{error}</li>
                {/each}
              </ul>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- Drive Files List -->
      {#if driveFiles.length > 0}
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-300">Files in Drive:</p>
          <div class="max-h-40 overflow-y-auto space-y-1">
            {#each driveFiles as file}
              <div class="flex items-center justify-between py-1.5 px-2 bg-darker rounded text-sm">
                <span class="text-gray-300 truncate">{file.name}</span>
                <span class="text-gray-500 text-xs ml-2 flex-shrink-0">{formatFileSize(file.size)}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else if !checkingConnection}
    <p class="text-sm text-gray-500">
      Connect your Google Drive account to sync project files to the cloud.
      {#if !import.meta.env.PUBLIC_GOOGLE_CLIENT_ID}
        <br/><br/>
        <span class="text-yellow-400">⚠️ Google Drive integration is not configured. Set PUBLIC_GOOGLE_CLIENT_ID in your environment.</span>
      {/if}
    </p>
  {/if}
</div>