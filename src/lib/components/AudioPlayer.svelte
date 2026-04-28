<script>
  export let src;
  export let title = 'Audio';
  
  let audioElement;
  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let volume = 1;
  
  function togglePlay() {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    isPlaying = !isPlaying;
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  function handleTimeUpdate() {
    currentTime = audioElement.currentTime;
  }
  
  function handleLoadedMetadata() {
    duration = audioElement.duration;
  }
  
  function handleSeek(event) {
    const rect = event.target.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * duration;
  }
  
  function handleVolumeChange(event) {
    volume = event.target.value;
    audioElement.volume = volume;
  }
</script>

<div class="bg-surface rounded-xl p-4 space-y-3">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button 
        on:click={togglePlay}
        class="w-10 h-10 bg-primary hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
      >
        {#if isPlaying}
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
          </svg>
        {:else}
          <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        {/if}
      </button>
      <div>
        <p class="text-white font-medium text-sm">{title}</p>
        <p class="text-gray-500 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</p>
      </div>
    </div>
    
    <!-- Volume -->
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1" 
        value={volume}
        on:input={handleVolumeChange}
        class="w-20 accent-primary"
      />
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div 
    class="h-1.5 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
    on:click={handleSeek}
  >
    <div 
      class="h-full bg-primary rounded-full transition-all"
      style="width: {(currentTime / duration) * 100 || 0}%"
    />
  </div>
  
  <!-- Audio Element -->
  <audio 
    bind:this={audioElement}
    {src}
    on:timeupdate={handleTimeUpdate}
    on:loadedmetadata={handleLoadedMetadata}
    on:ended={() => isPlaying = false}
    class="hidden"
  />
</div>