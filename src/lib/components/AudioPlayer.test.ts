import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import AudioPlayer from '$lib/components/AudioPlayer.svelte';

describe('AudioPlayer', () => {
  it('renders with default title', () => {
    const { getByText } = render(AudioPlayer, { props: { src: 'http://example.com/audio.mp3' } });
    expect(getByText('Audio')).toBeDefined();
  });

  it('renders with custom title', () => {
    const { getByText } = render(AudioPlayer, {
      props: { src: 'http://example.com/audio.mp3', title: 'My Track' },
    });
    expect(getByText('My Track')).toBeDefined();
  });

  it('renders play button', () => {
    const { container } = render(AudioPlayer, {
      props: { src: 'http://example.com/audio.mp3' },
    });
    const playButton = container.querySelector('button');
    expect(playButton).not.toBeNull();
  });

  it('renders audio element with correct source', () => {
    const { container } = render(AudioPlayer, {
      props: { src: 'http://example.com/audio.mp3' },
    });
    const audio = container.querySelector('audio');
    expect(audio).not.toBeNull();
    expect(audio?.getAttribute('src')).toBe('http://example.com/audio.mp3');
  });

  it('renders volume control', () => {
    const { container } = render(AudioPlayer, {
      props: { src: 'http://example.com/audio.mp3' },
    });
    const volumeInput = container.querySelector('input[type="range"]');
    expect(volumeInput).not.toBeNull();
  });
});