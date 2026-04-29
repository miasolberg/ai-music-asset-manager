/**
 * TypeScript types for PocketBase records.
 * These mirror the collections defined in pb_migrations/1680000000_initial_setup.js
 */

/** Base PocketBase record fields (includes PB v0.23+ auto-fields) */
export interface BaseRecord {
	id: string;
	created: string;
	updated: string;
	collectionId?: string;
	collectionName?: string;
}

/** Project status options */
export type ProjectStatus = 'draft' | 'in_progress' | 'mastering' | 'released';

/** Project record */
export interface Project extends BaseRecord {
	title: string;
	artist: string;
	genre: string;
	bpm: number;
	key: string;
	description: string;
	status: ProjectStatus;
	cover: string;
	owner: string;
}

/** Audio file type options */
export type AudioFileType = 'master' | 'stem_vocals' | 'stem_instrumental' | 'raw' | 'mix';

/** Audio file record */
export interface AudioFile extends BaseRecord {
	project: string;
	file: string;
	version: string;
	file_type: AudioFileType;
	notes: string;
	owner: string;
}

/** AI service options */
export type AIService = 'Suno' | 'Udio' | 'AIVA' | 'Boomy' | 'Soundraw' | 'Other';

/** Prompt record */
export interface Prompt extends BaseRecord {
	project: string;
	prompt_text: string;
	ai_service: AIService;
	tags: string;
	owner: string;
}

/** Lyrics record */
export interface Lyrics extends BaseRecord {
	project: string;
	content: string;
	language: string;
	owner: string;
}

/** Visual asset type options */
export type VisualAssetType = 'cover' | 'thumbnail' | 'background' | 'video_loop' | 'promo';

/** Visual asset format options */
export type VisualAssetFormat = '1:1' | '16:9' | '9:16' | '4:3' | 'other';

/** Visual asset record */
export interface VisualAsset extends BaseRecord {
	project: string;
	file: string;
	asset_type: VisualAssetType;
	format: VisualAssetFormat;
	alt_text: string;
	owner: string;
}

/** User record */
export interface User extends BaseRecord {
	email: string;
	name: string;
	avatar: string;
}

/** Status label mapping */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
	draft: 'Draft',
	in_progress: 'In Progress',
	mastering: 'Mastering',
	released: 'Released',
};

/** Status color mapping for Tailwind classes */
export const STATUS_COLORS: Record<ProjectStatus, string> = {
	draft: 'bg-yellow-500/20 text-yellow-400',
	in_progress: 'bg-blue-500/20 text-blue-400',
	mastering: 'bg-purple-500/20 text-purple-400',
	released: 'bg-green-500/20 text-green-400',
};

/** Status flow for project advancement */
export const STATUS_FLOW: ProjectStatus[] = ['draft', 'in_progress', 'mastering', 'released'];
