<script>
  import { createEventDispatcher } from 'svelte';
  import AudioPlayer from './AudioPlayer.svelte';
  
  export let tracks = [];
  export let currentTrackIndex = 0;
  
  const dispatch = createEventDispatcher();
  
  let isShuffling = false;
  let isRepeating = false;
  
  function nextTrack() {
    if (isShuffling) {
      currentTrackIndex = Math.floor(Math.random() * tracks.length);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    dispatch('trackChange', { index: currentTrackIndex });
  }
  
  function prevTrack() {
    if (isShuffling) {
      currentTrackIndex = Math.floor(Math.random() * tracks.length);
    } else {
      currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    dispatch('trackChange', { index: currentTrackIndex });
  }
  
  function handleTrackEnd() {
    if (isRepeating) {
      // Replay current track
      dispatch('trackChange', { index: currentTrackIndex });
    } else {
      nextTrack();
    }
  }
  
  function selectTrack(index) {
    currentTrackIndex = index;
    dispatch('trackChange', { index });
  }
  
  $: currentTrack = tracks[currentTrackIndex];
  $: progress = tracks.length > 0 ? ((currentTrackIndex + 1) / tracks.length) * 100 : 0;
</script>

<div class="space-y-4">
  <!-- Current Track -->
  {#if currentTrack}
    <AudioPlayer 
      src={currentTrack.src}
      title={currentTrack.title}
      on:ended={handleTrackEnd}
    />
  {/if}
  
  <!-- Controls -->
  <div class="flex items-center justify-center gap-4">
    <button
      on:click={() => isShuffling = !isShuffling}
      class={`p-2 rounded-lg transition-colors ${isShuffling ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
      title="Shuffle"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
      </svg>
    </button>
    
    <button
      on:click={prevTrack}
      disabled={tracks.length <= 1}
      class="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>
    
    <button
      on:click={() => isRepeating = !isRepeating}
      class={`p-2 rounded-lg transition-colors ${isRepeating ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
      title="Repeat"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    </button>
    
    <button
      on:click={nextTrack}
      disabled={tracks.length <= 1}
      class="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>
  </div>
  
  <!-- Progress Bar -->
  <div class="w-full bg-gray-800 rounded-full h-1">
    <div 
      class="bg-primary h-1 rounded-full transition-all duration-300"
      style="width: {progress}%"
    />
  </div>
  
  <!-- Track List -->
  <div class="bg-surface rounded-xl p-4 space-y-2">
    <p class="text-sm font-medium text-gray-300 mb-3">Playlist ({tracks.length} tracks)</p>
    
    <div class="space-y-1 max-h-48 overflow-y-auto">
      {#each tracks as track, index}
        <button
          on:click={() => selectTrack(index)}
          class={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
            index === currentTrackIndex 
              ? 'bg-primary/20 text-primary' 
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <span class="text-xs w-6 text-center">{index + 1}</span>
          <span class="flex-1 text-sm truncate">{track.title}</span>
          {#if index === currentTrackIndex}
            <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>
