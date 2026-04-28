# AI Music Asset Manager

Self-hosted web application for managing AI-generated music projects.

## Tech Stack

- **Backend:** PocketBase (Auth, DB, File Storage, Realtime)
- **Frontend:** SvelteKit + Tailwind CSS
- **Container:** Docker + Docker Compose

## Quick Start

```bash
# Start services
docker-compose up -d

# Access PocketBase Admin: http://localhost:8090/_/ (create admin account)
# Access App: http://localhost:3000
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

## Database Schema

### Collections

#### projects
- `title` (text, required) - Song title
- `artist` (text) - Artist name
- `genre` (text) - Music genre
- `bpm` (number) - Beats per minute
- `key` (text) - Musical key
- `description` (text) - Project notes
- `status` (select) - draft | in_progress | mastering | released
- `cover` (file) - Album cover image

#### audio_files
- `project` (relation → projects) - Parent project
- `file` (file, required) - Audio file
- `version` (text) - Version label (v1, v2, etc.)
- `file_type` (select) - master | stem_vocals | stem_instrumental | raw | mix
- `notes` (text) - File notes

#### prompts
- `project` (relation → projects) - Parent project
- `prompt_text` (text, required) - AI generation prompt
- `ai_service` (select) - Suno | Udio | AIVA | Boomy | Soundraw | Other
- `tags` (text) - Searchable tags

#### lyrics
- `project` (relation → projects) - Parent project
- `content` (text, required) - Lyrics text
- `language` (text) - Language code

#### visual_assets
- `project` (relation → projects) - Parent project
- `file` (file, required) - Image or video file
- `asset_type` (select) - cover | thumbnail | background | video_loop | promo
- `format` (select) - 1:1 | 16:9 | 9:16 | 4:3 | other
- `alt_text` (text) - Accessibility description

## Features

### Current (v0.0.4)
- ✅ Project CRUD
- ✅ Audio upload + player
- ✅ Prompt management
- ✅ Lyrics editor
- ✅ Visual asset management
- ✅ File upload (drag & drop)

### Planned
- [ ] Google Drive sync
- [ ] Multi-user support
- [ ] Real-time collaboration
- [ ] Version control for audio
- [ ] Export release packages

## License

MIT
