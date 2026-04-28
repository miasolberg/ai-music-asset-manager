<script>
  import { createEventDispatcher } from 'svelte';
  import { pb } from '$lib/pocketbase';
  
  const dispatch = createEventDispatcher();
  
  export let collection;
  export let field = 'file';
  export let accept = '*';
  export let maxSize = 104857600; // 100MB
  
  let fileInput;
  let isDragging = false;
  let uploading = false;
  let error = '';
  let progress = 0;
  
  function handleDragOver(e) {
    e.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }
  
  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }
  
  async function uploadFile(file) {
    // Validate file size
    if (file.size > maxSize) {
      error = `File too large. Max size: ${formatSize(maxSize)}`;
      return;
    }
    
    uploading = true;
    error = '';
    progress = 0;
    
    try {
      const formData = new FormData();
      formData.append(field, file);
      
      // Add owner if user is authenticated
      const user = pb.authStore.model;
      if (user) {
        formData.append('owner', user.id);
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
        }
      }, 200);
      
      const record = await pb.collection(collection).create(formData);
      
      clearInterval(progressInterval);
      progress = 100;
      
      dispatch('upload', { record, file });
      
      // Reset after success
      setTimeout(() => {
        uploading = false;
        progress = 0;
      }, 1000);
      
    } catch (err) {
      uploading = false;
      progress = 0;
      error = err.message || 'Upload failed';
      console.error('Upload error:', err);
    }
  }
  
  function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function triggerFileInput() {
    fileInput.click();
  }
</script>

<div class="space-y-3">
  <!-- Drop Zone -->
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
      {isDragging ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-gray-600'}
      {uploading ? 'pointer-events-none opacity-50' : ''}"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={triggerFileInput}
  >
    <input
      bind:this={fileInput}
      type="file"
      {accept}
      on:change={handleFileSelect}
      class="hidden"
    />
    
    {#if uploading}
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto">
          <svg class="animate-spin w-full h-full text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p class="text-white font-medium">Uploading... {progress}%</p>
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: {progress}%" />
        </div>
      </div>
    {:else}
      <div class="space-y-2">
        <div class="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p class="text-white font-medium">Drop files here or click to upload</p>
        <p class="text-gray-500 text-sm">Max size: {formatSize(maxSize)}</p>
      </div>
    {/if}
  </div>
  
  <!-- Error Message -->
  {#if error}
    <div class="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
      {error}
    </div>
  {/if}
</div>