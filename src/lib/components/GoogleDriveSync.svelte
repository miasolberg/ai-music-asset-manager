<script>
  import { onMount } from 'svelte';
  import { 
    initGoogleDrive, 
    signIn, 
    signOut, 
    isDriveConnected,
    syncProjectToDrive,
    createFolder,
    saveSyncConfig,
    loadSyncConfig
  } from '$lib/google-drive';
  import { pb } from '$lib/pocketbase';
  
  export let project;
  
  let connected = false;
  let syncing = false;
  let syncResult = null;
  let showSettings = false;
  let folderName = '';
  let config = loadSyncConfig();
  
  onMount(async () => {
    connected = await initGoogleDrive();
  });
  
  async function handleConnect() {
    const success = await signIn();
    connected = success;
  }
  
  async function handleDisconnect() {
    await signOut();
    connected = false;
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
      
      // Download files from PocketBase
      const files = [];
      
      for (const audio of audioFiles) {
        if (audio.file) {
          const url = pb.files.getUrl(audio, audio.file);
          const response = await fetch(url);
          const blob = await response.blob();
          files.push(new File([blob], audio.file, { type: blob.type }));
        }
      }
      
      for (const visual of visualFiles) {
        if (visual.file) {
          const url = pb.files.getUrl(visual, visual.file);
          const response = await fetch(url);
          const blob = await response.blob();
          files.push(new File([blob], visual.file, { type: blob.type }));
        }
      }
      
      // Sync to Google Drive
      const result = await syncProjectToDrive(
        project.id,
        project.title,
        files,
        {
          folderId: config?.folderId || '',
          syncDirection: config?.syncDirection || 'upload',
          autoSync: config?.autoSync || false,
          syncInterval: config?.syncInterval || 30
        }
      );
      
      syncResult = result;
      
      if (result.success) {
        // Save folder ID for future syncs
        if (!config) config = {};
        config.folderId = result.folderId;
        saveSyncConfig(config);
      }
      
    } catch (err) {
      syncResult = { success: false, uploaded: 0, errors: [err.message] };
    } finally {
      syncing = false;
    }
  }
  
  async function handleCreateFolder() {
    if (!folderName) return;
    
    const folderId = await createFolder(folderName);
    if (folderId) {
      if (!config) config = {};
      config.folderId = folderId;
      saveSyncConfig(config);
      folderName = '';
    }
  }
</script>

<div class="bg-surface rounded-xl p-6 space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <h3 class="text-lg font-semibold text-white">Google Drive Sync</h3>
    </div>
    
    {#if connected}
      <button 
        on:click={handleDisconnect}
        class="text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        Disconnect
      </button>
    {:else}
      <button 
        on:click={handleConnect}
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Connect
      </button>
    {/if}
  </div>
  
  {#if connected}
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Connected to Google Drive
      </div>
      
      {#if !config?.folderId}
        <div class="space-y-2">
          <p class="text-sm text-gray-400">Create a folder for this project:</p>
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={folderName}
              placeholder="Folder name"
              class="flex-1 px-3 py-2 bg-darker border border-gray-700 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
            />
            <button
              on:click={handleCreateFolder}
              disabled={!folderName}
              class="bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      {:else}
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          Folder configured
        </div>
      {/if}
      
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
          Sync to Google Drive
        {/if}
      </button>
      
      {#if syncResult}
        <div class={`p-3 rounded-lg text-sm ${syncResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {#if syncResult.success}
            ✅ Synced {syncResult.uploaded} files successfully
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
    </div>
  {:else}
    <p class="text-sm text-gray-500">
      Connect your Google Drive account to sync project files to the cloud.
    </p>
  {/if}
</div>
