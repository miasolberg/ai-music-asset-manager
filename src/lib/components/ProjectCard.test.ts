import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import ProjectCard from '$lib/components/ProjectCard.svelte';

// Mock project data
const mockProject = {
  id: 'project1',
  title: 'Test Track',
  artist: 'Test Artist',
  genre: 'Electronic',
  bpm: 128,
  key: 'C Major',
  status: 'in_progress',
  description: 'A test project',
  created: '2024-01-15T10:00:00Z',
  updated: '2024-01-16T12:00:00Z',
  audio_files: [],
  visual_assets: [],
};

const mockProjectMinimal = {
  id: 'project2',
  title: 'Minimal Project',
  status: 'draft',
  created: '2024-01-15T10:00:00Z',
  updated: '2024-01-15T10:00:00Z',
};

describe('ProjectCard', () => {
  it('renders project title', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProject } });
    expect(getByText('Test Track')).toBeDefined();
  });

  it('renders artist name when provided', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProject } });
    expect(getByText('Test Artist')).toBeDefined();
  });

  it('renders genre when provided', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProject } });
    expect(getByText('Electronic')).toBeDefined();
  });

  it('renders BPM when provided', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProject } });
    expect(getByText('128')).toBeDefined();
  });

  it('renders status badge', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProject } });
    // in_progress status should be displayed
    expect(getByText('in_progress')).toBeDefined();
  });

  it('renders minimal project without errors', () => {
    const { getByText } = render(ProjectCard, { props: { project: mockProjectMinimal } });
    expect(getByText('Minimal Project')).toBeDefined();
  });

  it('renders link to project detail page', () => {
    const { container } = render(ProjectCard, { props: { project: mockProject } });
    const link = container.querySelector('a[href="/projects/project1"]');
    expect(link).not.toBeNull();
  });
});