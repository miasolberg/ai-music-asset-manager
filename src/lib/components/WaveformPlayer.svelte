<script>
  import { onMount, onDestroy } from 'svelte';
  
  export let src = '';
  export let title = '';
  
  let audio;
  let canvas;
  let ctx;
  let animationId;
  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let volume = 1;
  let isLoading = true;
  let error = '';
  
  // Generate fake waveform data (in real app, analyze audio buffer)
  let waveformData = [];
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    generateWaveform();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  });
  
  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
  });
  
  function generateWaveform() {
    // Fake waveform - in production, analyze actual audio
    const bars = 100;
    waveformData = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
  }
  
  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawWaveform();
  }
  
  function drawWaveform() {
    if (!ctx || !canvas) return;
    
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressIndex = Math.floor(progress * waveformData.length);
    
    ctx.clearRect(0, 0, width, height);
    
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      // Color based on progress
      if (index <= progressIndex) {
        ctx.fillStyle = isPlaying ? '#10b981' : '#3b82f6'; // Green when playing, blue when paused
      } else {
        ctx.fillStyle = '#374151'; // Gray for future
      }
      
      // Draw rounded bars
      ctx.beginPath();
      ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
      ctx.fill();
    });
  }
  
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        error = 'Failed to play audio';
        console.error(err);
      });
    }
  }
  
  function handleTimeUpdate() {
    currentTime = audio.currentTime;
    duration = audio.duration || 0;
    drawWaveform();
  }
  
  function handleSeek(event) {
    if (!duration) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / rect.width;
    audio.currentTime = progress * duration;
  }
  
  function handleVolumeChange(event) {
    volume = event.target.value;
    audio.volume = volume;
  }
  
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  function handleLoaded() {
    isLoading = false;
    duration = audio.duration || 0;
  }
  
  function handleError() {
    isLoading = false;
    error = 'Failed to load audio';
  }
  
  $: if (isPlaying) {
    animationId = requestAnimationFrame(drawWaveform);
  }
</script>

<div class="bg-darker rounded-xl p-4 space-y-3">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button
        on:click={togglePlay}
        disabled={isLoading}
        class="w-12 h-12 bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
      >
        {#if isLoading}
          <svg class="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        {:else if isPlaying}
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
          </svg>
        {:else}
          <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
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
  
  <!-- Waveform -->
  <canvas
    bind:this={canvas}
    on:click={handleSeek}
    class="w-full h-16 cursor-pointer"
    style="display: block;"
  />
  
  {#if error}
    <p class="text-red-400 text-sm">{error}</p>
  {/if}
  
  <!-- Hidden Audio Element -->
  <audio
    bind:this={audio}
    {src}
    on:play={() => isPlaying = true}
    on:pause={() => isPlaying = false}
    on:timeupdate={handleTimeUpdate}
    on:loadedmetadata={handleLoaded}
    on:error={handleError}
    preload="metadata"
  />
</div>
